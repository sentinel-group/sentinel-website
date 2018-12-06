# 动态规则扩展

## 规则

Sentinel 的理念是开发者只需要关注资源的定义，当资源定义成功后可以动态增加各种流控降级规则。Sentinel 提供两种方式修改规则：

- 通过 API 直接修改 (`loadRules`)
- 通过 `DataSource` 适配不同数据源修改

通过 API 修改比较直观，可以通过以下几个 API 修改不同的规则：

```Java
FlowRuleManager.loadRules(List<FlowRule> rules); // 修改流控规则
DegradeRuleManager.loadRules(List<DegradeRule> rules); // 修改降级规则
SystemRuleManager.loadRules(List<SystemRule> rules); // 修改系统规则
AuthorityRuleManager.loadRules(List<AuthorityRule> rules); // 修改授权规则
```

## DataSource 扩展

上述 `loadRules()` 方法只接受内存态的规则对象，但更多时候规则存储在文件、数据库或者配置中心当中。`DataSource` 接口给我们提供了对接任意配置源的能力。相比直接通过 API 修改规则，实现 `DataSource` 接口是更加可靠的做法。

我们推荐**通过控制台设置规则后将规则推送到统一的规则中心，客户端实现** `ReadableDataSource` **接口端监听规则中心实时获取变更**，流程如下：

![push-rules-from-dashboard-to-config-center](https://user-images.githubusercontent.com/9434884/45406233-645e8380-b698-11e8-8199-0c917403238f.png)

`DataSource` 扩展常见的实现方式有:

- **拉模式**：客户端主动向某个规则管理中心定期轮询拉取规则，这个规则中心可以是 RDBMS、文件，甚至是 VCS 等。这样做的方式是简单，缺点是无法及时获取变更；
- **推模式**：规则中心统一推送，客户端通过注册监听器的方式时刻监听变化，比如使用 [Nacos](https://github.com/alibaba/nacos)、Zookeeper 等配置中心。这种方式有更好的实时性和一致性保证。

### 拉模式拓展

实现拉模式的数据源最简单的方式是继承 [`AutoRefreshDataSource`](https://github.com/alibaba/Sentinel/blob/master/sentinel-extension/sentinel-datasource-extension/src/main/java/com/alibaba/csp/sentinel/datasource/AutoRefreshDataSource.java) 抽象类，然后实现 `readSource()` 方法，在该方法里从指定数据源读取字符串格式的配置数据。比如 [基于文件的数据源](https://github.com/alibaba/Sentinel/blob/master/sentinel-demo/sentinel-demo-dynamic-file-rule/src/main/java/com/alibaba/csp/sentinel/demo/file/rule/FileDataSourceDemo.java)。

### 推模式拓展

实现推模式的数据源最简单的方式是继承 [`AbstractDataSource`](https://github.com/alibaba/Sentinel/blob/master/sentinel-extension/sentinel-datasource-extension/src/main/java/com/alibaba/csp/sentinel/datasource/AbstractDataSource.java) 抽象类，在其构造方法中添加监听器，并实现 `readSource()` 从指定数据源读取字符串格式的配置数据。比如 [基于 Nacos 的数据源](https://github.com/alibaba/Sentinel/blob/master/sentinel-extension/sentinel-datasource-nacos/src/main/java/com/alibaba/csp/sentinel/datasource/nacos/NacosDataSource.java)。

### 注册数据源

通常需要调用以下方法将数据源注册至指定的规则管理器中：

```java
ReadableDataSource<String, List<FlowRule>> flowRuleDataSource = new NacosDataSource<>(remoteAddress, groupId, dataId, parser);
FlowRuleManager.register2Property(flowRuleDataSource.getProperty());
```

若不希望手动注册数据源，可以借助 Sentinel 的 `InitFunc` SPI 扩展接口。只需要实现自己的 `InitFunc` 接口，在 `init` 方法中编写注册数据源的逻辑。比如：

```java
package com.test.init;

public class DataSourceInitFunc implements InitFunc {

    @Override
    public void init() throws Exception {
        final String remoteAddress = "localhost";
        final String groupId = "Sentinel:Demo";
        final String dataId = "com.alibaba.csp.sentinel.demo.flow.rule";

        ReadableDataSource<String, List<FlowRule>> flowRuleDataSource = new NacosDataSource<>(remoteAddress, groupId, dataId,
            source -> JSON.parseObject(source, new TypeReference<List<FlowRule>>() {}));
        FlowRuleManager.register2Property(flowRuleDataSource.getProperty());
    }
}
```

接着将对应的类名添加到位于资源目录（通常是 `resource` 目录）下的 `META-INF/services` 目录下的 `com.alibaba.csp.sentinel.init.InitFunc` 文件中，比如：

```
com.test.init.DataSourceInitFunc
```

这样，当初次访问任意资源的时候，Sentinel 就可以自动去注册对应的数据源了。

## 示例

###  API 模式：使用客户端规则 API 配置规则

[Sentinel Dashboard](https://github.com/alibaba/Sentinel/tree/master/sentinel-dashboard) 通过客户端自带的[规则 API](https://github.com/alibaba/Sentinel/wiki/%E5%A6%82%E4%BD%95%E4%BD%BF%E7%94%A8#%E6%9F%A5%E8%AF%A2%E6%9B%B4%E6%94%B9%E8%A7%84%E5%88%99)来实时查询和更改内存中的规则。

注意: 要使客户端具备规则 API，需在客户端引入以下依赖：

```xml
<dependency>
    <groupId>com.alibaba.csp</groupId>
    <artifactId>sentienl-http-simple-transport</artifactId>
    <version>x.y.z</version>
</dependency>
```

### 拉模式：使用文件配置规则

[这个示例](https://github.com/alibaba/Sentinel/blob/master/sentinel-demo/sentinel-demo-dynamic-file-rule/src/main/java/com/alibaba/csp/sentinel/demo/file/rule/FileDataSourceDemo.java)展示 Sentinel 是如何从文件获取规则信息的。[`FileRefreshableDataSource`](https://github.com/alibaba/Sentinel/blob/master/sentinel-extension/sentinel-datasource-extension/src/main/java/com/alibaba/csp/sentinel/datasource/FileRefreshableDataSource.java) 会周期性的读取文件以获取规则，当文件有更新时会及时发现，并将规则更新到内存中。使用时只需添加以下依赖：

```xml
<dependency>
    <groupId>com.alibaba.csp</groupId>
    <artifactId>sentinel-datasource-extension</artifactId>
    <version>x.y.z</version>
</dependency>
```

### 推模式：使用 Nacos 配置规则

[Nacos](https://github.com/alibaba/Nacos) 是阿里中间件团队开源的服务发现和动态配置中心。Sentinel 针对 Nacos 作了适配，底层可以采用 Nacos 作为规则配置数据源。使用时只需添加以下依赖：

```xml
<dependency>
    <groupId>com.alibaba.csp</groupId>
    <artifactId>sentinel-datasource-nacos</artifactId>
    <version>x.y.z</version>
</dependency>
```

然后创建 `NacosDataSource` 并将其注册至对应的 RuleManager 上即可。比如：

```java
// remoteAddress 代表 Nacos 服务端的地址
// groupId 和 dataId 对应 Nacos 中相应配置
ReadableDataSource<String, List<FlowRule>> flowRuleDataSource = new NacosDataSource<>(remoteAddress, groupId, dataId,
    source -> JSON.parseObject(source, new TypeReference<List<FlowRule>>() {}));
FlowRuleManager.register2Property(flowRuleDataSource.getProperty());
```

详细示例可以参见 [sentinel-demo-nacos-datasource](https://github.com/alibaba/Sentinel/tree/master/sentinel-demo/sentinel-demo-nacos-datasource)。

### 推模式：使用 ZooKeeper 配置规则

Sentinel 针对 ZooKeeper 作了相应适配，底层可以采用 ZooKeeper 作为规则配置数据源。使用时只需添加以下依赖：

```xml
<dependency>
    <groupId>com.alibaba.csp</groupId>
    <artifactId>sentinel-datasource-zookeeper</artifactId>
    <version>x.y.z</version>
</dependency>
```

然后创建 `ZookeeperDataSource` 并将其注册至对应的 RuleManager 上即可。比如：

```java
// remoteAddress 代表 ZooKeeper 服务端的地址
// path 对应 ZK 中的数据路径
ReadableDataSource<String, List<FlowRule>> flowRuleDataSource = new ZookeeperDataSource<>(remoteAddress, path, source -> JSON.parseObject(source, new TypeReference<List<FlowRule>>() {}));
FlowRuleManager.register2Property(flowRuleDataSource.getProperty());
```

详细示例可以参见 [sentinel-demo-zookeeper-datasource](https://github.com/alibaba/Sentinel/tree/master/sentinel-demo/sentinel-demo-zookeeper-datasource)。

### 推模式：使用 Apollo 配置规则

Sentinel 针对 [Apollo](https://github.com/ctripcorp/apollo) 作了相应适配，底层可以采用 Apollo 作为规则配置数据源。使用时只需添加以下依赖：

```xml
<dependency>
    <groupId>com.alibaba.csp</groupId>
    <artifactId>sentinel-datasource-apollo</artifactId>
    <version>x.y.z</version>
</dependency>
```

然后创建 `ApolloDataSource` 并将其注册至对应的 RuleManager 上即可。比如：

```java
// namespaceName 对应 Apollo 的命名空间名称
// ruleKey 对应规则存储的 key
// defaultRules 对应连接不上 Apollo 时的默认规则
ReadableDataSource<String, List<FlowRule>> flowRuleDataSource = new ApolloDataSource<>(namespaceName, ruleKey, defaultRules, source -> JSON.parseObject(source, new TypeReference<List<FlowRule>>() {}));
FlowRuleManager.register2Property(flowRuleDataSource.getProperty());
```

详细示例可以参见 [sentinel-demo-apollo-datasource](https://github.com/alibaba/Sentinel/tree/master/sentinel-demo/sentinel-demo-apollo-datasource)。