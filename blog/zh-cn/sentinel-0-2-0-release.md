# Sentinel 0.2.0 重磅发布

[Sentinel](https://github.com/alibaba/Sentinel) 是阿里中间件团队开源的，面向分布式服务架构的轻量级流量控制组件，主要以流量为切入点，从流量控制、熔断降级、系统负载保护等多个维度来帮助用户保护服务的稳定性。

Sentinel 的重要里程碑版本 0.2.0 正式发布。作为一个重要的里程碑版本，Sentinel 0.2.0 带来了多项新特性，如 **异步调用支持**、**热点参数限流** 等，并包括了大量的改进与 bug 修复。下面我们来看一下 Sentinel 0.2.0 的重要新特性。

## 异步调用链路支持

未来各种 RPC 框架、Web 框架都朝着异步化的目标发展（Spring WebFlux, Vert.x, 异步 Servlet, Netty 服务等），整个 Java 的发展方向也在朝着异步、响应式演进（无论是 CompletableFuture, Reactive Streams 还是后面的 Project Loom 协程），因此支持异步调用是非常有必要的。

Sentinel 0.2.0 引入了 [异步调用链路的支持](https://github.com/alibaba/Sentinel/wiki/%E5%A6%82%E4%BD%95%E4%BD%BF%E7%94%A8#%E5%BC%82%E6%AD%A5%E8%B0%83%E7%94%A8%E6%94%AF%E6%8C%81)，可以方便地统计异步调用资源的数据，维护异步调用链路，同时具备了适配异步框架/库的能力。

异步调用资源访问与普通的资源访问类似，只不过异步调用资源 exit 通常都是在异步回调中进行。Sentinel 提供了几个 `SphU.asyncEntry(xxx)` 方法用于访问异步资源，以下是一个示例：

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

同时，Sentinel 还支持异步调用的嵌套（比如在异步回调中嵌套普通的资源调用或另一个异步资源调用）。只需要借助 Sentinel 提供的上下文切换功能，在对应的地方进行 Context 变换，即可维持正确的调用链路关系。

## 热点参数限流

何为热点？热点即经常访问的数据。很多时候我们希望统计某个热点数据中访问频率最高的 Top K 数据，并对其访问进行限制。比如：

- 商品 ID 为参数，统计一段时间内最常购买的商品 ID 并进行限制
- 用户 ID 为参数，针对一段时间内频繁访问的用户 ID 进行限制

这时候就可以使用 Sentinel 的 [热点参数限流功能](https://github.com/alibaba/Sentinel/wiki/%E7%83%AD%E7%82%B9%E5%8F%82%E6%95%B0%E9%99%90%E6%B5%81)。热点参数限流会统计传入参数中的热点参数，并根据配置的限流阈值与模式，对包含热点参数的资源调用进行限流。热点参数限流可以看做是一种特殊的流量控制，仅对包含热点参数的资源调用生效。

![Sentinel Parameter Flow Control](https://github.com/alibaba/Sentinel/wiki/image/sentinel-hot-param-overview-1.png)

Sentinel 利用 LRU 策略，结合底层的滑动窗口机制来实现热点参数统计。LRU 策略可以统计单位时间内，最近最常访问的热点参数，而滑动窗口机制可以帮助统计每个参数的 QPS。Sentinel 还支持配置参数限流例外项，可以指定对某个特定的值配置单独的限流阈值。

要使用热点参数限流功能，只需引入对应的依赖，为对应的资源配置热点参数限流规则，并在 `entry` 的时候传入相应的参数，即可使热点参数限流生效。

## 黑白名单控制

很多时候，我们需要根据调用方信息来判断资源是否允许访问，比如服务 A 只允许来自 appA 和 appB 调用方的请求通过，而服务 B 不允许来自 appC 调用方的请求通过，这时候可以使用 Sentinel 的 [黑白名单控制功能](https://github.com/alibaba/Sentinel/wiki/%E9%BB%91%E7%99%BD%E5%90%8D%E5%8D%95%E6%8E%A7%E5%88%B6)。黑白名单根据资源的请求来源（`origin`）限制资源是否通过，若配置白名单则只有请求来源位于白名单内时才可通过；若配置黑名单则请求来源位于黑名单时不通过，其余的请求通过。

## Slot Chain 扩展

Sentinel 内部是通过一系列的 slot 组成的 slot chain 来完成各种功能的，包括构建调用链、调用数据统计、规则检查等。各个 slot 之间的顺序非常重要。

Sentinel 0.2.0 将 `SlotChainBuilder` 作为 SPI 接口进行扩展，使得 Slot Chain 具备了扩展的能力。用户可以自行加入自定义的 slot 并编排 slot 间的顺序，从而可以给 Sentinel 添加自定义的功能。

![Slot Chain SPI](https://user-images.githubusercontent.com/9434884/46783631-93324d00-cd5d-11e8-8ad1-a802bcc8f9c9.png)

比如我们想要在请求 pass 后记录当前的 context 和资源信息，则可以实现一个简单的 slot：

```java
public class DemoSlot extends AbstractLinkedProcessorSlot<DefaultNode> {

    @Override
    public void entry(Context context, ResourceWrapper resourceWrapper, DefaultNode node, int count, Object... args)
        throws Throwable {
        System.out.println("Current context: " + context.getName());
        System.out.println("Current entry resource: " + context.getCurEntry().getResourceWrapper().getName());
        fireEntry(context, resourceWrapper, node, count, args);
    }

    @Override
    public void exit(Context context, ResourceWrapper resourceWrapper, int count, Object... args) {
        System.out.println("Exiting for entry on DemoSlot: " + context.getCurEntry().getResourceWrapper().getName());
        fireExit(context, resourceWrapper, count, args);
    }
}
```

然后实现一个 `SlotChainBuilder`，可以在 `DefaultSlotChainBuilder` 的基础上将我们新的 slot 添加到链的尾部（当然也可以不用 DefaultSlotChainBuilder，自由组合现有的 slot）：

```java
package com.alibaba.csp.sentinel.demo.slot;

public class DemoSlotChainBuilder implements SlotChainBuilder {

    @Override
    public ProcessorSlotChain build() {
        ProcessorSlotChain chain = new DefaultSlotChainBuilder().build();
        chain.addLast(new DemoSlot());
        return chain;
    }
}
```

最后在 `resources/META-INF/services` 目录下的 SPI 配置文件 `com.alibaba.csp.sentinel.slotchain.SlotChainBuilder` 中添加上实现的 SlotChainBuilder 的类名即可生效：

```
# Custom slot chain builder
com.alibaba.csp.sentinel.demo.slot.DemoSlotChainBuilder
```

## 动态规则数据源重构

Sentinel 的 [动态规则数据源](https://github.com/alibaba/Sentinel/wiki/%E5%8A%A8%E6%80%81%E8%A7%84%E5%88%99%E6%89%A9%E5%B1%95) 用于从中读取及写入规则。Sentinel 0.2.0 对动态规则数据源（DataSource）进行了重构，将动态规则数据源划分为两种类型：读数据源（`ReadableDataSource`）和写数据源（`WritableDataSource`），从而使不同类型的数据源职责更加清晰：

- 读数据源仅负责监听或轮询读取远程存储的变更。
- 写数据源仅负责将规则变更写入到规则源中。

在实际的场景中，不同的存储类型对应的数据源类型也不同，可以参考之前的“[在生产环境中使用 Sentinel 控制台](https://github.com/alibaba/Sentinel/wiki/%E5%9C%A8%E7%94%9F%E4%BA%A7%E7%8E%AF%E5%A2%83%E4%B8%AD%E4%BD%BF%E7%94%A8-Sentinel-%E6%8E%A7%E5%88%B6%E5%8F%B0)”一文。对于 push 模式的数据源，一般不支持写入；而 pull 模式的数据源则是可写的。Sentinel 0.2.0 提供了本地文件写数据源的实现。

## 其它

Sentinel 0.2.0 还包含下面的一些特性和改进：

- 增加 Redis 动态数据源适配
- Sentinel Dubbo Adapter 支持统计更多种类的异常
- Sentinel Dashboard 提供监控数据持久化的接口，开发者可自行扩展实现监控数据持久化
- Sentinel Web Servlet Filter 支持从 HTTP 请求中提取来源信息（origin）

心动不如行动，赶快来体验吧！也欢迎大家多多参与到 Sentinel 社区来，无论是提建议，反馈 bug 还是参与贡献，我们都欢迎！