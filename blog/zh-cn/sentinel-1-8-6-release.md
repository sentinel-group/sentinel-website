# Sentinel 1.8.6 版本发布，初步支持 OpenSergo 流量治理标准

本周 [Sentinel 1.8.6](https://github.com/alibaba/Sentinel/releases/tag/1.8.6) 正式发布，带来了多项特性和改进。主要新特性及改进如下：

- 流控日志 `sentinel-block.log` 支持记录触发规则 ID，便于识别具体触发的规则
- 修复 Apache Dubbo 3.x 适配模块中 SPI path 错误导致无法生效的 bug

详情请参考 [Release Notes](https://github.com/alibaba/Sentinel/releases/tag/1.8.6)。感谢为该版本付出的所有贡献者：@AlbumenJ, @hongpy, @icodening, @PepoRobert, @sczyh30, @ZhongJinHacker

同时，随着 Sentinel 1.8.6 版本的发布，Sentinel 对接 OpenSergo 流量治理 spec 的数据源模块（[sentinel-datasource-opensergo](https://github.com/alibaba/Sentinel/pull/2842)）也迎来了首个版本。[OpenSergo](https://opensergo.io/zh-cn/) 是开放通用的，覆盖微服务及上下游关联组件的微服务治理项目。OpenSergo 从微服务的角度出发，涵盖**流量治理、服务容错、服务元信息治理、安全治理**等关键治理领域，提供一系列的治理能力与标准、生态适配与最佳实践，支持 Java, Go, Rust 等多语言生态。借助 sentinel-datasource-opensergo 数据源模块，开发者可以很方便地将 Kubernetes 集群下的应用通过 Sentinel 接入到 OpenSergo 控制面，然后通过统一的 OpenSergo CRD 对异构化的服务进行统一的治理规则管控。

下面是一个简单的示例。首先我们在 Maven 中引入依赖：

```xml
<dependency>
    <groupId>com.alibaba.csp</groupId>
    <artifactId>sentinel-datasource-opensergo</artifactId>
    <!-- 对应 Sentinel 1.8.6 版本 -->
    <version>0.1.0-beta</version>
</dependency>
```

然后在项目合适的位置（如 Spring 初始化 hook 或 Sentinel InitFunc 中）中创建并注册 Sentinel OpenSergo 数据源。在应用启动前，确保 OpenSergo 控制面及 CRD 已经部署在 Kubernetes 集群中。

```java
// 传入 OpenSergo Control Plane 的 endpoint，以及希望监听的应用名.
// 在我们的例子中，假定应用名为 foo-app
OpenSergoDataSourceGroup openSergo = new OpenSergoDataSourceGroup("opensergo-control-plane.svc.endpoint", 10246, "default", "foo-app");
// 初始化 OpenSergo 数据源.
openSergo.start();

// 订阅 OpenSergo 流控规则，并注册数据源到 Sentinel 流控规则数据源中.
FlowRuleManager.register2Property(openSergo.subscribeFlowRules());
```

启动应用后，即可编写 [FaultToleranceRule、RateLimitStrategy 等 CR YAML](https://github.com/opensergo/opensergo-specification/blob/main/specification/zh-Hans/fault-tolerance.md) 来动态配置流控容错规则，通过 kubectl apply 到集群中即可生效。

![sentinel-datasource-opensergo](https://user-images.githubusercontent.com/9434884/186125289-efb5e75a-0d6d-486c-a577-f986024ad911.png)

社区正在持续投入到 Sentinel 2.0 的演进中。Sentinel 2.0 品牌升级将为流量治理，领域涵盖流量路由/调度、流量染色、流控降级等；同时社区正在将流量治理相关标准抽出到 [OpenSergo 微服务治理 spec](https://opensergo.io/zh-cn/docs/what-is-opensergo/feature-list/) 中，Sentinel 作为流量治理标准实现。有关 Sentinel 流控降级与容错 spec 的最新进展，请参考 [opensergo-specification](https://github.com/opensergo/opensergo-specification/blob/main/specification/zh-Hans/fault-tolerance.md)，也欢迎社区一起来完善标准与实现。

![opensergo-and-sentinel](https://user-images.githubusercontent.com/9434884/183335605-4215c142-3f30-4cfb-a1f1-a235a44d024b.png)

