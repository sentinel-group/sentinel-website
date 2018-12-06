# System Adaptive Protection

## Overview

Adaptive system protection maintains high system throughput under the premise of reliability of the system.

The idea of [TCP BBR](https://en.wikipedia.org/wiki/TCP_congestion_control#TCP_BBR) gives us inspiration. We should balance the requests that the system can handle and the requests that are allowed to pass, rather than relying on a single metric (system load). Our ultimate goal is to increase the throughput of the system within appropriate system load, rather than the load must be restricted below a threshold.

Sentinel's approach to system load protection is to use `load1` as the metric to initiate traffic control, and the traffic allowed to pass is determined by the ability to process the request, including the response time and current QPS.

We've provided a demo for system adaptive protection: [SystemGuardDemo](https://github.com/alibaba/Sentinel/blob/master/sentinel-demo/sentinel-demo-basic/src/main/java/com/alibaba/csp/sentinel/demo/system/SystemGuardDemo.java).

## Usage

There are several kinds of global protection item:

- System load
- Global QPS
- Global average response time
- Global max thread count

## Principle

### Load Protection

![TCP BBR](https://camo.githubusercontent.com/5b1fd9b8d18c504f0c910c00b2b58876ab4eb452/687474703a2f2f617461322d696d672e636e2d68616e677a686f752e696d672d7075622e616c6979756e2d696e632e636f6d2f62313766326563396132346261376639373033643034626334343239633637342e6a7067)

The request will be blocked under the condition:

- Current system load (`load1`) exceeds the threshold (`highestSystemLoad`);
- Current concurrent requests exceeds the capacity (`thread count > minRt * maxQps`)

### Global Metrics Protection

We have a global statistic node `ENTRY_NODE` which records global metrics (e.g. QPS, average RT and thread count).