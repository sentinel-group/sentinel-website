# Circuit Breaking

## Introduction

Circuit breaking provides stability and prevents cascading failures in distributed systems.

![chain](https://user-images.githubusercontent.com/9434884/62410811-cd871680-b61d-11e9-9df7-3ee41c618644.png)

> Note: This document is for Sentinel 1.8.0 or above.

## Circuit breaker strategy

- **Slow Request Ratio**: Circuit breaking by slow request ratio. We'll need to provide the "upper-bound response time", and requests whose RT exceeds the upper-bound RT will be recorded as a slow request.
- **Error Ratio**: Circuit breaking by the error ratio (error count / total completed count).
- **Error Count**: Circuit breaking by the number of exceptions.

## Circuit breaker rules

For circuit breaking rules, you can refer to [here](https://github.com/alibaba/Sentinel/wiki/How-to-Use#circuit-breaking-rules-degraderule).

## Circuit breaker state change observer

```java
EventObserverRegistry.getInstance().addStateChangeObserver("logging",
    (prevState, newState, rule, snapshotValue) -> {
        if (newState == State.OPEN) {
            System.err.println(String.format("%s -> OPEN at %d, snapshotValue=%.2f", prevState.name(),
                TimeUtil.currentTimeMillis(), snapshotValue));
        } else {
            System.err.println(String.format("%s -> %s at %d", prevState.name(), newState.name(),
                TimeUtil.currentTimeMillis()));
        }
    });
```

## Demo

[SlowRatioCircuitBreakerDemo](https://github.com/alibaba/Sentinel/blob/master/sentinel-demo/sentinel-demo-basic/src/main/java/com/alibaba/csp/sentinel/demo/degrade/SlowRatioCircuitBreakerDemo.java)