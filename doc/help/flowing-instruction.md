# `flowing` 使用说明<br>`flowing` Instruction

注意：由于项目正在不断迭代，本说明可能包含过时的演示动画，请以实际呈现为准。
<br>
Note: Because the project is in continuous iteration, this instruction may contain outdated demonstration animations, please refer to the actual presentation.

## 设计网络结构<br>Build Network Structure

- 通过分类列表、搜索框寻找需要的算子。<br>Find what you need in the operator bar, or try to search them directly.

  ![get_node](../gif/get_node.gif)

- 按住鼠标左键并拖动左侧节点栏中的节点模板，松开后可将节点添加到画布指定位置中。<br>Hold down the left mouse button and drag the node template in the left operation bar. Release the button and create node to the specified position in the canvas.
  
  ![create_node](../gif/create_node.gif)

- 单击鼠标左键点击画布中的节点，在右侧弹出的配置框中配置节点属性。<br>Click the left mouse button on the node in the canvas, and configure the node properties in the configuration box that pops up on the right.

  ![edit_node](../gif/edit_node.gif)

- 按住鼠标左键并拖动画布中的节点，可改变节点的位置。<br>Hold down the left mouse button and drag the node in the canvas to change the position of the node.

  ![drag_node](../gif/drag_node.gif)

- 按住鼠标左键并拖动画布中的节点的输出端点（下方端点）到其余节点的输入端点（上方端点），松开后可建立两个节点的数据流。<br>Hold down the left mouse button and drag the output endpoint (at the lower end) of the node in the canvas to the input endpoint (at the upper end) of another node. Release the button to establish the data flow between the two nodes.

  ![connect](../gif/connect.gif)

- 按住鼠标左键并拖动画布中的节点的输入端点（上方端点）到空白处即可断开节点间的数据流；到另一个输入端点（上方端点）即可调整数据流。<br>Hold down the left mouse button. Drag the input endpoint (at the upper end) of a node, which is connected to an output endpoint (at the lower end), to the blank area of the canvas. Release the button to cancel the data flow between the two nodes. Or, drag it to another input endpoint (at the upper end) and release the button to change the data flow.

  ![connect_change](../gif/connect_change.gif)

## 设计辅助<br>Design Aids

- 点击算子名称，查看算子介绍。<br>Click on the name of the operator to see the introduction to the operator.

  ![node_introduction](../gif/node_introduction.gif)

- 点击提示推测错误的连线Shape信息，查看错误原因帮助修正模型。<br>Click on the prompt which inferring the incorrect Shape of connection, to view the error reason and help correct the model.

  ![checkout_shape_calc](../gif/checkout_shape_calc.gif)

- 点击`tidy`按钮，自动整理画布中的节点。<br>Click the `tidy` button to automatically organize the nodes in the canvas.

  ![tidy_nodes](../gif/tidy_nodes.gif)

## 画布操作指南<br>Canvas Operation Guide

- 点击`move`按钮或`select`按钮，切换画布拖动模式。<br>Click the `move` or `select` button to switch the mode of dragging canvas.

  ![drag_mode_switch](../gif/drag_mode_switch.gif)

- 按住`ctrl`键，按住鼠标左键并拖动画布时将短暂反转画布拖动模式。<br>Holding down the `ctrl` key while holding down the left mouse button and dragging the canvas will briefly reverse the mode of dragging canvas.

  ![temp_change_drag_mode](../gif/temp_change_drag_mode.gif)

- 在`move`模式下，按住鼠标左键并拖动画布，可改变视窗位置。<br>Hold down the left mouse button and drag the canvas to change the position of the viewport on the `move` mode.

  ![drag_viewport](../gif/drag_viewport.gif)

- 在`select`模式下，按住鼠标左键并拖动画布，可框选画布中的节点。<br>Hold down the left mouse button and drag the canvas to select nodes in the canvas on the `select` mode.

  ![select_nodes](../gif/select_nodes.gif)

- 在画布空白区域按住键盘Ctrl键并滚动鼠标滚轮，可缩放视窗。<br>Hold down the Ctrl key on the keyboard and scroll the mouse wheel in the blank area of the canvas to zoom in or out of the viewport.

  ![zoom](../gif/zoom.gif)

- 按住鼠标左键并拖动右侧地图，可移动视窗。<br>Hold down the left mouse button and drag the map on the right to move the viewport.

  ![drag_map](../gif/drag_map.gif)

- 点击`clear`按钮，清空画布。<br> Click the `clear` button to clear the canvas.

  ![clear](../gif/clear.gif)

## 生成网络结构<br>Generate Network Code

- 完成网络定义后，点击`calculate`按钮，生成代码文件。<br>After completing the network definition, click the `calculate` button to generate the code file.

  ![calculate](../gif/calculate.gif)

## 更多进阶技巧<br>More Advanced Tricks

- 单击鼠标右键点击画布中的节点/单击鼠标右键点击画布空白位置，弹出右键菜单。<br>Click the right mouse button on the node in the canvas or the blank area of the canvas to pop up the right-click menu.

  ![right-key-menu](../gif/right-key-menu.gif)

- 按住键盘Ctrl键并单击鼠标左键点击画布中的节点，可多选节点。<br>Hold down the Ctrl key on the keyboard and click the left mouse button on the node in the canvas to multi-select nodes.

  ![multiple_choice](../gif/multiple_choice.gif)

- 点击`export`按钮，导出画布中的节点、节点参数及连接结构。<br>Click the `export` button to export the nodes, node's parameters, and connection structure in the canvas.

  ![export_nodes](../gif/export_nodes.gif)

- 点击`import`按钮，导入先前导出的节点、节点参数及连接结构。<br>Click the `import` button to import the previously exported nodes, nodes parameters, and connection structure.

  您可以在[这里](../example/flowing/web/)找到一些示例。<br>You can find some examples in [here](../example/flowing/web/).

  ![import_nodes](../gif/import_nodes.gif)
