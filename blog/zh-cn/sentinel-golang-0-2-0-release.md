# Sentinel Go 0.2.0 发布，完善易用性与开源生态

[Sentinel](https://github.com/alibaba/Sentinel) 是阿里巴巴开源的，面向分布式服务架构的流量控制组件，主要以流量为切入点，从限流、流量整形、熔断降级、系统自适应保护等多个维度来帮助开发者保障微服务的稳定性。Sentinel 承接了阿里巴巴近 10 年的双十一大促流量的核心场景，例如秒杀、冷启动、消息削峰填谷、集群流量控制、实时熔断下游不可用服务等，是保障微服务高可用的利器，原生支持 Java/Go/C++ 等多种语言，并且提供 Envoy 全局流控支持来为 Service Mesh 提供高可用防护的能力。

近期，[Sentinel Go 0.2.0](https://github.com/alibaba/sentinel-golang/releases/tag/v0.2.0) 正式发布，完善易用性与开源生态，新增 gRPC、Gin、Dubbo-go 等框架的适配，新增动态文件数据源支持。在 0.2.0 版本中，用户只需要简单地对 Sentinel 进行初始化，并且为框架配置 Sentinel 的适配即可快速接入。比如针对 Gin Web 服务，我们只需要以下几步即可快速接入 Sentinel：

1. 在服务启动的时候对 Sentinel 进行初始化：

```go
import (
	sentinel "github.com/alibaba/sentinel-golang/api"
)

func init() {
	err := sentinel.InitDefault()
	if err != nil {
		log.Fatal(err)
	}
}
```

2. 在 Gin 的初始化代码中引入 SentinelMiddleware：

```go
import (
	sentinelPlugin "github.com/alibaba/sentinel-golang/adapter/gin" 
	"github.com/gin-gonic/gin"
)

r := gin.New()
// Sentinel 会对每个 API route 进行统计，资源名称类似于 GET:/foo/:id
// 默认的限流处理逻辑是返回 429 (Too Many Requests) 错误码，支持配置自定义的 fallback 逻辑
r.Use(sentinelPlugin.SentinelMiddleware())
```

3. 配置流控规则。可以创建动态文件数据源，通过文件配置规则，或硬编码配置规则。

详细特性列表请参考 [Release Notes](https://github.com/alibaba/sentinel-golang/releases/tag/v0.2.0)，欢迎大家使用并提出建议。

同时，社区也在完善更多的特性和整合模块，如 etcd 数据源、熔断降级等。Sentinel Go 版本的演进离不开社区的贡献，我们非常欢迎大家持续参与贡献，一起来主导未来版本的演进。若您有意愿参与贡献，可以参考 [贡献指南](https://github.com/alibaba/Sentinel/issues/391) 来入门，同时也欢迎联系我们加入 Sentinel 贡献小组认领任务（Sentinel 开源讨论钉钉群：30150716）。积极参与贡献的开发者我们会重点关注，有机会被提名为 Committer。Now start hacking!