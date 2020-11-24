# 熔断降级

## 目录

* [Overview](#overview)
* [熔断器模型](#熔断器模型)
* [熔断器的设计](#熔断器的设计)
* [熔断策略](#熔断策略)
* [熔断降级规则](#熔断降级规则)
* [最佳场景实践](#最佳场景实践)
* [Example](#example)

## Overview

在高可用设计中，除了流控外，对分布式系统调用链路中不稳定的资源(比如RPC服务等)进行熔断降级也是保障高可用的重要措施之一。现在的分布式架构中一个服务常常会调用第三方服务，这个第三方服务可能是另外的一个RPC接口、数据库，或者第三方 API 等等。例如，支付的时候，可能需要远程调用银联提供的 API；查询某个商品的价格，可能需要进行数据库查询。然而，除了自身服务外，依赖的外部服务的稳定性是不能绝对保证的。如果依赖的第三方服务出现了不稳定的情况，比如请求的响应时间变长，那么服务自身调用第三方服务的响应时间也会响应变长，也就是级联效应，服务自身的线程可能会产生堆积，最终可能耗尽业务自身的线程池，最终服务本身也变得不可用。下图是一个很抽象且经典的分布式架构中的服务分布图：

<img src="https://user-images.githubusercontent.com/9434884/62410811-cd871680-b61d-11e9-9df7-3ee41c618644.png" alt="dependnecy-map" width="75%"/>

现代微服务架构基本都是分布式的，整个分布式系统由非常多的微服务组成。不同服务之间相互调用，组成复杂的调用链路。前面描述的问题在分布式链路调用中会产生放大的效果。整个复杂链路中的某一环如果不稳定，就可能会层层级联，最终可能导致整个链路全部挂掉。因此我们需要对不稳定的 **弱依赖服务调用** 进行 **熔断降级**，暂时切断不稳定的服务调用，避免局部不稳定因素导致整个分布式系统的雪崩。熔断降级作为保护服务自身的手段，通常在客户端（调用端）进行配置。

## 熔断器模型

Sentinel 熔断降级基于熔断器模式 (circuit breaker pattern) 实现。熔断器内部维护了一个熔断器的状态机，状态机的转换关系如下图所示：

<img src="https://user-images.githubusercontent.com/9434884/82635455-ca075f00-9c32-11ea-9e99-d67518923e0d.png" alt="circuit-breaker" width="50%"/>

熔断器有三种状态：

1. Closed 状态：也是初始状态，该状态下，熔断器会保持闭合，对资源的访问直接通过熔断器的检查。
2. Open 状态：断开状态，熔断器处于开启状态，对资源的访问会被切断。
3. Half-Open 状态：半开状态，该状态下除了探测流量，其余对资源的访问也会被切断。探测流量指熔断器处于半开状态时，会周期性的允许一定数目的探测请求通过，如果探测请求能够正常的返回，代表探测成功，此时熔断器会重置状态到 Closed 状态，结束熔断；如果探测失败，则回滚到 Open 状态。

这三种状态之间的转换关系这里做一个更加清晰的解释：

1. 初始状态下，熔断器处于 Closed 状态。如果基于熔断器的统计数据表明当前资源触发了设定的阈值，那么熔断器会切换状态到 Open 状态；
2. Open 状态即代表熔断状态，所有请求都会直接被拒绝。熔断器规则中会配置一个熔断超时重试的时间，经过熔断超时重试时长后熔断器会将状态置为 Half-Open 状态，从而进行探测机制；
3. 处于 Half-Open 状态的熔断器会周期性去做探测。

Sentinel 提供了监听器去监听熔断器状态机的三种状态的转换，方便用户去自定义扩展：

```go
// StateChangeListener listens on the circuit breaker state change event.
type StateChangeListener interface {
        // 熔断器切换到 Closed 状态时候会调用改函数, prev代表切换前的状态，rule表示当前熔断器对应的规则
	OnTransformToClosed(prev State, rule Rule)
        // 熔断器切换到 Open 状态时候会调用改函数, prev代表切换前的状态，rule表示当前熔断器对应的规则， snapshot表示触发熔断的值
	OnTransformToOpen(prev State, rule Rule, snapshot interface{})
        // 熔断器切换到 HalfOpen 状态时候会调用改函数, prev代表切换前的状态，rule表示当前熔断器对应的规则
	OnTransformToHalfOpen(prev State, rule Rule)
}
```

通过上面的三个 hook 函数，用户可以很容易拿到熔断器每次状态切换的事件，以及熔断器对应的 Rule。

> Note 1: 这里需要注意的是，监听器 hook 里面携带的规则是基于 copy 的，也就是用户在监听器里面更改 Rule 不会影响到熔断器。此外这里基于拷贝是有一定性能开销的，用户要尽可能减少无效的监听器注册。
>
> Note 2: 熔断器监听器的注册和清除是非线程安全的，用户必须要在服务启动时配置 Sentinel 时候就注册对应的监听器，应用运行中禁止更改熔断器状态机的监听器。

## 熔断器的设计

我们衡量下游服务质量时候，场景的指标就是RT(response time)、异常数量以及异常比例等等。Sentinel 的熔断器支持三种熔断策略：慢调用比例熔断、异常比例熔断以及异常数量熔断。

用户通过设置熔断规则(Rule)来给资源添加熔断器。Sentinel会将每一个熔断规则转换成对应的熔断器，熔断器对用户是不可见的。Sentinel 的每个熔断器都会有自己独立的统计结构。

熔断器的整体检查逻辑可以用几点来精简概括：

1. 基于熔断器的状态机来判断对资源是否可以访问；
2. 对不可访问的资源会有探测机制，探测机制保障了对资源访问的弹性恢复；
3. 熔断器会在对资源访问的完成态去更新统计，然后基于熔断规则更新熔断器状态机。

## 熔断策略

Sentinel 熔断器的三种熔断策略都支持静默期 (规则中通过MinRequestAmount字段表示)。静默期是指一个最小的静默请求数，在一个统计周期内，如果对资源的请求数小于设置的静默数，那么熔断器将不会基于其统计值去更改熔断器的状态。静默期的设计理由也很简单，举个例子，假设在一个统计周期刚刚开始时候，第 1 个请求碰巧是个慢请求，这个时候这个时候的慢调用比例就会是 100%，很明显是不合理，所以存在一定的巧合性。所以静默期提高了熔断器的精准性以及降低误判可能性。

Sentinel 支持以下几种熔断策略：

* 慢调用比例策略 (SlowRequestRatio)：Sentinel 的熔断器不在静默期，并且慢调用的比例大于设置的阈值，则接下来的熔断周期内对资源的访问会自动地被熔断。该策略下需要设置允许的调用 RT 临界值（即最大的响应时间），对该资源访问的响应时间大于该阈值则统计为慢调用。
* 错误比例策略 (ErrorRatio)：Sentinel 的熔断器不在静默期，并且在统计周期内资源请求访问异常的比例大于设定的阈值，则接下来的熔断周期内对资源的访问会自动地被熔断。
* 错误计数策略 (ErrorCount)：Sentinel 的熔断器不在静默期，并且在统计周期内资源请求访问异常数大于设定的阈值，则接下来的熔断周期内对资源的访问会自动地被熔断。

注意：这里的错误比例熔断和错误计数熔断指的业务返回错误的比例或则计数。也就是说，如果规则指定熔断器策略采用错误比例或则错误计数，那么为了统计错误比例或错误计数，需要调用API： `api.TraceError(entry, err)`  埋点每个请求的业务异常。

## 熔断降级规则定义
熔断规则的定义如下： refer: [https://github.com/alibaba/sentinel-golang/blob/7ddba92fdf319c410df01e712ac5e89fe46d9c23/core/circuitbreaker/rule.go#L36](https://github.com/alibaba/sentinel-golang/blob/7ddba92fdf319c410df01e712ac5e89fe46d9c23/core/circuitbreaker/rule.go#L36)

```go
// Rule encompasses the fields of circuit breaking rule.
type Rule struct {
	// unique id
	Id string `json:"id,omitempty"`
	// resource name
	Resource string   `json:"resource"`
	Strategy Strategy `json:"strategy"`
	// RetryTimeoutMs represents recovery timeout (in milliseconds) before the circuit breaker opens.
	// During the open period, no requests are permitted until the timeout has elapsed.
	// After that, the circuit breaker will transform to half-open state for trying a few "trial" requests.
	RetryTimeoutMs uint32 `json:"retryTimeoutMs"`
	// MinRequestAmount represents the minimum number of requests (in an active statistic time span)
	// that can trigger circuit breaking.
	MinRequestAmount uint64 `json:"minRequestAmount"`
	// StatIntervalMs represents statistic time interval of the internal circuit breaker (in ms).
	StatIntervalMs uint32 `json:"statIntervalMs"`
	// MaxAllowedRtMs indicates that any invocation whose response time exceeds this value (in ms)
	// will be recorded as a slow request.
	// MaxAllowedRtMs only takes effect for SlowRequestRatio strategy
	MaxAllowedRtMs uint64 `json:"maxAllowedRtMs"`
	// Threshold represents the threshold of circuit breaker.
	// for SlowRequestRatio, it represents the max slow request ratio
	// for ErrorRatio, it represents the max error request ratio
	// for ErrorCount, it represents the max error request count
	Threshold float64 `json:"threshold"`
}
```
- `Id`: 表示 Sentinel 规则的全局唯一ID，可选项。
- `Resource`: 熔断器规则生效的埋点资源的名称；
- `Strategy`: 熔断策略，目前支持`SlowRequestRatio`、`ErrorRatio`、`ErrorCount`三种；
  - 选择以**慢调用比例** (SlowRequestRatio) 作为阈值，需要设置允许的**最大响应时间**（MaxAllowedRtMs），请求的响应时间大于该值则统计为慢调用。通过 `Threshold` 字段设置触发熔断的慢调用比例，取值范围为 [0.0, 1.0]。规则配置后，在单位统计时长内请求数目大于设置的最小请求数目，并且慢调用的比例大于阈值，则接下来的熔断时长内请求会自动被熔断。经过熔断时长后熔断器会进入探测恢复状态，若接下来的一个请求响应时间小于设置的最大 RT 则结束熔断，若大于设置的最大 RT 则会再次被熔断。
  - 选择以**错误比例** (ErrorRatio) 作为阈值，需要设置触发熔断的异常比例（`Threshold`），取值范围为 [0.0, 1.0]。规则配置后，在单位统计时长内请求数目大于设置的最小请求数目，并且异常的比例大于阈值，则接下来的熔断时长内请求会自动被熔断。经过熔断时长后熔断器会进入探测恢复状态，若接下来的一个请求没有错误则结束熔断，否则会再次被熔断。代码中可以通过 `api.TraceError(entry, err)` 函数来记录 error。
- `RetryTimeoutMs`: 即熔断触发后持续的时间（单位为 ms）。资源进入熔断状态后，在配置的熔断时长内，请求都会快速失败。熔断结束后进入探测恢复模式（HALF-OPEN）。
- `MinRequestAmount`: 静默数量，如果当前统计周期内对资源的访问数量小于静默数量，那么熔断器就处于静默期。换言之，也就是触发熔断的最小请求数目，若当前统计周期内的请求数小于此值，即使达到熔断条件规则也不会触发。
- `StatIntervalMs`: 统计的时间窗口长度（单位为 ms）。
- `MaxAllowedRtMs`: 仅对`慢调用熔断策略`生效，MaxAllowedRtMs 是判断请求是否是慢调用的临界值，也就是如果请求的response time小于或等于MaxAllowedRtMs，那么就不是慢调用；如果response time大于MaxAllowedRtMs，那么当前请求就属于慢调用。
- `Threshold`: 对于`慢调用熔断策略`, Threshold表示是慢调用比例的阈值(小数表示，比如0.1表示10%)，也就是如果当前资源的慢调用比例如果高于Threshold，那么熔断器就会断开；否则保持闭合状态。 对于`错误比例策略`，Threshold表示的是错误比例的阈值(小数表示，比如0.1表示10%)。对于`错误数策略`，Threshold是错误计数的阈值。

一些补充说明：

- Resource、Strategy、RetryTimeoutMs、MinRequestAmount、StatIntervalMs、Threshold 每个规则都必设的字段，MaxAllowedRtMs是慢调用比例熔断规则必设的字段。
- MaxAllowedRtMs 字段仅仅对**慢调用比例** (SlowRequestRatio) 策略有效，对其余策略均属于无效字段。
- StatIntervalMs 表示熔断器的统计周期，单位是毫秒，这个值我们不建议设置的太大或则太小，一般情况下设置10秒左右都OK，当然也要根据实际情况来适当调整。
- RetryTimeoutMs 的设置需要根据实际情况设置探测周期，一般情况下设置10秒左右都OK，当然也要根据实际情况来适当调整。

这里分别给出三种熔断策略规则配置的一个Sample(不可作为线上配置参考):

```go
// 慢调用比例规则
rule1 := &Rule{
        Resource:         "abc",
        Strategy:         SlowRequestRatio,
	RetryTimeoutMs:   5000,
	MinRequestAmount: 10,
	StatIntervalMs:   10000,
	MaxAllowedRtMs:   20,
	Threshold:        0.1,
},
// 错误比例规则
rule1 := &Rule{
        Resource:         "abc",
        Strategy:         ErrorRatio,
	RetryTimeoutMs:   5000,
	MinRequestAmount: 10,
	StatIntervalMs:   10000,
	Threshold:        0.1,
},
// 错误计数规则
rule1 := &Rule{
        Resource:         "abc",
        Strategy:         ErrorCount,
	RetryTimeoutMs:   5000,
	MinRequestAmount: 10,
	StatIntervalMs:   10000,
	Threshold:        100,
},
```

## 最佳场景实践

熔断器一般用于应用对外部资源访问时的保护措施。这里简单描述一些场景：

- 分布式系统中降级：假设存在应用A需要调用应用B的接口(特别是一些对接外部公司或者业务的接口时候)，那么一般用于A调用B的接口时的防护；
- 数据库慢调用的防护： 假设应用需要读/写数据库，但是该读写SQL存在潜在慢SQL的可能性，那么可以对该读写接口做防护，当接口不稳定时候(存在慢SQL)，那么基于熔断器做降级。
- 也可以是应用中任意弱依赖接口做降级防护（即自动降级后不影响业务核心链路）。

## Example

熔断降级 demo 可以参考 [circuit breaker example](https://github.com/alibaba/sentinel-golang/tree/master/example/circuitbreaker)