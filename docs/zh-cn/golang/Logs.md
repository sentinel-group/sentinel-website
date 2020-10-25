## Metric log 

Metrics of resources are recorded in `~/logs/csp/{app_name}_{pid}_metrics.log`. Example:

```
1529573107000|2018-06-21 17:25:07|sayHello|10|3601|10|0|2
```

Format description:

1. `1529573107000`: the timestamp of this record;
2. `2018-06-21 17:25:07`: formatted date/time;
3. `sayHello`: resource name;
4. `10`: passed count;
5. `3601`: blocked count；
6. `10`: complete count (successfully handled by Sentinel);
7. `0`: error count;
8. `2`: the average response time (ms)

## Other logs

Other info (such as rule loading) is recorded in `${user_home}/logs/csp/sentinel-record.log.xxx`.