# 开源框架适配

Sentinel Go 目前已提供以下框架或组件的 adapter 模块：

- Web
  - [CloudWeGo Hertz](https://pkg.go.dev/github.com/alibaba/sentinel-golang/pkg/adapters/hertz)
  - [echo](https://pkg.go.dev/github.com/alibaba/sentinel-golang/pkg/adapters/echo)
  - [gear](https://pkg.go.dev/github.com/alibaba/sentinel-golang/pkg/adapters/gear)
  - [Gin](https://pkg.go.dev/github.com/alibaba/sentinel-golang/pkg/adapters/gin)
- RPC
  - [CloudWeGo Kitex](https://pkg.go.dev/github.com/alibaba/sentinel-golang/pkg/adapters/kitex)
  - [dubbo-go](https://github.com/apache/dubbo-go/tree/master/filter/sentinel)
  - [gRPC-go](https://pkg.go.dev/github.com/alibaba/sentinel-golang/pkg/adapters/grpc)
  - [go-micro](https://pkg.go.dev/github.com/alibaba/sentinel-golang/pkg/adapters/micro)
- Service Mesh && Runtime
  - [Dapr](https://docs.dapr.io/reference/components-reference/supported-middleware/middleware-sentinel/)
  - MOSN

同时也欢迎社区贡献更多框架组件的适配模块。