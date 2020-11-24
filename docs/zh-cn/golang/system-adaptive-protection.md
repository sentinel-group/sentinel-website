# 系统自适应流控

Sentinel 系统自适应流控从整体维度对应用入口流量进行控制，结合系统的 Load、CPU 使用率以及应用的入口 QPS、平均响应时间和并发量等几个维度的监控指标，通过自适应的流控策略，让系统的入口流量和系统的负载达到一个平衡，让系统尽可能跑在最大吞吐量的同时保证系统整体的稳定性。

系统保护规则是应用整体维度的，而不是单个调用维度的，并且**仅对入口流量生效**。入口流量指的是进入应用的流量（埋点的 TrafficType 为 `Inbound`），比如 Web 服务或 gRPC provider 接收的请求，都属于入口流量。

系统自适应保护的原理参考 [此处文档](../system-adaptive-protection.md)。

## 示例

规则配置示例：

```go
import "github.com/alibaba/sentinel-golang/core/system"

// 自适应流控，启发因子为 load1 >= 8
_, err := system.LoadRules([]*system.SystemRule{
	{
		MetricType:system.Load,
		TriggerCount:8.0,
		Strategy:system.BBR,
	},
})
```