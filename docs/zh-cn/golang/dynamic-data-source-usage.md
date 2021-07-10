## Overview
这个 Wiki 主要描述 [sentinel-golang](https://github.com/alibaba/sentinel-golang) 的[动态数据源](https://github.com/alibaba/sentinel-golang/wiki/%E5%8A%A8%E6%80%81%E6%95%B0%E6%8D%AE%E6%BA%90%E6%89%A9%E5%B1%95%E8%AE%BE%E8%AE%A1) 如何使用，使用动态数据源可以参考下面介绍的example。

Sentinel-Golang 目前支持以下数据源扩展：

- [Consul](https://github.com/sentinel-group/sentinel-go-datasources/tree/main/consul)
- [Etcd](https://github.com/sentinel-group/sentinel-go-datasources/tree/main/etcdv3)
- [Nacos](https://github.com/sentinel-group/sentinel-go-datasources/tree/main/nacos)

sentinel-golang后续会接入更多的配置中心中间件例如Apollo等等,欢迎大家参与共建

## Effect

提供的example会首先在程序中加载自定义的rule进行限流，程序运行后在配置中心修改或者新增限流配置，达到动态更新数据源以及动态限流的效果。


## Etcd

### example地址

https://github.com/sentinel-group/sentinel-go-datasources/tree/main/example/etcdv3/datasource_etcdv3_example.go

### example使用说明

1. 搭建Etcd,参考[入门指南](https://github.com/etcd-io/etcd#getting-started)

2. [运行Etcd](https://github.com/etcd-io/etcd#running-etcd) 

3. 修改example中的Etcd地址信息

   1. ```go
         cli, err := clientv3.New(clientv3.Config{
         		Endpoints:   []string{"localhost:2379"},
         		DialTimeout: 5 * time.Second,
         	})
      ```

4. 运行[datasource_etcdv3_example.go](https://github.com/sentinel-group/sentinel-go-datasources/tree/main/example/etcdv3/datasource_etcdv3_example.go) #main()

5. 在Etcd中设置限流参数

   1. key:"flow-test"

   2. value:

      ```json
        [{
              "resource": "some-test",
              "threshold": 50.0,
              "relationStrategy": 0,
              "controlBehavior": 0,
              "statIntervalInMs":1000
          }]
      ```

6. 限流配置变更,控制台输出重新加载规则日志如下:限流阈值从10->50

   1. ```
      {"timestamp":"2020-11-10 14:22:54.54100","caller":"rule_manager.go:118","logLevel":"INFO","msg":"[FlowRuleManager] Flow rules were loaded","rules":[{"resource":"some-test","tokenCa
      lculateStrategy":0,"controlBehavior":0,"threshold":50,"relationStrategy":0,"refResource":"","maxQueueingTimeMs":0,"warmUpPeriodSec":0,"warmUpColdFactor":0,"statIntervalInMs":1000}]}
      
      ```

## Consul

### example地址

https://github.com/sentinel-group/sentinel-go-datasources/tree/main/example/consul/datasource_consul_example.go

### example使用说明

1. 搭建Consul,参考[入门指南](https://learn.hashicorp.com/tutorials/consul/get-started-install?in=consul/getting-started)

2. [运行Consul](https://learn.hashicorp.com/tutorials/consul/get-started-agent?in=consul/getting-started) 

3. 修改example中的Consul地址信息

   1. ```go
          client, err := api.NewClient(&api.Config{
              Address: "127.0.0.1:8500",
          })
      ```

4. 运行[datasource_consul_example.go](https://github.com/sentinel-group/sentinel-go-datasources/tree/main/example/consul/datasource_consul_example.go) #main()

5. 在Consul中设置限流参数

   1. key:"flow-test"

   2. value:

      ```json
        [{
              "resource": "some-test",
              "threshold": 50.0,
              "relationStrategy": 0,
              "controlBehavior": 0,
              "statIntervalInMs":1000
          }]
      ```

6. 限流配置变更,控制台输出重新加载规则日志如下:限流阈值从10->50

   1. ```
      {"timestamp":"2020-11-10 14:22:54.54100","caller":"rule_manager.go:118","logLevel":"INFO","msg":"[FlowRuleManager] Flow rules were loaded","rules":[{"resource":"some-test","tokenCa
      lculateStrategy":0,"controlBehavior":0,"threshold":50,"relationStrategy":0,"refResource":"","maxQueueingTimeMs":0,"warmUpPeriodSec":0,"warmUpColdFactor":0,"statIntervalInMs":1000}]}
      ```

      


## Nacos

### example地址

https://github.com/sentinel-group/sentinel-go-datasources/tree/main/example/nacos/datasource_nacos_example.go

### example使用说明

1. 搭建Nacos,参考[入门指南](https://github.com/alibaba/nacos#quick-start)

2. [运行Nacos](https://github.com/alibaba/nacos#step-2-start-server) 

3. 修改example中的Nacos地址信息

   1. ```go
      	sc := []constant.ServerConfig{
      		{
      			ContextPath: "/nacos",
      			Port:        8848,
      			IpAddr:      "127.0.0.1",
      		},
      	}
      ```

4. 运行[datasource_consul_example.go](https://github.com/sentinel-group/sentinel-go-datasources/tree/main/example/consul/datasource_consul_example.go) #main()

5. 在Nacos中设置限流参数

   1. dataId: "flow-test"

   2. group: "sentinel-go"

   3. content:

      ```json
        [{
              "resource": "some-test",
              "threshold": 50.0,
              "relationStrategy": 0,
              "controlBehavior": 0,
              "statIntervalInMs":1000
          }]
      ```

6. 限流配置变更,控制台输出重新加载规则日志如下:限流阈值从10->50

   1. ```
      {"timestamp":"2020-11-10 14:22:54.54100","caller":"rule_manager.go:118","logLevel":"INFO","msg":"[FlowRuleManager] Flow rules were loaded","rules":[{"resource":"some-test","tokenCa
      lculateStrategy":0,"controlBehavior":0,"threshold":50,"relationStrategy":0,"refResource":"","maxQueueingTimeMs":0,"warmUpPeriodSec":0,"warmUpColdFactor":0,"statIntervalInMs":1000}]}
      ```

      
