# 快速开始

欢迎来到 Sentinel 的世界！这篇新手指南将指引您快速入门 Sentinel。

Sentinel 的使用可以分为两个部分:

- 核心库（Java 客户端）：不依赖任何框架/库，能够运行于 Java 7 及以上的版本的运行时环境，同时对 Dubbo / Spring Cloud 等框架也有较好的支持（见 [主流框架适配](./open-source-framework-integrations.md)）。
- 控制台（Dashboard）：Dashboard 主要负责管理推送规则、监控、管理机器信息等。

我们将会提供 [本地运行 demo](#本地-demo) 和 [公网 demo](#公网-demo) 来帮助新手快速入门。这两种方式都只需要您执行2到5个步骤。

## 本地Demo

### 1. 引入 Sentinel 依赖

如果您的应用使用了 Maven，则在 `pom.xml` 文件中加入以下代码即可：

```xml
<dependency>
    <groupId>com.alibaba.csp</groupId>
    <artifactId>sentinel-core</artifactId>
    <version>1.7.1</version>
</dependency>
```

如果您未使用依赖管理工具，请到 [Maven Center Repository](https://mvnrepository.com/artifact/com.alibaba.csp/sentinel-core) 直接下载 JAR 包。

### 2. 定义资源

**资源** 是 Sentinel 中的核心概念之一。最常用的资源是我们代码中的 Java 方法。
当然，您也可以更灵活的定义你的资源，例如，把需要控制流量的代码用 Sentinel API `SphU.entry("HelloWorld")` 和 `entry.exit()` 包围起来即可。在下面的例子中，我们将 `System.out.println("hello world");` 作为资源（被保护的逻辑），用 API 包装起来。参考代码如下:

```java
public static void main(String[] args) {
    // 配置规则.
    initFlowRules();

    while (true) {
        // 1.5.0 版本开始可以直接利用 try-with-resources 特性
        try (Entry entry = SphU.entry("HelloWorld")) {
            // 被保护的逻辑
            System.out.println("hello world");
	} catch (BlockException ex) {
            // 处理被流控的逻辑
	    System.out.println("blocked!");
	}
    }
}
```

完成以上两步后，代码端的改造就完成了。

您也可以通过我们提供的 [注解支持模块](./annotation-support.md)，来定义我们的资源，类似于下面的代码：

```java
@SentinelResource("HelloWorld")
public void helloWorld() {
    // 资源中的逻辑
    System.out.println("hello world");
}
```

这样，`helloWorld()` 方法就成了我们的一个资源。注意注解支持模块需要配合 Spring AOP 或者 AspectJ 一起使用。

### 3. 定义规则

接下来，通过流控规则来指定允许该资源通过的请求次数，例如下面的代码定义了资源 `HelloWorld` 每秒最多只能通过 20 个请求。

```java
private static void initFlowRules(){
    List<FlowRule> rules = new ArrayList<>();
    FlowRule rule = new FlowRule();
    rule.setResource("HelloWorld");
    rule.setGrade(RuleConstant.FLOW_GRADE_QPS);
    // Set limit QPS to 20.
    rule.setCount(20);
    rules.add(rule);
    FlowRuleManager.loadRules(rules);
}
```

完成上面 3 步，Sentinel 就能够正常工作了。更多的信息可以参考 [使用文档](./basic-api-resource-rule.md)。

### 4. 检查效果

Demo 运行之后，我们可以在日志 `~/logs/csp/${appName}-metrics.log.xxx` 里看到下面的输出:

```
|--timestamp-|------date time----|--resource-|p |block|s |e|rt
1529998904000|2018-06-26 15:41:44|hello world|20|0    |20|0|0
1529998905000|2018-06-26 15:41:45|hello world|20|5579 |20|0|728
1529998906000|2018-06-26 15:41:46|hello world|20|15698|20|0|0
1529998907000|2018-06-26 15:41:47|hello world|20|19262|20|0|0
1529998908000|2018-06-26 15:41:48|hello world|20|19502|20|0|0
1529998909000|2018-06-26 15:41:49|hello world|20|18386|20|0|0
```

其中 `p` 代表通过的请求, `block` 代表被阻止的请求, `s` 代表成功执行完成的请求个数, `e` 代表用户自定义的异常, `rt` 代表平均响应时长。

可以看到，这个程序每秒稳定输出 "hello world" 20 次，和规则中预先设定的阈值是一样的。

更详细的说明可以参考: [如何使用](./basic-api-resource-rule.md)

更多的例子可以参考: [Sentinel Demo 集锦](https://github.com/alibaba/Sentinel/tree/master/sentinel-demo)

### 5. 启动 Sentinel 控制台

Sentinel 开源控制台支持实时监控和规则管理。接入控制台的步骤如下：

（1）下载控制台 jar 包并在本地启动：可以参见 [此处文档](./dashboard.md)。

（2）客户端接入控制台，需要：

- 客户端需要引入 Transport 模块来与 Sentinel 控制台进行通信。您可以通过 `pom.xml` 引入 JAR 包:

```xml
<dependency>
    <groupId>com.alibaba.csp</groupId>
    <artifactId>sentinel-transport-simple-http</artifactId>
    <version>1.7.0</version>
</dependency>
```

- 启动时加入 JVM 参数 `-Dcsp.sentinel.dashboard.server=consoleIp:port` 指定控制台地址和端口。更多的参数参见 [启动参数文档](./startup-configuration.md)。
- 确保应用端有访问量

完成以上步骤后即可在 Sentinel 控制台上看到对应的应用，机器列表页面可以看到对应的机器：

![machine-discovery](https://user-images.githubusercontent.com/9434884/50627838-5cd92800-0f70-11e9-891e-31430adcbbf4.png)

详细介绍和使用文档可参考：[Sentinel 控制台文档](./dashboard.md)。

## 公网 Demo

若您不希望在本地另启动控制台，可以在本地运行公网 Demo，接入云上版本的 [AHAS Sentinel 控制台](https://github.com/alibaba/Sentinel/wiki/AHAS-Sentinel-控制台)。这个 Demo 主要是给开发者一个最快最直观的感受，能够最快地感受到：

1. Sentinel 多样化的限流手段
2. 如何所见即所得的配置规则
3. 如何有效地使用 Sentinel 的监控数据
4. 如何通过机器上报来管理机器

> 注意：若要使用阿里云 AHAS Sentinel 控制台，您需要用自己的阿里云账号登录。由于安全策略原因我们无法提供公共账号。运行了这个 Demo 之后，这个 Demo 将会向 AHAS Sentinel 控制台上报基本的机器信息；同时 AHAS Sentinel 控制台也将会根据上报的信息，通过 Sentinel Transport API 拉取簇点监控信息。如果用户不想要运行这个 Demo，停止即可。Demo 的所有的源码都开放可以下载。

### 1. 下载 Demo jar

您可以 [点击此处下载 Sentinel 公网 Demo jar 包](https://ahasoss-cn-hangzhou.oss-cn-hangzhou.aliyuncs.com/sdk/latest/ahas-sentinel-sdk-demo.jar)。

此 Demo Jar 主要包含的内容有:

1. [本地 demo 客户端](#本地Demo) 中已有的 `sentinel-core`；
2. 接入 AHAS Sentinel 控制台所需的通信模块 `ahas-sentinel-client`，用于向控制台上报心跳信息。心跳信息、规则和监控均存于您个人的账号下，其它人均无法访问。
3. 一个简单的 main 函数，程序类似于：

```java
public static void main(String[] args) {
    // 不断进行资源调用.
    while (true) {
        Entry entry = null;
        try {
	        entry = SphU.entry("HelloWorld");
            // 资源中的逻辑.
            System.out.println("hello world");
        } catch (BlockException ex) {
            System.err.println("blocked!");
        } finally {
            if (entry != null) {
                entry.exit();
            }
        }
    }
}
```

若您之前接入了开源 Sentinel 控制台，您也可以简单的通过替换 pom 包中的 `sentinel-transport-simple-http` 模块为 `ahas-sentinel-client` 模块达到同样的目的。

### 2. 开通 AHAS 流控降级并获取启动参数

接下来您需要到 [阿里云控制台](https://ahas.console.aliyun.com/) 开通 AHAS 功能。可以根据 [开通 AHAS 文档](https://help.aliyun.com/document_detail/90323.html) 和 [流控降级 Demo 快速入门](https://help.aliyun.com/document_detail/101410.html) 里面的指引进行开通。

> **注意**：本地运行接入 AHAS Sentinel 控制台需要在页面左上角选择 **公网** 环境。

开通后您可以点击左侧侧边栏的 **流控降级**，进入 Sentinel 控制台应用总览页面。在页面右上角，单击添加应用，选择 SDK 接入页签，到 **配置启动参数** 页签拿到需要的启动参数（详情请参考 [SDK 接入文档](https://help.aliyun.com/document_detail/101088.html)），类似于：

```bash
-Dproject.name=AppName -Dahas.license=<License>
```

其中 `project.name` 配置项代表应用名（会显示在控制台），`ahas.license` 配置项代表自己的授权 license（注意保密）。

### 3. 启动 demo

接下来我们就可以在本地启动 demo 了，启动应用时需要加上拿到的启动参数：

```bash
java -Dproject.name=<AppName> -Dahas.license=<License> -jar ahas-sentinel-sdk-demo.jar
```

当应用开始运行后一段时间，我们刷新一下控制台页面，就可以在 AHAS Sentinel 控制台上看到我们的应用了：

![image](https://user-images.githubusercontent.com/9434884/50626822-72981e80-0f6b-11e9-858b-f34cc1565f93.png)

点击应用卡片，进入详情页面后点击左侧侧边栏的“机器列表”。我们可以在机器列表页面看到刚刚接入的机器，代表接入成功：

![image](https://user-images.githubusercontent.com/9434884/50626928-036efa00-0f6c-11e9-9dd8-3291654a8902.png)

我们可以在监控详情页面查看聚合监控和历史监控图线：

![image](https://user-images.githubusercontent.com/9434884/50626939-18e42400-0f6c-11e9-92b8-9387b676a3f5.png)

AHAS Sentinel 控制台提供了一个我们推荐的推送规则的做法，即 **配置中心控制台/Sentinel 控制台 → 配置中心 → Sentinel 数据源 → Sentinel**，这样的流程就非常清晰了：

![Remote push rules to config center](https://user-images.githubusercontent.com/9434884/53381986-a0b73f00-39ad-11e9-90cf-b49158ae4b6f.png)

详细介绍和使用文档可参考：[AHAS Sentinel 控制台文档](https://github.com/alibaba/Sentinel/wiki/AHAS-Sentinel-%E6%8E%A7%E5%88%B6%E5%8F%B0)。