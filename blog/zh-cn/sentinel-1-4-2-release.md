# Sentinel 1.4.2 版本发布

[Sentinel 1.4.2](https://github.com/alibaba/Sentinel/releases/tag/1.4.2) 正式发布，欢迎大家使用。该版本主要变更如下：

## 特性/功能改进

- 新增 Zuul 1.x 适配模块（[sentinel-zuul-adapter](https://github.com/alibaba/Sentinel/tree/master/sentinel-adapter/sentinel-zuul-adapter)），结合集群限流特性可以更好地在 API Gateway 发挥流控的作用
- 热点参数限流添加线程数模式支持
- 在 BlockException 中携带更多的信息（如触发的规则）
- 完善 Tracer，支持针对某个 Entry 或 Context 记录异常数目
- 优化 ClusterStateManager 的逻辑，防止 SPI 在不同 ClassLoader 中加载导致 Error
- `sentinel-annotation-aspectj` 模块移除 slf4j 依赖

## Bug 修复

- 修复 ConnectionManager 创建连接记录 NPE 的 bug
- 修复匀速器模式中的一些 bug
- 修复热点并发统计时由于旧值被淘汰引发 NPE 的 bug
- 修复集群流控中传入热点参数时计算参数大小和数目的 bug

## Sentinel 控制台

- 包名变更：由 `com.taobao.*` 变更为 `com.alibaba.*`
- 规则页面添加集群流控中集群规则的失败退化（`fallbackToLocalWhenFail`）配置项
- 修复控制台编辑规则时数据拷贝的问题
- 控制台左侧侧边栏添加健康机器数目及总机器数目的展示
- 监控页面优化文案展示

详情请参考 [Release Notes](https://github.com/alibaba/Sentinel/wiki/Release-Notes#142)。