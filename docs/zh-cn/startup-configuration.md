# 启动配置项

Sentinel 配置项允许在启动程序的时候设置相关参数。

# 配置方式

上述参数所有均可通过 JVM -D 参数指定。除 `project.name` 之外，其余参数还可通过 properties 文件指定，路径为 `${user_home}/logs/csp/${project.name}.properties`。

优先级顺序：JVM -D 参数的优先级最高，若 properties 和 JVM 参数中有相同项的配置，以 JVM -D 参数配置的为准。

> 注：若您正在使用 [Spring Cloud Alibaba](https://github.com/spring-cloud-incubator/spring-cloud-alibaba)，则可以通过 Spring 配置文件来进行配置，示例可见[此处](https://github.com/spring-cloud-incubator/spring-cloud-alibaba/blob/master/spring-cloud-alibaba-examples/sentinel-example/sentinel-core-example/readme-zh.md)。

# 参数列表

## sentinel-core 的配置项

|名称|含义|类型|默认值|是否必需|
|--------|--------|--------|--------|--------|
|`project.name`|指定程序的名称|`String`|`null`|否|
|`csp.sentinel.metric.file.single.size`|单个监控文件的大小|`long`|52428800|否|
|`csp.sentinel.metric.file.total.count`|监控文件的总数上限|`int`|6|否|
|`csp.sentinel.log.dir`| Sentinel 日志文件目录|`String`|`${user.home}/logs/csp/`| 否 |
|`csp.sentinel.log.use.pid`|日志文件名中是否加入进程号，用于单机部署多个 Sentinel 客户端的情况|`boolean`|`false`|否|

> 注：`project.name` 项用于指定应用名（appName）。若未指定，则默认从 `sun.java.command` 中解析出对应的类名作为应用名。实际项目使用中建议指定应用名。

## sentinel-transport-common 的配置项

|名称|含义|类型|默认值|是否必需|
|--------|--------|--------|--------|--------|
|`csp.sentinel.dashboard.server`|控制台的地址，指定控制台后客户端会自动向该地址发送心跳包。地址格式为：`hostIp:port`|`String`|`null`|是|
|`csp.sentinel.heartbeat.interval.ms`|心跳包发送周期，单位毫秒|`long`|`null`| 非必需，若不进行配置，则会从相应的 `HeartbeatSender` 中提取默认值 |
|`csp.sentinel.api.port`|本地启动 HTTP API Server 的端口号|`int`|`null`|是，且不可冲突|