# General Configuration

Sentinel provides the following ways to configure the common items:

- JVM -D parameter
- properties file (since 1.7.0)

The `project.name` item should be configured with JVM -D parameter, while other items support both approaches.

Users can configure the path of the properties file via the `-Dcsp.sentinel.config.file` property item, which also supports files in classpath (such as `classpath:sentinel.properties`). Sentinel will attempt to read the configuration from the `classpath:sentinel.properties` file (the default charset is UTF-8).

> Note: If you're using Spring Boot or Spring Cloud, you may leverage [Spring Cloud Alibaba Sentinel](https://github.com/alibaba/spring-cloud-alibaba) to provide Sentinel configuration in your Spring config file directly.

## Sentinel Core

### Basic configuration items

| Item | Description| Type | Default Value | Required | Notes |
|--------|--------|--------|--------|--------|--------|
| `project.name` | The name of your microservice | `String` | `null` | no | It's recommended to provide the name. |
| `csp.sentinel.app.type` | The type of your microservice | `int` | 0 (`APP_TYPE_COMMON`) | no | introduced since 1.6.0 |
| `csp.sentinel.metric.file.single.size` | The max size of single metric log file |`long`|52428800 (50MB)| no | |
| `csp.sentinel.metric.file.total.count` | The max amount of metric log files | `int` |6| no | |
| `csp.sentinel.statistic.max.rt`| Maximum allowed response time (in ms). If exceeding this value, it will be recorded as this value. | `int` | 4900 | no | introduced since 1.4.1 |
| `csp.sentinel.spi.classloader`| The SPI classloader mechanism | `String` | `default` | no | If the value is `context`, then Sentinel will use the thread context classloader as the SPI classloader. |

### Logging configuration items

| Item | Description| Type | Default Value | Required | Notes |
|--------|--------|--------|--------|--------|--------|
| `csp.sentinel.log.dir` | The log directory |`String`|`${user.home}/logs/csp/`| no | introduced since 1.3.0 |
| `csp.sentinel.log.use.pid`| Whether the log files include the process ID |`boolean`| `false` | no | introduced since 1.3.0 |
| `csp.sentinel.log.output.type` | The output destination of the record logs (`console` for the terminal, `file` for the file) | `String` | `file` | no | introduced since 1.6.2 |