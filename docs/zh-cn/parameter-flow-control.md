# 热点参数限流

## 目录

- [Overview](#overview)
- [基本使用](#基本使用)
- [热点参数规则](#热点参数规则)
- [示例](#示例)

## Overview

何为热点？热点即经常访问的数据。很多时候我们希望统计某个热点数据中访问频次最高的 Top K 数据，并对其访问进行限制。比如：

- 商品 ID 为参数，统计一段时间内最常购买的商品 ID 并进行限制
- 用户 ID 为参数，针对一段时间内频繁访问的用户 ID 进行限制

热点参数限流会统计传入参数中的热点参数，并根据配置的限流阈值与模式，对包含热点参数的资源调用进行限流。热点参数限流可以看做是一种特殊的流量控制，仅对包含热点参数的资源调用生效。

![Sentinel Parameter Flow Control](https://github.com/alibaba/Sentinel/wiki/image/sentinel-hot-param-overview-1.png)

Sentinel 利用 LRU 策略，结合底层的滑动窗口机制来实现热点参数统计。LRU 策略可以统计单位时间内，最近最常访问的热点参数，而滑动窗口机制可以帮助统计每个参数的 QPS。

## 基本使用

要使用热点限流功能，需要引入以下依赖：

```xml
<dependency>
    <groupId>com.alibaba.csp</groupId>
    <artifactId>sentinel-parameter-flow-control</artifactId>
    <version>x.y.z</version>
</dependency>
```

然后为对应的资源配置热点参数限流规则，并在 `entry` 的时候传入相应的参数，即可使热点参数限流生效。

> 注：若自行扩展并注册了自己实现的 `SlotChainBuilder`，并希望使用热点参数限流功能，则可以在 chain 里面合适的地方插入 `ParamFlowSlot`。

那么如何传入对应的参数以便 Sentinel 统计呢？我们可以通过 `SphU` 类里面几个 `entry` 重载方法来传入：

```java
public static Entry entry(String name, EntryType type, int count, Object... args) throws BlockException

public static Entry entry(Method method, EntryType type, int count, Object... args) throws BlockException
```

其中最后的一串 `args` 就是要传入的参数，有多个就按照次序依次传入。比如要传入两个参数 `paramA` 和 `paramB`，则可以：

```java
// paramA in index 0, paramB in index 1.
SphU.entry(resourceName, EntryType.IN, 1, paramA, paramB);
```

## 热点参数规则

热点参数规则（`ParamFlowRule`）类似于流量控制规则（`FlowRule`）：

| 属性 | 说明 | 默认值 |
| :----: | :----| :----|
| resource | 资源名，必填 ||
| count | 限流阈值，必填 ||
| grade | 限流模式（保留字段，目前只支持 QPS 模式）| QPS 模式 |
| paramIdx | 热点参数的索引，必填，对应 `SphU.entry(xxx, args)` 中的参数索引 ||
| paramFlowItemList | 参数例外项，可以针对指定的参数值单独设置限流阈值 ||

可以通过 `ParamFlowRuleManager` 的 `loadRules` 方法更新热点参数规则，下面是一个示例：

```java
ParamFlowRule rule = new ParamFlowRule(resourceName)
    .setParamIdx(0)
    .setCount(5);
// 针对 int 类型的参数 PARAM_B，单独设置限流 QPS 阈值为 10，而不是全局的阈值 5.
ParamFlowItem item = new ParamFlowItem().setObject(String.valueOf(PARAM_B))
    .setClassType(int.class.getName())
    .setCount(10);
rule.setParamFlowItemList(Collections.singletonList(item));

ParamFlowRuleManager.loadRules(Collections.singletonList(rule));
```

## 示例

示例可参见 [sentinel-demo-parameter-flow-control](https://github.com/alibaba/Sentinel/blob/master/sentinel-demo/sentinel-demo-parameter-flow-control/src/main/java/com/alibaba/csp/sentinel/demo/flow/param/ParamFlowQpsDemo.java)。