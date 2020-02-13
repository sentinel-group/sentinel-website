# 迈向云原生，Sentinel Golang 首个版本发布

随着微服务的流行，服务和服务之间的稳定性变得越来越重要。[Sentinel](https://github.com/alibaba/Sentinel) 是阿里巴巴开源的，面向分布式服务架构的流量控制组件，主要以流量为切入点，从限流、流量整形、熔断降级、系统自适应保护等多个维度来帮助开发者保障微服务的稳定性。Sentinel 承接了阿里巴巴近 10 年的双十一大促流量的核心场景，例如秒杀、冷启动、消息削峰填谷、集群流量控制、实时熔断下游不可用服务等，是保障微服务高可用的利器。

Sentinel 开源初期主要面向 Java 微服务，同时也在朝着多语言扩展的方向不断探索。去年中旬，Sentinel 推出 [C++ 原生版本](https://github.com/alibaba/sentinel-cpp)，同时针对 Service Mesh 场景，Sentinel 也推出了 [Envoy 集群流量控制的支持](https://github.com/alibaba/Sentinel/tree/master/sentinel-cluster/sentinel-cluster-server-envoy-rls)，可以解决 Service Mesh 架构下多语言限流的问题。

<img src="https://user-images.githubusercontent.com/9434884/74398114-87730100-4e51-11ea-9267-288cbc71b508.png" alt="Sentinel Golang Logo" height="70%" width="70%">

近期，Sentinel 多语言俱乐部又迎来新的一员 —— [Sentinel Golang](https://github.com/sentinel-group/sentinel-golang) 首个原生版本 0.1.0 正式发布，为 Go 语言的微服务提供流控降级、系统保护等特性的原生支持。开发者只需简单的几步即可快速接入 Sentinel，享受到以下能力：

- 精确限制接口级别的 QPS，防止打垮核心接口。
- 削峰填谷，激增的请求排队等待处理。
- 自适应的系统维度流量保护，结合 load 等系统指标以及服务实时的请求量和响应时间来自动拒绝多余的流量，尽可能地提升吞吐量的同时保证服务不挂。
- 实时的秒级监控能力，通过监控日志了解系统的实时流量情况。

更多特性介绍可以参考 [Sentinel Golang 文档](https://github.com/sentinel-group/sentinel-golang/wiki/%E5%A6%82%E4%BD%95%E4%BD%BF%E7%94%A8)。

在接下来的版本中，Sentinel Golang 将会陆续推出熔断降级、热点参数限流等一系列的稳定性保障能力。同时，社区也会陆续提供与常用的框架和云原生组件的整合模块，如原生 Istio Service Mesh 整合，方便开发者在各种云原生场景下快速接入 Sentinel。社区后面也计划提供与 Prometheus 等云原生监控组件的整合，可以利用 Sentinel 的指标统计数据进行接口级别的监控。

Sentinel Golang 的诞生离不开社区的贡献，在此感谢 @louyuting 和 @gorexlv 两位社区开发者在 Sentinel Go 版本演进中的积极贡献。我们非常欢迎大家持续参与社区贡献，一起来参与未来版本的演进。若您有意愿参与社区贡献，可以参考 [贡献指南](https://github.com/alibaba/Sentinel/issues/391) 来入门，同时也欢迎联系我们加入 Sentinel 核心贡献小组认领任务（Sentinel 开源讨论钉钉群：21977771）。积极参与贡献的开发者我们会重点关注，有机会被提名为 Committer。Now start hacking!