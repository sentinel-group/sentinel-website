# 熔断降级

## 概述

熔断降级是指当资源处于不稳定的情况下，在接下来的时间窗口之内，对该资源的调用都自动熔断（默认行为是抛出 `DegradeException`）。我们通常用两种方式来衡量资源是否处于稳定的状态：

- 平均响应时间 (`DEGRADE_GRADE_RT`)：当资源的平均响应时间超过阈值（`DegradeRule` 中的 `count`，以 ms 为单位）之后，资源进入准降级状态。接下来如果持续进入 5 个请求，它们的 RT 都持续超过这个阈值，那么在接下的时间窗口（`DegradeRule` 中的 `timeWindow`，以 s 为单位）之内，对这个方法的调用都会自动地返回（抛出 `DegradeException`）。

  如 [RT Degrade demo](https://github.com/alibaba/Sentinel/blob/master/sentinel-demo/sentinel-demo-basic/src/main/java/com/alibaba/csp/sentinel/demo/degrade/RtDegradeDemo.java) 所示，一个资源每次需要 500 ms。那么观察这个例子的结果，发现每过 10 秒，就会恢复对该资源的调用，但是很快这个资源又会被降级（平均响应时间仍然不满足需求）。

- 异常比例 (`DEGRADE_GRADE_EXCEPTION_RATIO`)：当资源的每秒异常总数占通过量的比值超过阈值（`DegradeRule` 中的 `count`）之后，资源进入降级状态，即在接下的时间窗口（`DegradeRule` 中的 `timeWindow`，以 s 为单位）之内，对这个方法的调用都会自动地返回。异常比率的阈值范围是 `[0.0, 1.0]`，代表 0% - 100%。
- 异常数 (`DEGRADE_GRADE_EXCEPTION_COUNT`)：当资源近 1 分钟的异常数目超过阈值之后会进行熔断。

注意：为了统计异常比例或异常数，需要通过 `Tracer.trace(ex)` 记录业务异常。示例：

```java
Entry entry = null;
try {
  entry = SphU.entry(key, EntryType.IN, key);

  // Write your biz code here.
  // <<BIZ CODE>>
} catch (Throwable t) {
  if (!BlockException.isBlockException(t)) {
    Tracer.trace(t);
  }
} finally {
  if (entry != null) {
    entry.exit();
  }
}
```

开源整合模块，如 Sentinel Dubbo Adapter, Sentinel Web Servlet Filter 会自动统计业务异常，无需手动调用。

## 示例

运行 Demo，将可以看到：

```
1529399827825,total:0, pass:0, block:0
1529399828825,total:4263, pass:100, block:4164  // 第一秒的平均RT都还比较小
1529399829825,total:19179, pass:4, block:19176
1529399830824,total:19806, pass:0, block:19806  // 开始被降级
1529399831825,total:19198, pass:0, block:19198  
1529399832824,total:19481, pass:0, block:19481
1529399833826,total:19241, pass:0, block:19241
1529399834826,total:17276, pass:0, block:17276
1529399835826,total:18722, pass:0, block:18722
1529399836826,total:19490, pass:0, block:19492
1529399837828,total:19355, pass:0, block:19355
1529399838827,total:11388, pass:0, block:11388
1529399839829,total:14494, pass:104, block:14390 // 10秒之后恢复，然而又迅速地被降级
1529399840854,total:18505, pass:0, block:18505
1529399841854,total:19673, pass:0, block:19676
```