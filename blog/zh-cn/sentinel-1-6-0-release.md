# Sentinel 1.6.0 版本发布，引入 Spring Cloud Gateway 支持

流控降级组件 Sentinel 的又一个里程碑版本 1.6.0 正式发布，带来了定制化的网关流控支持、注解 fallback 改进等多项新特性。

## 网关流控

Sentinel 1.6.0 针对 API Gateway 场景引入了定制化的网关流控特性，支持针对不同的路由和自定义的 API 分组进行流控，支持针对请求属性（如 URL 参数，Client IP，Header 等）进行流控。更多特性可以参考 [Sentinel 网关流控文档](https://github.com/alibaba/Sentinel/wiki/网关限流)。

![sentinel-api-gateway-common-arch](https://user-images.githubusercontent.com/9434884/58381714-266d7980-7ff3-11e9-8617-d0d7c325d703.png)

详细信息请参考 [Release Notes](https://github.com/alibaba/Sentinel/wiki/Release-Notes#160)，欢迎大家使用并提出建议，也欢迎大家一起参与贡献。
