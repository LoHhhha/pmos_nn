# 网络解析模块

## 设计原理

### `net.abstract`抽象层

将网络元素分为：

- 输入层节点`InputNode`
    - `to_data`记录数据流向的算子节点
- 算子节点`LayerNode`
    - `from_data`记录数据从哪个算子节点流入
    - `api_name`记录算子类型
    - `layer_node`记录算子实现层对象
- 输出层节点`OutputNode`
    - `from_data`记录数据从哪个算子节点流入

### `net.layer`实现层

- `forward_code`生成前向传播代码
- `init_code`生成初始化代码

### `net.parser`解析层

- 对算子节点形成的图进行拓扑排序并校验
- 按拓扑排序解算结果为节点赋变量名
- 按拓扑排序解算结果为节点生成代码

## 目录结构

```
net
 ├─abstract         抽象层
 ├─layer            实现层
 │  ├─tensorflow      Tensorflow算子适配器
 │  └─torch           Pytorch算子适配器
 ├─parser           解析层
 ├─struct           结构类
 └─template         模板类
```

---

Copyright © 2024 PMoS. All rights reserved.