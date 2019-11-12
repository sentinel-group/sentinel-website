# 开源框架适配

> **注：适配模块仅提供相应适配功能，若希望接入 Sentinel 控制台，请务必参考 [Sentinel 控制台文档](./dashboard.md)。**

## Web Servlet

Sentinel 提供与 Servlet 的整合，可以对 Web 请求进行流量控制。使用时需引入以下模块（以 Maven 为例）：

```xml
<dependency>
    <groupId>com.alibaba.csp</groupId>
    <artifactId>sentinel-web-servlet</artifactId>
    <version>x.y.z</version>
</dependency>
```

您只需要在 Web 容器中的 `web.xml` 配置文件中进行如下配置即可开启 Sentinel 支持：

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

若是 Spring 应用可以通过 Spring 进行配置，例如：

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

**限流处理逻辑**：默认情况下，当请求被限流时会返回默认的提示页面 `Blocked by Sentinel (flow limiting)`。您也可以通过 JVM 参数 `-Dcsp.sentinel.web.servlet.block.page` 或代码中调用 `WebServletConfig.setBlockPage(blockPage)` 方法设定自定义的跳转 URL，当请求被限流时会自动跳转至设定好的 URL。同样您也可以实现 `UrlBlockHandler` 接口并编写定制化的限流处理逻辑，然后将其注册至 `WebCallbackManager` 中。

> 提示：1.7.0 版本开始默认的限流页面 HTTP 返回码是 **429**。您可以通过 `csp.sentinel.web.servlet.block.status` 配置项自定义限流页面的 HTTP 状态码。

**按来源限流**：若希望对 HTTP 请求按照来源限流，则可以自己实现 `RequestOriginParser` 接口从 HTTP 请求中解析 origin 并注册至 `WebCallbackManager` 中。**注意来源数目不能太多，若太多请自定义埋点作为参数传入并使用热点规则。**

**注意**：Sentinel Web Filter 会将每个到来的不同的 URL 都作为不同的资源处理，因此对于 REST 风格的 API，需要自行实现 `UrlCleaner` 接口清洗一下资源（比如将满足 `/foo/:id` 的 URL 都归到 `/foo/*` 资源下），然后将其注册至 `WebCallbackManager` 中。否则会导致资源数量过多，超出资源数量阈值（目前是 6000）时多出的资源的规则将 **不会生效**。

从 1.6.3 版本开始，`UrlCleaner` 还可以来过滤掉不希望统计的 URL，只需要在 UrlCleaner 中将不希望统计的 URL 转换成空字符串（""）即可。示例：

```java
WebCallbackManager.setUrlCleaner(new UrlCleaner() {
    @Override
    public String clean(String originUrl) {
        if (originUrl == null || originUrl.isEmpty()) {
            return originUrl;
        }

        // 比如将满足 /foo/{id} 的 URL 都归到 /foo/*
        if (originUrl.startsWith("/foo/")) {
            return "/foo/*";
        }
        // 不希望统计 *.ico 的资源文件，可以将其转换为 empty string (since 1.6.3)
        if (originUrl.endsWith(".ico")) {
            return "";
        }
        return originUrl;
    }
});
```

如果您正在使用 Spring Boot / Spring Cloud，那么可以通过引入 Spring Cloud Alibaba Sentinel 来更方便地整合 Sentinel，详情请见 [Spring Cloud Alibaba 文档](https://github.com/alibaba/spring-cloud-alibaba/wiki/Sentinel#如何使用-sentinel)。

## Dubbo

Sentinel 提供 Dubbo 的相关适配 [Sentinel Dubbo Adapter](https://github.com/dubbo/dubbo-sentinel-support)，主要包括针对 Service Provider 和 Service Consumer 实现的 Filter。相关模块：

- `sentinel-apache-dubbo-adapter`（兼容 Apache Dubbo 2.7.x 及以上版本，自 Sentinel 1.5.1 开始支持）
- `sentinel-dubbo-adapter`（兼容 Dubbo 2.6.x 版本）

对于 Apache Dubbo **2.7.x** 及以上版本，使用时需引入以下模块（以 Maven 为例）：

```xml
<dependency>
    <groupId>com.alibaba.csp</groupId>
    <artifactId>sentinel-apache-dubbo-adapter</artifactId>
    <version>x.y.z</version>
</dependency>
```

对于 Dubbo **2.6.x** 及以下版本，使用时需引入以下模块（以 Maven 为例）：

```xml
<dependency>
    <groupId>com.alibaba.csp</groupId>
    <artifactId>sentinel-dubbo-adapter</artifactId>
    <version>x.y.z</version>
</dependency>
```

引入此依赖后，Dubbo 的服务接口和方法（包括调用端和服务端）就会成为 Sentinel 中的资源，在配置了规则后就可以自动享受到 Sentinel 的防护能力。

> **注：若希望接入 Dashboard，请参考 [接入控制台的步骤](https://github.com/alibaba/Sentinel/blob/master/sentinel-demo/sentinel-demo-dubbo/README.md#sentinel-dashboard)。只引入 Sentinel Dubbo Adapter 无法接入控制台！**

若不希望开启 Sentinel Dubbo Adapter 中的某个 Filter，可以手动关闭对应的 Filter，比如：

```xml
<!-- 关闭 Sentinel 对应的 Service Consumer Filter -->
<dubbo:consumer filter="-sentinel.dubbo.consumer.filter"/>
```

限流粒度可以是服务接口和服务方法两种粒度：

- 服务接口：resourceName 为 `接口全限定名`，如 `com.alibaba.csp.sentinel.demo.dubbo.FooService`
- 服务方法：resourceName 为 `接口全限定名:方法签名`，如 `com.alibaba.csp.sentinel.demo.dubbo.FooService:sayHello(java.lang.String)`

Sentinel Dubbo Adapter 还支持配置全局的 fallback 函数，可以在 Dubbo 服务被限流/降级/负载保护的时候进行相应的 fallback 处理。用户只需要实现自定义的 [`DubboFallback`](https://github.com/alibaba/Sentinel/blob/master/sentinel-adapter/sentinel-dubbo-adapter/src/main/java/com/alibaba/csp/sentinel/adapter/dubbo/fallback/DubboFallback.java) 接口，并通过 `DubboFallbackRegistry` 注册即可。默认情况会直接将 `BlockException` 包装后抛出。同时，我们还可以配合 [Dubbo 的 fallback 机制](http://dubbo.incubator.apache.org/zh-cn/docs/user/demos/local-mock.html) 来为降级的服务提供替代的实现。

> 注：一般情况下熔断降级 / fallback 用于调用端（客户端）。

我们提供了 Dubbo 的相关示例，请见 [sentinel-demo-dubbo](https://github.com/alibaba/Sentinel/tree/master/sentinel-demo/sentinel-demo-dubbo)。

有关 Sentinel 在 Dubbo 中的最佳实践，请参考 [Sentinel: Dubbo 服务的流量哨兵](http://dubbo.incubator.apache.org/zh-cn/blog/sentinel-introduction-for-dubbo.html)。

关于 Dubbo Filter 的更多信息，请参考 [Dubbo Filter 文档](http://dubbo.incubator.apache.org/zh-cn/docs/dev/impls/filter.html)。

## Spring Cloud

[Spring Cloud Alibaba](https://github.com/spring-cloud-incubator/spring-cloud-alibaba) 致力于提供微服务开发的一站式解决方案。Sentinel 与 Spring Cloud 的整合见 [Sentinel Spring Cloud Starter](https://github.com/alibaba/spring-cloud-alibaba/wiki/Sentinel)。

Spring Cloud Alibaba 默认为 Sentinel 整合了 Servlet、RestTemplate、FeignClient 和 Spring WebFlux。Sentinel 在 Spring Cloud 生态中，不仅补全了 Hystrix 在 Servlet 和 RestTemplate 这一块的空白，而且还完全兼容了 Hystrix 在 FeignClient 中限流降级的用法，并且支持运行时灵活地配置和调整限流降级规则。

Spring Cloud Alibaba Sentinel 的示例可以参考 [sentinel-guide-spring-cloud](https://github.com/sentinel-group/sentinel-guides/tree/master/sentinel-guide-spring-cloud)

## Spring WebFlux

> 注：从 1.5.0 版本开始支持，需要 Java 8 及以上版本。

Sentinel 提供与 Spring WebFlux 的整合模块，从而 Reactive Web 应用也可以利用 Sentinel 的流控降级来保障稳定性。该整合模块基于 Sentinel Reactor Adapter 实现。

使用时需引入以下模块（以 Maven 为例）：

```xml
<dependency>
    <groupId>com.alibaba.csp</groupId>
    <artifactId>sentinel-spring-webflux-adapter</artifactId>
    <version>x.y.z</version>
</dependency>
```

使用时只需注入对应的 `SentinelWebFluxFilter` 实例以及 `SentinelBlockExceptionHandler` 实例即可。比如：

```java
@Configuration
public class WebFluxConfig {

    private final List<ViewResolver> viewResolvers;
    private final ServerCodecConfigurer serverCodecConfigurer;

    public WebFluxConfig(ObjectProvider<List<ViewResolver>> viewResolversProvider,
                         ServerCodecConfigurer serverCodecConfigurer) {
        this.viewResolvers = viewResolversProvider.getIfAvailable(Collections::emptyList);
        this.serverCodecConfigurer = serverCodecConfigurer;
    }

    @Bean
    @Order(-1)
    public SentinelBlockExceptionHandler sentinelBlockExceptionHandler() {
        // Register the block exception handler for Spring WebFlux.
        return new SentinelBlockExceptionHandler(viewResolvers, serverCodecConfigurer);
    }

    @Bean
    @Order(-1)
    public SentinelWebFluxFilter sentinelWebFluxFilter() {
        // Register the Sentinel WebFlux filter.
        return new SentinelWebFluxFilter();
    }
}
```

您可以在 `WebFluxCallbackManager` 注册回调进行定制：

- `setBlockHandler`：注册函数用于实现自定义的逻辑处理被限流的请求，对应接口为 `BlockRequestHandler`。默认实现为 `DefaultBlockRequestHandler`，当被限流时会返回类似于下面的错误信息：`Blocked by Sentinel: FlowException`。
- `setUrlCleaner`：注册函数用于 Web 资源名的归一化。函数类型为 `(ServerWebExchange, String) → String`，对应含义为 `(webExchange, originalUrl) → finalUrl`。
- `setRequestOriginParser`：注册函数用于从请求中解析请求来源。函数类型为 `ServerWebExchange → String`。

相关示例：[sentinel-demo-spring-webflux](https://github.com/alibaba/Sentinel/tree/master/sentinel-demo/sentinel-demo-spring-webflux)

## gRPC

Sentinel 提供与 [gRPC Java](https://github.com/grpc/grpc-java) 的整合，以 gRPC [ServerInterceptor](https://grpc.io/grpc-java/javadoc/io/grpc/ServerInterceptor.html) 和 [ClientInterceptor](https://grpc.io/grpc-java/javadoc/io/grpc/ClientInterceptor.html) 的形式保护 gRPC 服务资源。使用时需引入以下模块（以 Maven 为例）：

```xml
<dependency>
    <groupId>com.alibaba.csp</groupId>
    <artifactId>sentinel-grpc-adapter</artifactId>
    <version>x.y.z</version>
</dependency>
```

在使用 Sentinel gRPC Adapter 时，只需要将对应的 `Interceptor` 注册至对应的客户端或服务端中。其中客户端的示例如下：

```java
public class ServiceClient {

    private final ManagedChannel channel;

    ServiceClient(String host, int port) {
        this.channel = ManagedChannelBuilder.forAddress(host, port)
            .intercept(new SentinelGrpcClientInterceptor()) // 在此处注册拦截器
            .build();
        // 在此处初始化客户端 stub 类
    }
}
```

服务端的示例如下：

```java
import io.grpc.Server;

Server server = ServerBuilder.forPort(port)
     .addService(new MyServiceImpl()) // 添加自己的服务实现
     .intercept(new SentinelGrpcServerInterceptor()) // 在此处注册拦截器
     .build();
```

注意：由于 gRPC 拦截器中 ClientCall/ServerCall 以回调的形式进行请求响应信息的获取，每次 gRPC 服务调用计算出的 RT 可能会不准确。Sentinel gRPC Adapter 目前只支持 unary call。

## Reactive 适配

### Reactor

> 注：从 1.5.0 版本开始支持，需要 Java 8 及以上版本。

Sentinel 提供 [Reactor](https://projectreactor.io/) 的适配，可以方便地在 reactive 应用中接入 Sentinel。使用时需引入以下模块（以 Maven 为例）：

```xml
<dependency>
    <groupId>com.alibaba.csp</groupId>
    <artifactId>sentinel-reactor-adapter</artifactId>
    <version>x.y.z</version>
</dependency>
```

Sentinel Reactor Adapter 分别针对 `Mono` 和 `Flux` 实现了对应的 Sentinel Operator，从而在各种事件触发时汇入 Sentinel 的相关逻辑。同时 Sentinel 在上层提供了 `SentinelReactorTransformer` 用于在组装期装入对应的 operator，用户使用时只需要通过 `transform` 操作符来进行变换即可。接入示例：

```java
someService.doSomething() // return type: Mono<T> or Flux<T>
   .transform(new SentinelReactorTransformer<>(resourceName)) // 在此处进行变换
   .subscribe();
```

## API Gateway 适配

Sentinel 支持对 Spring Cloud Gateway、Zuul 等主流的 API Gateway 进行限流。

### Spring Cloud Gateway

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

详细文档可以参考 [网关限流 - Spring Cloud Gateway 文档](https://github.com/alibaba/Sentinel/wiki/网关限流#spring-cloud-gateway)。

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

详细文档可以参考 [网关限流 - Zuul 1.x](https://github.com/alibaba/Sentinel/wiki/网关限流#zuul-1x)。

如果您正在使用 Spring Cloud Zuul Starter，那么可以通过引入 `spring-cloud-alibaba-sentinel-zuul` 来更方便地整合 Sentinel。请参考 [对应文档](https://github.com/spring-cloud-incubator/spring-cloud-alibaba/tree/master/spring-cloud-alibaba-sentinel-zuul)。

## Apache RocketMQ

在 Apache RocketMQ 中，当消费者去消费消息的时候，无论是通过 pull 的方式还是 push 的方式，都可能会出现大批量的消息突刺。如果此时要处理所有消息，很可能会导致系统负载过高，影响稳定性。但其实可能后面几秒之内都没有消息投递，若直接把多余的消息丢掉则没有充分利用系统处理消息的能力。我们希望可以把消息突刺均摊到一段时间内，让系统负载保持在消息处理水位之下的同时尽可能地处理更多消息，从而起到“削峰填谷”的效果：

![削峰填谷](https://github.com/alibaba/Sentinel/wiki/image/mq-traffic-peak-clipping.png) 

上图中红色的部分代表超出消息处理能力的部分。我们可以看到消息突刺往往都是瞬时的、不规律的，其后一段时间系统往往都会有空闲资源。我们希望把红色的那部分消息平摊到后面空闲时去处理，这样既可以保证系统负载处在一个稳定的水位，又可以尽可能地处理更多消息。Sentinel 专门为这种场景提供了[匀速器](https://github.com/alibaba/Sentinel/wiki/%E9%99%90%E6%B5%81---%E5%8C%80%E9%80%9F%E5%99%A8)的特性，可以把突然到来的大量请求以匀速的形式均摊，以固定的间隔时间让请求通过，以稳定的速度逐步处理这些请求，起到“削峰填谷”的效果，从而避免流量突刺造成系统负载过高。同时堆积的请求将会排队，逐步进行处理；当请求排队预计超过最大超时时长的时候则直接拒绝，而不是拒绝全部请求。

比如在 RocketMQ 的场景下配置了匀速模式下请求 QPS 为 5，则会每 200 ms 处理一条消息，多余的处理任务将排队；同时设置了超时时间为 5 s，预计排队时长超过 5 s 的处理任务将会直接被拒绝。示意图如下图所示：

![Uniform rate](https://github.com/alibaba/Sentinel/wiki/image/uniform-speed-queue.png)

RocketMQ 用户可以根据不同的 group 和不同的 topic 分别设置限流规则，限流控制模式设置为匀速器模式（`RuleConstant.CONTROL_BEHAVIOR_RATE_LIMITER`），比如：

```java
private void initFlowControlRule() {
    FlowRule rule = new FlowRule();
    rule.setResource(KEY); // 对应的 key 为 `groupName:topicName`
    rule.setCount(5);
    rule.setGrade(RuleConstant.FLOW_GRADE_QPS);
    rule.setLimitApp("default");

    // 匀速器模式下，设置了 QPS 为 5，则请求每 200 ms 允许通过 1 个
    rule.setControlBehavior(RuleConstant.CONTROL_BEHAVIOR_RATE_LIMITER);
    // 如果更多的请求到达，这些请求会被置于虚拟的等待队列中。等待队列有一个 max timeout，如果请求预计的等待时间超过这个时间会直接被 block
    // 在这里，timeout 为 5s
    rule.setMaxQueueingTimeMs(5 * 1000);
    FlowRuleManager.loadRules(Collections.singletonList(rule));
}
```

结合 RocketMQ Client 使用 Sentinel 时，用户需要在处理消息时手动埋点。详情请见 [Sentinel RocketMQ Demo](https://github.com/alibaba/Sentinel/tree/master/sentinel-demo/sentinel-demo-rocketmq)。相关 Blog 见 [Sentinel 为 RocketMQ 保驾护航](https://github.com/alibaba/Sentinel/wiki/Sentinel-%E4%B8%BA-RocketMQ-%E4%BF%9D%E9%A9%BE%E6%8A%A4%E8%88%AA)。