# Sentinel 1.4.1 版本发布

[Sentinel 1.4.1 版本](https://github.com/alibaba/Sentinel/releases/tag/1.4.1) 正式发布，欢迎大家使用。该版本主要 features:

- 改善了 Sentinel 控制台集群限流管理页面的操作，支持应用维度的 token server 管理
- 支持限制 token server 的总 QPS 来防止 Embedded 模式下资源占用过多影响应用本身
- 改善了 token client 的重试机制

![image](https://user-images.githubusercontent.com/9434884/50681555-e529fc80-1046-11e9-99e4-6f1bc2ea3bb1.png)

![image](https://user-images.githubusercontent.com/9434884/50681583-0985d900-1047-11e9-8e99-73e43ff78098.png)

详情请见 [Release Notes](https://github.com/alibaba/Sentinel/wiki/Release-Notes#141)。