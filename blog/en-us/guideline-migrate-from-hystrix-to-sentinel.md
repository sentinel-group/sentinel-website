# Guideline: Migration from Hystrix to Sentinel

This article will help you migrate from Hystrix to Sentinel and help you get up to speed on using Sentinel.

| Feature in Hystrix                          | Migration Solution                                           | Feature in Sentinel                                          |
| ------------------------------------------- | ------------------------------------------------------------ | ------------------------------------------------------------ |
| Thread Pool Isolation / Semaphore Isolation | Sentinel does not support thread pool isolation; In Sentinel, flow control in [thread count mode](https://github.com/alibaba/Sentinel/wiki/Flow-Control#concurrent-thread-count) represents semaphore isolation. If you are using semaphore isolation, you can simply add flow rules for target resource. | [Thread Count Flow Control](https://github.com/alibaba/Sentinel/wiki/Flow-Control#concurrent-thread-count) |
| Circuit Breaker                             | Sentinel supports circuit breaking by average response time, exception ratio and exception count. If you want to use circuit breaking in Sentinel, you cam simply configure degrade rules for target resource. | [Circuit breaking with various strategy](https://github.com/alibaba/Sentinel/wiki/Circuit-Breaking) |
| Command Definition                          | You can define your resource entry (similar to command key) via `SphU` API in Sentinel. [Resource definition](https://github.com/alibaba/Sentinel/wiki/How-to-Use#define-resource) and [rule configuration](https://github.com/alibaba/Sentinel/wiki/How-to-Use#configure-rules) are separate. | [Resource Entry Definition](https://github.com/alibaba/Sentinel/wiki/How-to-Use#define-resource) |
| Command Configuration                       | Rules can be hardcoded through the `xxxRuleManager` API in Sentinel, and multiple dynamic rule data sources are also supported. | [Rule Configuration](https://github.com/alibaba/Sentinel/wiki/How-to-Use#configure-rules) |
| HystrixCommand annotation                   | Sentinel also provides [annotation support](https://github.com/alibaba/Sentinel/blob/master/sentinel-extension/sentinel-annotation-aspectj/README.md) (`SentinelResource`), which is easy to use. | [SentinelResource annotation](https://github.com/alibaba/Sentinel/blob/master/sentinel-extension/sentinel-annotation-aspectj/README.md) |
| Spring Cloud Netflix                        | Sentinel provides out-of-box integration modules for Servlet, Dubbo, Spring Cloud, and gRPC. If you were using Spring Cloud Netflix previously, it's east for you to migrate to Spring Cloud Alibaba. | [Spring Cloud Alibaba](https://github.com/spring-cloud-incubator/spring-cloud-alibaba) |

## HystrixCommand

The execution model of Hystrix is designed with command pattern that encapsulates the business logic and fallback logic into a single command object (`HystrixCommand` / `HystrixObservableCommand`). A simple example:

```java
public class SomeCommand extends HystrixCommand<String> {

    public SomeCommand() {
        super(Setter.withGroupKey(HystrixCommandGroupKey.Factory.asKey("SomeGroup"))
            // command key
            .andCommandKey(HystrixCommandKey.Factory.asKey("SomeCommand"))
            // command configuration
            .andCommandPropertiesDefaults(HystrixCommandProperties.Setter()
                .withFallbackEnabled(true)
            ));
    }

    @Override
    protected String run() {
        // business logic
        return "Hello World!";
    }
}

// The execution model of Hystrix
// sync mode:
String s = new SomeCommand().execute();
// async mode (managed by Hystrix):
Observable<String> s = new SomeCommand().observe();
```

Sentinel does not specify an execution model, nor does it care how the code is executed. In Sentinel, what you should do is just to wrap your code with Sentinel API to define resources:

```java
Entry entry = null;
try {
    entry = SphU.entry("resourceName");
    // your business logic here
    return doSomeThing();
} catch (BlockException ex) {
    // handle rejected
} finally {
    if (entry != null) {
        entry.exit();
    }
}
```

In Hystrix, you usually have to configure rules when the command is defined. In Sentinel, resource definitions and rule configurations are separate. Users first define resources for the corresponding business logic through the Sentinel API, and then configure the rules when needed. For details, please refer to [the document](https://github.com/alibaba/Sentinel/wiki/How-to-Use).

## Thread Pool Isolation

The advantage of thread pool isolation is that the isolation is relatively thorough, and it can be processed for the thread pool of a resource without affecting other resources. But the drawback is that the number of threads is large, and the overhead of thread context switching is very large, especially for low latency invocations. Sentinel does not provide such a heavy isolation strategy, but provides a relatively lightweight isolation strategy - thread count flow control as semaphore isolation.

## Semaphore Isolation

Hystrix's semaphore isolation is configured at Command definition, such as：

```java
public class CommandUsingSemaphoreIsolation extends HystrixCommand<String> {

    private final int id;

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

In Sentinel, semaphore isolation is provided as a mode of flow control (thread count mode), so you only need to configure the flow rule for the resource:

```java
FlowRule rule = new FlowRule("doSomething") // resource name
    .setGrade(RuleConstant.FLOW_GRADE_THREAD) // thread count mode
    .setCount(8); // max concurrency
FlowRuleManager.loadRules(Collections.singletonList(rule)); // load the rules
```

If you are using Sentinel dashboard, you can also easily configure the rules in dashboard.



## Circuit Breaking

Hystrix circuit breaker supports error percentage mode. Related properties:

- `circuitBreaker.errorThresholdPercentage`: the threshold
- `circuitBreaker.sleepWindowInMilliseconds`: the sleep window when circuit breaker is open

For example:

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

In Sentinel, you only need to configure circuit breaking rules for resources that want to be automatically degraded. For example, the rules corresponding to the Hystrix example above:

```java
DegradeRule rule = new DegradeRule("fooService")
    .setGrade(RuleConstant.DEGRADE_GRADE_EXCEPTION_RATIO) // exception ratio mode
    .setCount(0.5) // ratio threshold (0.5 -> 50%)
    .setTimeWindow(10); // sleep window (10s)
// load the rules
DegradeRuleManager.loadRules(Collections.singletonList(rule));
```

If you are using [Sentinel dashboard](https://github.com/alibaba/Sentinel/wiki/Dashboard), you can also easily configure the circuit breaking rules in dashboard.

In addition to the exception ratio mode, Sentinel also supports automatic circuit breaking based on average response time and minute exceptions.

## Annotation Support

Hystrix provides annotation support to encapsulate command and configure it. Here is an example of Hystrix annotation:

```java
// original method
@HystrixCommand(fallbackMethod = "fallbackForGetUser")
User getUserById(String id) {
    throw new RuntimeException("getUserById command failed");
}

// fallback method
User fallbackForGetUser(String id) {
    return new User("admin");
}
```

Hystrix rule configuration is bundled with command execution. We can configure rules for command in the `commandProperties` property of the `@HystrixCommand annotation`, such as:

```java
@HystrixCommand(commandProperties = {
        @HystrixProperty(name = "circuitBreaker.errorThresholdPercentage", value = "50")
    })
public User getUserById(String id) {
    return userResource.getUserById(id);
}
```

Using Sentinel annotations is similar to Hystrix, as follows:

- Add the annotation support dependency: `sentinel-annotation-aspectj` and register the aspect as a Spring bean (if you are using [Spring Cloud Alibaba](https://github.com/spring-cloud-incubator/spring-cloud-alibaba) then the bean will be injected automatically);
- Add the `@SentinelResource` annotation to the method that needs flow control and circuit breaking. You can set `fallback` or `blockHandler` functions in the annotation;
- Configure rules

For the details, you can refer to [the annotation support document](https://github.com/alibaba/Sentinel/blob/master/sentinel-extension/sentinel-annotation-aspectj/README.md). An example for Sentinel annotation:

```java
// original method
@SentinelResource(fallback = "fallbackForGetUser")
User getUserById(String id) {
    throw new RuntimeException("getUserById command failed");
}

// fallback method (only invoked when the original resource triggers circuit breaking); If we need to handle for flow control / system protection, we can set `blockHandler` method
User fallbackForGetUser(String id) {
    return new User("admin");
}
```

Then configure the rules:

- via API (e.g. `DegradeRuleManager.loadRules(rules)` method)

```java
DegradeRule rule = new DegradeRule("getUserById")
    .setGrade(RuleConstant.DEGRADE_GRADE_EXCEPTION_RATIO) // exception ratio mode
    .setCount(0.5) // ratio threshold (0.5 -> 50%)
    .setTimeWindow(10); // sleep window (10s)
// load the rules
DegradeRuleManager.loadRules(Collections.singletonList(rule));
```

- via [Sentinel dashboard](https://github.com/alibaba/Sentinel/wiki/Dashboard)

## Integrations

Sentinel has integration modules with Web Servlet, Dubbo, Spring Cloud and gRPC. Users can quickly use Sentinel by introducing adapter dependencies and do simple configuration. If you have been using Spring Cloud Netflix before, you may consider migrating to the [Spring Cloud Alibaba](https://github.com/spring-cloud-incubator/spring-cloud-alibaba).

## Dynamic Configuration

Sentinel provides dynamic rule data-source support for dynamic rule management. The `ReadableDataSource` and `WritableDataSource` interfaces provided by Sentinel are easy to use.

The Sentinel dynamic rule data-source provides extension module to integrate with popular configuration centers and remote storage. Currently, it supports many dynamic rule sources such as Nacos, ZooKeeper, Apollo, and Redis, which can cover many production scenarios.