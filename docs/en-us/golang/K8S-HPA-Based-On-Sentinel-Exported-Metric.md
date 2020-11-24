# RFC: Kubernetes HPA based on exported metrics of Sentinel

## Abstract

Typically, in a cluster, Sentinel restricts the capacity of the cluster to handle the traffic through flow control. Direct rejection or other strategies for traffic exceeding the set processing capacity. In some scenario, that works good, but there are some scenarios in K8S cluster where users expect to be able to do dynamic horizontal scaling(HPA in K8S) based on some standard monitoring log data.

Key word:

* [HPA](https://kubernetes.io/docs/tasks/run-application/horizontal-pod-autoscale/)
* [Aggregator API](https://kubernetes.io/zh/docs/tasks/extend-kubernetes/configure-aggregation-layer/)

In K8S HPA(Horizontal Pod Autoscaler), MetricServer Kubernetes is a structure that collects metrics from objects such as pods, nodes according to the state of CPU, RAM and keeps them in time. Metric-Server can be installed in the system as an addon. 

In addition, K8S provide the Aggregator API to extend API Server, User could define custom metrics and use them for HPA.
 
# Motivation

* Extend APIService based on aggregate APIServer and provide Custom Metrics Server to collect application monitoring metrics
* More adaptable HPA based on application custom metrics.

# High Level Architecture
![K8S HPA Based on Sentinel Metrics](https://user-images.githubusercontent.com/9346473/87427815-ee206480-c613-11ea-9735-7e92ae12d999.png)




