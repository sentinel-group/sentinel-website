# 通用配置

Sentinel 的运行需要一些配置启动项，比如启动监控日志，用户自定义日志目录，统计相关的一些设置。

## 配置项详解

Sentinel 支持的配置项的定义如下：

```go
// SentinelConfig represent the general configuration of Sentinel.
type SentinelConfig struct {
	App struct {
		// Name represents the name of current running service.
		Name string
		// Type indicates the classification of the service (e.g. web service, API gateway).
		Type int32
	}
	// Log represents configuration items related to logging.
	Log LogConfig
	// Stat represents configuration items related to statistics.
	Stat StatConfig
	// UseCacheTime indicates whether to cache time(ms)
	UseCacheTime bool `yaml:"useCacheTime"`
}

// LogConfig represent the configuration of logging in Sentinel.
type LogConfig struct {
	// Logger indicates that using logger to replace default logging.
	Logger logging.Logger
	// Dir represents the log directory path.
	Dir string
	// UsePid indicates whether the filename ends with the process ID (PID).
	UsePid bool `yaml:"usePid"`
	// Metric represents the configuration items of the metric log.
	Metric MetricLogConfig
}

// MetricLogConfig represents the configuration items of the metric log.
type MetricLogConfig struct {
	SingleFileMaxSize uint64 `yaml:"singleFileMaxSize"`
	MaxFileCount      uint32 `yaml:"maxFileCount"`
	FlushIntervalSec  uint32 `yaml:"flushIntervalSec"`
}

// StatConfig represents the configuration items of statistics.
type StatConfig struct {
	// GlobalStatisticSampleCountTotal and GlobalStatisticIntervalMsTotal is the per resource's global default statistic sliding window config
	GlobalStatisticSampleCountTotal uint32 `yaml:"globalStatisticSampleCountTotal"`
	GlobalStatisticIntervalMsTotal  uint32 `yaml:"globalStatisticIntervalMsTotal"`

	// MetricStatisticSampleCount and MetricStatisticIntervalMs is the per resource's default readonly metric statistic
	// This default readonly metric statistic must be reusable based on global statistic.
	MetricStatisticSampleCount uint32 `yaml:"metricStatisticSampleCount"`
	MetricStatisticIntervalMs  uint32 `yaml:"metricStatisticIntervalMs"`

	System SystemStatConfig `yaml:"system"`
}

// SystemStatConfig represents the configuration items of system statistics.
type SystemStatConfig struct {
	// CollectIntervalMs represents the collecting interval of the system metrics collector.
	CollectIntervalMs uint32 `yaml:"collectIntervalMs"`
}
```

字段详细解释：

| key | 含义 | 默认值 | 备注 |
| -------- | -------- | -------- | -------- |
| `version` | 配置的版本 | v1 | 无 |
| `sentinel.app.name`  | 项目名称  | `unknown_go_service` | **必需的配置项**。若环境变量 `SENTINEL_APP_NAME` 和文件中均未配置，则标为 `unknown_go_service` |
| `sentinel.app.type`  | 项目类型  | 0 | **必需的配置项**。若环境变量 `SENTINEL_APP_TYPE` 和文件中均未配置，则标为 `0` |
| `sentinel.log.logger`  | 用户自定义Logger  | nil | 如果用户期望使用自定义的Logger去覆盖Sentinel默认的logger，需要指定这个对象，如果指定了，Sentinel就会使用这个对象打日志 |
| `sentinel.log.dir`  | 日志路径  | `${user.home}/logs/csp` |  |
| `sentinel.log.usePid`  | 监控日志文件名是否带上进程 PID  | false |  |
| `sentinel.log.metric.maxFileCount`  | 监控日志最大文件数目  | 8 |  |
| `sentinel.log.metric.singleFileMaxSize`  | 监控日志单个文件大小上限  | 50 MB (`1024*1024*50`) |  |
| `sentinel.log.metric.flushIntervalSec`  | 监控日志聚合和刷盘的时间频率  | 1s | 若无特殊需要，请采用默认值。若设为 0 则关闭监控日志输出。 |
| `sentinel.stat.system.globalStatisticSampleCountTotal`  | Resource的全局滑动窗口的统计格子数 | 20 | 若无特殊需要，请采用默认值。|
| `sentinel.stat.system.globalStatisticIntervalMsTotal`  | Resource的全局滑动窗口的间隔时间(ms) | 10000 | 若无特殊需要，请采用默认值。|
| `sentinel.stat.system.metricStatisticSampleCount`  | Resource的默认监控日志统计的滑动窗口的统计格子数 | 2 | 若无特殊需要，请采用默认值。|
| `sentinel.stat.system.metricStatisticIntervalMs`  | Resource的默认监控日志统计的滑动窗口的间隔时间 | 1000 | 若无特殊需要，请采用默认值。|
| `sentinel.stat.system.collectIntervalMs`  | 系统指标收集的间隔时间 | 1000 | 若无特殊需要，请采用默认值。若设为 0 则关闭系统指标收集。 |
| `sentinel.useCachedTime`  | 是否通过异步协程缓存时间 (ms) | true | 若无特殊需要，请采用默认值。 |

如果不使用自适应限流模块(core/system)，可以通过设置`sentinel.stat.system.collectIntervalMs` 为0，表示关闭系统指标收集。
如果不使用监控日志，可以通过设置`sentinel.log.metric.flushIntervalSec`为0，表示关闭监控日志文件异步输出。

## Sentinel支持的配置方式
Sentinel支持三种方式来初始化运行环境：yaml文件、手动配置config.Entity以及环境变量。优先级是：环境变量大于手动配置。

### yaml配置文件
Sentinel的api pkg提供了两个函数通过yaml文件初始化Sentinel运行环境：
1. `func InitDefault()` 函数初始化，Sentinel 则会尝试从 `SENTINEL_CONFIG_FILE_PATH` 环境变量读取 path 并读取对应的文件。若未指定则默认从项目目录下的 `sentinel.yml` 文件读取配置；若均不存在，Sentinel 会通过环境变量读取基础的配置（如项目名称），其它配置项采用默认值。
2. `func InitWithConfigFile(configPath string)` 使用用户指定目录的yaml文件，同时会通过环境变量读取基础的配置，然后初始化 Sentinel 


如果yaml文件不存在，就是通过默认的全局配置项初始化Sentinel。默认的全局配置项定义可refer：[https://github.com/alibaba/sentinel-golang/blob/master/core/config/entity.go#NewDefaultConfig](https://github.com/alibaba/sentinel-golang/blob/master/core/config/entity.go)

YAML 配置文件示例：

```yaml
version: "v1"
sentinel:
  app:
    name: sentinel-go-demo
    type: 0
  log:
    dir: "~/logs/csp"
    pid: false
    metric:
      maxFileCount: 14
      flushIntervalSec: 1
  stat:
    system:
      collectIntervalMs: 1000
```

### 通过配置对象初始化Sentinel运行环境
`InitWithConfig(confEntity *config.Entity)` 函数初始化，用户需要自己制定配置项 `config.Entity`, Sentinle 会使用用户输入的配置项初始化。如果存在环境变量，那么环境变量优先级最高。

注意：环境变量配置优先级最高。若同时存在，则环境变量的配置会覆盖 YAML 文件的配置。

## 环境变量配置项
环境变量的配置优先级永远是最高的，Sentinel支持5个环境变量：

| key | 对应的 yaml 配置项 | 含义 | 备注 |
| -------- | -------- | -------- | -------- |
| `SENTINEL_CONFIG_FILE_PATH`  | - | yaml 配置文件路径  | 若未指定则默认从项目目录下的 `sentinel.yml` 文件读取配置  |
| `SENTINEL_APP_NAME`  | sentinel.app.name | 项目名称   | **必需的配置项**。若环境变量和文件中均未配置，则标为 `unknown_go_service`  |
| `SENTINEL_APP_TYPE`  | sentinel.app.type | 项目类型   | **必需的配置项**。若环境变量和文件中均未配置，则标为 1  |
| `SENTINEL_LOG_DIR`  | - | 日志路径   | 默认路径为 `~/logs/csp`  |
| `SENTINEL_LOG_USE_PID`  | - | 日志文件是否带 pid | 默认为 false  |

以上配置项中，应用名称（sentinel.app.name）为必需的配置项。