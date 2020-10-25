## Slot Chain

- `StatPrepareSlot`：处于整个 chain 最开始的部分，用于初始化一些必要的统计结构。执行方式为顺序执行，不应出现异常。
- `RuleCheckerSlot`：用于规则检查，执行方式为顺序执行，规则检查的状态包装在返回值内 `TokenResult`。若返回状态不为 Blocked 则继续执行，若为 Blocked 则中断执行并返回 Blocked。
- `StatSlot`：根据规则检查的结果，更新统计数据并做一些额外的记录（如记录日志、将事件透传给外部）。StatSlot 包含三个函数：`OnEntryPassed`（允许通过时触发）、`OnEntryBlocked`（请求被拒绝时触发）和 `OnCompleted`（请求完成时触发）。

Slot 的每次 Entry 传递当前的 EntryContext。

## TokenResult

TokenResult 由每个 RuleCheckerSlot 返回，指示控制行为：

- `ResultStatusPass`: 当前 slot 允许通过，可以执行后续的 slot
- `ResultStatusBlocked`: 当前 slot 拒绝通过，中断 slot 执行
- `ResultStatusShouldWait`: 当前 slot 允许通过，但须等待一段时间

## BlockError

BlockError 代表该调用被 Sentinel 拒绝，可通过 BlockType 获取规则触发类型。BlockError 需遵循以下规范：

- BlockError 由 `BlockType` 决定分类。
- `Error()` 返回结果需要以 `SentinelBlockError: ${blockType}` 开头。如果有额外的信息，则置于 `blockMsg` 中。
- RuleCheckerSlot 返回的 BlockError 必须携带触发的规则（`rule`），并且应尽量携带当时的触发值（`snapshotValue`）。相关 slot 的注释信息应详细包含触发值的类型和描述。

TBD：热点参数的携带方式