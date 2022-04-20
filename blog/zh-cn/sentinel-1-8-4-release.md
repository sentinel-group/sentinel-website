# Sentinel 1.8.4 版本发布

[Sentinel 1.8.4](https://github.com/alibaba/Sentinel/releases/tag/1.8.4) 正式发布，带来了多项特性和改进。主要新特性及改进如下：

- 完善 transport 模块的扩展性，支持拦截器扩展以支持用户自定义鉴权等行为
- 网关流控中完善参数解析的扩展性，支持用户自定义解析参数的逻辑（如定制化解析 IP 的逻辑）
- 修复控制台在进行集群流控分配时的一些异常情况，并完善熔断规则配置提示
- 将控制台依赖的 Spring Boot 版本升级至 2.5.12（安全版本）


详情请参考 [Release Notes](https://github.com/alibaba/Sentinel/releases/tag/1.8.4)。感谢为该版本付出的所有贡献者：@brotherlu-xcq, @code-ferry, @DollarB, @howiekang, @icodening, @Reagan1947, @Roger3581321, @sczyh30, @tain198127, @zhaoxinhu, @zhuyou1234

