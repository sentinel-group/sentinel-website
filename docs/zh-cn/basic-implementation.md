# Sentinel 工作主流程

## Overview

在 Sentinel 里面，所有的资源都对应一个资源名称以及一个 Entry。Entry 可以通过对主流框架的适配自动创建，也可以通过注解的方式或调用 API 显式创建；每一个 Entry 创建的时候，同时也会创建一系列功能插槽（slot chain）。这些插槽有不同的职责，例如:

- `NodeSelectorSlot` 负责收集资源的路径，并将这些资源的调用路径，以树状结构存储起来，用于根据调用路径来限流降级；
- `ClusterBuilderSlot` 则用于存储资源的统计信息以及调用者信息，例如该资源的 RT, QPS, thread count 等等，这些信息将用作为多维度限流，降级的依据；
- `StatisticSlot` 则用于记录、统计不同纬度的 runtime 指标监控信息；
- `FlowSlot` 则用于根据预设的限流规则以及前面 slot 统计的状态，来进行流量控制；
- `AuthoritySlot` 则根据配置的黑白名单和调用来源信息，来做黑白名单控制；
- `DegradeSlot` 则通过统计信息以及预设的规则，来做熔断降级；
- `SystemSlot` 则通过系统的状态，例如 load1 等，来控制总的入口流量；

总体的框架如下:

![arch overview](./img/sentinel-slot-chain-architecture.png)

Sentinel 将 `SlotChainBuilder` 作为 SPI 接口进行扩展，使得 Slot Chain 具备了扩展的能力。您可以自行加入自定义的 slot 并编排 slot 间的顺序，从而可以给 Sentinel 添加自定义的功能。

![Slot Chain SPI](https://user-images.githubusercontent.com/9434884/46783631-93324d00-cd5d-11e8-8ad1-a802bcc8f9c9.png)

下面介绍一下各个 slot 的功能。

##  NodeSelectorSlot

这个 slot 主要负责收集资源的路径，并将这些资源的调用路径，以树状结构存储起来，用于根据调用路径来限流降级。

```java
 ContextUtil.enter("entrance1", "appA");
 Entry nodeA = SphU.entry("nodeA");
 if (nodeA != null) {
    nodeA.exit();
 }
 ContextUtil.exit();
``` 

上述代码通过 `ContextUtil.enter()` 创建了一个名为 `entrance1` 的上下文，同时指定调用发起者为 `appA`；接着通过  `SphU.entry()`请求一个 token，如果该方法顺利执行没有抛 `BlockException`，表明 token 请求成功。

以上代码将在内存中生成以下结构：

```
 	     machine-root
                 /     
                /
         EntranceNode1
              /
             /   
      DefaultNode(nodeA)
```

注意：每个 `DefaultNode` 由资源 ID 和输入名称来标识。换句话说，一个资源 ID 可以有多个不同入口的 DefaultNode。

```java
  ContextUtil.enter("entrance1", "appA");
  Entry nodeA = SphU.entry("nodeA");
  if (nodeA != null) {
    nodeA.exit();
  }
  ContextUtil.exit();

  ContextUtil.enter("entrance2", "appA");
  nodeA = SphU.entry("nodeA");
  if (nodeA != null) {
    nodeA.exit();
  }
  ContextUtil.exit();
``` 

以上代码将在内存中生成以下结构：

``` 
                   machine-root
                   /         \
                  /           \
          EntranceNode1   EntranceNode2
                /               \
               /                 \
       DefaultNode(nodeA)   DefaultNode(nodeA)
``` 

上面的结构可以通过调用 `curl http://localhost:8719/tree?type=root` 来显示：

``` 
EntranceNode: machine-root(t:0 pq:1 bq:0 tq:1 rt:0 prq:1 1mp:0 1mb:0 1mt:0)
-EntranceNode1: Entrance1(t:0 pq:1 bq:0 tq:1 rt:0 prq:1 1mp:0 1mb:0 1mt:0)
--nodeA(t:0 pq:1 bq:0 tq:1 rt:0 prq:1 1mp:0 1mb:0 1mt:0)
-EntranceNode2: Entrance1(t:0 pq:1 bq:0 tq:1 rt:0 prq:1 1mp:0 1mb:0 1mt:0)
--nodeA(t:0 pq:1 bq:0 tq:1 rt:0 prq:1 1mp:0 1mb:0 1mt:0)

t:threadNum  pq:passQps  bq:blockedQps  tq:totalQps  rt:averageRt  prq: passRequestQps 1mp:1m-passed 1mb:1m-blocked 1mt:1m-total
``` 

## ClusterBuilderSlot

此插槽用于构建资源的 `ClusterNode` 以及调用来源节点。`ClusterNode` 保持资源运行统计信息（响应时间、QPS、block 数目、线程数、异常数等）以及原始调用者统计信息列表。来源调用者的名字由 `Context.enter(contextName，origin)` 中的 `origin` 标记。可通过如下命令查看某个资源不同调用者的访问情况：`curl http://localhost:8719/origin?id=caller`：

``` 
id: nodeA
idx origin  threadNum passedQps blockedQps totalQps aRt   1m-passed 1m-blocked 1m-total 
1   caller1 0         0         0          0        0     0         0          0        
2   caller2 0         0         0          0        0     0         0          0        
```   
## StatisticSlot

`StatisticSlot` 是 Sentinel 的核心功能插槽之一，用于统计实时的调用数据。

- `clusterNode`：资源唯一标识的 ClusterNode 的 runtime 统计
- `origin`：根据来自不同调用者的统计信息
- `defaultnode`: 根据上下文条目名称和资源 ID 的 runtime 统计
- 入口的统计

## FlowSlot

这个 slot 主要根据预设的资源的统计信息，按照固定的次序，依次生效。如果一个资源对应两条或者多条流控规则，则会根据如下次序依次检验，直到全部通过或者有一个规则生效为止:

- 指定应用生效的规则，即针对调用方限流的；
- 调用方为 other 的规则；
- 调用方为 default 的规则。

## DegradeSlot

这个 slot 主要针对资源的运行 RT 以及预设规则（平均 RT 模式或异常比率模式），来决定资源是否在接下来的时间被自动降级掉。

## SystemSlot

这个 slot 会根据对于当前系统的整体情况，对入口的资源进行调配。其原理是让入口的流量和当前系统的 load 达到一个动态平衡。

注意这个功能的两个限制:

- 只对入口流量起作用（调用类型为`EntryType.IN`），对出口流量无效。可通过 `SphU.entry()` 指定调用类型，如果不指定，默认是`EntryType.OUT`。
``` java
 Entry entry = SphU.entry("resourceName"，EntryType.IN);
``` 

- 只在 Unix-like 的操作系统上生效