# 构建解析模块

## 设计原理

### `builder.Args`参数表

- 记录网络构建过程中的模型
- 记录网络构建过程中的损失函数
- 记录网络构建过程中的优化器
- 记录网络构建过程中的数据
- 记录网络构建过程中的参数

### `builder.Action`行为表

- 将构建过程抽象为一系列的行为`builder.ActionCode`
- 对每一种行为可执行对应的动作

### `builder.Transit`流通器

- 按照`Action`列表完成一次迭代

### `builder.Build`构建器

- 完成网络模型的构建
- 完成网络模型的验证
- 完成网络模型的存储

---

Copyright © 2024 PMoS. All rights reserved.