# Sentinel 1.7.0 发布，支持 Envoy 集群流量控制

流控降级中间件 [Sentinel 1.7.0](https://github.com/alibaba/Sentinel/releases/tag/1.7.0) 版本正式发布，引入了 Envoy 集群流量控制支持、properties 文件配置、Consul/Etcd/Spring Cloud Config 动态数据源适配等多项新特性与改进。详细特性列表请参考 [Release Notes](https://github.com/alibaba/Sentinel/releases/tag/1.7.0)，欢迎大家使用并提出建议。

下面我们来一起探索一下 Sentinel 1.7.0 的重要特性。

## Envoy 集群流量控制

[Envoy](https://www.envoyproxy.io/) 目前广泛用作 Service Mesh 的数据平面，作为 sidecar 承担路由和流量转发等任务。在 Service Mesh 中集群流量控制是保障整个集群稳定性必不可少的一环，因此 Sentinel 1.7.0 提供了 [Envoy Global Rate Limiting gRPC Service](https://www.envoyproxy.io/docs/envoy/latest/intro/arch_overview/other_features/global_rate_limiting#arch-overview-rate-limit) 的实现 —— [Sentinel RLS token server](https://github.com/alibaba/Sentinel/tree/master/sentinel-cluster/sentinel-cluster-server-envoy-rls)，借助 Sentinel 集群限流 token server 来为 Envoy 服务网格提供集群流量控制的能力。

<div style="text-align: center;">
<img src="https://user-images.githubusercontent.com/9434884/68639837-d2266980-0540-11ea-8997-05084e2e47bb.png" alt="Envoy RLS Sentinel overview" style="width: 60%;" />
</div>

用户只需要拉起 Sentinel RLS token server 实例并配置集群流控规则，然后在 Envoy 中进行相应的配置即可快速接入 Sentinel 的集群限流。集群流控规则项与 Envoy 的 [rate limit action](https://www.envoyproxy.io/docs/envoy/latest/api-v2/api/v2/route/route.proto#envoy-api-msg-route-ratelimit) 生成的 descriptor 相对应，支持 `source_cluster`、`destination_cluster`、`request_headers`、`remote_address`、`generic_key` 等几种策略（支持组合）。示例规则项：

```yaml
domain: foo
descriptors:
  - resources:
    - key: "destination_cluster"
      value: "service_aliyun"
    count: 1
  - resources:
    - key: "remote_address"
      value: "30.40.50.60"
    count: 10
```

上面的示例配置了两条规则，针对的 domain 都是 `foo`（与 Envoy 的配置相对应），其中一条规则会对所有目标为 `service_aliyun` 集群的请求进行控制，QPS 最大为 1；另一条规则控制所有来源 IP 为 `30.40.50.60` 的请求每秒不超过 10 次。

我们提供了 [Sentinel RLS token server 在 Kubernetes 环境的示例](https://github.com/alibaba/Sentinel/tree/master/sentinel-cluster/sentinel-cluster-server-envoy-rls/sample/k8s)，方便大家在 K8s 集群中快速体验 Sentinel 集群限流的能力。

在后续的版本我们还会改进规则动态配置的方式，支持 Kubernetes CRD 的形式配置规则，同时结合 [Sentinel C++](https://github.com/alibaba/sentinel-cpp) 版本提供原生的 Envoy Filter。未来我们还会提供 Istio 的支持，让 Sentinel 在 Service Mesh 中发挥更为重要的作用。

## properties 文件配置支持

Sentinel 1.7.0 优化了加载[启动配置项](https://github.com/alibaba/Sentinel/wiki/启动配置项)的方式，支持将配置项直接配置在 properties 文件中。用户只需要通过 `-Dcsp.sentinel.config.file` 参数配置 properties 文件的路径即可，从而简化了通用配置的方式。

## 动态数据源适配

Sentinel 1.7.0 新增了以下三种动态数据源的支持，用户可以利用这些动态数据源保存、拉取规则：

- [Etcd 数据源](https://github.com/alibaba/Sentinel/tree/master/sentinel-extension/sentinel-datasource-etcd)
- [Consul 数据源](https://github.com/alibaba/Sentinel/tree/master/sentinel-extension/sentinel-datasource-consul)
- [Spring Cloud Config 数据源](https://github.com/alibaba/Sentinel/tree/master/sentinel-extension/sentinel-datasource-spring-cloud-config)

至此，Sentinel 已经支持了七种常用的配置中心，可以覆盖大部分的规则推送场景。

## Start hacking

值得注意的是，Sentinel 1.7.0 有近一半的特性都是由社区开发者贡献的，许多的特性都是社区里面进行充分讨论和 review 后出炉的，因此我们可以称 Sentinel 1.7.0 是一个社区一起定义的版本。我们非常欢迎大家持续参与社区贡献，一起来参与未来版本的演进。若您有意愿参与社区贡献，可以参考 [贡献指南](https://github.com/alibaba/Sentinel/issues/391) 来入门，同时也欢迎联系我们加入 Sentinel 核心贡献小组认领任务。积极参与贡献的开发者我们会重点关注，有机会被提名为 Committer。Now start hacking!
