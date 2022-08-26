# Hertz 和 sentinel-golang 的对接方案

## 介绍

在以云原生为技术支撑的背景下，各个公司都开源了自己的微服务框架或产品，如耳熟能详的 Istio、Envoy、Kratos、Go-zero 等。前段时间字节跳动也开源了 **[超大规模的企业级微服务 HTTP 框架 — Hertz](https://mp.weixin.qq.com/s/D1Pol8L9F_5-Yte_k4DH8A)**。

经过了字节跳动内部一年多的使用和迭代，高性能企业级 HTTP 框架—— Hertz，已在 [CloudWeGo](https://github.com/cloudwego) 正式开源啦！Hertz 已经成为了字节跳动内部最大的 HTTP 框架，线上接入的服务数量超过**1 万**，峰值 QPS 超过 **4 千万**，具有**高易用性**、**易扩展**、**低时延**的特点。对于字节跳动服务框架团队和 CloudWeGo 而言，Hertz 将不仅仅是一个开源项目，它也是一个真实的超大规模企业级实践。

## 背景

> 鉴于 Hertz 自身没有熔断限流的能力，于是将 sentinel-golang 这种成熟的方案通过中间件的方式引入进来进行流量的熔断和处理。
> 此方案将介绍如何使 Hertz 可以以中间件的形式引入 sentinel-golang

## Sentinel 中 adapter 的实现思路

### 提供自定义处理函数

adapter 提供了 `WithResourceExtractor` 添加自定义资源函数 和 `WithBlockFallback` 自定义失败回调函数等 Option 来对程序进行个性化处理

> 何为热点？热点即经常访问的数据。很多时候我们希望统计某个热点数据中访问频次最高的 Top K 数据，并对其访问进行限制。比如：
> - 商品 ID 为参数，统计一段时间内最常购买的商品 ID 并进行限制
>
> - 用户 ID 为参数，针对一段时间内频繁访问的用户 ID 进行限制
>   热点参数限流会统计传入参数中的热点参数，并根据配置的限流阈值与模式，对包含热点参数的资源调用进行限流。热点参数限流可以看做是一种特殊的流量控制，仅对包含热点参数的资源调用生效。

| 函数名                  | 描述                                                         |
| ----------------------- | ------------------------------------------------------------ |
| `WithResourceExtractor` | `WithResourceExtractor` 为设置网络请求的自定义函数，通过自定义的资源名和 Sentinel-golang 中的 热点参数流控规则 的 `Resource` 相匹配以达到自定义规则的目的 |
| `WithBlockFallback`     | `WithBlockFallback` 为设置请求被阻断时的自定义回调函数，可以通过 `context.Context` 和 `app.RequestContext` 分别来进行错误日志打印和自定义回调处理 |

### 如何使用提供的自定义函数

以下为使用 `WithResourceExtracto`r 时的伪代码
```go
// eg：FullPath 为 /ping
h.use(SentinelMiddleware(
    WithResourceExtractor(
       func(c context.Context, ctx *app.RequestContext) string {
          return ctx.FullPath()
       },
    ),
))

// 默认的 resourceName eg: GET:/ping
resourceName := string(c.Request.Method()) + ":" + c.FullPath()

// 通过 WithResourceExtractor 使用自定义的 resourceName 
if options.resourceExtract != nil {
   // 为上方定义的 /ping 
   resourceName = options.resourceExtract(ctx, c)
}

// 将 resourceName 放入 sentinel.Entry
entry, err := sentinel.Entry(
   resourceName,
   sentinel.WithResourceType(base.ResTypeWeb),
   sentinel.WithTrafficType(base.Inbound),
)
```

以下为使用 `WithBlockFallback` 时进行自定义错误返回的伪代码
```Go
// 在 block 时 返回自定义的 json 数据
h.use(SentinelMiddleware(
    WithBlockFallback(func(c context.Context, ctx *app.RequestContext) {
       ctx.AbortWithStatusJSON(400, map[string]interface{}{
          "code":    400,
          "message": "busy",
       })
    ),
)

if options.blockFallback != nil {
   // 通过 WithResourceExtractor 使用自定义的 json 返回
   options.blockFallback(ctx, c)
} else {
   // 默认返回 http.StatusTooManyRequests: 403
   c.AbortWithStatus(http.StatusTooManyRequests)
}
```

### Hertz Server 中间件的业务实现

#### 自定义函数的注入原理

`evaluateServerOptions` 为 server middleware 的 option 注入函数，它内部将存放默认的实现逻辑，用户可以通过自定义 option 的方式将默认实现替换为自定义逻辑

```Go
func evaluateServerOptions(opts []ServerOption) *serverOptions {
   // 提供默认实现 
   options := &serverOptions{
      resourceExtract: func(c context.Context, ctx *app.RequestContext) string {
         return fmt.Sprintf("%v:%v", string(ctx.Request.Method()), ctx.FullPath())
      },
      blockFallback: func(c context.Context, ctx *app.RequestContext) {
         ctx.AbortWithStatus(http.StatusTooManyRequests)
      },
   }
   // 将用户的自定义 option 同默认配置进行替换
   options.Apply(opts)
   return options
}
```

#### Server Middleware 的实现逻辑

> 使用 Sentinel 的 Entry API 将业务逻辑封装起来，这一步称为“埋点”。每个埋点都有一个资源名称（resource），代表触发了这个资源的调用或访问。

以下为大致的伪代码：

```Go
func SentinelServerMiddleware(opts ...Option) app.HandlerFunc {
   options := evaluateOptions(opts)
   return func(ctx context.Context, c *app.RequestContext) {
      // 获取默认的 resourceName 或自定义的资源名
     resourceName := options.resourceExtract(c, ctx)
   
      // 进行埋点
      entry, err := sentinel.Entry(
         resourceName,
         sentinel.WithResourceType(base.ResTypeWeb),
         sentinel.WithTrafficType(base.Inbound),
      )
      // 产生 err 就应该停止继续业务逻辑
      // 使用默认的响应逻辑或自定义的响应逻辑
    if err != nil {
       options.blockFallback(c, ctx)
       return
    }
      defer entry.Exit()
      c.Next(ctx)
   }
}
```

请求进入中间件的逻辑流程图
![](.\img\sentinel-golang-hertz1.jpg)

## Hertz adapter 和 Sentinel Gin adpter 的差异

- Hertz 提供客户端和服务端的功能，和 gin 并不一样，gin 只提供服务端功能

- Hertz server 和 client 的 middleware 原理实现并不相同，Hertz server 使用 `app.HandlerFunc` Hertz middleware 使用 `middleware.Endpoint` ，所以需要分别编写

- 将中间件处理函数 `gin.HandlerFunc` 置换为 Hertz 的 `app.HandlerFunc`

- 将option的基本类型从gin 的 `HandlerFunc`替换Hertz 的 `HandlerFunc` 对请求进行自定义处理

```Go
// gin 的 HandlerFunc
func(*gin.Context)
// hertz 的 HandlerFunc
func(ctx context.Context, c *app.RequestContext)
```

## Sentinel Hertz client adapter 实现

1. 中间件函数使用 hertz client middleware 的 `middleware.Endpoint`

1. 由于 client middleware 必须保持**默认**格式，所以使用构造函数从外部给 middlware 函数内部 的options 进行赋值，最后返回一个统一格式的中间件

### 自定义函数的注入原理

`evaluateClientOptions` 为 client middleware 的 option 注入函数，它内部将存放默认的实现逻辑，用户可以通过自定义 option 的方式将默认实现替换为自定义逻辑

以下为 `evaluateClientOptions` 的实现伪代码

```Go
func evaluateClientOptions(opts []ClientOption) *clientOptions {
    // 提供默认实现 
   options := &clientOptions{
      resourceExtractForClient: func(ctx context.Context, req *protocol.Request, resp *protocol.Response) string {
         return fmt.Sprintf("%v:%v", string(req.Method()), string(req.Path()))
      },
      blockFallbackForClient: func(ctx context.Context, req *protocol.Request, resp *protocol.Response) {
         resp.SetStatusCode(http.StatusTooManyRequests)
      },
   }
   // 将用户的自定义 option 同默认配置进行替换
   options.Apply(opts)
   return options
}
```

以下为伪代码：

```Go
// 中间件默认格式
func(next client.Endpoint) client.Endpoint {
   return func(ctx context.Context, req *protocol.Request, resp *protocol.Response) (err error) {
     return nil 
   }
}

// 构造函数的初步实现方案
func SentinelClientMiddleware(opts ...Option) client.Endpoint {
   // 注入 option
   options := evaluateClientOptions(opts)
   // 进行中间件实现
   return func(next client.Endpoint) client.Endpoint {
      return func(ctx context.Context, req *protocol.Request, resp *protocol.Response) (err error) {
         // 进行option注入以及进行埋点处理等
         ...
         err = next(ctx, req, resp)
         // 处理错误
         if err != nil {
            return err
         }
         return nil
      }
   }
}
```

- Client middleware 逻辑使用伪代码展示

```Go
func SentinelClientMiddleware(opts ...ClientOption) client.Middleware {
   // 注入默认实现或用户的自定义实现
   options := evaluateClientOptions(opts)
   return func(next client.Endpoint) client.Endpoint {
      return func(ctx context.Context, req *protocol.Request, resp *protocol.Response) (err error) {
         // 使用默认ResourceName: eg: GET:/ping 或自定义资源名
         resourceName := options.resourceExtractForClient(ctx, req, resp)
          // 进行埋点
         entry, blockErr := sentinel.Entry(
            resourceName,
            sentinel.WithResourceType(base.ResTypeWeb),
            sentinel.WithTrafficType(base.Outbound),
         )
         // 发生熔断，应停止继续
         if blockErr != nil {
            // 使用默认响应或用户自定义响应
            options.blockFallbackForClient(ctx, req, resp)
            return
         }
         defer entry.Exit()
         err = next(ctx, req, resp)
         if err != nil {
            sentinel.traceError(entry, err)
            return err
         }
         return nil
      }
   }
}
```

Client 的基本业务流程图：

![](.\img\sentinel-golang-hertz2.jpg)
