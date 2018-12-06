# 基本使用 - 资源与规则

## 目录

* [简介](#简介)
* [定义资源](#定义资源)
  * [抛出异常的方式定义资源](#抛出异常的方式定义资源)
  * [返回布尔值方式定义资源](#返回布尔值方式定义资源)
  * [注解方式定义资源](#注解方式定义资源)
  * [判断限流降级异常](#判断限流降级异常)
  * [异步调用支持](#异步调用支持)
* [定义规则](https://github.com/alibaba/Sentinel/wiki/%E5%A6%82%E4%BD%95%E4%BD%BF%E7%94%A8#%E5%AE%9A%E4%B9%89%E8%A7%84%E5%88%99)
  *  [规则的定义](https://github.com/alibaba/Sentinel/wiki/%E5%A6%82%E4%BD%95%E4%BD%BF%E7%94%A8#%E8%A7%84%E5%88%99%E7%9A%84%E5%AE%9A%E4%B9%89)
  * [查询修改规则](https://github.com/alibaba/Sentinel/wiki/%E5%A6%82%E4%BD%95%E4%BD%BF%E7%94%A8#%E6%9F%A5%E8%AF%A2%E6%9B%B4%E6%94%B9%E8%A7%84%E5%88%99)
  * [定制规则推送方式](https://github.com/alibaba/Sentinel/wiki/%E5%A6%82%E4%BD%95%E4%BD%BF%E7%94%A8#%E5%AE%9A%E5%88%B6%E8%87%AA%E5%B7%B1%E7%9A%84%E6%8C%81%E4%B9%85%E5%8C%96%E8%A7%84%E5%88%99)
* [规则生效的效果](#规则生效的效果)

## 简介

我们说的资源，可以是任何东西，服务，服务里的方法，甚至是一段代码。使用 Sentinel 来进行资源保护，主要分为两个步骤:

1. 定义资源
2. 定义规则

先把可能需要保护的资源定义好，之后再配置规则。也可以理解为，只要有了资源，我们就可以在任何时候灵活地定义各种流量控制规则。在编码的时候，只需要考虑这个代码是否需要保护，如果需要保护，就将之定义为一个资源。

对于主流的框架，我们提供适配，只需要按照适配中的说明配置，Sentinel 就会默认定义提供的服务，方法等为资源。

## 定义资源

### 抛出异常的方式定义资源

用这种方式，当资源发生了限流之后会抛出 `BlockException`。这个时候可以捕捉异常，进行限流之后的逻辑处理。示例代码如下:

```java
Entry entry = null;
// 务必保证finally会被执行
try {
  // 资源名可使用任意有业务语义的字符串
  entry = SphU.entry("自定义资源名");
  /**
   * 被保护的业务逻辑
   */
} catch (BlockException e1) {
  // 资源访问阻止，被限流或被降级
  // 进行相应的处理操作
} finally {
  if (entry != null) {
    entry.exit();
  }
}
```

### 返回布尔值方式定义资源

用这种方式，当资源发生了限流之后会返回 `false`，这个时候可以根据返回值，进行限流之后的逻辑处理。示例代码如下:

```java
  // 资源名可使用任意有业务语义的字符串
  if (SphO.entry("自定义资源名")) {
    // 务必保证finally会被执行
    try {
      /**
      * 被保护的业务逻辑
      */
    } finally {
      SphO.exit();
    }
  } else {
    // 资源访问阻止，被限流或被降级
    // 进行相应的处理操作
  }
```

### 注解方式定义资源

Sentinel 支持通过 `@SentinelResource` 注解定义资源并配置 `blockHandler` 和 `fallback` 函数。详情可以参见 [Sentinel 注解支持文档](./annotation-support.md)。

### 业务异常统计

如果用户通过 `SphU` 或 `SphO` 手动定义资源，则 Sentinel 不能感知上层业务的异常，需要手动调用 `Tracer.trace(ex)` 来记录业务异常，否则对应的异常不会统计到 Sentinel 异常计数中。

从 1.4.0 版本开始，注解方式定义资源支持自动统计业务异常，无需手动调用 `Tracer.trace(ex)` 来记录业务异常。Sentinel 1.4.0 以前的版本需要手动记录。

### 判断限流降级异常

通过以下方法判断：

```java
BlockException.isBlockException(Throwable t);
```

### 异步调用支持

Sentinel 从 0.2.0 版本开始支持异步调用资源的定义。在异步调用中，需要通过 `SphU.asyncEntry(xxx)` 方法定义资源，并通常需要在异步的回调函数中调用 `exit` 方法。以下是一个简单的示例：

```java
try {
    AsyncEntry entry = SphU.asyncEntry(resourceName);

    // 异步调用.
    doAsync(userId, result -> {
        try {
            // 在此处处理异步调用的结果.
        } finally {
            // 在回调结束后 exit.
            entry.exit();
        }
    });
} catch (BlockException ex) {
    // Request blocked.
    // Handle the exception (e.g. retry or fallback).
}
```

`SphU.asyncEntry(xxx)` 不会影响当前（调用线程）的 Context，因此以下两个 entry 在调用链上是平级关系（处于同一层），而不是嵌套关系：

```java
// 调用链类似于：
// -parent
// ---asyncResource
// ---syncResource
asyncEntry = SphU.asyncEntry(asyncResource);
entry = SphU.entry(normalResource);
```

若在异步回调中需要嵌套其它的资源调用（无论是 `entry` 还是 `asyncEntry`），只需要借助 Sentinel 提供的上下文切换功能，在对应的地方通过 `ContextUtil.runOnContext(context, f)` 进行 Context 变换，将对应资源调用处的 Context 切换为生成的异步 Context，即可维持正确的调用链路关系。示例如下：

```java
public void handleResult(String result) {
    Entry entry = null;
    try {
        entry = SphU.entry("handleResultForAsync");
        // Handle your result here.
    } catch (BlockException ex) {
        // Blocked for the result handler.
    } finally {
        if (entry != null) {
            entry.exit();
        }
    }
}

public void someAsync() {
    try {
        AsyncEntry entry = SphU.asyncEntry(resourceName);

        // Asynchronous invocation.
        doAsync(userId, result -> {
            // 在异步回调中进行上下文变换，通过 AsyncEntry 的 getAsyncContext 方法获取异步 Context
            ContextUtil.runOnContext(entry.getAsyncContext(), () -> {
                try {
                    // 此处嵌套正常的资源调用.
                    handleResult(result);
                } finally {
                    entry.exit();
                }
            });
        });
    } catch (BlockException ex) {
        // Request blocked.
        // Handle the exception (e.g. retry or fallback).
    }
}
```

此时的调用链就类似于：

```
-parent
---asyncInvocation
-----handleResultForAsync
```

更详细的示例可以参考 Demo 中的 [AsyncEntryDemo](https://github.com/alibaba/Sentinel/blob/master/sentinel-demo/sentinel-demo-basic/src/main/java/com/alibaba/csp/sentinel/demo/AsyncEntryDemo.java)，里面包含了普通资源与异步资源之间的各种嵌套示例。

## 主流框架的适配

为了减少开发的复杂程度，我们对大部分的主流框架，例如 Dubbo, RocketMQ, Spring Cloud 等都做了适配。您只需要引入对应的依赖，它们的方法，服务，都会进行默认的埋点。

参见: [主流框架的适配](./open-source-framework-integrations.md)

## 定义规则
Sentinel 的所有规则都可以在内存态中动态地查询及修改，修改之后立即生效。同时 Sentinel 也提供相关 API，供您来定制自己的规则策略。

### 规则的定义

Sentinel 支持以下几种规则：**流量控制规则**、**熔断降级规则**、**系统保护规则** 以及 **授权规则**。

### 流量控制规则 (FlowRule)

#### 流量规则的定义

重要属性：

| Field| 说明 |默认值
| :----: | :----| :----|
| resource| 资源名，资源名是限流规则的作用对象 ||
| count| 限流阈值 ||
| grade| 限流阈值类型，是按照 QPS 还是线程数 |QPS 模式|
| limitApp| 是否根据调用者来限流|否|
| strategy| 判断的根据是资源自身，还是根据其它资源 (`refResource`)，还是根据链路入口 (`refResource`)|根据资源本身|
| controlBehavior| 发生拦截后的流量整形和控制策略（直接拒绝 / 排队等待 / 慢启动模式）|直接拒绝|

同一个资源可以同时有多个限流规则。

#### 通过代码定义流量控制规则

理解上面规则的定义之后，我们可以通过调用 `FlowRuleManager.loadRules()` 方法来用硬编码的方式定义流量控制规则，比如：

```java
private static void initFlowQpsRule() {
        List<FlowRule> rules = new ArrayList<>();
        FlowRule rule1 = new FlowRule();
        rule1.setResource(KEY);
        // set limit qps to 20
        rule1.setCount(20);
        rule1.setGrade(RuleConstant.FLOW_GRADE_QPS);
        rule1.setLimitApp("default");
        rules.add(rule1);
        FlowRuleManager.loadRules(rules);
    }
```

更多详细内容可以参考 [流量控制](./flow-control.md)。

### 熔断降级规则 (DegradeRule)

熔断降级规则包含下面几个重要的属性：

| Field| 说明 |默认值
| :----: | :----| :----|
| resource| 资源名，资源名是限流规则的作用对象 ||
| count| 限流阈值 ||
| grade| 降级模式，根据 RT 降级还是根据异常比例降级 |RT|
| timeWindow | 降级的时间||

同一个资源可以同时有多个降级规则。

理解上面规则的定义之后，我们可以通过调用 `DegradeRuleManager.loadRules()` 方法来用硬编码的方式定义流量控制规则。

```java
 private static void initDegradeRule() {
        List<DegradeRule> rules = new ArrayList<>();
        DegradeRule rule = new DegradeRule();
        rule.setResource(KEY);
        // set threshold rt, 10 ms
        rule.setCount(10);
        rule.setGrade(RuleConstant.DEGRADE_GRADE_RT);
        rule.setTimeWindow(10);
        rules.add(rule);
        DegradeRuleManager.loadRules(rules);
    }
```

更多详情可以参考 [熔断降级](./circuit-breaking.md)。

### 系统保护规则 (SystemRule)

规则包含下面几个重要的属性：

| Field| 说明 |默认值
| :----: | :----| :----|
| highestSystemLoad | 最大的 `load1`，参考值 |-1 (不生效)|
| avgRt | 所有入口流量的平均响应时间 |-1 (不生效)|
| maxThread | 入口流量的最大并发数 |-1 (不生效)|


理解上面规则的定义之后，我们可以通过调用 `SystemRuleManager.loadRules()` 方法来用硬编码的方式定义流量控制规则。

```java
private void initSystemProtectionRule() {
  List<SystemRule> rules = new ArrayList<>();
  SystemRule rule = new SystemRule();
  rule.setHighestSystemLoad(10);
  rules.add(rule);
  SystemRuleManager.loadRules(rules);
}
```

更多详情可以参考 [系统负载保护](./system-adaptive-protection.md)。

### 查询更改规则

运行下面命令，则会返回现有生效的规则：

```shell
curl http://localhost:8719/getRules?type=<XXXX>
```

其中，`type=flow` 以 JSON 格式返回现有的限流规则；degrade 则返回现有生效的降级规则列表；system 则返回系统保护规则。

同时也可以通过下面命令来修改已有规则：

```shell
curl http://localhost:8719/setRules?type=<XXXX>&data=<DATA>
```

其中，type 可以输入 `flow`、`degrade` 等方式来制定更改的规则种类，`data` 则是对应的 JSON 格式的规则。

## 定制自己的持久化规则

上面的规则配置，都是存在内存中的。即如果应用重启，这个规则就会失效。因此我们提供了开放的接口，您可以通过实现 [`DataSource`](https://github.com/alibaba/Sentinel/blob/master/sentinel-extension/sentinel-datasource-extension/src/main/java/com/alibaba/csp/sentinel/datasource/AbstractDataSource.java) 接口的方式，来自定义规则的存储数据源。通常我们的建议有：

- 整合动态配置系统，如 ZooKeeper、[Nacos](https://github.com/alibaba/Nacos) 等，动态地实时刷新配置规则
- 结合 RDBMS、NoSQL、VCS 等来实现该规则
- 配合 Sentinel Dashboard 使用

更多详情请参考 [动态规则配置](./dynamic-rule-configuration.md)。

# 规则生效的效果

除了在业务代码逻辑上看到规则生效，我们也可以通过下面简单的方法，来校验规则生效的效果：

- **暴露的 HTTP 接口**：通过运行下面命令 `curl http://localhost:8719/cnode?id=<资源名称>`，观察返回的数据。如果规则生效，在返回的数据栏中的 `block` 以及 `block(m)` 中会有显示
- **日志**：Sentinel 提供秒级的资源运行日志以及限流日志，详情可以参考: [日志](./logs.md)