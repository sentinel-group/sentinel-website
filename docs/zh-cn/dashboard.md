# Sentinel 控制台

## 1. 概述

Sentinel 控制台提供一个轻量级的控制台，它提供机器发现、单机资源实时监控、集群资源汇总，以及规则管理的功能。您只需要对应用进行简单的配置，就可以使用这些功能。

**注意:** 集群资源汇总仅支持 500 台以下的应用集群，有大概 1 - 2 秒的延时。

![Dashboard](https://github.com/alibaba/Sentinel/wiki/image/dashboard.png)

## 2. 启动控制台

### 2.1 获取 Sentinel 控制台

您可以从 [release 页面](https://github.com/alibaba/Sentinel/releases) 下载最新版本的控制台 jar 包。

您也可以从最新版本的源码自行构建 Sentinel 控制台：

- 下载 [控制台](https://github.com/alibaba/Sentinel/tree/master/sentinel-dashboard) 工程
- 使用以下命令将代码打包成一个 fat jar: `mvn clean package`

### 2.2 启动

> **注意**：启动 Sentinel 控制台需要 JDK 版本为 1.8 及以上版本。

使用如下命令启动控制台：

```bash
java -Dserver.port=8080 -Dcsp.sentinel.dashboard.server=localhost:8080 -Dproject.name=sentinel-dashboard -jar sentinel-dashboard.jar
```

其中 `-Dserver.port=8080` 用于指定 Sentinel 控制台端口为 `8080`。

## 3. 客户端接入控制台

控制台启动后，客户端需要按照以下步骤接入到控制台。

### 3.1 引入JAR包

客户端需要引入 Transport 模块来与 Sentinel 控制台进行通信。您可以通过 `pom.xml` 引入 JAR 包:

```xml
<dependency>
    <groupId>com.alibaba.csp</groupId>
    <artifactId>sentinel-transport-simple-http</artifactId>
    <version>x.y.z</version>
</dependency>
```

### 3.2 配置启动参数

启动时加入 JVM 参数 `-Dcsp.sentinel.dashboard.server=consoleIp:port` 指定控制台地址和端口。若启动多个应用，则需要通过 `-Dcsp.sentinel.api.port=xxxx` 指定客户端监控 API 的端口（默认是 8719）。

除了修改 JVM 参数，也可以通过配置文件取得同样的效果。更详细的信息可以参考 [启动配置项](https://github.com/alibaba/Sentinel/wiki/%E5%90%AF%E5%8A%A8%E9%85%8D%E7%BD%AE%E9%A1%B9)。

### 3.3 触发客户端初始化

**确保客户端有访问量**，Sentinel 会在**客户端首次调用的时候**进行初始化，开始向控制台发送心跳包。

## 4. 查看机器列表和监控

> 注意：若接入 Sentinel 控制台不成功，可以参考 [FAQ](https://github.com/alibaba/Sentinel/wiki/FAQ#q-sentinel-%E6%8E%A7%E5%88%B6%E5%8F%B0%E6%B2%A1%E6%9C%89%E6%98%BE%E7%A4%BA%E6%88%91%E7%9A%84%E5%BA%94%E7%94%A8%E6%88%96%E8%80%85%E6%B2%A1%E6%9C%89%E7%9B%91%E6%8E%A7%E5%B1%95%E7%A4%BA%E5%A6%82%E4%BD%95%E6%8E%92%E6%9F%A5) 排查问题。

> 注意：请确保在使用较新版本的浏览器，我们不保证支持旧版本的浏览器。

### 4.1 "机器列表"中显示机器

当您在机器列表中看到您的机器，就代表着您已经成功接入控制台；如果没有看到您的机器，请检查配置，并通过 `record.log` 和 `metricStat.log.pid<Pid No>.<Date>`来排查原因，详细的部分请参考 [日志文档](https://github.com/alibaba/Sentinel/wiki/%E6%97%A5%E5%BF%97)。

![machinediscover](https://github.com/alibaba/Sentinel/wiki/image/machinediscover.png)

### 4.2 "簇点链路"中显示刚刚调用的资源

簇点链路实时的去拉取指定客户端资源的运行情况，它一共提供两种展示模式：一种用树状结构展示资源的调用链路，另外一种则不区分调用链路展示资源的运行情况。

**注意:** 簇点监控是内存态的信息，它仅展示启动后调用过的资源。

| 树状链路| 平铺链路 
| :----: | :----
|![resourceTree](https://github.com/alibaba/Sentinel/wiki/image/resourceTree.png)|![cluster](https://github.com/alibaba/Sentinel/wiki/image/sentine_dashboard.gif)

### 4.3 "实时监控"汇总资源信息

同时，同一个服务下的所有机器的簇点信息会被汇总，并且秒级地展示在"实时监控"下。

**注意:** 实时监控仅存储 5 分钟以内的数据，如果需要持久化，需要通过调用[实时监控](https://github.com/alibaba/Sentinel/wiki/%E5%AE%9E%E6%97%B6%E7%9B%91%E6%8E%A7)接口来定制。

![Dashboard](https://github.com/alibaba/Sentinel/wiki/image/dashboard.png)

> 注意：请确保 Sentinel 控制台所在的机器时间与自己应用的机器时间保持一致，否则会导致拉不到实时的监控数据。

## 5. 规则管理及推送

控制台同时提供简单的规则管理以及推送的功能。

### 5.1 规则管理

您可以在控制台通过客户端开放的 HTTP 命令来查询规则，详情请参考 [规则查询更改](https://github.com/alibaba/Sentinel/wiki/%E5%A6%82%E4%BD%95%E4%BD%BF%E7%94%A8#%E6%9F%A5%E8%AF%A2%E6%9B%B4%E6%94%B9%E8%A7%84%E5%88%99)。

![rules](https://user-images.githubusercontent.com/9434884/48189045-2ae58400-e37a-11e8-84aa-2e2c0dd042e2.png)

### 5.2 规则推送

![dashboard-add-rule](https://user-images.githubusercontent.com/9434884/48189035-25883980-e37a-11e8-8f25-3f3f5be23f0e.png)

目前控制台的规则推送也是通过 [规则查询更改](https://github.com/alibaba/Sentinel/wiki/%E5%A6%82%E4%BD%95%E4%BD%BF%E7%94%A8#%E6%9F%A5%E8%AF%A2%E6%9B%B4%E6%94%B9%E8%A7%84%E5%88%99) HTTP 命令来更改规则。这也意味着这些规则仅在内存态生效，应用重启之后，该规则会丢失。

同时我们非常鼓励您通过 [动态规则](https://github.com/alibaba/Sentinel/wiki/%E5%8A%A8%E6%80%81%E8%A7%84%E5%88%99%E6%89%A9%E5%B1%95) 并结合各种外部存储来定制自己的规则源。我们推荐通过动态配置源的控制台来进行规则写入和推送，而不是通过 Sentinel 客户端直接写入到动态配置源中。