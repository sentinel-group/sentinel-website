# Open-Source Integrations

## Microservices

### Spring Cloud

Spring Cloud Alibaba Sentinel provides out-of-box integration with Sentinel for Spring Cloud applications and services (Spring Web, Spring WebFlux, RestTemplate, Feign, Spring Cloud Gateway, Reactor, Zuul).

Please refer to [Spring Cloud Alibaba](https://github.com/alibaba/spring-cloud-alibaba) for more information. Demo: [sentinel-guide-spring-cloud](https://github.com/sentinel-group/sentinel-guides/tree/master/sentinel-guide-spring-cloud)

### Quarkus

Sentinel provides out-of-box support for Quarkus. See [sentinel-quarkus-adapter](https://github.com/alibaba/Sentinel/tree/master/sentinel-adapter/sentinel-quarkus-adapter) for more details (since 1.8.0).

## Web frameworks

### Web Servlet

Sentinel provides Web Servlet filter integration to enable flow control for web requests. Add the following dependency in `pom.xml` (if you are using Maven):

```xml
<dependency>
    <groupId>com.alibaba.csp</groupId>
    <artifactId>sentinel-web-servlet</artifactId>
    <version>x.y.z</version>
</dependency>
```

To use the filter, you can simply configure your `web.xml` with:

```xml
<filter>
	<filter-name>SentinelCommonFilter</filter-name>
	<filter-class>com.alibaba.csp.sentinel.adapter.servlet.CommonFilter</filter-class>
</filter>

<filter-mapping>
	<filter-name>SentinelCommonFilter</filter-name>
	<url-pattern>/*</url-pattern>
</filter-mapping>
```

For Spring web applications you can configure with Spring bean:

```java
@Configuration
public class FilterConfig {

    @Bean
    public FilterRegistrationBean sentinelFilterRegistration() {
        FilterRegistrationBean<Filter> registration = new FilterRegistrationBean<>();
        registration.setFilter(new CommonFilter());
        registration.addUrlPatterns("/*");
        registration.setName("sentinelFilter");
        registration.setOrder(1);

        return registration;
    }
}
```

When a request is blocked, Sentinel servlet filter will give a default page indicating the request blocked.
If customized block page is set (via `WebServletConfig.setBlockPage(blockPage)` method),
the filter will redirect the request to provided URL. You can also implement your own
block handler (the `UrlBlockHandler` interface) and register to `WebCallbackManager`.

The `UrlCleaner` interface is designed to clean and unify the URL resource.
For REST APIs, you have to clean the URL resource (e.g. `/foo/1` and `/foo/2` -> `/foo/:id`), or
the amount of context and resources will exceed the threshold.

The `RequestOriginParser` interface is useful for extracting request origin (e.g. IP or appName from HTTP Header)
from the HTTP request. You can implement your own `RequestOriginParser` and register to `WebCallbackManager`.

### Spring WebFlux

> Note: supported since Sentinel 1.5.0. This module requires JDK 8 or later versions.

See [the document of Sentinel Spring WebFlux Adapter module](https://github.com/alibaba/Sentinel/blob/master/sentinel-adapter/sentinel-spring-webflux-adapter/README.md).

## RPC frameworks

### Dubbo

[Sentinel Dubbo Adapter](https://github.com/dubbo/dubbo-sentinel-support) provides service consumer filter and provider filter for Dubbo services. Since Dubbo 2.7.x is not compatible with the previous version, we provide two modules:

- `sentinel-apache-dubbo3-adapter` (compatible with Apache Dubbo **3.x** and later version, supported since Sentinel **1.8.5**)
- `sentinel-apache-dubbo-adapter` (compatible with Apache Dubbo **2.7.x** and later version, supported since Sentinel **1.5.1**)
- `sentinel-dubbo-adapter` (compatible with Dubbo **2.6.x** and previous version)

If you are using Apache Dubbo **2.7.x** and later version, you can add the following dependency:

```xml
<dependency>
    <groupId>com.alibaba.csp</groupId>
    <artifactId>sentinel-apache-dubbo-adapter</artifactId>
    <version>x.y.z</version>
</dependency>
```

If you are using Dubbo **2.6.x** or previous version, you can add the following dependency:

```xml
<dependency>
    <groupId>com.alibaba.csp</groupId>
    <artifactId>sentinel-dubbo-adapter</artifactId>
    <version>x.y.z</version>
</dependency>
```

The adapter filters are enabled by default. Once you add the dependency, the Dubbo services and methods will become protected resources in Sentinel, which can leverage Sentinel's flow control and guard ability when rules are configured. 

If you don't want to enable the filter, you can manually disable it. For example:

```xml
<!-- disable the Sentinel Dubbo consumer filter -->
<dubbo:consumer filter="-sentinel.dubbo.consumer.filter"/>
```

The guarded resource can be both service interface and service method:

- Service interface：resourceName format is `interfaceName`，e.g. `com.alibaba.csp.sentinel.demo.dubbo.FooService`
- Service method：resourceName format is `interfaceName:methodSignature`，e.g. `com.alibaba.csp.sentinel.demo.dubbo.FooService:sayHello(java.lang.String)`

Sentinel Dubbo Adapter supports global fallback configuration.
The global fallback will handle exceptions and give the replacement result when blocked by
flow control, degrade or system load protection. You can implement your own `DubboFallback` interface
and then register to `DubboFallbackRegistry`. If no fallback is configured, Sentinel will wrap the `BlockException`
then directly throw it out. Besides, we can also leverage [Dubbo mock mechanism](http://dubbo.apache.org/en-us/docs/user/demos/local-mock.html) to provide the fallback implementation of degraded Dubbo services.

For Sentinel's best practice in Dubbo, please refer to [Sentinel: the flow sentinel of Dubbo](http://dubbo.apache.org/en-us/blog/sentinel-introduction-for-dubbo.html).

For more details of Dubbo filter, see [here](http://dubbo.apache.org/en-us/docs/dev/impls/filter.html).

### gRPC

Sentinel provides integration with [gRPC Java](https://github.com/grpc/grpc-java). Sentinel gRPC Adapter provides client and server interceptor for gRPC services. Add the following dependency in `pom.xml` (if you are using Maven):

```xml
<dependency>
    <groupId>com.alibaba.csp</groupId>
    <artifactId>sentinel-grpc-adapter</artifactId>
    <version>x.y.z</version>
</dependency>
```

To use Sentinel gRPC Adapter, you simply need to register the `Interceptor` to your client or server. The client sample:

```java
public class ServiceClient {

    private final ManagedChannel channel;

    ServiceClient(String host, int port) {
        this.channel = ManagedChannelBuilder.forAddress(host, port)
            .intercept(new SentinelGrpcClientInterceptor()) // Add the client interceptor.
            .build();
        // Init your stub here.
    }
}
```

The server sample；

```java
import io.grpc.Server;

Server server = ServerBuilder.forPort(port)
     .addService(new MyServiceImpl()) // Add your service.
     .intercept(new SentinelGrpcServerInterceptor()) // Add the server interceptor.
     .build();
```

> Note that currently the interceptor only supports unary methods in gRPC.

## Reactive support

### Reactor

> Note: supported since Sentinel 1.5.0. This module requires JDK 8 or later versions.

Sentinel provides integration module for [Reactor](https://projectreactor.io/).

Add the following dependency in `pom.xml` (if you are using Maven):

```xml
<dependency>
    <groupId>com.alibaba.csp</groupId>
    <artifactId>sentinel-reactor-adapter</artifactId>
    <version>x.y.z</version>
</dependency>
```

Example:

```java
someService.doSomething() // return type: Mono<T> or Flux<T>
   .transform(new SentinelReactorTransformer<>(resourceName)) // transform here
   .subscribe();
```

## API Gateway support

### Spring Cloud Gateway

> Note: this module requires Java 8 or later version.

Sentinel provides an integration module with Spring Cloud Gateway, which supports flow control for routes and customized API groups. The integration module is based on the Sentinel Reactor Adapter.

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
    @Order(-1)
    public GlobalFilter sentinelGatewayFilter() {
        return new SentinelGatewayFilter();
    }
}
```

The gateway adapter will regard all `routeId` (defined in Spring properties) and all customized API definitions
(defined in `GatewayApiDefinitionManager` of `sentinel-api-gateway-adapter-common` module) as resources.

You can register various customized callback in `GatewayCallbackManager`:

- `setBlockHandler`: register a customized `BlockRequestHandler` to handle the blocked request. The default implementation is `DefaultBlockRequestHandler`, which returns default message like `Blocked by Sentinel: FlowException`.

For more details you could refer to [the document of API gateway flow control](./api-gateway-flow-control.md).

### Zuul 1.x

Sentinel Zuul Adapter provides **route level** and **customized API level**
flow control for Zuul 1.x. Please refer to [the document here](https://github.com/alibaba/Sentinel/tree/master/sentinel-adapter/sentinel-zuul-adapter).

## Service Mesh

### Envoy

See [Envoy Global Rate Limiting Support](./envoy-global-rate-limiting-support.md).