# 并发隔离控制

并发隔离控制是指基于资源访问的并发协程数来控制对资源的访问，这里的思路和信号量隔离很类似，主要是控制对资源访问的最大并发数，避免因为资源的异常导致协程耗尽。

参考：[https://github.com/alibaba/sentinel-golang/tree/master/core/isolation](https://github.com/alibaba/sentinel-golang/tree/master/core/isolation)

## 隔离规则

并发隔离规则的[定义](https://github.com/alibaba/sentinel-golang/blob/master/core/isolation/rule.go)如下：

```go
// Rule describes the concurrency num control, that is similar to semaphore
type Rule struct {
	// ID represents the unique ID of the rule (optional).
	ID         string     `json:"id,omitempty"`
	Resource   string     `json:"resource"`
	MetricType MetricType `json:"metricType"`
	Threshold  uint32     `json:"threshold"`
}
```

Sentinel 支持 `Concurrency`，也就是并发数作为统计指标。如果资源当前的并发数高于阈值 (Threshold)，那么资源将不可访问。

隔离规则配置示例（具体数值不作为线上配置参考，要根据业务系统情况而定）：

```go
r1 := &Rule{
	Resource:   "abc",
	MetricType: Concurrency,
	Threshold:  100,
}
```

## 最佳实践场景

在分布式系统架构中，我们一般推荐在客户端（调用端）做一层软隔离（并发隔离控制），达到对资源访问的并发控制的目的。

## 示例

参考：[concurrency_limiting_example](https://github.com/alibaba/sentinel-golang/blob/master/example/isolation/concurrency_limitation_example.go)