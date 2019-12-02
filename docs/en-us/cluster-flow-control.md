# Cluster Flow Control

## Introduction

Cluster flow control is useful in plenty of scenarios. For example:

- There are 50 instances in the service cluster, and you're going to limit the frequency of one invocation to 10 per second in total.
- The traffic towards each instance might be uneven, so if we set local flow rules, requests might be blocked when specific instances are targeted with large traffic, while the total QPS has not reached the threshold sum.

<img src="https://user-images.githubusercontent.com/9434884/65305357-8f39bc80-dbb5-11e9-96d6-d1111fc365a9.png" alt="clustr-token-server-overview" height="75%" width="75%">

## Cluster Flow Rule

In `FlowRule`:

```java
private boolean clusterMode; // whether to enable the cluster mode
private ClusterFlowConfig clusterConfig; // items about the cluster flow control
```

In `ClusterFlowConfig`:

```java
// Required and unique. Usually assigned by the dashboard
private Long flowId;

// Threshold type. 0 for average threshold (per instance), 1 for global threshold.
private int thresholdType = ClusterRuleConstant.FLOW_THRESHOLD_AVG_LOCAL;

// Whether to fallback to local flow control if the transport between token client and server failed
private boolean fallbackToLocalWhenFail = true;
```

## Flow control for service mesh

- [Envoy Global Rate Limiting Support](./envoy-global-rate-limiting-support.md)