# 浏览器原理可视化工具（Browser Internals Visualizer）

## 一、项目一句话定位（非常重要）

> **一个用“可视化 + 时间轴”的方式，演示浏览器从 HTML → 页面渲染全过程的学习工具**

不是模拟 Chrome 全部实现，而是：

* **还原关键阶段**
* **让抽象过程“看得见”**
* 面向 **前端工程师 / 学习原理的人**

---

## 二、目标用户 & 使用场景

### 🎯 目标用户

* 1–5 年前端
* 正在学浏览器原理 / 面试
* 想“真正理解”而不是背概念

### 📌 使用场景

* 打开一个 HTML 示例
* 点击「开始解析」
* 按时间轴看到：

  * DOM 是怎么生成的
  * CSS 如何影响渲染
  * 回流 / 重绘什么时候发生

---

## 三、整体架构设计（核心）

### 🧱 架构分层

```txt
┌────────────────────────┐
│   Visualization Layer  │  ← 画面 & 动画 & 交互
├────────────────────────┤
│   Simulation Engine    │  ← 浏览器流程模拟
├────────────────────────┤
│   Data Model Layer     │  ← DOM / CSSOM / RenderTree
├────────────────────────┤
│   Input Layer          │  ← HTML / CSS / JS 示例
└────────────────────────┘
```

你这个项目**不是 UI 项目**，而是 **Simulation Engine 驱动 UI**。

---

## 四、核心模块设计（重点）

### 1️⃣ HTML 解析模块（Parser）

#### 功能

* 将 HTML 字符串解析为：

  * Token
  * Node
  * DOM Tree

#### 可视化

* 左侧：HTML 源码
* 中间：Token 流（逐个高亮）
* 右侧：DOM 树动态生长

#### 强调概念

* 词法解析
* 标签栈
* 自闭合标签
* script 阻塞解析

---

### 2️⃣ CSS 解析 & CSSOM

#### 功能

* 解析 CSS 规则
* 构建 CSSOM

#### 可视化

* CSS 规则列表
* Selector 匹配过程
* 每个 DOM 节点的匹配结果

#### 可解释内容

* Selector 优先级
* 样式合并顺序
* 继承 vs 非继承

---

### 3️⃣ Render Tree 构建

#### 功能

* DOM + CSSOM → Render Tree

#### 可视化

* 对比：

  * DOM Tree
  * Render Tree（display:none 节点消失）
* 样式计算后的节点

#### 强调

* 为什么要 Render Tree
* 为什么 DOM ≠ Render Tree

---

### 4️⃣ Layout（回流）

#### 功能

* 计算盒模型
* 宽高 / 位置

#### 可视化（非常亮点）

* 页面中显示盒模型
* 实时显示：

  * content / padding / border / margin
* 改变样式触发重新计算

#### 可演示

* width / height
* position / flex / inline

---

### 5️⃣ Paint & Composite（绘制 & 合成）

#### 功能

* 绘制指令生成
* 图层概念

#### 可视化

* Paint 顺序时间轴
* Layer 分层展示
* transform / opacity 创建新层

---

### 6️⃣ Reflow & Repaint 触发演示

#### 功能

* 模拟 JS 修改样式

#### 可视化

* 哪一步被触发
* 哪些节点受影响
* 高亮耗性能操作

#### 示例操作

* 修改 width
* 修改 color
* 读取 offsetHeight

---

## 五、时间轴系统（这个是灵魂）

### 时间轴本质

你不是一次性渲染，而是：

```txt
Step 1: Parse HTML
Step 2: Build DOM
Step 3: Parse CSS
Step 4: Build CSSOM
Step 5: Build Render Tree
Step 6: Layout
Step 7: Paint
```

### 用户交互

* ▶ 播放
* ⏸ 暂停
* ⏭ 单步执行
* ⏮ 回退一步

### 技术思想（不写代码）

* 每一步是一个 **Action**
* Action 产生 **State Diff**
* UI 只负责渲染 State

👉 这就是 **“时间旅行调试”思想**

---

## 六、UI 结构建议（偏工程）

```txt
┌───────────────┬────────────────────────┐
│ Source Panel  │ Visualization Canvas   │
│ HTML / CSS    │ DOM / Render / Layout  │
├───────────────┴────────────────────────┤
│ Timeline & Controls                     │
└────────────────────────────────────────┘
```

HTML 字符串 → Token 数组 → DOM 树对象 → JSON 显示