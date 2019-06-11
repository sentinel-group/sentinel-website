# 网关流量控制

Sentinel 支持对 Spring Cloud Gateway、Zuul 等主流的 API Gateway 进行限流。

![sentinel-api-gateway-common-arch](https://user-images.githubusercontent.com/9434884/58381714-266d7980-7ff3-11e9-8617-d0d7c325d703.png)

Sentinel 1.6.0 引入了 Sentinel API Gateway Adapter Common 模块，此模块中包含网关限流的规则和自定义 API 的实体和管理逻辑：

- `GatewayFlowRule`：网关限流规则，针对 API Gateway 的场景定制的限流规则，可以针对不同 route 或自定义的 API 分组进行限流，支持针对请求中的参数、Header、来源 IP 等进行定制化的限流。
- `ApiDefinition`：用户自定义的 API 定义分组，可以看做是一些 URL 匹配的组合。比如我们可以定义一个 API 叫 `my_api`，请求 path 模式为 `/foo/**` 和 `/baz/**` 的都归到 `my_api` 这个 API 分组下面。限流的时候可以针对这个自定义的 API 分组维度进行限流。

其中网关限流规则 `GatewayFlowRule` 的字段解释如下：

- `resource`：资源名称，可以是网关中的 route 名称或者用户自定义的 API 分组名称。
- `resourceMode`：规则是针对 API Gateway 的 route（`RESOURCE_MODE_ROUTE_ID`）还是用户在 Sentinel 中定义的 API 分组（`RESOURCE_MODE_CUSTOM_API_NAME`），默认是 route。
- `grade`：限流指标维度，同限流规则的 `grade` 字段。
- `count`：限流阈值
- `intervalSec`：统计时间窗口，单位是秒，默认是 1 秒（目前仅对参数限流生效）。
- `controlBehavior`：流量整形的控制效果，同限流规则的 `controlBehavior` 字段，目前支持快速失败和匀速排队两种模式，默认是快速失败。
- `burst`：应对突发请求时额外允许的请求数目（目前仅对参数限流生效）。
- `maxQueueingTimeoutMs`：匀速排队模式下的最长排队时间，单位是毫秒，仅在匀速排队模式下生效。
- `paramItem`：参数限流配置。若不提供，则代表不针对参数进行限流，该网关规则将会被转换成普通流控规则；否则会转换成热点规则。其中的字段：
  - `parseStrategy`：从请求中提取参数的策略，目前支持提取来源 IP（`PARAM_PARSE_STRATEGY_CLIENT_IP`）、Host（`PARAM_PARSE_STRATEGY_HOST`）、任意 Header（`PARAM_PARSE_STRATEGY_HEADER`）和任意 URL 参数（`PARAM_PARSE_STRATEGY_URL_PARAM`）四种模式。
  - `fieldName`：若提取策略选择 Header 模式或 URL 参数模式，则需要指定对应的 header 名称或 URL 参数名称。
  - `pattern` 和 `matchStrategy`：为后续参数匹配特性预留，目前未实现。

用户可以通过 `GatewayRuleManager.loadRules(rules)` 手动加载网关规则，或通过 `GatewayRuleManager.register2Property(property)` 注册动态规则源动态推送（推荐方式）。

## Spring Cloud Gateway

从 1.6.0 版本开始，Sentinel 提供了 Spring Cloud Gateway 的适配模块，可以提供两种资源维度的限流：

- route 维度：即在 Spring 配置文件中配置的路由条目，资源名为对应的 routeId
- 自定义 API 维度：用户可以利用 Sentinel 提供的 API 来自定义一些 API 分组

使用时需引入以下模块（以 Maven 为例）：

```xml
<dependency>
    <groupId>com.alibaba.csp</groupId>
    <artifactId>sentinel-spring-cloud-gateway-adapter</artifactId>
    <version>x.y.z</version>
</dependency>
```

使用时只需注入对应的 `SentinelGatewayFilter` 实例以及 `SentinelGatewayBlockExceptionHandler` 实例即可。比如：

```java
@Configuration
public class GatewayConfiguration {

    private final List<ViewResolver> viewResolvers;
    private final ServerCodecConfigurer serverCodecConfigurer;

    public GatewayConfiguration(ObjectProvider<List<ViewResolver>> viewResolversProvider,
                                ServerCodecConfigurer serverCodecConfigurer) {
        this.viewResolvers = viewResolversProvider.getIfAvailable(Collections::emptyList);
        this.serverCodecConfigurer = serverCodecConfigurer;
    }

    @Bean
    @Order(Ordered.HIGHEST_PRECEDENCE)
    public SentinelGatewayBlockExceptionHandler sentinelGatewayBlockExceptionHandler() {
        // Register the block exception handler for Spring Cloud Gateway.
        return new SentinelGatewayBlockExceptionHandler(viewResolvers, serverCodecConfigurer);
    }

    @Bean
    @Order(-1)
    public GlobalFilter sentinelGatewayFilter() {
        return new SentinelGatewayFilter();
    }
}
```

Demo 示例：[sentinel-demo-spring-cloud-gateway](https://github.com/alibaba/Sentinel/tree/master/sentinel-demo/sentinel-demo-spring-cloud-gateway)

比如我们在 Spring Cloud Gateway 中配置了以下路由：

```yaml
server:
  port: 8090
spring:
  application:
    name: spring-cloud-gateway
  cloud:
    gateway:
      enabled: true
      discovery:
        locator:
          lower-case-service-id: true
      routes:
        # Add your routes here.
        - id: product_route
          uri: lb://product
          predicates:
            - Path=/product/**
        - id: httpbin_route
          uri: https://httpbin.org
          predicates:
            - Path=/httpbin/**
          filters:
            - RewritePath=/httpbin/(?<segment>.*), /$\{segment}
```

同时自定义了一些 API 分组：

```java
private void initCustomizedApis() {
    Set<ApiDefinition> definitions = new HashSet<>();
    ApiDefinition api1 = new ApiDefinition("some_customized_api")
        .setPredicateItems(new HashSet<ApiPredicateItem>() {{
            add(new ApiPathPredicateItem().setPattern("/product/baz"));
            add(new ApiPathPredicateItem().setPattern("/product/foo/**")
                .setMatchStrategy(SentinelGatewayConstants.PARAM_MATCH_STRATEGY_PREFIX));
        }});
    ApiDefinition api2 = new ApiDefinition("another_customized_api")
        .setPredicateItems(new HashSet<ApiPredicateItem>() {{
            add(new ApiPathPredicateItem().setPattern("/ahas"));
        }});
    definitions.add(api1);
    definitions.add(api2);
    GatewayApiDefinitionManager.loadApiDefinitions(definitions);
}
```

那么这里面的 route ID（如 `product_route`）和 API name（如 `some_customized_api`）都会被标识为 Sentinel 的资源。比如访问网关的 URL 为 `http://localhost:8090/product/foo/22` 的时候，对应的统计会加到 `product_route` 和 `some_customized_api` 这两个资源上面，而 `http://localhost:8090/httpbin/json` 只会对应到 `httpbin_route` 资源上面。

您可以在 `GatewayCallbackManager` 注册回调进行定制：

- `setBlockHandler`：注册函数用于实现自定义的逻辑处理被限流的请求，对应接口为 `BlockRequestHandler`。默认实现为 `DefaultBlockRequestHandler`，当被限流时会返回类似于下面的错误信息：`Blocked by Sentinel: FlowException`。

## Zuul 1.x

Sentinel 提供了 Zuul 1.x 的适配模块，可以为 Zuul Gateway 提供两种资源维度的限流：

- route 维度：即在 Spring 配置文件中配置的路由条目，资源名为对应的 route ID（对应 `RequestContext` 中的 `proxy` 字段）
- 自定义 API 维度：用户可以利用 Sentinel 提供的 API 来自定义一些 API 分组

使用时需引入以下模块（以 Maven 为例）：

```xml
<dependency>
    <groupId>com.alibaba.csp</groupId>
    <artifactId>sentinel-zuul-adapter</artifactId>
    <version>x.y.z</version>
</dependency>
```

若使用的是 Spring Cloud Netflix Zuul，我们可以直接在配置类中将三个 filter 注入到 Spring 环境中即可：

```java
@Configuration
public class ZuulConfig {

    @Bean
    public ZuulFilter sentinelZuulPreFilter() {
        // We can also provider the filter order in the constructor.
        return new SentinelZuulPreFilter();
    }

    @Bean
    public ZuulFilter sentinelZuulPostFilter() {
        return new SentinelZuulPostFilter();
    }

    @Bean
    public ZuulFilter sentinelZuulErrorFilter() {
        return new SentinelZuulErrorFilter();
    }
}
```

Sentinel Zuul Adapter 生成的调用链路类似于下面，其中的资源名都是 route ID 或者自定义的 API 分组名称：

```
-EntranceNode: sentinel_gateway_context$$route$$another-route-b(t:0 pq:0.0 bq:0.0 tq:0.0 rt:0.0 prq:0.0 1mp:8 1mb:1 1mt:9)
--another-route-b(t:0 pq:0.0 bq:0.0 tq:0.0 rt:0.0 prq:0.0 1mp:4 1mb:1 1mt:5)
--another_customized_api(t:0 pq:0.0 bq:0.0 tq:0.0 rt:0.0 prq:0.0 1mp:4 1mb:0 1mt:4)
-EntranceNode: sentinel_gateway_context$$route$$my-route-1(t:0 pq:0.0 bq:0.0 tq:0.0 rt:0.0 prq:0.0 1mp:6 1mb:0 1mt:6)
--my-route-1(t:0 pq:0.0 bq:0.0 tq:0.0 rt:0.0 prq:0.0 1mp:2 1mb:0 1mt:2)
--some_customized_api(t:0 pq:0.0 bq:0.0 tq:0.0 rt:0.0 prq:0.0 1mp:2 1mb:0 1mt:2)
```

发生限流之后的处理流程 ：

- 发生限流之后可自定义返回参数，通过实现 `SentinelFallbackProvider` 接口，默认的实现是 `DefaultBlockFallbackProvider`。
- 默认的 fallback route 的规则是 route ID 或自定义的 API 分组名称。

比如：

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

## 网关流控实现原理

当通过 `GatewayRuleManager` 加载网关流控规则（`GatewayFlowRule`）时，无论是否针对请求属性进行限流，Sentinel 底层都会将网关流控规则转化为热点参数规则（`ParamFlowRule`），存储在 `GatewayRuleManager` 中，与正常的热点参数规则相隔离。转换时 Sentinel 会根据请求属性配置，为网关流控规则设置参数索引（`idx`），并同步到生成的热点参数规则中。

外部请求进入 API Gateway 时会经过 Sentinel 实现的 filter，其中会依次进行 **路由/API 分组匹配**、**请求属性解析**和**参数组装**。Sentinel 会根据配置的网关流控规则来解析请求属性，并依照参数索引顺序组装参数数组，最终传入 `SphU.entry(res, args)` 中。Sentinel API Gateway Adapter Common 模块向 Slot Chain 中添加了一个 `GatewayFlowSlot`，专门用来做网关规则的检查。`GatewayFlowSlot` 会从 `GatewayRuleManager` 中提取生成的热点参数规则，根据传入的参数依次进行规则检查。若某条规则不针对请求属性，则会在参数最后一个位置置入预设的常量，达到普通流控的效果。

![image](https://user-images.githubusercontent.com/9434884/58381786-5406f280-7ff4-11e9-9020-016ccaf7ab7d.png)

## 网关流控控制台

可以参考 [AHAS 网关流控](https://help.aliyun.com/document_detail/118482.html)。