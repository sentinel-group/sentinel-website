# Quick Start

Below is a simple demo that guides new users to use Sentinel in just 3 steps. It also shows how to monitor this demo using the dashboard.

## 1. Add Dependency

**Note:** Sentinel requires Java 7 or later.

If your application is build in maven, just add the following code in pom.xml.

```xml
<dependency>
    <groupId>com.alibaba.csp</groupId>
    <artifactId>sentinel-core</artifactId>
    <version>x.y.z</version>
</dependency>
```

If not, you can download JAR in [Maven Center Repository](https://mvnrepository.com/artifact/com.alibaba.csp/sentinel-core).

## 2. Define Resource

Wrap code snippet via Sentinel API: `SphU.entry("resourceName")` and `entry.exit()`. In below example, it is `System.out.println("hello world");`:

```java
Entry entry = null;

try {   
  entry = SphU.entry("HelloWorld");
  
  // BIZ logic being protected
  System.out.println("hello world");
} catch (BlockException e) {
  // handle block logic
} finally {
  // make sure that the exit() logic is called
  if (entry != null) {
    entry.exit();
  }
}
```

So far the code modification is done. We also provide [annotation support module](https://github.com/alibaba/Sentinel/blob/master/sentinel-extension/sentinel-annotation-aspectj/README.md) to define resource easier.

## 3. Define Rules

If we want to limit the access times of the resource, we can define rules. The following code defines a rule that limits access to the reource to 20 times per second at the maximum. 

```java
List<FlowRule> rules = new ArrayList<FlowRule>();
FlowRule rule = new FlowRule();
rule.setResource("HelloWorld");
// set limit qps to 20
rule.setCount(20);
rule.setGrade(RuleConstant.FLOW_GRADE_QPS);
rules.add(rule);
FlowRuleManager.loadRules(rules);
```

For more information, please refer to [How To Use](./basic-api-resource-rule.md).

## 4. Check the Result

After running the demo for a while, you can see the following records in `~/logs/csp/${appName}-metrics.log`.

```
|--timestamp-|------date time----|--resource-|p |block|s |e|rt
1529998904000|2018-06-26 15:41:44|hello world|20|0    |20|0|0
1529998905000|2018-06-26 15:41:45|hello world|20|5579 |20|0|728
1529998906000|2018-06-26 15:41:46|hello world|20|15698|20|0|0
1529998907000|2018-06-26 15:41:47|hello world|20|19262|20|0|0
1529998908000|2018-06-26 15:41:48|hello world|20|19502|20|0|0
1529998909000|2018-06-26 15:41:49|hello world|20|18386|20|0|0

p stands for incoming request, block for blocked by rules, success for success handled by Sentinel, e for exception count, rt for average response time (ms)
```
This shows that the demo can print "hello world" 20 times per second.

More examples and information can be found in the [How To Use](./basic-api-resource-rule.md) section.

Samples can be found in the [sentinel-demo](https://github.com/alibaba/Sentinel/tree/master/sentinel-demo) module.

## 5. Start Dashboard

Sentinel also provides a simple dashboard application, on which you can monitor the clients and configure the rules in real time.

For details please refer to [Sentinel dashboard document](./dashboard.md).

## Trouble Shooting and Logs

Sentinel will generate logs for troubleshooting. All the information can be found in [Sentinel logs](./logs.md).