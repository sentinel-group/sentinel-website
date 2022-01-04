# Sentinel 1.8.3 版本发布

[Sentinel 1.8.3](https://github.com/alibaba/Sentinel/releases/tag/1.8.3) 正式发布，带来了多项特性和改进。主要新特性及改进如下：

- 集群流控 token server 支持 Envoy RLS v3 API，以支持较新版本 Envoy ([#2336](https://github.com/alibaba/Sentinel/pull/2336))
- 新增 JMX metric exporter 模块 ([#2275](https://github.com/alibaba/Sentinel/pull/2275))
- Consul 动态数据源支持 ACL token ([#2307](https://github.com/alibaba/Sentinel/pull/2307))
- 完善系统规则 inbound QPS 策略判断的条件，采用 pass QPS 而不是 complete QPS ([#2455](https://github.com/alibaba/Sentinel/pull/2455))


详情请参考 [Release Notes](https://github.com/alibaba/Sentinel/releases/tag/1.8.3)。感谢为该版本付出的所有贡献者：@brotherlu-xcq, @chenzhiguo, @sczyh30, @shaohsiung, @su787910081, @winjaychan, @wucheng1997, @xiaojun207, @xianwdong


2022 元旦临近，Sentinel 社区祝大家新年快乐。