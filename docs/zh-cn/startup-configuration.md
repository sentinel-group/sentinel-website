# 启动配置项

## 配置方式

Sentinel 提供如下的配置方式：

- JVM -D 参数方式
- properties 文件方式（1.7.0 版本开始支持）

其中，`project.name` 参数只能通过 JVM -D 参数方式配置，其它参数支持所有的配置方式。

**优先级顺序**：JVM -D 参数的优先级最高。若 properties 和 JVM 参数中有相同项的配置，以 JVM 参数配置的为准。

用户可以通过 `-Dcsp.sentinel.config.file` 参数配置 properties 文件的路径，支持 classpath 路径配置（如 `classpath:sentinel.properties`）。默认 Sentinel 会尝试从 `classpath:sentinel.properties` 文件读取配置，读取编码默认为 UTF-8。

> 注：1.7.0 以下版本可以通过 `${user_home}/logs/csp/${project.name}.properties` 配置文件进行配置（除 `project.name` 和日志相关配置项）。

> 注：若您的应用为 Spring Boot 或 Spring Cloud 应用，您可以使用 [Spring Cloud Alibaba](https://github.com/alibaba/spring-cloud-alibaba)，通过 Spring 配置文件来指定配置，详情请参考 [Spring Cloud Alibaba Sentinel 文档](https://github.com/alibaba/spring-cloud-alibaba/wiki/Sentinel)。

## 配置项列表

### sentinel-core 的配置项

#### 基础配置项

|名称|含义|类型|默认值|是否必需| 备注 |
|--------|--------|--------|--------|--------|--------|
| `project.name` | 指定应用的名称 | `String` | `null` | 否 | |
| `csp.sentinel.app.type` | 指定应用的类型 | `int` | 0 (`APP_TYPE_COMMON`) | 否 | 1.6.0 引入 |
| `csp.sentinel.metric.file.single.size` |单个监控日志文件的大小|`long`|52428800 (50MB)|否| |
| `csp.sentinel.metric.file.total.count` |监控日志文件的总数上限|`int`|6|否| |
| `csp.sentinel.statistic.max.rt`| 最大的有效响应时长（ms），超出此值则按照此值记录 | `int` | 4900 |否| 1.4.1 引入 |
| `csp.sentinel.spi.classloader`| SPI 加载时使用的 ClassLoader，默认为给定类的 ClassLoader | `String` | `default` |否| 若配置 `context` 则使用 thread context ClassLoader。1.7.0 引入 |

其中 `project.name` 项用于指定应用名（appName）。若未指定，则默认解析 main 函数的类名作为应用名。**实际项目使用中建议手动指定应用名**。

#### 日志相关配置项

|名称|含义|类型|默认值|是否必需| 备注 |
|--------|--------|--------|--------|--------|--------|
| `csp.sentinel.log.dir` | Sentinel 日志文件目录 |`String`|`${user.home}/logs/csp/`| 否 | 1.3.0 引入 |
| `csp.sentinel.log.use.pid`|日志文件名中是否加入进程号，用于单机部署多个应用的情况 |`boolean`| `false` |否| 1.3.0 引入 |
| `csp.sentinel.log.output.type` | Record 日志输出的类型，`file` 代表输出至文件，`console` 代表输出至终端 | `String` | `file` | 否 | 1.6.2 引入 |

> **注意**：若需要在单台机器上运行相同服务的多个实例，则需要加入 `-Dcsp.sentinel.log.use.pid=true` 来保证不同实例日志的独立性。

### sentinel-transport-common 的配置项

|名称|含义|类型|默认值|是否必需|
|--------|--------|--------|--------|--------|
|`csp.sentinel.dashboard.server`|控制台的地址，指定控制台后客户端会自动向该地址发送心跳包。地址格式为：`hostIp:port`|`String`|`null`|是|
|`csp.sentinel.heartbeat.interval.ms`|心跳包发送周期，单位毫秒|`long`|`null`| 非必需，若不进行配置，则会从相应的 `HeartbeatSender` 中提取默认值 |
|`csp.sentinel.api.port`|本地启动 HTTP API Server 的端口号|`int`| 8719 | 否 |
| `csp.sentinel.heartbeat.client.ip` | 指定心跳包中本机的 IP |`String`| - | 若不指定则通过 `HostNameUtil` 解析；该配置项多用于多网卡环境 |

> 注：`csp.sentinel.api.port` 可不提供，默认为 8719，若端口冲突会自动向下探测可用的端口。