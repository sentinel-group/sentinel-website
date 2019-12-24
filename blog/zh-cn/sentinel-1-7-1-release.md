# Sentinel 1.7.1 版本发布

[Sentinel 1.7.1](https://github.com/alibaba/Sentinel/releases/tag/1.7.1) 正式发布，带来了 Spring Web 模块适配、Dubbo 异步模式适配改进、控制台 ACL 注解扩展等多项特性和改进。主要变更如下：

## 特性/功能改进

- 新增原生的 Spring Web 模块适配（[sentinel-spring-webmvc-adapter](https://github.com/alibaba/Sentinel/tree/master/sentinel-adapter/sentinel-spring-webmvc-adapter)），自动提取 controller 中的 URL pattern 作为资源名，对于 REST API 无需再通过 `UrlCleaner` 归一资源名
- 改进 `sentinel-apache-dubbo-adapter` 模块中 Dubbo 异步模式的统计处理方式（仅支持 Dubbo 2.7.2 及以上版本）
- 支持配置 transport 心跳组件发送心跳的路径
- 控制台新增 ACL 注解方式扩展，方便用户定制细粒度的权限控制
- 控制台 SentinelApiClient 推规则时默认编码采用 UTF-8，以支持中文字符

## Bug 修复

- 修复 `sentinel-transport-simple-http` 模块匹配 Content-Type 时逻辑不正确导致 POST 请求信息无法正确解析的 bug


详情请参考 [Release Notes](https://github.com/alibaba/Sentinel/wiki/Release-Notes#171)。