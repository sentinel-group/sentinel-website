# 动态数据源扩展
这个 Wiki 主要描述 [sentinel-golang](https://github.com/alibaba/sentinel-golang) 的动态数据源扩展的设计。目前 Sentinel 内部的限流、熔断等策略都是基于规则来实现的，提供动态数据源扩展的目的，就是希望将规则数据或则其余的 properties 的更新操作通过一些配置中心中间件(比如 etcd,conful,nacos-go 等等)来实现动态更新。整体数据流的pipeline大概就是：Sentinel board 或则是其余的 Config center dashboard --> 配置中心中间件 --> sentinel， 从而实现 properties 的动态更新。

## Overall
动态数据源扩展的整体架构和 Java 版本是一样的，可以参考下图所示架构图：

![](https://user-images.githubusercontent.com/9434884/45406233-645e8380-b698-11e8-8199-0c917403238f.png)

整体的设计分为两大块：property的抽象和DataSource数据源的抽象。

1. Property的抽象作为DataSource的下游，负责具体property的处理，将最新的property更新到下游的组件(比如流控规则、限流规则、配置模块等)。
2. DataSource的抽象主要是负责建立与配置中心中间件建立长连接，基于类似于Watcher的监听机制来监听具体property的变化，并将property变化通过Property的抽象处理。

## Property的设计
Property的抽象通过接口 `PropertyHandler` 接口来定义，PropertyHandler的职责边界是：处理输入的property字节，并将最新的property更新到下游相关联的核心组件。
```go
type PropertyHandler interface {
	// check whether the current src is consistent with last update property
	isPropertyConsistent(src interface{}) bool
	// handle the current property
	Handle(src []byte) error
}
```
`PropertyHandler` 的定义非常简单，只包含两个函数：

1. `isPropertyConsistent` 函数用于判断当前更新的 property 是否和上次更新的一样，如果一样就不做更新，类似于一个缓存过滤机制。
2. `Handle` 函数则负责具体的 property 处理逻辑，包括将字节数组转换成实际的 property ，并将该 property 更新到下游相关联的核心组件。

Sentinel 提供了 `PropertyHandler` 的一个默认的实现：`DefaultPropertyHandler`。
```go
type DefaultPropertyHandler struct {
	lastUpdateProperty interface{}

	converter PropertyConverter
	updater   PropertyUpdater
}
```
这里的一个DefaultPropertyHandler实例将用于处理一个 property type。 属性`lastUpdateProperty` 用于缓存上次更新的property，用于过滤无效property。 此外还包含两个函数属性, 下面先看定义：
```go
// PropertyConverter func is to converter source message bytes to the specific property.
// the first  return value: is the real property;
// the second return value: return nil if succeed to convert src, if not return the detailed error when convert src.
// if src is nil or len(src)==0, the return value is (nil,nil)
type PropertyConverter func(src []byte) (interface{}, error)

// PropertyUpdater func is to update the specific properties to downstream.
// return nil if succeed to update, if not, return the error.
type PropertyUpdater func(data interface{}) error
```

PropertyConverter：会将property的字节数组反序列化成具体的property类型。 具体的反序列化协议依据用户的实现，提供比较高的灵活性，Sentinel默认会提供一个json反序列化的实现，用户也可以根据自己的需求，自己实现自己的反序列化方式。

PropertyUpdater：会将具体的property类型数据，更新到相关联的下游的核心组件。比如 []FlowRule 类型的property会被更新到 flow module的flow manager里面。这里sentinel框架会提供所有支持的动态 property 的update函数的实现，用户对这个理论上来说是不感知的。

这里需要强调的是，每种动态property类型的PropertyConverter和PropertyUpdater是成对出现在`DefaultPropertyHandler`中的。

`DefaultPropertyHandler` 具体的 `Handle` 函数的实现可以参考源码：
```go
func (h *DefaultPropertyHandler) Handle(src []byte) error {
	defer func() {
		if err := recover(); err != nil && logger != nil {
			logger.Panicf("Unexpected panic: %+v", errors.Errorf("%+v", err))
		}
	}()
	// convert to target property
	realProperty, err := h.converter(src)
	if err != nil {
		return err
	}
	isConsistent := h.isPropertyConsistent(realProperty)
	if isConsistent {
		return nil
	}
	return h.updater(realProperty)
}
```
整体的workflow如下：
1. 调用converter将 []bytes 转成具体的property；
2. 通过缓存过滤无效property；
3. 更新实际的property到相关联的下游组件。

针对Sentinel 现有组件可能的动态 property，Sentinel提供了一个 helper.go 的函数集，里面包含了一系列的 Converter 和 Updater。源码在：
[helper.go](https://github.com/alibaba/sentinel-golang/blob/master/ext/datasource/helper.go)
helper.go里面的 **xxxUpdater** 是更新下游的标准函数；xxxConverter是默认提供的json协议的标准化converter，用户可以根据自己的实际业务需要，基于自己的协议实现自己的converter，只需要保证满足 `PropertyConverter` 函数的定义以及入参出参语义就OK。

## 数据源抽象设计
数据源的抽象通过接口 `Datasource` 来定义，一个`Datasource` 可能会有多个下游的property handler来处理。`Datasource`的职责就是负责建立与配置中心中间件建立长连接，基于类似于Watcher的监听机制监听具体property的变化，并将property变化通过下游的property handler来处理。下面是接口的定义：
```go
// The generic interface to describe the datasource
// Each DataSource instance listen in one property type.
type DataSource interface {
	// Add specified property handler in current datasource
	AddPropertyHandler(h PropertyHandler)
	// Remove specified property handler in current datasource
	RemovePropertyHandler(h PropertyHandler)
	// Read original data from the data source.
	// return source bytes if succeed to read, if not, return error when reading
	ReadSource() ([]byte, error)
	// Initialize the datasource and load initial rules
	// start listener to listen on dynamic source
	// return error if initialize failed;
	// once initialized, listener should recover all panic and error.
	Initialize() error
	// Close the data source.
	io.Closer
}
```
这里主要有两个函数需要介绍下：

1. ReadSource：基于watcher机制，从watcher读取最新的property数据。
2. Initialize：这里需要创建property的watcher，并通过一个单独的goroutine来监听watcher上的事件并处理相应的事件。

DataSource是一个非常抽象的接口，所有具体数据源扩展的实现都需要实现这个接口。Sentinel 封装了一些数据源通用的逻辑到 dataSource.Base里面，这里主要是与handlers相关的，具体代码可能参考：

```go
type Base struct {
	handlers []PropertyHandler
}

func (b *Base) Handlers() []PropertyHandler {
	return b.handlers
}

// return idx if existed, else return -1
func (b *Base) indexOfHandler(h PropertyHandler) int {
	for idx, handler := range b.handlers {
		if handler == h {
			return idx
		}
	}
	return -1
}

func (b *Base) AddPropertyHandler(h PropertyHandler) {
	if h == nil || b.indexOfHandler(h) >= 0 {
		return
	}
	b.handlers = append(b.handlers, h)
}

func (b *Base) RemovePropertyHandler(h PropertyHandler) {
	if h == nil {
		return
	}
	idx := b.indexOfHandler(h)
	if idx < 0 {
		return
	}
	b.handlers = append(b.handlers[:idx], b.handlers[idx+1:]...)
}
```
主要包括一个DataSource相关的 handlers的定义以及相关增删。

# Example: refresh file datasource:
为了方便开发者理解，Sentinel 提供了一个基于文件的数据源的example, 具体代码可以参考：[refreshable_file.go](https://github.com/alibaba/sentinel-golang/tree/master/ext/datasource/file)


# Use case

## app instance复用etcd长连接的场景：
etcd client 和 server 底层的数据交换是基于gRPC的，gRPC使用的是http2的长连接。所以比较期待的是每个应用的instance存在多个动态Property时候，能够复用一个长连接。

etcd client与Server保持长连接是基于 clientv3/client.go里面的[Client struct](https://github.com/etcd-io/etcd/blob/0eee733220fc766ff0d193d61d9124aa06493986/clientv3/client.go#L72)。Sentinel期望不管用户在一个 APP instance上不管创建多少个动态 property 的数据源，都能够复用一个 etcd 的长连接。

下面提供了一个demo 伪代码实现：
```go
type DatasourceGenerator struct {
	etcdv3Client *clientv3.Client
}

func NewDatasourceGenerator(config *clientv3.Config) *DatasourceGenerator {
	client, err := clientv3.New(*config)
	if err != nil {
		logging.GetDefaultLogger().Errorf("Fail to instance clientv3 Client, err: %+v", err)
		return nil
	}
	return &DatasourceGenerator{etcdv3Client: client}
}

func (g *DatasourceGenerator) Generate(key string, handlers ...datasource.PropertyHandler) (*Etcdv3DataSource, error) {
	var err error
	if g.etcdv3Client == nil {
		err = errors.New("The etcdv3 client is nil in DatasourceGenerator")
		return nil, err
	}
	ds := &Etcdv3DataSource{
		client:      g.etcdv3Client,
		propertyKey: key,
	}
	for _, h := range handlers {
		ds.AddPropertyHandler(h)
	}
	return ds, err
}
```

实际使用的demo：
```go
etcdv3Gen := NewDatasourceGenerator()
if etcdv3Gen == nil {
    logger.Errorf("Fail to instance etcdv3 datasource generator.")
    return
}
ds1 := etcdv3Gen.Generate(key, handle...)
ds2 := etcdv3Gen.Generate(key, handle...)
ds3 := etcdv3Gen.Generate(key, handle...)
......
```

## 一个动态property关联一个动态数据源场景
Suppose现在property是system rules, property的下游也只有system manager。test code如下：

```go
ds := NewFileDataSource(TestSystemRulesFile, NewSystemRulesHandler(SystemRulesJsonConverter))
err = ds.Initialize()
```

## 一个动态property使用一个动态数据源，但是下游存在联动场景
先介绍下联动场景的背景：在集群模式下，Server端维护了一个namespaceSet(这里namespace表示的是每一个client的unique描述)，这个namespaceSet property 通过动态数据源来维护，做动态更新。

集群模式下，client其实是一个非常轻的存在，所有的集群流控check实际上都是在Server端来做的，Server端维护了每一个client端的流控rules以及动态数据源。用伪代码来表示，Server端维护了一个map：namespace -> datasource，这里map的value的每一个datasource表示一个client的流控规则的动态数据源，所以client的更新实际上是在Server端来做的。

这个时候有一个场景：假设Server端的 namespaceSet property 动态数据源做了一个update，更改了namespaceSet(也就是client端存在增删情况)，这时候Server端也需要做对应数据源的增删，也就是联动场景。

这种场景下，需要添加一个中间层，这个中间层的主要职责是维护 namespace -> datasource 的map关系，并且根据上游 namespaceSet的动态更新，更新中间层的数据。

基于现有DataSource的设计，给出联动场景的伪代码：
```go
namespacesDatasource := NewDatasource(key, handlers{NamespacesJsonConverter, NamespacesUpdater}...)
func NamespacesJsonConverter(src []byte) (interface{}, error){
    // return namespaces string list.
}

func NamespacesUpdater(value interface{}) error {
    // Call ClusterDatasourceManager.LoadNamespaces()
}


// 中间层
// datasource generator
type Generator struct {

}

type ClusterDatasourceManager struct{
    datasourceGenerator Generator
    //namespace -> Datasource
    clientDatasource map[string]datasource.Datasource
}

func LoadNamespaces(namespaces []string){
    //check diff between current namespaces and the keys of clientDatasource
    // call generator to generate new datasource.
    // thread safe to update clientDatasource
}
--------------------------------------------------------------------
// 集群流控规则manager
type ClusterFlowRuleManager struct {
   // namespace -> rule list
   clientRules map[string][]*FlowRule
}

func LoadNamespaceRules(namespace string, rules []*flow.Rules){

}
```

## 多个动态property type共享一个数据源
假设现在存在多个property type: system rules, flow rules, circuit breaker rules. 期望通过一个动态compound property就能实现动态更新这三种类型的sub property。

假设 property schema 大概是这样：
```json
{
    "systemRules":{
    },
    "flowRules":{
    },
    "cbRules":{
    }
}
```

基于现有DataSource extension的design是可以实现的。用户需要创建三个数据源 systemRulesDS,flowRulesDS,cbRulesDS，伪代码如下：
```go
func SystemRulesConverter(src []byte) (interface{}, error) {
    1. Decode src to Property struct
    2. get systemRules related data
    3. return system Rule list.
}
func FlowRulesConverter(src []byte) (interface{}, error) {
    1. Decode src to Property struct
    2. get flowRules related data
    3. return flow Rule list.
}
func cbRulesConverter(src []byte) (interface{}, error) {
    1. Decode src to Property struct
    2. get cbRules related data
    3. return cb Rule list.
}

// new system rules datasource
systemRulesDS := NewDatasource(propertyLocation, NewDefaultPropertyHandler(SystemRulesConverter, SystemRulesUpdater));
// new flow rules datasource
flowRulesDS := NewDatasource(propertyLocation, NewDefaultPropertyHandler(FlowRulesConverter, FlowRulesUpdater));
// new cb rules datasource
cbRulesDS := NewDatasource(propertyLocation, NewDefaultPropertyHandler(CbRulesConverter, CbRulesUpdater));

systemRulesDS.Initialize()
flowRulesDS.Initialize()
cbRulesDS.Initialize()
```
