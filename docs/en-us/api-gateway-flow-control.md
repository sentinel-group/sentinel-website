# API Gateway Flow Control

Sentinel supports flow control for API gateways including Spring Cloud Gateway and Zuul 1.x.

![image](https://user-images.githubusercontent.com/9434884/70883552-4ce61700-200e-11ea-8324-e803d0753a20.png)

Sentinel 1.6.0 introduced the `sentinel-api-gateway-adapter-common` module, which includes common management logic for gateway rules and customized API groups.

- `GatewayFlowRule`: The flow rule specifically designed for API gateway, enabling flow control for different routes or customized API groups. It also supports flow control by request attributes (e.g. HTTP header, client IP and URL parameters).
- `ApiDefinition`: The user-defined API group, which can be regarded as a group of URL patterns.

## Spring Cloud Gateway

Sentinel provides the integration module with Spring Cloud Gateway, providing two levels of flow control:

- Route level: flow control for defined routes in Spring properties file.
- Customized API group level: flow control for customized API groups defined in `GatewayApiDefinitionManager` of Sentinel.

Add the following dependency in `pom.xml` (if you are using Maven):

```xml
<dependency>
    <groupId>com.alibaba.csp</groupId>
    <artifactId>sentinel-spring-cloud-gateway-adapter</artifactId>
    <version>x.y.z</version>
</dependency>
```

Then you only need to inject the corresponding `SentinelGatewayFilter` and `SentinelGatewayBlockExceptionHandler` instance
in Spring configuration. For example:

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
    @Order(-1)
    public SentinelGatewayBlockExceptionHandler sentinelGatewayBlockExceptionHandler() {
        // Register the block exception handler for Spring Cloud Gateway.
        return new SentinelGatewayBlockExceptionHandler(viewResolvers, serverCodecConfigurer);
    }

    @Bean
    public GlobalFilter sentinelGatewayFilter() {
        // By default the order is HIGHEST_PRECEDENCE
        return new SentinelGatewayFilter();
    }
}
```

The gateway adapter will regard all `routeId` (defined in Spring properties) and all customized API definitions
(defined in `GatewayApiDefinitionManager` of `sentinel-api-gateway-adapter-common` module) as resources.

You can register various kinds of customized callback in `GatewayCallbackManager`:

- `setBlockHandler`: register a customized `BlockRequestHandler` to handle the blocked request. The default implementation is `DefaultBlockRequestHandler`, which returns default message like `Blocked by Sentinel: FlowException`.

## Zuul 1.x

Sentinel provides the integration module with Zuul 1.x, providing two levels of flow control:

- Route level: flow control for defined routes in Zuul properties file.
- Customized API group level: flow control for customized API groups defined in `GatewayApiDefinitionManager` of Sentinel.

To introduce Sentinel to your Zuul gateway, add the following dependency in `pom.xml` (if you are using Maven):

```xml
<dependency>
    <groupId>com.alibaba.csp</groupId>
    <artifactId>sentinel-zuul-adapter</artifactId>
    <version>x.y.z</version>
</dependency>
```

Then for Spring Cloud Zuul users, we only need to inject the three filters in Spring configuration class like this:

```java
@Configuration
public class ZuulConfig {

    @Bean
    public ZuulFilter sentinelZuulPreFilter() {
        // We can provider the filter order here.
        return new SentinelZuulPreFilter(10000);
    }

    @Bean
    public ZuulFilter sentinelZuulPostFilter() {
        return new SentinelZuulPostFilter(1000);
    }

    @Bean
    public ZuulFilter sentinelZuulErrorFilter() {
        return new SentinelZuulErrorFilter(-1);
    }
}
```