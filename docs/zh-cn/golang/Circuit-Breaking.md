# Circuit Breaker
Excepting traffic control, circuit breaking used for unstable resource in calling link is also one of the important measures to ensure high availability.  B/C the complexity of the call link in a distributed system, if a service is unstable in the calling link, the callers who depend on that service may themselves be blocked by slow calls, eventually causing the entire link to crash.
![](https://user-images.githubusercontent.com/9434884/62410811-cd871680-b61d-11e9-9df7-3ee41c618644.png)

Sentinel circuit breaker will cut the calls to resource if some downstream resource occurs unstable state. the fail-fast could avoid the cascading error. If the resource was degraded, calls to the resource are automatically circuited during the next degradation time window.

Below is the state machine of circuit breaker:
```go
          the error count/error ratio/ slow request ratio exceeds the threshold  
         +-----------------------------------------------------------------------+
         |                                                                       |
         |                                                                       v
+----------------+                   +----------------+    Probe        +----------------+
|                |    Probe succeed  |                |<----------------|                |
|                | Recover to Closed |                |                 |                |
|     Closed     |<------------------|    HalfOpen    |                 |      Open      |
|                |                   |                |  Probe failed   |                |
|                |                   |                +---------------->|                |
+----------------+                   +----------------+                 +----------------+
```

# Circuit Strategy
Sentinel Go support three circuit strategy:

- Slow Request Ratio: If the number of requests within the unit statistical time is greater than the set minimum number of requests, and the proportion of slow calls is greater than the threshold value, then the request will be automatically fused within the following fuse time. You need to set the maximum allowed response time, and if the request response time is greater than that, it is counted as a slow call.
- Error Ratio: If the number of resource requests within a unit statistical time is greater than the set minimum number of requests, and the proportion of exceptions is greater than the threshold value, then the request will be automatically fused within the following circuit breaker time.
- Error Count: If the number of resource requests in the unit statistical time is greater than the set minimum number of requests, and the number of exceptions is greater than the threshold value, then the requests will be automatically fused in the following circuit breaker time.

Note: A circuit breaker error is only for business exceptions, and the Sentinel limiter reversion itself of the exception (BlockError) is not valid. For custom burial points, you need to record business exceptions through api.traceError(err) in order to count the percentage or number of exceptions.

# Demo
The demo refers to [https://github.com/alibaba/sentinel-golang/blob/master/example/circuitbreaker/circuit_breaker_example.go](https://github.com/alibaba/sentinel-golang/blob/master/example/circuitbreaker/circuit_breaker_example.go)

