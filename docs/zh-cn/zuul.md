## Zuul

Sentinel 提供与 [Zuul](https://github.com/Netflix/zuul) 1.x 的整合，可以对网关的转发请求进行流量控制，默认提供Service和URL两个维度上的限流。

下面数据是Sentinel生成的链路数据，`coke` 和 `book` 是对应的微服务（服务ID存储在Zuul的`Context`中，对应的key为：`ctx.get("serviceId")`）。

`--/coke/app` 是服务对应的请求，

可以针对服务coke调用进行限流，也可以直接对URL限流，或者根据需要同时限流。

```bash

EntranceNode: machine-root
-EntranceNode: coke
--coke
---/coke/app
-EntranceNode: book
--book
---/book/app

```

使用时需引入以下模块（以 Maven 为例）：

```xml
       <dependency>
          <groupId>com.alibaba.csp</groupId>
            <artifactId>sentinel-zuul-adapter</artifactId>
            <version>x.y.z</version>
        </dependency>

```

注册ZuulFilter ：

Adapter通过实现`ZuulFilter`来完成来完成Sentinel的整合，所以需要注册`ZuulFilter`.

```java

// 获取 FilterRegistry
final FilterRegistry r = FilterRegistry.instance();
// 开关,顺序等ZuulFilter的配置信息。
SentinelZuulProperties properties = new SentinelZuulProperties();
// 开启Sentinel。
properties.setEnabled(true);
// 配置URL解析器（限流对应的资源）,可以自定义，这里使用默认的解析器。
UrlCleaner defaultUrlCleaner = new DefaultUrlCleaner();
// 配置默认的orgin解析器（ContextUtil.enter(serviceTarget, origin) ）
RequestOriginParser defaultRequestOriginParser = new DefaultRequestOriginParser();

// 注册ZuulFilter, 三个ZuulFilter 必须全部注册，才能完整的统计链路信息。
SentinelPreFilter sentinelPreFilter = new SentinelPreFilter(properties, defaultUrlCleaner, defaultRequestOriginParser);
r.put("sentinelPreFilter", sentinelPreFilter);
SentinelPostFilter postFilter = new SentinelPostFilter(properties);
r.put("sentinelPostFilter", postFilter);
SentinelErrorFilter errorFilter = new SentinelErrorFilter(properties);
r.put("sentinelErrorFilter", errorFilter);

```

发生限流之后的处理流程 ：

发生限流之后可自定义返回参数，通过实现 `SentinelFallbackProvider` 接口，默认的实现是 `DefaultBlockFallbackProvider`. 

可以针对不同的路径有不同的返回，默认的 Fallback route 的规则是 `ServiveId + URI PATH`, 例如 `/book/app`, 其中 `book`是serviceId, `/app`是URI PATH. 

```java

// 自定义 FallbackProvider 
public class MyBlockFallbackProvider implements ZuulBlockFallbackProvider {

    private Logger logger = LoggerFactory.getLogger(DefaultBlockFallbackProvider.class);
    
    // you can define route as service level 
    @Override
    public String getRoute() {
        return "/book/app";
    }

    @Override
        public BlockResponse fallbackResponse(String route, Throwable cause) {
            RecordLog.info(String.format("[Sentinel DefaultBlockFallbackProvider] Run fallback route: %s", route));
            if (cause instanceof BlockException) {
                return new BlockResponse(429, "Sentinel block exception", route);
            } else {
                return new BlockResponse(500, "System Error", route);
            }
        }
 }
 
 // 注册 FallbackProvider
 ZuulBlockFallbackManager.registerProvider(new MyBlockFallbackProvider());

```

限流发生之后的默认返回：

```json

{
    "code":429,
    "message":"Sentinel block exception",
    "route":"/"
}

```

**注意**：Sentinel Zuul Filter 会将每个到来的不同的 URL 都作为不同的资源处理，因此对于 REST 风格的 API，需要自行实现 `UrlCleaner` 接口清洗一下资源（比如将满足 `/foo/:id` 的 URL 都归到 `/foo/*` 资源下），
然后将其传入至`SentinelPreFilter`的构造参数中。否则会导致资源数量过多，超出资源数量阈值（目前是 6000）时多出的资源的规则将 **不会生效**。

若希望对 HTTP 请求按照来源限流，则可以自己实现 `RequestOriginParser` 接口从 HTTP 请求中解析 origin 然后将其传入至`SentinelPreFilter`的构造参数中。

如果您正在使用 Spring Cloud Zuul Starter，那么可以通过引入 Spring Cloud Alibaba Sentinel Zuul Starter 来更方便地整合 Sentinel, Starter 会依赖这个Adapter, [进度请查看这里](https://github.com/spring-cloud-incubator/spring-cloud-alibaba/issues/58)