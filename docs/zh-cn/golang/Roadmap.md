# Roadmap

| 版本 | Milestone | 主要特性 |
|--|--|--|
| 0.5.0 | 2020.7 |  |
| 0.6.0 | 2020.8 |  |
| 1.0.0 | 2020.11 |  |

## 1.0 GA主要Feature(API Changes)

* K8S CRD 作为动态数据源   @louyuting
* adapter和DataSource拆分    @louyuting
* rule cache   

Done:
* 热点参数特殊值设置(Done)   @louyuting

# Enhancement

* block 时候的snapshot的规范化   @luckyxiaoqiang   https://github.com/alibaba/sentinel-golang/issues/282
* 各个维度的benchmark: 空的slot chain/各个slot的benchmark. 包括QPS/内存/Load   @louyuting
* 文档/英文文档    @宿何 + @yuting
* 日志风格统一     @sanxu0325   https://github.com/alibaba/sentinel-golang/issues/280
* 完善测试。       @sanxu0325   
* block 日志

Done
* 去除panic(Done)       @sanxu0325   https://github.com/alibaba/sentinel-golang/issues/278
* 优化slot chain(Done)  @yuting
* 优化float的比较(Done)   @luckyxiaoqiang   https://github.com/alibaba/sentinel-golang/issues/281
* 配置项的优化(Done)     @宿何 + @yuting