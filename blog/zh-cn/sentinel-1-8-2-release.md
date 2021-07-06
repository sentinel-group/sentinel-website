# Sentinel 1.8.2 版本发布

[Sentinel 1.8.2](https://github.com/alibaba/Sentinel/releases/tag/1.8.2) 正式发布，带来了多项特性和改进。主要变更如下：

- 完善 TimeUtil 在不同流量大小情况下的性能，低峰期可降低 CPU 占用 ([#1746](https://github.com/alibaba/Sentinel/pull/1746))
- `@SentinelResource` 注解的 blockHandler/fallback/defaultFallback 现在支持 private-level 函数 ([#2163](https://github.com/alibaba/Sentinel/pull/2163))
- 新增 `sentinel-transport-spring-mvc` 模块，支持直接将 Spring Web 作为 command center ([#1957](https://github.com/alibaba/Sentinel/pull/1957))
- Redis 动态数据源支持 Redis Cluster 模式 ([#1751](https://github.com/alibaba/Sentinel/pull/1751))
- 部分通用配置项支持通过系统环境变量进行配置 ([#2154](https://github.com/alibaba/Sentinel/pull/2154))
- Dashboard 完善权限管理模块的扩展性 ([#2059](https://github.com/alibaba/Sentinel/pull/2059))


详情请参考 [Release Notes](https://github.com/alibaba/Sentinel/releases/tag/1.8.2)。感谢为该版本付出的所有贡献者：@Amitbhave, @Anilople, @brotherlu-xcq, @cdfive, @drgnchan, @goodjava, @gvma, @huakai-zhang, @jasonjoo2010, @jiajiangnan, @JJFly-JOJO, @JerryChin, @liqiangz, @quaff, @Roger3581321, @ShubhamPalriwala, @Slideee, @SparkLee, @sczyh30, @shenbaoyong, @ss-superman, @VegetaPn, @wutingjia, @wuwen5, @zhangyunan1994