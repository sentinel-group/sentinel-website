# 新手指南 (Sentinel Go)

欢迎来到 Sentinel 的世界！这篇新手指南将指引您快速入门 Sentinel Go。

## 引入 Sentinel 依赖

Sentinel Go 支持 go modules 的依赖，可以通过 [release 页面](https://github.com/alibaba/sentinel-golang/releases) 获取最新 release 版本，并通过 go mod 引用依赖：`github.com/alibaba/sentinel-golang v1.0.0`

## 定义资源

资源是 Sentinel 中的最核心概念之一，Sentinel 中所有的限流熔断机制都是基于资源生效的，不同资源的限流熔断规则互相隔离互不影响。

资源在Sentinel中的定义很抽象，用户可以灵活的定义，资源可以是应用、接口、函数、甚至是一段代码。我们的限流熔断机制都是为了保护这段资源运行如预期一样。

用户通过Sentinel api 包里面的接口可以把资源包起来，这一步称为“埋点”，通过限流熔断规则来保护资源。每个埋点都有一个资源名称（resource），代表触发了这个资源的调用或访问。api接口参考：[https://github.com/alibaba/sentinel-golang/tree/master/api](https://github.com/alibaba/sentinel-golang/tree/master/api)

下面是一个示例代码，将`fmt.Println("hello world");` 作为资源（被保护的逻辑），用 API 包装起来。参考代码如下:
```go
// We should initialize Sentinel first.
err := sentinel.InitDefault()
if err != nil {
	log.Fatalf("Unexpected error: %+v", err)
}

// initialize sentinel rules
initRules()

e, b := sentinel.Entry("some-test", sentinel.WithTrafficType(base.Inbound))
if b != nil {
        // Blocked. We could get the block reason from the BlockError.
} else {
	// the resource was guarded.
        fmt.Println("hello world")
	// Be sure the entry is exited finally.
	e.Exit()
}
```

## 规则配置

针对埋点资源配置相应的规则，来达到流量控制的效果。目前 Sentinel 支持五种规则：
1. 流控规则：参考 [/core/flow/rule.go](https://github.com/alibaba/sentinel-golang/blob/master/core/flow/rule.go)
2. 流量隔离规则：参考 [/core/isolation/rule.go](https://github.com/alibaba/sentinel-golang/blob/master/core/isolation/rule.go)
3. 熔断规则：参考 [/core/circuitbreaker/rule.go](https://github.com/alibaba/sentinel-golang/blob/master/core/circuitbreaker/rule.go)
4. 自适应流控规则：参考 [/core/system/rule.go](https://github.com/alibaba/sentinel-golang/blob/master/core/system/rule.go)
5. 热点参数流控规则：参考 [/core/hotspot/rule.go](https://github.com/alibaba/sentinel-golang/blob/master/core/hotspot/rule.go)

## 基于QPS限流的完整的示例

```go
import (
	sentinel "github.com/alibaba/sentinel-golang/api"
)

func main() {
	// 务必先进行初始化
	err := sentinel.InitDefault()
	if err != nil {
		log.Fatal(err)
	}

	// 配置一条限流规则
	_, err = flow.LoadRules([]*flow.Rule{
		{
			Resource:               "some-test",
			Threshold:              10,
			TokenCalculateStrategy: flow.Direct,
			ControlBehavior:        flow.Reject,
		},
	})
	if err != nil {
		fmt.Println(err)
		return
	}

	ch := make(chan struct{})
	for i := 0; i < 10; i++ {
		go func() {
			for {
				// 埋点逻辑，埋点资源名为 some-test
				e, b := sentinel.Entry("some-test")
				if b != nil {
					// 请求被拒绝，在此处进行处理
					time.Sleep(time.Duration(rand.Uint64() % 10) * time.Millisecond)
				} else {
					// 请求允许通过，此处编写业务逻辑
					fmt.Println(util.CurrentTimeMillis(), "Passed")
					time.Sleep(time.Duration(rand.Uint64() % 10) * time.Millisecond)

					// 务必保证业务结束后调用 Exit
					e.Exit()
				}

			}
		}()
	}
	<-ch
}
```

Demo 运行后，可以看到控制台每秒稳定输出 "Passed" 10 次，和规则中预先设定的阈值是一样的。我们可以在 metric 日志里看到类似下面的输出：

```
1581516234000|2020-02-12 22:03:54|some-test|10|2068|10|0|5|0|0|0
1581516235000|2020-02-12 22:03:55|some-test|10|2073|10|0|3|0|0|0
1581516236000|2020-02-12 22:03:56|some-test|10|2058|10|0|5|0|0|0
1581516237000|2020-02-12 22:03:57|some-test|10|2023|10|0|5|0|0|0
1581516238000|2020-02-12 22:03:58|some-test|10|2046|10|0|5|0|0|0
```

其中 `some-test` 这一列代表埋点资源名，后面的数字依次代表该一秒内的通过数（pass）、拒绝数（block）、完成数（complete）、错误数目（error）、平均响应时长（rt）。详细信息可以参考 [监控日志文档](https://github.com/alibaba/sentinel-golang/wiki/实时监控#秒级监控日志)。
