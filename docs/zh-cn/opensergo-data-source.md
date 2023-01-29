# OpenSergo 动态规则源

Sentinel 2.0 将作为 [OpenSergo 流量治理](https://opensergo.io/zh-cn/)的标准实现，原生支持 OpenSergo 流量治理相关 CRD 配置及能力，结合 Sentinel 提供的各框架的适配模块，让 Dubbo, Spring Cloud Alibaba, gRPC, CloudWeGo 等20+框架能够无缝接入到 OpenSergo 生态中，用统一的 CRD 来配置流量路由、流控降级、服务容错等治理规则。无论是 Java 还是 Go 还是 Mesh 服务，无论是 HTTP 请求还是 RPC 调用，还是数据库 SQL 访问，用户都可以用统一的容错治理规则 CRD 来给微服务架构中的每一环配置治理，来保障服务链路的稳定性。

Sentinel 社区提供对接 OpenSergo spec 的动态数据源模块 [`sentinel-datasource-opensergo`](https://github.com/alibaba/Sentinel/tree/master/sentinel-extension/sentinel-datasource-opensergo)，只需要按照 Sentinel 数据源的方式接入即可。

> 注意：该适配模块目前还在 beta 阶段。目前 Sentinel OpenSergo 数据源支持流控规则、匀速排队规则以及熔断规则。

![image](../../img/opensergo/sentinel-opensergo-datasource-arch.jpg)

以 Java 版本为例，首先 Maven 引入依赖：

```xml
<dependency>
    <groupId>com.alibaba.csp</groupId>
    <artifactId>sentinel-datasource-opensergo</artifactId>
    <!-- 对应 Sentinel 1.8.6 版本 -->
    <version>0.1.0-beta</version>
</dependency>
```

然后在项目合适的位置（如 Spring 初始化 hook 或 Sentinel `InitFunc` 中）中创建并注册 Sentinel OpenSergo 数据源。在应用启动前，确保 OpenSergo 控制面及 CRD 已经部署在 Kubernetes 集群中，可以参考[控制面快速部署文档](https://opensergo.io/zh-cn/docs/quick-start/opensergo-control-plane/)。

```java
// 传入 OpenSergo Control Plane 的 endpoint，以及希望监听的应用名.
// 在我们的例子中，假定应用名为 foo-app
OpenSergoDataSourceGroup openSergo = new OpenSergoDataSourceGroup("localhost", 10246, "default", "foo-app");
// 初始化 OpenSergo 数据源
openSergo.start();

// 订阅 OpenSergo 流控规则，并注册数据源到 Sentinel 流控规则数据源中
FlowRuleManager.register2Property(openSergo.subscribeFlowRules());
```

启动应用后，即可编写 [FaultToleranceRule、RateLimitStrategy 等 CR YAML](https://github.com/opensergo/opensergo-specification/blob/main/specification/zh-Hans/fault-tolerance.md) 来动态配置流控容错规则，通过 kubectl apply 到集群中即可生效。

Sentinel 社区提供了一个 [Spring Boot 应用接入 OpenSergo 数据源的 demo](https://github.com/alibaba/Sentinel/blob/master/sentinel-demo/sentinel-demo-opensergo-datasource/README.zh-cn.md)，可作参考。