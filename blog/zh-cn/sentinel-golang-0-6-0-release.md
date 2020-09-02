# Sentinel Go 0.6.0 发布，支持 Warm-Up 预热流控

[Sentinel Go 0.6.0](https://github.com/alibaba/sentinel-golang/releases/tag/v0.6.0) 正式发布，该版本带来了 Warm-Up 预热流控特性、go-micro 框架的适配模块，以及其它的一些特性改进。Release notes: https://github.com/alibaba/sentinel-golang/releases/tag/v0.6.0

该版本的主要特性之一是 Warm-Up 预热流控支持。当系统长期处于低水位的情况下，流量突然增加时，直接把系统拉升到高水位可能瞬间把系统压垮。比如刚启动的服务，数据库连接池可能还未初始化，缓存也处于空的状态，这时候激增的流量非常容易导致服务崩溃。这时我们就可以利用 Sentinel 的 Warm-Up 流控模式，控制通过的流量缓慢增加，在一定时间内逐渐增加到阈值上限，而不是在一瞬间全部放行。这样可以给冷系统一个预热的时间，避免冷系统被压垮。

![Warm Up](https://aliware-images.oss-cn-hangzhou.aliyuncs.com/ahas/sc_example_warmup.png)

WarmUp 预热控制的示例可以参考 [qps_warm_up_example.go](https://github.com/alibaba/sentinel-golang/blob/master/example/warm_up/qps_warm_up_example.go)。

同时新版本还带来了 [go-micro v2 的适配模块](https://pkg.go.dev/github.com/alibaba/sentinel-golang@v0.6.0/adapter/micro?tab=doc)，开发者只需在创建 server/client 的时候添加上 Sentinel 的 handler wrapper 即可快速接入适配，自动对 RPC 调用进行埋点。默认埋点会提取服务 method 作为资源名，限流处理逻辑默认返回对应的 BlockError。用户也可以在构造 handler wrapper 时传入自定义的资源名提取逻辑和流控 fallback 逻辑，来进行定制。示例：

```go
svr := micro.NewService(
	micro.Name("sentinel.test.server"),
	micro.Version("latest"),
	micro.WrapHandler(NewHandlerWrapper(
		// 提供自定义的流控 fallback 逻辑
		WithServerBlockFallback(
			func(ctx context.Context, request server.Request, blockError *base.BlockError) error {
				return errors.New(myBlockMessage)
			}),
	)),
)
```

其它主要特性改进包括：

- 修复熔断器模块半开启模式探测阶段被同资源其它规则 block 后状态无法变换的 bug
- 支持用自定义的 Logger 实现替换默认自带的 record logger
- 完善部分 rule entity 的定义，完善数据源模块提供的默认规则解析器

Sentinel Go 版本正在快速演进中，1.0 GA 版本即将在近期发布，带来更多云原生相关的特性。我们非常欢迎感兴趣的开发者参与贡献，一起来主导未来版本的演进。若您有意愿参与贡献，欢迎联系我们加入 Sentinel 贡献小组一起成长（Sentinel 开源讨论钉钉群：30150716）。我们会定期给活跃贡献者寄送小礼品，核心贡献者会提名为 committer，一起主导社区的演进。Now let's start hacking!
