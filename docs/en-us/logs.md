# Logs

## Block log

All block logs will be recorded in `${user_home}/logs/csp/sentinel-block.log`:

```
2014-06-20 16:35:10|1|sayHello(java.lang.String,long),FlowException,default,origin|61,0
2014-06-20 16:35:11|1|sayHello(java.lang.String,long),FlowException,default,origin|1,0
```

1. `2014-06-20 16:35:10`: timestamp
2. `1`: index
3. `sayHello(java.lang.String,long)`: the resource name
4. `XXXException`，type of rules to take effect. `FlowException` for flow control, `DegradeException` for circuit breaking, `SystemException` for system adaptive protection, `ParamFlowException` for parameter flow control
5. `default` for the `limitApp` defined in rules
6. `origin`，for the real origin of the request
7. `61,0`，61 for block times; 0 has no meaning, which can be ignored

## Metric log 

Metrics of resources are recorded in `{user_home}/logs/csp/{app_name}_{pid}_metrics.log`:

```
1529573107000|2018-06-21 17:25:07|sayHello(java.lang.String,long)|10|3601|10|0|2
```

1. `1529573107000`: the timestamp of this record;
2. `2018-06-21 17:25:07`: formatted date/time;
3. `sayHello(java.lang.String,long)`: resource name;
4. `10`: passed request count (`passQps`);
5. `3601`: blocked count；
6. `10`: complete count (successfully handled by Sentinel);
7. `0`: business exception count;
8. `2`: the average response time (ms)

## Other logs

Other info (such as rule loading) is recorded in `${user_home}/logs/csp/sentinel-record.log.xxx`.