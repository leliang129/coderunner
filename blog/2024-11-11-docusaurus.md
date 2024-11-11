---
slug: docusaurus
title: docusaurus代码块使用
authors: [1cobot]
tags: [docusaurus]
date: 2024-11-11
---
在 Docusaurus 中实现代码块的多个选项卡可以使用其提供的 `Tabs` 和 `TabItem` 组件。这些组件允许你创建一个选项卡式的界面，并在不同选项卡中展示不同的代码块或内容。

## 实现步骤
 - 使用 `Tabs` 组件包裹不同的 `TabItem` 组件。
 - 在每个 `TabItem` 中放置对应的代码块或内容。
   
下面是一个示例，展示如何实现多语言的代码选项卡（比如 `JavaScript` 和 `Python` ）：


import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

<Tabs>
  <TabItem value="javascript" label="JavaScript">

```javascript
function helloWorld() {
  console.log("Hello, World!");
}
```

  </TabItem>
  <TabItem value="python" label="Python">

```python
def hello_world():
    print("Hello, World!")
```

  </TabItem>
</Tabs>


### 说明
- `value`：每个 `TabItem` 的唯一标识符，用于区分不同的选项卡。
- `label`：选项卡上显示的文本标签。
- 代码块中的语言标识符（如 `javascript`、`python`）将启用相应的语法高亮。

### 效果
这种方法可以创建一个界面，其中每个选项卡对应不同的编程语言或内容，并且用户可以通过点击不同的选项卡来查看不同的代码块。