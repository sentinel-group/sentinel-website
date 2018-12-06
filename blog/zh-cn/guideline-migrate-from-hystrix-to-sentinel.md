# Guideline: 从 Hystrix 迁移到 Sentinel

本文将帮助您从 Hystrix 迁移到 Sentinel，并帮助您快速了解 Sentinel 的使用。

| Hystrix 功能          | 迁移方案                                                     |
| --------------------- | ------------------------------------------------------------ |
| 线程池隔离/信号量隔离 | Sentinel 不支持线程池隔离；信号量隔离对应 Sentinel 中的线程数限流，详见[此处](#信号量隔离) |
| 熔断器                | Sentinel 支持按平均响应时间、异常比率、异常数来进行熔断降级。从 Hystrix 的异常比率熔断迁移的步骤详见[此处](#熔断降级) |
| Command 创建          | 直接使用 Sentinel `SphU` API 定义资源即可，资源定义与规则配置分离，详见[此处](#command-迁移) |
| 规则配置              | 在 Sentinel 中可通过 API 硬编码配置规则，也支持多种动态规则源 |
| 注解支持              | Sentinel 也提供注解支持，可以很方便地迁移，详见[此处](#注解支持)            |
| 开源框架支持          | Sentinel 提供 Servlet、Dubbo、Spring Cloud、gRPC 的适配模块，开箱即用；若之前使用 Spring Cloud Netflix，可迁移至 [Spring Cloud Alibaba](https://github.com/spring-cloud-incubator/spring-cloud-alibaba) |

## 功能对比

|                | Sentinel                                                   | Hystrix                 | resilience4j                     |
| -------------- | ---------------------------------------------------------- | ----------------------- | -------------------------------- |
| 隔离策略       | 信号量隔离（并发线程数限流）                               | 线程池隔离/信号量隔离   | 信号量隔离                       |
| 熔断降级策略   | 基于响应时间、异常比率、异常数                             | 基于异常比率            | 基于异常比率、响应时间           |
| 实时统计实现   | 滑动窗口（LeapArray）                                      | 滑动窗口（基于 RxJava） | Ring Bit Buffer                  |
| 动态规则配置   | 支持多种数据源                                             | 支持多种数据源          | 有限支持                         |
| 扩展性         | 多个扩展点                                                 | 插件的形式              | 接口的形式                       |
| 基于注解的支持 | 支持                                                       | 支持                    | 支持                             |
| 限流           | 基于 QPS，支持基于调用关系的限流                           | 有限的支持              | Rate Limiter                     |
| 流量整形       | 支持预热模式、匀速器模式、预热排队模式                     | 不支持                  | 简单的 Rate Limiter 模式         |
| 系统自适应保护 | 支持                                                       | 不支持                  | 不支持                           |
| 控制台         | 提供开箱即用的控制台，可配置规则、查看秒级监控、机器发现等 | 简单的监控查看          | 不提供控制台，可对接其它监控系统 |

## Command 迁移

Hystrix 的执行模型设计上采用了命令模式，将对外部资源的调用逻辑和 fallback 逻辑封装成一个命令对象（`HystrixCommand` / `HystrixObservableCommand`），交由 Hystrix 执行。一个最简单的例子：

```java
public class SomeCommand extends HystrixCommand<String> {

    public SomeCommand() {
        super(Setter.withGroupKey(HystrixCommandGroupKey.Factory.asKey("SomeGroup"))
            // command 定义
            .andCommandKey(HystrixCommandKey.Factory.asKey("SomeCommand"))
            // 规则配置
            .andCommandPropertiesDefaults(HystrixCommandProperties.Setter()
                .withFallbackEnabled(true)
            ));
    }

    @Override
    protected String run() {
        // 真正的业务逻辑
        return "Hello World!";
    }
}

// Hystrix 的执行方式
// 同步执行：
String s = new SomeCommand().execute();
// 异步执行 (交由 Hystrix 管理)
Observable<String> s = new SomeCommand().observe();
```

而 Sentinel 并不指定执行模型，也不关注应用是如何执行的。在 Sentinel 中手动定义资源，只需要用 API 将其包装起来即可：

```java
Entry entry = null;
try {
    entry = SphU.entry("resourceName");
    // 真正的业务逻辑.
    return doSomeThing();
} catch (BlockException ex) {
    // 处理限流降级异常
} finally {
    if (entry != null) {
        entry.exit();
    }
}
```

在 Hystrix 中，一般需要在 command 定义的时候就配置规则。而在 Sentinel 中资源定义和规则配置是分离的。用户先通过 Sentinel API 给对应的业务逻辑定义资源（埋点），然后可以在需要的时候配置规则。具体可以参考 [相关文档](https://github.com/alibaba/Sentinel/wiki/%E5%A6%82%E4%BD%95%E4%BD%BF%E7%94%A8)。

## 线程池隔离

线程池隔离的好处是隔离度比较高，可以针对某个资源的线程池去进行处理而不影响其它资源，但是代价就是线程数目比较多，线程上下文切换的 overhead 比较大，特别是对低延时的调用有比较大的影响。Sentinel 没有提供线程池隔离这样比较重的隔离方式，而是提供了信号量隔离这种比较轻量级的隔离方式。

## 信号量隔离

Hystrix 的信号量隔离是在 Command 定义时配置的，比如：

```java
public class CommandUsingSemaphoreIsolation extends HystrixCommand<String> {

    private final int id;

    // 在 command 的构造函数配置信号量隔离模式，并指定最大并发量限制
    public CommandUsingSemaphoreIsolation(int id) {
        super(Setter.withGroupKey(HystrixCommandGroupKey.Factory.asKey("SomeGroup"))
            .andCommandPropertiesDefaults(HystrixCommandProperties.Setter()
                .withExecutionIsolationStrategy(ExecutionIsolationStrategy.SEMAPHORE)
                .withExecutionIsolationSemaphoreMaxConcurrentRequests(8)));
        this.id = id;
    }

    @Override
    protected String run() {
        return "result_" + id;
    }
}
```

而在 Sentinel 中，信号量隔离是作为流量控制的一种模式（线程数模式）提供的，因此只需要给资源配置线程数限流规则即可：

```java
FlowRule rule = new FlowRule("doSomething") // 资源名称
    .setGrade(RuleConstant.FLOW_GRADE_THREAD) // 线程数模式 (信号量隔离)
    .setCount(8); // 最大并发数
FlowRuleManager.loadRules(Collections.singletonList(rule)); // 加载规则
```

如果应用接入了 [Sentinel 控制台](https://github.com/alibaba/Sentinel/wiki/%E6%8E%A7%E5%88%B6%E5%8F%B0)，也可以方便地在控制台上进行配置。

同个资源可以配置多种规则，多条规则。

## 熔断降级

Hystrix 熔断器支持异常比率熔断模式，主要有以下配置项：

- `circuitBreaker.errorThresholdPercentage`: 异常比率阈值，超出这个比率就会进行熔断
- `circuitBreaker.sleepWindowInMilliseconds`: 熔断时长（保持 OPEN 状态的时长）

示例：

```java
public class FooServiceCommand extends HystrixCommand<String> {

    protected FooServiceCommand(HystrixCommandGroupKey group) {
        super(Setter.withGroupKey(HystrixCommandGroupKey.Factory.asKey("OtherGroup"))
            // command key
            .andCommandKey(HystrixCommandKey.Factory.asKey("fooService"))
            .andCommandPropertiesDefaults(HystrixCommandProperties.Setter()
                .withExecutionTimeoutInMilliseconds(500)
                .withCircuitBreakerRequestVolumeThreshold(5)
                .withCircuitBreakerErrorThresholdPercentage(50)
                .withCircuitBreakerSleepWindowInMilliseconds(10000)
            ));
    }

    @Override
    protected String run() throws Exception {
        return "some_result";
    }
}
```

在 Sentinel 中只需要对希望自动熔断降级的资源配置降级规则即可。比如与上面 Hystrix 示例相对应的规则：

```java
DegradeRule rule = new DegradeRule("fooService") // 资源名称
    .setGrade(RuleConstant.DEGRADE_GRADE_EXCEPTION_RATIO) // 异常比率模式(秒级)
    .setCount(0.5) // 异常比率阈值(50%)
    .setTimeWindow(10); // 熔断降级时间(10s)
// 加载规则.
DegradeRuleManager.loadRules(Collections.singletonList(rule));
```

如果接入了 [Sentinel 控制台](https://github.com/alibaba/Sentinel/wiki/%E6%8E%A7%E5%88%B6%E5%8F%B0)，也可以在控制台上直接配置熔断降级规则。

![image](https://user-images.githubusercontent.com/9434884/49210023-fa33c000-f3f6-11e8-98f4-436e5edc0b36.png)

除了异常比率模式之外，Sentinel 还支持根据平均响应时间、分钟级异常数进行自动熔断降级。

## 注解支持

Hystrix 提供了注解的方式来封装 command 并进行配置。以下是 Hystrix 注解的示例：

```java
// 原本的业务方法
@HystrixCommand(fallbackMethod = "fallbackForGetUser")
User getUserById(String id) {
    throw new RuntimeException("getUserById command failed");
}

// fallback 方法，原方法被降级的时候调用
User fallbackForGetUser(String id) {
    return new User("admin");
}
```

Hystrix command 执行和规则是捆绑在一起的，因此配置规则是在 `@HystrixCommand` 注解中的 `commandProperties` 属性中配置，比如：

```java
    @HystrixCommand(commandProperties = {
            @HystrixProperty(name = "circuitBreaker.errorThresholdPercentage", value = "50")
        })
    public User getUserById(String id) {
        return userResource.getUserById(id);
    }
```

而 Sentinel 并不指定执行模型，也不关注应用是如何执行的。Sentinel 的原则非常简单：根据对应资源配置的规则来为资源执行相应的限流/降级/负载保护策略。在 Sentinel 中资源定义和规则配置是分离的。用户先通过 Sentinel API 给对应的业务逻辑定义资源（埋点），然后可以在需要的时候配置规则。

使用 Sentinel 注解的方式和 Hystrix 类似，步骤如下：

- 引入注解支持依赖：`sentinel-annotation-aspectj`，并注入对应的 Aspect 实例（若使用 [Spring Cloud Alibaba](https://github.com/spring-cloud-incubator/spring-cloud-alibaba) 则会自动注入，不需要额外配置）；
- 在需要进行限流/降级的方法上添加 `@SentinelResource` 注解并进行相应的配置（如配置 `fallback` 函数，配置 `blockHandler` 函数）；
- 配置规则

Sentinel 注解示例（[相关文档](https://github.com/alibaba/Sentinel/wiki/%E6%B3%A8%E8%A7%A3%E6%94%AF%E6%8C%81)）：

```java
// 原本的业务方法.
@SentinelResource(fallback = "fallbackForGetUser")
User getUserById(String id) {
    throw new RuntimeException("getUserById command failed");
}

// fallback 方法，原方法被降级的时候调用；若需要限流/系统保护的 fallback 可以配置 blockHandler.
User fallbackForGetUser(String id) {
    return new User("admin");
}
```

配置规则按照 Sentinel 提供的配置规则的方式即可：

- 通过 API 来进行配置（如 `DegradeRuleManager.loadRules(rules)` 方法）：

```java
DegradeRule rule = new DegradeRule("getUserById") // 资源名称
    .setGrade(RuleConstant.DEGRADE_GRADE_EXCEPTION_RATIO) // 异常比率模式
    .setCount(0.5) // 异常比率阈值(50%)
    .setTimeWindow(10); // 熔断降级时间(10s)
DegradeRuleManager.loadRules(Collections.singletonList(rule));
```

- 通过 Sentinel 控制台进行规则配置和管理

## 开源框架适配

Sentinel 目前已经针对 Servlet、Dubbo、Spring Cloud、gRPC 等进行了适配，用户只需引入相应依赖并进行简单配置即可快速地接入 Sentinel，无需修改现有代码。若您之前在使用  Spring Cloud Netflix，可以考虑迁移到 [Spring Cloud Alibaba](https://github.com/spring-cloud-incubator/spring-cloud-alibaba) 体系中。

## 动态配置

Sentinel 提供 [动态规则数据源](https://github.com/alibaba/Sentinel/wiki/%E5%8A%A8%E6%80%81%E8%A7%84%E5%88%99%E6%89%A9%E5%B1%95) 支持来动态地管理、读取配置的规则。Sentinel 提供的 `ReadableDataSource` 和 `WritableDataSource` 接口简单易用，非常方便使用。

Sentinel 动态规则源针对常见的配置中心和远程存储进行适配，目前已支持 **Nacos、ZooKeeper、Apollo、Redis** 等多种动态规则源，可以覆盖到很多的生产场景。
