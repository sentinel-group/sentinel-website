# How Sentinel Works

When an entry is created, a series of slots are created as well. These slots have different responsibilities, some for tracing, some for collecting and calculating run-time information, some for flow control, some for circuit breaking, and so on. You can customize your own logic by adding slots based on the following fundamental slots.

![image](https://user-images.githubusercontent.com/9434884/69955207-1e5d3c00-1538-11ea-9ab2-297efff32809.png)

##  NodeSelectorSlot: Trace nodes and form a calling tree in the memory

```java
ContextUtil.enter("entrance1", "appA");
Entry nodeA = SphU.entry("nodeA");
if (nodeA != null) {
    nodeA.exit();
}
ContextUtil.exit();
``` 

The code above will generate the following structure in memory:

```
 	     machine-root
                 /     
                /
         EntranceNode1
              /
             /   
      DefaultNode(nodeA)
```

Each `DefaultNode` is identified by both the context and resource name. In other words, one resource id may have multiple `DefaultNode` distinguished by the entry names declared in `ContextUtil.enter(contextName)`.

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
The code above will generate the following structure in memory:
``` 
                   machine-root
                   /         \
                  /           \
          EntranceNode1   EntranceNode2
                /               \
               /                 \
       DefaultNode(nodeA)   DefaultNode(nodeA)
``` 
The calling trace can be displayed by calling `curl http://localhost:8719/tree?type=root`.
``` 
EntranceNode: machine-root(t:0 pq:1 bq:0 tq:1 rt:0 prq:1 1mp:0 1mb:0 1mt:0)
-EntranceNode1: Entrance1(t:0 pq:1 bq:0 tq:1 rt:0 prq:1 1mp:0 1mb:0 1mt:0)
--nodeA(t:0 pq:1 bq:0 tq:1 rt:0 prq:1 1mp:0 1mb:0 1mt:0)
-EntranceNode2: Entrance1(t:0 pq:1 bq:0 tq:1 rt:0 prq:1 1mp:0 1mb:0 1mt:0)
--nodeA(t:0 pq:1 bq:0 tq:1 rt:0 prq:1 1mp:0 1mb:0 1mt:0)

t:threadNum  pq:passQps  bq:blockedQps  tq:totalQps  rt:averageRt  prq: passRequestQps 1mp:1m-passed 1mb:1m-blocked 1mt:1m-total
``` 

##  ClusterNodeBuilderSlot: Build cluster node named by resource

This slot maintains resource runtime statistics (response time, QPS, thread, count, exception), and a list of origin callers' statistics. The origin caller's name is marked by `origin` in `ContextUtil.enter(contextName, origin)`.  

The information can be displayed by calling the following HTTP API:  `http://localhost:8719/origin?id=xxxx` 

``` 
id: nodeA
idx origin  threadNum passedQps blockedQps totalQps aRt   1m-passed 1m-blocked 1m-total 
1   caller1 0         0         0          0        0     0         0          0        
2   caller2 0         0         0          0        0     0         0          0        
```                        

## StatisticSlot: Collect runtime statistics 

- ClusterNode (ResourceNode): Total statistics of a resource;  
- Origin node: Statistics of a ClusterNode from different callers;   
- DefaultNode: The entry of the node, marked by context entry name and resource ID;
- The total sum statistics of incoming entrances.

The StatisticNode is backed by sliding window data structure (LeapArray):

![sliding-window](https://user-images.githubusercontent.com/9434884/51955215-0af7c500-247e-11e9-8895-9fc0e4c10c8c.png)