# 日志

## 拦截详情日志

无论限流，降级还是系统保护，它们的秒级拦截详情日志都在 `{user_home}/logs/csp/sentinel-block.log`里。格式如下:
```
2014-06-20 16:35:10|1|sayHello(java.lang.String,long),FlowException,default,origin|61,0
2014-06-20 16:35:11|1|sayHello(java.lang.String,long),FlowException,default,origin|1,0
```
1. `2014-06-20 16:35:10`：时间戳；
2. `1`：序号；
3. `sayHello(java.lang.String,long)`：资源描述符；
4. `XXXException`：表示被限制的种类。`FlowException` 表示被限流，`DegradeException` 表示被降级，`SystemException` 表示被系统保护
5. `default`规则上配置的限制应用；
6. `origin`：实际被限制的来源应用，可能为空字符串；
7. `61,0`：61 代表这一秒内限流降级发生的次数，0 无含义（可忽略)。

## 秒级监控日志

所有的资源都会产生秒级日志，它在 `{user_home}/logs/csp/{app_name}-{pid}-metrics.log`里。格式如下:

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

其它的日志在 `{user_home}/logs/csp/record.log`里。该日志包含规则的推送、接收、处理等记录。