# Release Manual

1. check milestone 相关 issue 是否完成，若无法预期完成 则排到下个 release 中；重要的 bug fix/improvement 需要搞定。
2. 整体看一遍代码，扫一下是否有明显的规范性问题，有没有多余的文件；若有重点特性没有注释，要补上注释（后续这一步在 PR 里面卡，即：不规范、无注释则不review）；总览一下这个版本新加的核心特性，看看有没有什么明显的问题。
3. 跑一遍所有测试，跑一遍所有 demo，验证功能符合预期。对于example，需要观察结果、内存、CPU、load等指标是否在预期内。
4. 整理该版本的 release notes，格式先参考之前的 release notes，新特性可写几段简述；重点关注 breaking changes/dependency changes 并注明（1.0 版本后，小版本不允许核心接口不兼容修改）；GitHub 上 release notes 必须用英文写，并且严格注重规范性（包括大小写、标点符号、用词）。写好先放到 https://github.com/alibaba/sentinel-golang/wiki/Release-Notes 里面标为 staging 状态，全体 committer 进行 review。
5. 所有 ready 后，给当前 commit 打 tag，格式类似于 v0.3.0；push tag 后到 GitHub release 页面创建 release，贴上 release notes；检查无误后正式创建 release，发布完毕。在本地独立 demo 引用下新版本，看看是否正常。
6. 钉钉群、Gitter 中宣传本次 release：若是小版本发布，可用中文写下核心功能和改进；若是大版本发布，必须有对应的 blog post 详细描述该版本的核心特性和未来规划（对应的 blog post 可于下一周发布）