# Sentinel 控制台

## 1. 概述

Sentinel 提供一个轻量级的开源控制台，它提供机器发现以及健康情况管理、监控（单机和集群），规则管理和推送的功能。这里，我们将会详细讲述如何通过简单的步骤就可以使用这些功能。

接下来，我们将会逐一介绍如何整合 Sentinel 核心库和 Dashboard，让它发挥最大的作用。同时我们也在阿里云上提供企业级的 Sentinel 服务：[AHAS Sentinel 控制台](https://github.com/alibaba/Sentinel/wiki/AHAS-Sentinel-%E6%8E%A7%E5%88%B6%E5%8F%B0)，您只需要几个简单的步骤，就能最直观地看到控制台如何实现这些功能，并体验多样化的监控及全自动托管的集群流控能力。

Sentinel 控制台包含如下功能:

- **查看机器列表以及健康情况**：收集 Sentinel 客户端发送的心跳包，用于判断机器是否在线。
- **监控 (单机和集群聚合)**：通过 Sentinel 客户端暴露的监控 API，定期拉取并且聚合应用监控信息，最终可以实现秒级的实时监控。
- **规则管理和推送**：统一管理推送规则。
- **鉴权**：生产环境中鉴权非常重要。这里每个开发者需要根据自己的实际情况进行定制。

> 注意：Sentinel 控制台目前仅支持单机部署。Sentinel 控制台项目提供 Sentinel 功能全集示例，不作为开箱即用的生产环境控制台，若希望在生产环境使用请根据[文档](https://github.com/alibaba/Sentinel/wiki/在生产环境中使用-Sentinel)自行进行定制和改造。

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

从 Sentinel 1.6.0 起，Sentinel 控制台引入基本的**登录**功能，默认用户名和密码都是 `sentinel`。可以参考 [鉴权模块文档](#鉴权) 配置用户名和密码。

> 注：若您的应用为 Spring Boot 或 Spring Cloud 应用，您可以通过 Spring 配置文件来指定配置，详情请参考 [Spring Cloud Alibaba Sentinel 文档](https://github.com/spring-cloud-incubator/spring-cloud-alibaba/wiki/Sentinel)。

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

除了修改 JVM 参数，也可以通过配置文件取得同样的效果。更详细的信息可以参考 [启动配置项](./startup-configuration.md)。

### 3.3 触发客户端初始化

**确保客户端有访问量**，Sentinel 会在**客户端首次调用的时候**进行初始化，开始向控制台发送心跳包。

> 注意：您还需要根据您的应用类型和接入方式引入对应的 [适配依赖](./open-source-framework-integrations.md)，否则即使有访问量也不能被 Sentinel 统计。

## 4. 查看机器列表以及健康情况

当您在机器列表中看到您的机器，就代表着您已经成功接入控制台；如果没有看到您的机器，请检查配置，并通过 `${user.home}/logs/csp/sentinel-record.log.xxx` 日志来排查原因，详细的部分请参考 [日志文档](./logs.md)。

![machine-discovery](https://user-images.githubusercontent.com/9434884/50627838-5cd92800-0f70-11e9-891e-31430adcbbf4.png)

> 注意：若接入 Sentinel 控制台不成功，可以参考 [FAQ](https://github.com/alibaba/Sentinel/wiki/FAQ#q-sentinel-%E6%8E%A7%E5%88%B6%E5%8F%B0%E6%B2%A1%E6%9C%89%E6%98%BE%E7%A4%BA%E6%88%91%E7%9A%84%E5%BA%94%E7%94%A8%E6%88%96%E8%80%85%E6%B2%A1%E6%9C%89%E7%9B%91%E6%8E%A7%E5%B1%95%E7%A4%BA%E5%A6%82%E4%BD%95%E6%8E%92%E6%9F%A5) 排查问题。

> 注意：请确保在使用较新版本的浏览器，我们不保证支持旧版本的浏览器。

## 5. 监控

### 5.1 "簇点链路"中显示刚刚调用的资源（单机实时）

簇点链路（单机调用链路）页面实时的去拉取指定客户端资源的运行情况。它一共提供两种展示模式：一种用树状结构展示资源的调用链路，另外一种则不区分调用链路展示资源的运行情况。

**注意:** 簇点监控是内存态的信息，它仅展示启动后调用过的资源。

| 树状链路| 平铺链路 |
| ---- | ---- |
|![resourceTree](https://github.com/alibaba/Sentinel/wiki/image/resourceTree.png)|![cluster](https://github.com/alibaba/Sentinel/wiki/image/sentine_dashboard.gif) |

### 5.2 "实时监控"汇总资源信息（集群聚合）

同时，同一个服务下的所有机器的簇点信息会被汇总，并且秒级地展示在"实时监控"下。

**注意:** 实时监控仅存储 5 分钟以内的数据，如果需要持久化，需要通过调用[实时监控接口](./metric.md)来定制。

![dashboard-overview](https://user-images.githubusercontent.com/9434884/50678855-aa6e9700-103b-11e9-83de-2a33e580325f.png)

> 注意：请确保 Sentinel 控制台所在的机器时间与自己应用的机器时间保持一致，否则会导致拉不到实时的监控数据。

## 6. 规则管理及推送

Sentinel 控制台同时提供简单的规则管理以及推送的功能。规则推送分为 3 种模式，包括 "原始模式"、"Pull 模式" 和"Push 模式"。

这里先简单的介绍"原始模式"。

### 6.1 规则管理

您可以在控制台通过接入端暴露的 [HTTP API](https://github.com/alibaba/Sentinel/wiki/%E5%A6%82%E4%BD%95%E4%BD%BF%E7%94%A8#%E6%9F%A5%E8%AF%A2%E6%9B%B4%E6%94%B9%E8%A7%84%E5%88%99) 来查询规则。

![rules](https://user-images.githubusercontent.com/9434884/48189045-2ae58400-e37a-11e8-84aa-2e2c0dd042e2.png)

### 6.2 规则推送

![dashboard-add-rule](https://user-images.githubusercontent.com/9434884/48189035-25883980-e37a-11e8-8f25-3f3f5be23f0e.png)

目前控制台的规则推送也是通过 [规则查询更改 HTTP API](https://github.com/alibaba/Sentinel/wiki/%E5%A6%82%E4%BD%95%E4%BD%BF%E7%94%A8#%E6%9F%A5%E8%AF%A2%E6%9B%B4%E6%94%B9%E8%A7%84%E5%88%99) 来更改规则。这也意味着这些规则**仅在内存态生效**，应用重启之后，该规则会丢失。

以上是原始模式。当了解了原始模式之后，我们非常鼓励您通过 [动态规则](https://github.com/alibaba/Sentinel/wiki/%E5%8A%A8%E6%80%81%E8%A7%84%E5%88%99%E6%89%A9%E5%B1%95) 并结合各种外部存储来定制自己的规则源。我们推荐通过动态配置源的控制台来进行规则写入和推送，而不是通过 Sentinel 客户端直接写入到动态配置源中。在生产环境中，我们推荐 **push 模式**，具体可以参考：[在生产环境使用 Sentinel](https://github.com/alibaba/Sentinel/wiki/%E5%9C%A8%E7%94%9F%E4%BA%A7%E7%8E%AF%E5%A2%83%E4%B8%AD%E4%BD%BF%E7%94%A8-Sentinel)。

> **注：若要使用集群流控功能，则必须对接动态规则源，否则无法正常使用。您也可以接入 [AHAS Sentinel](https://help.aliyun.com/document_detail/174871.html) 快速接入全自动托管、高可用的集群流控能力。**

Sentinel 同时还提供应用维度规则推送的示例页面（流控规则页面，前端路由为 `/v2/flow`），用户改造控制台对接配置中心后可直接通过 v2 页面推送规则至配置中心。Sentinel 抽取了通用接口用于向远程配置中心推送规则以及拉取规则：

- `DynamicRuleProvider<T>`: 拉取规则（应用维度）
- `DynamicRulePublisher<T>`: 推送规则（应用维度）

用户只需实现 `DynamicRuleProvider` 和 `DynamicRulePublisher` 接口，并在 v2 的 controller 中通过 `@Qualifier` 注解替换相应的 bean 即可实现应用维度推送。我们提供了 Nacos 和 Apollo 的示例，改造详情可参考 [应用维度规则推送示例](https://github.com/alibaba/Sentinel/wiki/Sentinel-%E6%8E%A7%E5%88%B6%E5%8F%B0%EF%BC%88%E9%9B%86%E7%BE%A4%E6%B5%81%E6%8E%A7%E7%AE%A1%E7%90%86%EF%BC%89#%E8%A7%84%E5%88%99%E9%85%8D%E7%BD%AE)。

## 鉴权

从 Sentinel 1.5.0 开始，控制台提供通用的鉴权接口 [AuthService](https://github.com/alibaba/Sentinel/blob/master/sentinel-dashboard/src/main/java/com/alibaba/csp/sentinel/dashboard/auth/AuthService.java)，用户可根据需求自行实现。

从 Sentinel 1.6.0 起，Sentinel 控制台引入基本的**登录**功能，默认用户名和密码都是 `sentinel`。

![login-page](https://user-images.githubusercontent.com/9434884/56669344-94b4d880-66e3-11e9-9553-731d67651a11.png)

用户可以通过如下参数进行配置：

- `-Dsentinel.dashboard.auth.username=sentinel` 用于指定控制台的登录用户名为 `sentinel`；
- `-Dsentinel.dashboard.auth.password=123456` 用于指定控制台的登录密码为 `123456`；如果省略这两个参数，默认用户和密码均为 `sentinel`；
- `-Dserver.servlet.session.timeout=7200` 用于指定 Spring Boot 服务端 session 的过期时间，如 `7200` 表示 7200 秒；`60m` 表示 60 分钟，默认为 30 分钟；

同样也可以直接在 Spring properties 文件中进行配置。

## 控制台配置项

控制台的一些特性可以通过配置项来进行配置，配置项主要有两个来源：`System.getProperty()` 和 `System.getenv()`，同时存在时后者可以覆盖前者。

> 通过环境变量进行配置时，因为不支持 `.` 所以需要将其更换为 `_`。

| 配置项 | 类型 | 默认值 | 最小值 | 描述 |
| --- | --- | --- | --- | --- |
auth.enabled | boolean | true | - | 是否开启登录鉴权，仅用于日常测试，生产上不建议关闭 |
sentinel.dashboard.auth.username | String | sentinel | - | 登录控制台的用户名，默认为 `sentinel` |
sentinel.dashboard.auth.password | String | sentinel | - | 登录控制台的密码，默认为 `sentinel` |
sentinel.dashboard.app.hideAppNoMachineMillis | Integer | 0 | 60000 | 是否隐藏无健康节点的应用，距离最近一次主机心跳时间的毫秒数，默认关闭 |
sentinel.dashboard.removeAppNoMachineMillis | Integer | 0 | 120000 | 是否自动删除无健康节点的应用，距离最近一次其下节点的心跳时间毫秒数，默认关闭 |
sentinel.dashboard.unhealthyMachineMillis | Integer | 60000 | 30000 | 主机失联判定，不可关闭 |
sentinel.dashboard.autoRemoveMachineMillis | Integer | 0 | 300000 | 距离最近心跳时间超过指定时间是否自动删除失联节点，默认关闭 |
sentinel.dashboard.unhealthyMachineMillis | Integer | 60000 | 30000 | 主机失联判定，不可关闭 |
server.servlet.session.cookie.name | String | sentinel_dashboard_cookie | - | 控制台应用的 cookie 名称，可单独设置避免同一域名下 cookie 名冲突 |

配置示例：

- 命令行方式：

```shell
java -Dsentinel.dashboard.app.hideAppNoMachineMillis=60000
```

- Java 方式：

```java
System.setProperty("sentinel.dashboard.app.hideAppNoMachineMillis", "60000");
```

- 环境变量方式：

```shell
sentinel_dashboard_app_hideAppNoMachineMillis=60000
```