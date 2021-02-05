# Sentinel 1.8.1 版本发布

[Sentinel 1.8.1](https://github.com/alibaba/Sentinel/releases/tag/1.8.1) 正式发布，带来了多项特性和改进。主要变更如下：

## 特性/功能改进

- 新增 Motan RPC 框架适配模块 [sentinel-motan-adapter](https://github.com/alibaba/Sentinel/tree/master/sentinel-adapter/sentinel-motan-adapter)
- 重构底层 SPI 机制，完善 SPI 扩展定制的能力 ([#1383](https://github.com/alibaba/Sentinel/pull/1383)），现在用户可以更方便地织入自定义的实现逻辑
- 完善 Dubbo 2.6.x 适配模块默认的流控处理逻辑
- 控制台心跳模块支持 HTTPS 协议通信

## Bug 修复

- 修复初次埋点访问之前更新热点规则/网关流控规则时可能出现 NPE 的问题
- 修复 Zuul 1.x 适配模块在少数情况下获取 path 为空的问题
- 修复熔断器模块 100% 比例阈值不生效的问题


详情请参考 [Release Notes](https://github.com/alibaba/Sentinel/releases/tag/1.8.1)。感谢为该版本付出的所有贡献者：@brothelul, @cdfive, @dani3lWong, @evasnowind, @HelloCoCooo, @jasonjoo2010, @JiangZian, @JieGz, @John-Chan, @liuming-dev, @mikawudi, @nickChenyx, @odidev, @polarbear567, @PeineLiang, @samuelxw, @sczyh30, @vipweihua, @wzg923, @xierunzi, @xierunzi, @xuande, @yunfeiyanggzq, @zcai2, @zhangkai253, @zhangxn8, @zhouyongshen

2021 新年临近，Sentinel 社区祝大家新年快乐。