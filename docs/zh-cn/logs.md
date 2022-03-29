# 日志

Sentinel 日志目录可通过 `csp.sentinel.log.dir` 启动参数进行配置，详情请参考[通用配置项文档](./general-configuration.md)。

## 拦截详情日志（block 日志）

无论触发了限流、熔断降级还是系统保护，它们的秒级拦截详情日志都在 `${user_home}/logs/csp/sentinel-block.log`里。如果没有发生拦截，则该日志不会出现。日志格式如下:

```
2014-06-20 16:35:10|1|sayHello(java.lang.String,long),FlowException,default,origin|61,0
2014-06-20 16:35:11|1|sayHello(java.lang.String,long),FlowException,default,origin|1,0
```

日志含义：

| index| 例子| 说明|
| :--- | :----: | :---- |
|1|`2014-06-20 16:35:10`|时间戳|
|2|`1`|该秒发生的第一个资源|
|3| `sayHello(java.lang.String,long)` |资源名称|
|4| `XXXException` |拦截的原因, 通常 `FlowException` 代表是被限流规则拦截，`DegradeException` 则表示被降级，`SystemBlockException` 则表示被系统保护拦截 |
|5| `default` | 生效规则的调用来源（参数限流中代表生效的参数）|
|6| `origin` | 被拦截资源的调用者，可以为空 |
|7| `61,0` |61 被拦截的数量，０无意义可忽略|

## 秒级监控日志

所有的资源访问都会产生秒级监控日志，日志文件默认为 `${user_home}/logs/csp/${app_name}-${pid}-metrics.log`（会随时间滚动）。格式如下:

```
1532415661000|2018-07-24 15:01:01|sayHello(java.lang.String)|12|3|4|2|295|0|0|1
```

1. `1532415661000`：时间戳
2. `2018-07-24 15:01:01`：格式化之后的时间戳
3. `sayHello(java.lang.String)`：资源名
4. `12`：表示到来的数量，即此刻通过 Sentinel 规则 check 的数量（passed QPS）
5. `3`：实际该资源被拦截的数量（blocked QPS）
6. `4`：每秒结束的资源个数（完成调用），包括正常结束和异常结束的情况（exit QPS）
7. `2`：异常的数量
8. `295`：资源的平均响应时间（RT）
9. `0`: 该秒占用未来请求的数目（since 1.5.0）
10. `0`: 最大并发数（预留用）
11. `1`: 资源分类（since 1.7.0）

## 业务日志

其它的日志在 `${user_home}/logs/csp/sentinel-record.log.xxx` 里。该日志包含规则的推送、接收、处理等记录，排查问题的时候会非常有帮助。

## 集群限流日志

- `${log_dir}/sentinel-cluster-client.log`：Token Client 日志，会记录请求失败的信息

## SPI 扩展机制

1.7.2 版本开始，Sentinel 支持 Logger 扩展机制，可以实现自定义的 Logger SPI 来将 record log 等日志自行处理。metric/block log 暂不支持定制。