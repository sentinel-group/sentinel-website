# 日志

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

所有的资源都会产生秒级日志，它在 `${user_home}/logs/csp/${app_name}-${pid}-metrics.log`里。格式如下:

```
1532415661000|2018-07-24 15:01:01|sayHello(java.lang.String)|12|3|4|2|295
```

1. `1532415661000`：时间戳
2. `2018-07-24 15:01:01`：格式化之后的时间戳
3. `sayHello(java.lang.String)`：资源名
4. `12`：表示到来的数量，即此刻通过 Sentinel 规则 check 的数量（passed QPS）
5. `3`：实际该资源被拦截的数量（blocked QPS）
6. `4`：每秒结束的资源个数（完成调用），包括正常结束和异常结束的情况（exit QPS）
7. `2`：异常的数量
8. `295`：资源的平均响应时间（RT）

## 业务日志

其它的日志在 `${user_home}/logs/csp/sentinel-record.log.xxx` 里。该日志包含规则的推送、接收、处理等记录，排查问题的时候会非常有帮助。

## 集群限流日志

- `${log_dir}/sentinel-cluster-client.log`：Token Client 日志，会记录请求失败的信息