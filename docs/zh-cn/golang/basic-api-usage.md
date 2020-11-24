# API 使用指南

用户接入使用 Sentinel Go (后文均用 Sentinel 表示 Sentinel Go) 主要需要需要以下几步：

1. 对 Sentinel 的运行环境进行相关配置并初始化。API 接口使用细节可以参考：[配置方式](https://github.com/alibaba/sentinel-golang/wiki/启动配置)
2. 埋点（定义资源），该步骤主要是确定系统中有哪些资源需要防护，资源定义可参考：[新手指南](https://github.com/alibaba/sentinel-golang/wiki/%E6%96%B0%E6%89%8B%E6%8C%87%E5%8D%97)
3. 配置规则，该步骤主要是为每个资源都配置具体的规则，规则的配置可参考：[新手指南](https://github.com/alibaba/sentinel-golang/wiki/%E6%96%B0%E6%89%8B%E6%8C%87%E5%8D%97) 以及各个模块的使用文档。
4. 编写资源防护的入口和出口代码。释放方式可参考：[新手指南](https://github.com/alibaba/sentinel-golang/wiki/%E6%96%B0%E6%89%8B%E6%8C%87%E5%8D%97)

## 通用配置及初始化

使用 Sentinel 需要在应用启动时对 Sentinel 运行环境进行相关配置并触发初始化。`api` 包下提供如下函数：

- `InitDefault()`：从环境变量指定的配置文件以及环境变量中读取相应配置来初始化 Sentinel，若环境变量不存在则使用默认值。
- `Init(configPath string)`：从给定的 YAML 文件中读取相应配置来初始化 Sentinel。
- `InitWithConfig(confEntity *config.Entity)`: 用户硬编码配置对象`*config.Entity`来初始化Sentinel。

通用配置项加载策略和配置项请参考 [配置方式使用文档](https://github.com/alibaba/sentinel-golang/wiki/启动配置)

示例代码：

```go
import (
	sentinel "github.com/alibaba/sentinel-golang/api"
)

func initSentinel() {
	err := sentinel.Init(confPath)
	if err != nil {
		// 初始化 Sentinel 失败
	}
}
```

**注意**：必须成功调用 Sentinel 的初始化函数以后再调用埋点 API。

## 埋点(定义资源)

使用 Sentinel 的 Entry API 将业务逻辑封装起来，这一步称为“埋点”。每个埋点都有一个资源名称（resource），代表触发了这个资源的调用或访问。

埋点 API 位于 `api` 包中：

- `Entry(resource string, opts ...Option) (*base.SentinelEntry, *base.BlockError)`

其中 `resource` 代表埋点资源名，`opts` 代表埋点配置。这里需要注意的是，返回值参数列表的第一个和第二个参数是互斥的，也就是说，如果Entry执行pass，那么Sentinel会返回(*base.SentinelEntry, nil)；如果Entry执行blocked，那么Sentinel会返回(nil, *base.BlockError)。

目前支持以下埋点配置：

- `WithTrafficType(entryType base.TrafficType)`：标记该埋点资源的流量类型，其中 Inbound 代表入口流量，Outbound 代表出口流量。若不指定，默认为 Outbound。
- `WithResourceType(resourceType base.ResourceType)`：标记该埋点资源的分类。
- `WithAcquireCount(acquireCount uint32)`：标记每次触发该埋点计为几次调用（可以理解为 batch count）。若不指定，默认为 1。
- `WithArgs(args ...interface{})`：埋点携带的参数列表，为热点参数统计预留。
- `WithSlotChain(chain *base.SlotChain)`：埋点执行的检查的slotchain，若不指定，默认使用全局slotchain

埋点 API 示例：

```go
import (
	sentinel "github.com/alibaba/sentinel-golang/api"
)

// Entry 方法用于埋点
e, b := sentinel.Entry("your-resource-name", sentinel.WithTrafficType(base.Inbound))
if b != nil {
	// 请求被流控，可以从 BlockError 中获取限流详情
	// block 后不需要进行 Exit()
} else {
	// 请求可以通过，在此处编写您的业务逻辑
	// 务必保证业务逻辑结束后 Exit
	e.Exit()
}
```

若该次调用被拒绝，则 Entry API 会返回 BlockError 代表被 Sentinel 限流。BlockError 提供了限流原因以及触发的规则等信息，可以方便开发者获取相关信息进行记录和处理。

## 规则配置

### 硬编码方式

Sentinel 支持原始的硬编码方式加载规则，可以通过各个模块的 `LoadRules(rules)` 函数加载规则。以流控规则为例：

```go
_, err = flow.LoadRules([]*flow.Rule{
	{
		Resource:               "some-test",
		Threshold:              10,
		TokenCalculateStrategy: flow.Direct,
		ControlBehavior:        flow.Reject,
	},
})
if err != nil {
	// 加载规则失败，进行相关处理
}
```
### 动态数据源

Sentinel 提供动态数据源接口进行扩展，用户可以通过动态文件、etcd、consul、nacos 等配置中心来动态地配置规则。
