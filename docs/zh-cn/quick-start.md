# 快速开始

下面的例子将展示应用如何三步接入 Sentinel。同时，Sentinel 也提供一个所见即所得的控制台，可以实时监控资源以及管理规则。

## 在应用中引入 Sentinel

**注意:** Sentinel 仅支持 Java 7 或者以上版本。

如果应用使用 pom 工程，则在 `pom.xml` 文件中加入以下代码即可：

```xml
<dependency>
    <groupId>com.alibaba.csp</groupId>
    <artifactId>sentinel-core</artifactId>
    <version>x.y.z</version>
</dependency>
```

如果您未使用依赖管理工具，请到 [Maven Center Repository](https://mvnrepository.com/artifact/com.alibaba.csp/sentinel-core) 直接下载 JAR 包。

## 定义资源

接下来，把需要控制流量的代码用 Sentinel API `SphU.entry("HelloWorld")` 和 `entry.exit()` 包围起来即可。在下面的例子中，我们将 `System.out.println("hello wolrd");` 作为资源，用 API 包围起来。参考代码如下:

```java
public static void main(String[] args) {
    initFlowRules();
    while (true) {
        Entry entry = null;
        try {
	    entry = SphU.entry("HelloWorld");
            System.out.println("hello world");
	} catch (BlockException e1) {
	    System.out.println("block!");
	} finally {
	   if (entry != null) {
	       entry.exit();
	   }
	}
    }
}
```

完成以上两步后，代码端的改造就完成了。当然，我们也提供了[注解支持模块](./annotation-support.md)，可以以低侵入性的方式定义资源。

## 定义规则

接下来，通过规则来指定允许该资源通过的请求次数，例如下面的代码定义了资源 `HelloWorld` 每秒最多只能通过 20 个请求。

```java
private static void initFlowRules(){
    List<FlowRule> rules = new ArrayList<FlowRule>();
    FlowRule rule = new FlowRule();
    rule.setResource("HelloWorld");
    rule.setGrade(RuleConstant.FLOW_GRADE_QPS);
    // Set limit QPS to 20.
    rule.setCount(20);
    rules.add(rule);
    FlowRuleManager.loadRules(rules);
}
```

完成上面 3 步，Sentinel 就能够正常工作了。

## 检查效果

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

其中 `p` 代表通过的请求, `block` 代表被阻止的请求, `s` 代表成功通过 Sentinel 的请求个数, `e` 代表用户自定义的异常, `rt` 代表平均响应时长。

可以看到，这个程序每秒稳定输出 "hello world" 20 次，和规则中预先设定的阈值是一样的。

更详细的说明可以参考 [基本使用文档](./basic-api-resource-rule.md)；更多的例子可以参考 [demo 集合](https://github.com/alibaba/Sentinel/tree/master/sentinel-demo)。

## 启动 Sentinel 控制台

Sentinel 同时提供控制台，可以实时监控各个资源的运行情况，并且可以实时地修改规则。更多的信息请参考 [控制台文档](./dashboard.md)。