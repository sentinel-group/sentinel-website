---
key1: RocketMQ
---

# Sentinel 为 Apache RocketMQ 保驾护航

在 Apache RocketMQ 中，当消费者去消费消息的时候，无论是通过 pull 的方式还是 push 的方式，都可能会出现大批量的消息突刺。如果此时要处理所有消息，很可能会导致系统负载过高，影响稳定性。但其实可能后面几秒之内都没有消息投递，若直接把多余的消息丢掉则没有充分利用系统处理消息的能力。我们希望可以把消息突刺均摊到一段时间内，让系统负载保持在消息处理水位之下的同时尽可能地处理更多消息，从而起到“削峰填谷”的效果：

![削峰填谷](https://github.com/alibaba/Sentinel/wiki/image/mq-traffic-peak-clipping.png) 

上图中红色的部分代表超出消息处理能力的部分。我们可以看到消息突刺往往都是瞬时的、不规律的，其后一段时间系统往往都会有空闲资源。我们希望把红色的那部分消息平摊到后面空闲时去处理，这样既可以保证系统负载处在一个稳定的水位，又可以尽可能地处理更多消息，这时候我们就需要一个能够控制消息匀速处理的利器 —— Sentinel，来为 RocketMQ 削峰填谷，保驾护航。

## Sentinel 是如何削峰填谷的

### Sentinel 介绍

[Sentinel](https://github.com/alibaba/Sentinel) 是阿里中间件团队开源的，面向分布式服务架构的轻量级流量控制产品，主要以流量为切入点，从流量控制、熔断降级、系统负载保护等多个维度来帮助用户保护服务的稳定性。

### 原理

Sentinel 专门为这种场景提供了[匀速器](https://github.com/alibaba/Sentinel/wiki/%E9%99%90%E6%B5%81---%E5%8C%80%E9%80%9F%E5%99%A8)的特性，可以把突然到来的大量请求以匀速的形式均摊，以固定的间隔时间让请求通过，以稳定的速度逐步处理这些请求，起到“削峰填谷”的效果，从而避免流量突刺造成系统负载过高。同时堆积的请求将会排队，逐步进行处理；当请求排队预计超过最大超时时长的时候则直接拒绝，而不是拒绝全部请求。

比如在 RocketMQ 的场景下配置了匀速模式下请求 QPS 为 5，则会每 200 ms 处理一条消息，多余的处理任务将排队；同时设置了超时时间为 5 s，预计排队时长超过 5 s 的处理任务将会直接被拒绝。示意图如下图所示：

![Uniform rate](https://github.com/alibaba/Sentinel/wiki/image/uniform-speed-queue.png)

### RocketMQ Client 接入 Sentinel 的示例

在结合 RocketMQ Client 使用 Sentinel 时，用户首先需要引入 `sentinel-core` 依赖（以 Maven 为例）：

```xml
<dependency>
    <groupId>com.alibaba.csp</groupId>
    <artifactId>sentinel-core</artifactId>
    <version>x.y.z</version>
</dependency>
```

由于 RocketMQ Client 未提供相应拦截机制，而且每次收到都可能是批量的消息，因此用户在处理消息时需要手动进行埋点。

在 RocketMQ 的场景中，用户可以根据不同的 group 和不同的 topic 分别设置限流规则，开启匀速器模式（`RuleConstant.CONTROL_BEHAVIOR_RATE_LIMITER`），并在处理消息时埋点，即可以以固定的速率处理消息。以下是一个规则示例：

```java
private void initFlowControlRule() {
    FlowRule rule = new FlowRule();
    rule.setResource(KEY); // 对应的 key 为 `groupName:topicName`
    rule.setCount(5);
    rule.setGrade(RuleConstant.FLOW_GRADE_QPS);
    rule.setLimitApp("default");

    // 匀速器模式下，设置了 QPS 为 5，则请求每 200 ms 允许通过 1 个
    rule.setControlBehavior(RuleConstant.CONTROL_BEHAVIOR_RATE_LIMITER);
    // 如果更多的请求到达，这些请求会被置于虚拟的等待队列中。等待队列有一个 max timeout，如果请求预计的等待时间超过这个时间会直接被 block
    // 在这里，timeout 为 5s
    rule.setMaxQueueingTimeMs(5 * 1000);
    FlowRuleManager.loadRules(Collections.singletonList(rule));
}
```

然后在处理消息的时候手动埋点（以 pull consumer 为例）：

```java
// pull 消息的代码片段，每次最多 32 条消息
PullResult pullResult = consumer.pullBlockIfNotFound(mq, null, getMessageQueueOffset(mq), 32);
if (pullResult.getMsgFoundList() != null) {
    for (MessageExt msg : pullResult.getMsgFoundList()) {
        // 处理消息
        doSomething(msg);
    }
}

long nextOffset = pullResult.getNextBeginOffset();
putMessageQueueOffset(mq, nextOffset);
consumer.updateConsumeOffset(mq, nextOffset);
```

```java
private static void doSomething(MessageExt message) {
    pool.submit(() -> {
        Entry entry = null;
        try {
            ContextUtil.enter(KEY);
            entry = SphU.entry(KEY, EntryType.OUT);

            // 在此处理消息.
            System.out.printf("[%d][%s][Success: %d] Receive New Messages: %s %n", System.currentTimeMillis(),
                Thread.currentThread().getName(), successCount.addAndGet(1), , new String(message.getBody()));
        } catch (BlockException ex) {
            // Blocked.
			// NOTE: 在处理请求被拒绝的时候，需要根据需求决定是否需要重新消费消息
            System.out.println("Blocked: " + failCount.addAndGet(1));
        } finally {
            if (entry != null) {
                entry.exit();
            }
            ContextUtil.exit();
        }
    });
}
```

详细代码请见 [PullConsumerDemo](https://github.com/alibaba/Sentinel/blob/master/sentinel-demo/sentinel-demo-rocketmq/src/main/java/com/alibaba/csp/sentinel/demo/rocketmq/PullConsumerDemo.java)。

下面我们来看一下具体的运行效果。首先根据 [RocketMQ 的文档](https://rocketmq.apache.org/docs/quick-start/) 来在本地启动 RocketMQ，然后向对应 group 的对应 topic 发送 1000 条消息，然后按上面的例子配限流规则，启动消费者应用。可以看到消息消费的速率是匀速的，大约每 200 ms 消费一条消息：

```
[1532571650235][pool-1-thread-32][Success: 3] Receive New Messages: Hello RocketMQ From Sentinel 274 
[1532571650435][pool-1-thread-22][Success: 4] Receive New Messages: Hello RocketMQ From Sentinel 154 
[1532571650634][pool-1-thread-7][Success: 5] Receive New Messages: Hello RocketMQ From Sentinel 72 
[1532571650833][pool-1-thread-31][Success: 6] Receive New Messages: Hello RocketMQ From Sentinel 262 
[1532571651035][pool-1-thread-30][Success: 7] Receive New Messages: Hello RocketMQ From Sentinel 250 
[1532571651235][pool-1-thread-8][Success: 8] Receive New Messages: Hello RocketMQ From Sentinel 84 
[1532571651435][pool-1-thread-4][Success: 9] Receive New Messages: Hello RocketMQ From Sentinel 36 
[1532571651635][pool-1-thread-5][Success: 10] Receive New Messages: Hello RocketMQ From Sentinel 48 
[1532571651835][pool-1-thread-1][Success: 11] Receive New Messages: Hello RocketMQ From Sentinel 0 
```

同时不断有排队的处理任务完成，超出等待时长的处理请求直接被拒绝。注意在处理请求被拒绝的时候，需要根据需求决定是否需要重新消费消息。

如果不开启匀速模式，只是普通的限流模式，则只会同时处理 5 条消息，其余的全部被拒绝，即使后面的时间系统资源充足多余的请求也无法被处理，因而浪费了许多空闲资源。

### Sentinel Dashboard

Sentinel 提供 API 用于获取实时的监控信息，对应文档见[此处](https://github.com/alibaba/Sentinel/wiki/%E5%AE%9E%E6%97%B6%E7%9B%91%E6%8E%A7)。使用时可以添加以下依赖：

```xml
<dependency>
    <groupId>com.alibaba.csp</groupId>
    <artifactId>sentinel-transport-simple-http</artifactId>
    <version>x.y.z</version>
</dependency>
```

为了便于使用，Sentinel 还提供了一个控制台（Dashboard）用于配置规则、查看监控、机器发现等功能。我们只需要按照 [Sentinel 控制台文档](https://github.com/alibaba/Sentinel/wiki/%E6%8E%A7%E5%88%B6%E5%8F%B0) 启动控制台，然后给对应的应用程序添加相应参数并启动即可（注意客户端需要添加上面的 transport 依赖）。比如本文中消息消费者示例的启动参数：

```bash
-Dcsp.sentinel.api.port=8720 -Dcsp.sentinel.dashboard.server=localhost:8080 -Dproject.name=sentinel-rocketmq-consumer
```

这样在启动 Consumer 示例以后，就可以在 Sentinel 控制台中找到我们的应用了。可以很方便地在控制台中配置限流规则：

![规则配置](https://github.com/alibaba/Sentinel/wiki/image/mq-sentinel-dashboard-rule.png) 

或者查看实时监控（这里对应匀速模式，图中标注的 `b_qps` 代表每秒被 block 的数目，下同）：

![匀速模式下的秒级实时监控](https://github.com/alibaba/Sentinel/wiki/image/mq-sentinel-dashboard-metrics-uniform.png) 

对比普通限流模式下的监控图线：

![普通限流模式的监控](https://github.com/alibaba/Sentinel/wiki/image/mq-sentinel-dashboard-metrics-normal.png) 

可以看到普通限流模式下每次流量突刺都只能在一瞬间处理少量消息，其它请求都会立即被限掉。而匀速模式下可以把突刺的部分平滑到后面的时间中处理，每次消息量激增时都可以处理更多的消息。两种模式对比说明匀速模式下消息处理能力得到了更好的利用。

## 其它

以上介绍的只是 Sentinel 的其中一个场景 —— 请求匀速。Sentinel 还可以处理更复杂的各种情况，比如：

- 流量控制：Sentinel 可以针对不同的调用关系，以不同的运行指标（如 QPS、线程数、系统负载等）为基准，对资源调用进行流量控制，将随机的请求调整成合适的形状（请求匀速、冷启动等）。
- 熔断降级：当调用链路中某个资源出现不稳定的情况，如平均 RT 增高、异常比例升高的时候，Sentinel 会使对此资源的调用请求快速失败，避免影响其它的资源，导致级联失败。
- 系统负载保护：Sentinel 对系统的维度提供保护。当系统负载较高的时候，Sentinel 提供了对应的保护机制，让系统的入口流量和系统的负载达到一个平衡，保证系统在能力范围之内处理最多的请求。

可以参考 [Sentinel 文档](https://github.com/alibaba/Sentinel/wiki/%E4%B8%BB%E9%A1%B5) 来挖掘更多的场景。