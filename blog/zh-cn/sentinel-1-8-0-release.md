# Sentinel 1.8.0 年度版本发布，熔断降级重构升级

在经过数月的打磨后，[Sentinel 1.8.0](https://github.com/alibaba/Sentinel/releases/tag/v1.8.0) 版本正式发布！该版本是本年度最重要的版本之一，包含大量特性改进与 bug 修复，尤其是针对熔断降级特性的完善升级（支持任意统计时长、慢调用比例降级策略、熔断器事件监听）；同时该版本进一步扩充了开源生态，提供对 Java EE (JAX-RS, CDI), Quarkus, HTTP client 等体系的原生支持。详细特性列表请参考 [Release Notes](https://github.com/alibaba/Sentinel/releases/tag/v1.8.0)，欢迎大家使用并提出建议。

下面我们来一起探索一下 Sentinel 1.8.0 的重要特性。

## 熔断降级改进

一个服务常常会调用别的模块，可能是另外的一个远程服务、数据库，或者第三方 API 等。例如，支付的时候，可能需要远程调用银联提供的 API；查询某个商品的价格，可能需要进行数据库查询。然而，这个被依赖服务的稳定性是不能保证的。如果依赖的服务出现了不稳定的情况，请求的响应时间变长，那么调用服务的方法的响应时间也会变长，线程会产生堆积，最终可能耗尽业务自身的线程池，服务本身也变得不可用。

![dependency](https://user-images.githubusercontent.com/9434884/62410811-cd871680-b61d-11e9-9df7-3ee41c618644.png)

现代微服务架构都是分布式的，由非常多的服务组成。不同服务之间相互调用，组成复杂的调用链路。以上的问题在链路调用中会产生放大的效果。复杂链路上的某一环不稳定，就可能会层层级联，最终导致整个链路都不可用。因此我们需要对不稳定的**弱依赖服务**进行**自动熔断**，暂时切断不稳定调用，避免局部不稳定因素导致整体的雪崩。

Sentinel 1.8.0 版本对原有的熔断降级模块进行了重构和升级，重新以熔断器（cicuit breaker）的形式进行抽象，并进一步完善了熔断器的能力。新版熔断降级支持**任意统计时长**，用户可以根据接口的场景灵活配置统计维度为秒级或者分钟级；同时我们也引入了用户需要的**半开启探测恢复支持**。新版熔断降级还对原有的秒级平均 RT 策略进行了升级，原有 RT 策略对稀疏请求不友好，并且采用平均 RT 可能会被某个特别慢的调用影响。1.8.0 版本将基于响应时长的策略升级为**慢调用比例策略**，用户指定响应时长超出多少记为慢调用（即稳态 RT 的上界），同时配置慢调用比例阈值，结合场景配置统计时长维度，即可更好地针对慢调用进行熔断。用户可以结合 Sentinel 控制台的实时监控来决定稳态 RT 的阈值。

同时考虑到用户可能需要感知熔断器的状态变化以进行一些日志记录或其它的操作，Sentinel 提供了熔断器的事件监听器扩展，用户可以注册自定义的事件监听器以感知熔断器状态变化。示例：

```java
EventObserverRegistry.getInstance().addStateChangeObserver("logging",
    (prevState, newState, rule, snapshotValue) -> {
        if (newState == State.OPEN) {
            // 变换至 OPEN state 时会携带触发时的值
            System.out.println(String.format("%s -> OPEN at %d, snapshotValue=%.2f", prevState.name(),
                TimeUtil.currentTimeMillis(), snapshotValue));
        } else {
            System.out.println(String.format("%s -> %s at %d", prevState.name(), newState.name(),
                TimeUtil.currentTimeMillis()));
        }
    });
```

至此，Sentinel 已提供三种熔断策略：**慢调用比例**、**异常比例**和**异常数**。有关熔断降级特性的更多信息请参考 [熔断降级文档](https://sentinelguard.io/zh-cn/docs/circuit-breaking.html)。

## 开源生态与云原生

Sentinel 1.8.0 进一步扩充了开源生态。Sentinel 1.8.0 引入了 Java EE 原生支持，提供对 JAX-RS Web 应用的原生支持（[sentinel-jax-rs-adapter](https://github.com/alibaba/Sentinel/tree/master/sentinel-adapter/sentinel-jax-rs-adapter)），以及基于 CDI 的注解埋点支持（[sentinel-annotation-cdi-interceptor](https://github.com/alibaba/Sentinel/tree/master/sentinel-extension/sentinel-annotation-cdi-interceptor)），对于采用原生 Java EE 架构的服务可以更方便地接入。

<center><img src="https://user-images.githubusercontent.com/9434884/91040198-654c0e00-e640-11ea-9b3b-c3eecc0949cd.png" alt="sentinel-and-quarkus" style="width:50%" /></center>

Quarkus 作为广受关注的云原生微服务框架，在微服务框架中活跃度排名前列。Sentinel 1.8.0 提供了[针对 Quarkus 的适配模块](https://github.com/alibaba/Sentinel/tree/master/sentinel-adapter/sentinel-quarkus-adapter)，支持 Quarkus Web 服务无缝集成（基于 JAX-RS 适配），并且通过 CDI 注解埋点支持和 Reactor 适配，可以针对 Quarkus 服务中的任意逻辑进行流控。Quarkus 适配模块支持构建 native image，感兴趣的开发者欢迎参考 [demo](https://github.com/alibaba/Sentinel/tree/master/sentinel-demo/sentinel-demo-quarkus) 进行尝试。

至此，Sentinel 的开源生态得到进一步扩充：

![sentinel-open-source-eco](https://user-images.githubusercontent.com/9434884/91042203-f670b400-e643-11ea-959a-c24c7c67e3f4.png)

## 其它重要特性/改进

- `@SentinelResource` 注解支持配置类级别统一的 defaultFallback
- 修复 Dubbo 2.7.x 适配模块 Entry 泄漏可能导致 FGC 的 bug
- 修复 Spring Web 适配模块在内部转发请求时可能导致 ErrorEntryFreeException 的 bug
- 支持通过 properties 配置文件配置 `project.name`（至此所有启动配置项均可通过文件配置）
- 新增 Eureka 数据源支持

更多信息请参考 [Release Notes](https://github.com/alibaba/Sentinel/releases/tag/v1.8.0)。

## Start hacking

Sentinel 1.8.0 是社区一起定义的年度版本，近 80% 的特性都是社区开发者贡献的。感谢各位贡献者的付出！同时我们非常欢迎大家持续参与社区贡献，一起来参与未来版本的演进。若您有意愿参与社区贡献，欢迎联系我们加入 Sentinel 贡献小组一起成长（Sentinel 开源讨论钉钉群：30150716）。我们会定期给活跃贡献者寄送小礼品，核心贡献者会提名为 committer，一起主导社区的演进。同时，也欢迎大家通过 [AHAS Sentinel 控制台](https://help.aliyun.com/document_detail/101132.html) 来快速体验 Sentinel 的能力。Now let's start hacking!
