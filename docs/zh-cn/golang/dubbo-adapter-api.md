# 在dubbo-go中使用sentinel

在sentinel-golang中已经实现了对dubbo-go的adapter代码，您可以很轻松的在dubbo-go中使用sentinel。

注意：dubbo-go版本请使用1.3.0-rc3及其以上版本

dubbo-go仓库地址：https://github.com/apache/dubbo-go

在dubbo-go中使用sentinel主要分为以下几步：

1.初始化sentinel

2.将sentinel注入dubbo-go的filter

3.初始化dubbo-go

4.配置规划



## 初始化sentinel

示例代码：

```go
import (
	sentinel "github.com/alibaba/sentinel-golang/api"
)

func initSentinel() {
	err := sentinel.InitWithLogDir(confPath, logDir)
	if err != nil {
		// 初始化 Sentinel 失败
	}
}
```

## 将sentinel注入dubbo-go的filter

你可以通过import包的形式执行，执行其中的init()来注入filter

```go
import (
	_ "github.com/alibaba/sentinel-golang/adapter/dubbo"
)

```

也可以手动执行，给你的filter取上自己想要的名字

```go
import (
  "github.com/apache/dubbo-go/common/extension"
  sd "github.com/alibaba/sentinel-golang/adapter/dubbo"
)

func main(){
  extension.SetFilter("myConsumerFilter",sd.GetConsumerFilter())
  extension.SetFilter("myProviderFilter",sd.GetConsumerFilter())
}
```

完成以上步骤，你就可以在需要的dubbo接口配置里写入sentinel的filterName,构建起接口的filter链条。比如以下以consumer.yml配置文件为例

```yml
references:
  "UserProvider":
    registry: "hangzhouzk"
    protocol : "dubbo"
    interface : "com.ikurento.user.UserProvider"
    cluster: "failover"
    filter: "myConsumerFilter"
    methods :
    - name: "GetUser"
      retries: 3
```

## 初始化dubbo-go

到这一步，你只需要正常启动dubbo-go程序就完成了服务启动。用以下代码做一个较为完整举例

```go
import (
	hessian "github.com/apache/dubbo-go-hessian2"
	sd "github.com/alibaba/sentinel-golang/adapter/dubbo"
)

import (
	"github.com/apache/dubbo-go/common/logger"
	_ "github.com/apache/dubbo-go/common/proxy/proxy_factory"
	"github.com/apache/dubbo-go/config"
	_ "github.com/apache/dubbo-go/filter/impl"
	_ "github.com/apache/dubbo-go/protocol/dubbo"
	_ "github.com/apache/dubbo-go/registry/protocol"

	_ "github.com/apache/dubbo-go/cluster/cluster_impl"
	_ "github.com/apache/dubbo-go/cluster/loadbalance"
	_ "github.com/apache/dubbo-go/registry/zookeeper"
	"github.com/apache/dubbo-go/common/extension"
)

func main() {

	hessian.RegisterPOJO(&User{})
  extension.SetFilter("myConsumerFilter",sd.GetConsumerFilter())
  extension.SetFilter("myProviderFilter",sd.GetConsumerFilter())
	config.Load()

	// init finish, do your work
	test()

}
```



## 规划配置

sentinel以强大的规划配置吸引了很多使用者，其提供动态数据源接口进行扩展，用户可以通过动态文件或 etcd 等配置中心来动态地配置规则。但目前sentinel-golang作为破蛋版本，动态配置还在开发中



### 动态数据源

（规划中）Sentinel 提供动态数据源接口进行扩展，用户可以通过动态文件或 etcd 等配置中心来动态地配置规则。

### 硬编码方式

Sentinel 也支持原始的硬编码方式加载规则，可以通过各个模块的 `LoadRules(rules)` 方法加载规则。以下是硬编码方式对某个method在consumer端的QPS流控：

```go
_, err := flow.LoadRules([]*flow.FlowRule{
	{
		ID:                666,
		Resource:         "dubbo:consumer:com.ikurento.user.UserProvider:myGroup:1.0.0:hello()",
		MetricType:        flow.QPS,
		Count:             10,
		ControlBehavior:   flow.Reject,
	},
})
if err != nil {
	// 加载规则失败，进行相关处理
}
```

