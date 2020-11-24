# RFC: Kubernetes CRD data-source

## Motivation

* utilizing K8S CRD API to extend dynamic datasource. Standardizing the CRD, listing on custom resource and updating the newest state by controller.
* Extending the sentinel rules for components circuit breaker、flow control、 hotspot arguments control、system adaptive control

## High Level Architecture

```
                                                                                                                   +--------------------------------+
                                                                                                                   |                                |
                                                   |                                                               |                                |
                                                   |                                                               |                                |
                                                   |                                                               |                                |
                                                   |  Apply Sentinel                                               |   Sentinel K8s Datasource ->   |
                                                   |    Rule CRDs                                                  |          RuleManager           |
                                                   |                                       +----------------------->                                |
                                                   |                                       |                       |                                |
                                                   |                                       |                       |                                |
                                                   |                                       |                       |                                |
                               +-------------------v----------------+                      |                       |                                |
      Kubectl                  |                                    |                      |                       +--------------------------------+
                               |                                    |                      |                       |                                |
------------------------------->                                    |                      |                       |                                |
                               |                                    |                      |                       |                                |
                     Apply     |                                    |      Listen and      |                       |                                |
                  Sentinel CR  |          K8S API Server/           |      Controller      |                       |   Sentinel K8s Datasource ->   |
                               |             CRD Server             +----------------------+----------------------->          RuleManager           |
                               |                                    |                      |                       |                                |
 Sentinel Dashboard            |                                    |                      |                       |                                |
     K8s-client                |                                    |                      |                       |                                |
------------------------------->                                    |                      |                       |                                |
                               |                                    |                      |                       |                                |
                               |                                    |                      |                       +--------------------------------+
                               +------------------------------------+                      |                       |                                |
                                                                                           |                       |                                |
                                                                                           |                       |                                |
                                                                                           |                       |                                |
                                                                                           |                       |   Sentinel K8s Datasource ->   |
                                                                                           +----------------------->          RuleManager           |
                                                                                                                   |                                |
                                                                                                                   |                                |
                                                                                                                   |                                |
                                                                                                                   |                                |
                                                                                                                   |                                |
                                                                                                                   +--------------------------------+
```

## CRD Schema

The Schema refer to PR: [K8S CRD definition for Sentinel rules](https://github.com/alibaba/sentinel-golang/pull/182/files)

## CRD Controller

CRDs Controller are based on [operator framework SDK](https://sdk.operatorframework.io/docs/golang/quickstart/). The handler logic of datasource is same with other datasource(etcd、consul...)

