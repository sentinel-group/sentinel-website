# How to use - resource and rule

## Introduction

To use Sentinel, you only need to complete 2 steps:

1. Define resources
2. Configure rules

These two steps don’t have to be synchronized. As long as the resources are defined, you can add rules as needed. Multiple rules can be applied to the same resource simultaneously.

Sentinel provides [integrations with popular open-source frameworks and libraries](https://github.com/alibaba/Sentinel/wiki/Adapters-to-Popular-Framework) as well (e.g. Spring Cloud, gRPC, Dubbo). After introducing these integrations, services and methods provided by these frameworks are defined as resources by default. 

## Define Resource

You can use one of the following approaches to define resources.

###  "try" and "catch" mode

```java
Entry entry = null;
try {
    entry = SphU.entry(resourceName);

    // Your business logic here.
} catch (BlockException ex) {
    // Resource is rejected.

    // Here to handle the block exception
} finally {
    // DO NOT forget to exit the entry!
    if (entry != null) {
        entry.exit();
    }
}
```
### Bool mode

```java
if (SphO.entry(resourceName)) {
  try {
     // Your code logic here.
  } finally {
      SphO.exit();
  }
} else {
    // Resource is rejected.
    // Your logic to handle blocking here.
  }
}
```

### Annotation mode

Sentinel supports defining resource with `@SentinelResource` annotation. See [annotation support](https://github.com/alibaba/Sentinel/blob/master/sentinel-extension/sentinel-annotation-aspectj/README.md) for guidelines.

### Check block exception

You can check whether an exception is caused by Sentinel's flow control (`BlockException`) via:

```java
BlockException.isBlockException(Throwable t);
```

### Integrations with open-source frameworks

For details, please refer to [Adapters to popular frameworks](https://github.com/alibaba/Sentinel/wiki/Adapters-to-Popular-Framework).

### Resource for asynchronous entries

Here is a simple example:

```java
try {
    AsyncEntry entry = SphU.asyncEntry(resourceName);

    // Asynchronous invocation.
    doAsync(userId, result -> {
        try {
            // Handle your asynchronous result here.
        } finally {
            // Exit after callback completed.
            entry.exit();
        }
    });
} catch (BlockException ex) {
    // Request blocked.
    // Handle the exception (e.g. retry or fallback).
}
```

For more advanced usage, you can refer to [AsyncEntryDemo](https://github.com/alibaba/Sentinel/blob/master/sentinel-demo/sentinel-demo-basic/src/main/java/com/alibaba/csp/sentinel/demo/AsyncEntryDemo.java).

## Configure Rules

Sentinel provides APIs for you to modify your rules, which can be integrated with various kinds of rule repository, such as configuration server and NoSQL.

### Definition of Rules

There are 4 types of rules：**flow control rules**, **degrade rules**, **system protection rules** and **authority rules**.

#### Flow control rules (FlowRule)

**Definition**

key fields：

| Field| Description|Default value|
| :----: | :----| :----|
| resource | resource name ||
| count | threshold ||
| grade | flow control metric (QPS or concurrent thread count) |QPS|
| limitApp | refer to specified caller|default|
| strategy | by resource itself or other resource (`refResource`)，or entry (refResource)|resource itself|
| controlBehavior| traffic shaping control behavior (reject directly，queue，slow start up) |reject directly|

Multiple rules can be applied to the same resource.

**API**

`FlowRuleManager.loadRules()` can be used to configure flow control rules.

```java
private static void initFlowQpsRule() {
        List<FlowRule> rules = new ArrayList<FlowRule>();
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

For more details please refer to [Flow Control](./flow-control.md).

#### Circuit breaking rules (DegradeRule)

Key fields:

| Field| Description|Default value
| :----: | :----| :----|
| resource| resource name ||
| count | threshold ||
| grade| circuit breaking mode, by response time or exception ratio |response time|
| timeWindow| degrade time window (in second)||

Multiple rules can be applied to the same resource.

**API**

`DegradeRuleManager.loadRules()` can be used to configure degrade rules.

```java
private static void initDegradeRule() {
        List<DegradeRule> rules = new ArrayList<DegradeRule>();
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
For more details, please refer to [Circuit Breaking](./circuit-breaking.md).

#### System protection rules (SystemRule)

Key factors

| Field| Description |Default value
| :----: | :----| :----|
| highestSystemLoad | threshold of Load1 |-1(not valid)|
| avgRt | average response time  |-1(not valid)|
| maxThread |concurrent thread count |-1(not valid)|

**API**

`SystemRuleManager.loadRules()` can be used to configure system protection rules.

```java
private void initSystemProtectionRule() {
  List<SystemRule> rules = new ArrayList<>();
  SystemRule rule = new SystemRule();
  rule.setHighestSystemLoad(10);
  rules.add(rule);
  SystemRuleManager.loadRules(rules);
}
```
For more details, please refer to [System Adaptive Protection](./system-adaptive-protection.md).

### HTTP commands for rules

You can also use HTTP API to configure, query and update Sentinel rules. 

To use these API, make sure that the following library has been introduced:

```xml
<dependency>
    <groupId>com.alibaba.csp</groupId>
    <artifactId>sentinel-transport-simple-http</artifactId>
    <version>x.y.z</version>
</dependency>
```

#### Query command

API:

```shell
curl http://localhost:8719/getRules?type=<XXXX>
```

- `type=flow` for flow rules;
- `type=degrade` for circuit breaking rules;
- `type=system` for system protection rules. 

Rules will be returned in JSON format.

#### Modification command

> Note: Only for test, do not use in production.

```shell
curl http://localhost:8719/setRules?type=<XXXX>&data=<DATA>
```

## Integrate with rule repositories

[DataSource](https://github.com/alibaba/Sentinel/blob/master/sentinel-extension/src/main/java/com/alibaba/csp/sentinel/datasource/AbstractDataSource.java) is designed to integrate rules to customized repositories and make rules persistent. 

For more details, you can refer to [Dynamic Rule Configuration](./dynamic-rule-configuration.md).
