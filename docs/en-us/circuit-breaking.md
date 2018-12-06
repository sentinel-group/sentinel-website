# Circuit Breaking

## Introduction

Circuit breaking is used to degrade (cut down, fast fail) a resource when it is in an unstable state. There are several ways to determine whether a resource is in a stable state:

- Average Response Time (`DEGRADE_RT`): When the average RT exceeds the threshold (`count` in `DegradeRule`, in ms), the resource enters a quasi-degraded state. If the RT of next coming five requests still exceeds this threshold, this resource will be degraded, which means that in the next time window (defined in 'timeWindow', in second) all the access to this resource will be blocked.
- Exception Ratio: `exception ratio = exception count per second / success QPS`. When the ratio exceeds the threshold, access to the resource will be blocked in the specified time window.
- Exception Count: circuit breaking by exception count per minute.

For circuit breaking rules, you can refer to [here](https://github.com/alibaba/Sentinel/wiki/How-to-Use#circuit-breaking-rules-degraderule).

## Demo

Run the demo and the output will be as follows:

```
 1529399827825,total:0, pass:0, block:0
 1529399828825,total:4263, pass:100, block:4164  
 1529399829825,total:19179, pass:4, block:19176
 1529399830824,total:19806, pass:0, block:19806  // Circuit breaker opens (begin to degrade)
 1529399831825,total:19198, pass:0, block:19198  
 1529399832824,total:19481, pass:0, block:19481
 1529399833826,total:19241, pass:0, block:19241
 1529399834826,total:17276, pass:0, block:17276
 1529399835826,total:18722, pass:0, block:18722
 1529399836826,total:19490, pass:0, block:19492
 1529399837828,total:19355, pass:0, block:19355
 1529399838827,total:11388, pass:0, block:11388
 1529399839829,total:14494, pass:104, block:14390 //After 10 seconds, the system is restored, and degraded very quickly
 1529399840854,total:18505, pass:0, block:18505
 1529399841854,total:19673, pass:0, block:19676
```