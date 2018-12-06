# 注解支持

Sentinel 提供了 `@SentinelResource` 注解用于定义资源，并提供了 AspectJ 的扩展用于自动定义资源、处理 `BlockException` 等。使用 [Sentinel Annotation AspectJ Extension](https://github.com/alibaba/Sentinel/tree/master/sentinel-extension/sentinel-annotation-aspectj) 的时候需要引入以下依赖：

```xml
<dependency>
    <groupId>com.alibaba.csp</groupId>
    <artifactId>sentinel-annotation-aspectj</artifactId>
    <version>x.y.z</version>
</dependency>
```

## @SentinelResource 注解

 `@SentinelResource` 用于定义资源，并提供可选的异常处理和 fallback 配置项。 `@SentinelResource` 注解包含以下属性：

- `value`: 资源名称，必需项（不能为空）
- `entryType`: 入口类型，可选项（默认为 `EntryType.OUT`）
- `blockHandler ` / `blockHandlerClass`: `blockHandler ` 对应处理 `BlockException` 的函数名称，可选项。若未配置，则将 `BlockException` **直接抛出**。blockHandler 函数访问范围需要是 `public`，返回类型需要与原方法相匹配，参数类型需要和原方法相匹配并且最后加一个额外的参数，类型为 `BlockException`。blockHandler 函数默认需要和原方法在同一个类中。若希望使用其他类的函数，则可以指定 `blockHandlerClass` 为对应的类的 `Class` 对象，注意对应的函数必需为 static 函数，否则无法解析。
- `fallback`: fallback 函数名称，可选项，仅针对降级功能生效（`DegradeException`）。fallback 函数的访问范围需要是 `public`，参数类型和返回类型都需要与原方法相匹配，并且需要和原方法在同一个类中。**业务异常不会进入 fallback 逻辑。**

若 blockHandler 和 fallback 都进行了配置，则遇到降级的时候首先选择 fallback 函数进行处理。

注意 `blockHandler` 是处理被 block 的情况（所有类型的 `BlockException`），而 `fallback` 仅处理被降级的情况（`DegradeException`）。其它异常会原样抛出，Sentinel 不会进行处理。

示例：

```java
public class TestService {

    // 对应的 `handleException` 函数需要位于 `ExceptionUtil` 类中，并且必须为 static 函数.
    @SentinelResource(value = "test", blockHandler = "handleException", blockHandlerClass = {ExceptionUtil.class})
    public void test() {
        System.out.println("Test");
    }

    // 原函数
    @SentinelResource(value = "hello", blockHandler = "exceptionHandler", fallback = "helloFallback")
    public String hello(long s) {
        return String.format("Hello at %d", s);
    }
    
    // Fallback 函数，函数签名与原函数一致.
    public String helloFallback(long s) {
        return String.format("Halooooo %d", s);
    }

    // Block 异常处理函数，参数最后多一个 BlockException，其余与原函数一致.
    public String exceptionHandler(long s, BlockException ex) {
        // Do some log here.
        ex.printStackTrace();
        return "Oops, error occurred at " + s;
    }
}
```

从 1.4.0 版本开始，注解方式定义资源支持自动统计业务异常，无需手动调用 `Tracer.trace(ex)` 来记录业务异常。Sentinel 1.4.0 以前的版本需要自行调用 `Tracer.trace(ex)` 来记录业务异常。

## 配置

### AspectJ

若您的应用直接使用了 AspectJ，那么您需要在 `aop.xml` 文件中引入对应的 Aspect：

```xml
<aspects>
    <aspect name="com.alibaba.csp.sentinel.annotation.aspectj.SentinelResourceAspect"/>
</aspects>
```

### Spring AOP

若您的应用使用了 Spring AOP，您需要通过配置的方式将 `SentinelResourceAspect` 注册为一个 Spring Bean：

```java
@Configuration
public class SentinelAspectConfiguration {

    @Bean
    public SentinelResourceAspect sentinelResourceAspect() {
        return new SentinelResourceAspect();
    }
}
```

我们提供了 Spring AOP 的示例，可以参见 [sentinel-demo-annotation-spring-aop](https://github.com/alibaba/Sentinel/tree/master/sentinel-demo/sentinel-demo-annotation-spring-aop)。