# 什么是`PMoS`？<br>What is `PMoS`?

`PMoS`旨在创建一个深度学习一站式开发平台，使用可视化编程的方式完成模型构建、模型训练、模型部署全流程。

`PMoS`, which stands for Produce your Module at one Site. We strive to build a platform using visual programming that
allows most people to enjoy the process of building deep-learning modules.

# 构建方案<br>Build Approaches

`PMoS`将分为多个模块来完成整体的构建，包括：

- 网络构建、网络训练支持模块`flowing`
- 其余模块正在计划中...

`PMoS` will be divided into multiple modules to complete the overall construction, including:

- network construction and network training support module `flowing`
- other modules are currently under planning...

# 模块说明<br>Modules

## 模块`flowing`<br>`flowing` Module

### 功能<br>Function

支持流程式定义网络，指定输入节点、算子节点、输出节点及其数据流向即可完成网络定义；支持流程式定义训练流程，指定每个步中的数据操作即可完成训练过程的定义。

`flowing` supports defining networks in a workflow-like manner. You just need to specify the input nodes, operator
nodes, output nodes, and their data flow directions to complete the network definition. It also supports defining the
training process in a similar way. Just specify the data operations in each step to complete the definition of the
training process.

### 代码形式调用<br>Using by Code

`./demo`中可找到相关的示例，其中网络的定义示例项目为`net_generate`，网络的训练示例项目为`segment`。

You can find relevant examples in `./demo`. The example project for network definition is `net_generate`, and the
example project for network training is `segment`.

### Web服务形式调用<br>Using by Web

#### 启动方法<br>How to Boot

1. 访问`flowing`部署在`https://pmos.lohhhha.cn`的在线服务。
2. 按以下步骤本地启动`flowing`服务：
    1. 准备`flowing`的whl包，可以在本项目仓库下载，也可以自行下载源码打包。
    2. 在选定Python环境中安装`flowing`，推荐的Python版本为3.12，需要的依赖会自动获取。
         ```bash
         pip install flowing-xxxx.whl
         ```
    3. 启动`flowing`服务。
        ```bash
        python -m server.runner --port 54321 --host 127.0.0.1 --log_level INFO
        ```
    4. 根据启动参数，打开对应的Web服务，例如：`127.0.0.1:54321`。

<br>

1. Access the online service of `flowing` deployed at https://pmos.lohhhha.cn.
2. Follow these steps to start the `flowing` service locally:
    1. Prepare the whl package of flowing. You can download it from this repository or package it yourself by
       downloading the source code.
    2. Install flowing in the selected Python environment. The recommended Python version is 3.12, and the required
       dependencies will be obtained automatically.
         ```bash
         pip install flowing-xxxx.whl
         ```
    3. Start the `flowing` service.
         ```bash
         python -m server.runner --port 54321 --host 127.0.0.1 --log_level INFO
         ```
    4. Open the corresponding Web service according to the startup parameters, such as `127.0.0.1:54321`.

#### 使用方法<br>How to Use

- 按住鼠标左键并拖动左侧节点栏中的节点模板，松开后可将节点添加到画布指定位置中。
- 单击鼠标左键点击画布中的节点，在右侧弹出的配置框中配置节点属性。
- 按住鼠标左键并拖动画布中的节点，可改变节点的位置。
- 按住鼠标左键并拖动画布，可改变视窗位置。
- 单击鼠标右键点击画布中的节点，弹出右键菜单。
- 单击鼠标右键点击画布空白位置，弹出右键菜单。
- 按住键盘Ctrl键并单击鼠标左键点击画布中的节点，可多选节点。
- 在画布空白区域按住键盘Ctrl键并滚动鼠标滚轮，可缩放视窗。
- 按住鼠标左键并拖动右侧地图，可移动视窗。
- 按住鼠标左键并拖动画布中的节点的输出端点（下方端点）到其余节点的输入端点（上方节点），松开后可建立两个节点的数据流。
- 完成网络定义后，点击`calculate`按键，生成代码文件。

<br>

- Hold down the left mouse button and drag the node template in the left node bar. Release the button and create node to
  the specified position in the canvas.
- Click the left mouse button on the node in the canvas, and configure the node properties in the configuration box that
  pops up on the right.
- Hold down the left mouse button and drag the node in the canvas to change the position of the node.
- Hold down the left mouse button and drag the canvas to change the position of the viewport.
- Click the right mouse button on the node in the canvas to pop up the right-click menu.
- Click the right mouse button in the blank area of the canvas to pop up the right-click menu.
- Hold down the Ctrl key on the keyboard and click the left mouse button on the node in the canvas to multi-select
  nodes.
- Hold down the Ctrl key on the keyboard and scroll the mouse wheel in the blank area of the canvas to zoom in or out of
  the viewport.
- Hold down the left mouse button and drag the map on the right to move the viewport.
- Hold down the left mouse button and drag the output endpoint (at the lower end) of the node in the canvas to the input
  endpoint (at the upper end) of another node. Release the button to establish the data flow between the two nodes.
- After completing the network definition, click the `calculate` button to generate the code file.