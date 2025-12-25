# 浏览器原理实现记录

本文档记录项目中每个模块对应的浏览器原理。

---

## 已实现

### 1. HTML Tokenizer（词法分析器）
**文件**: `src/engine/tokenizer.ts`

**浏览器原理**:
- 浏览器接收到 HTML 字节流后，首先进行**词法分析（Tokenization）**
- 将 HTML 字符串拆分成一个个 Token（标记）
- Token 类型包括：DOCTYPE、StartTag、EndTag、SelfClosingTag、Text、Comment
- 这是一个**状态机**过程，逐字符扫描，根据当前状态决定如何处理

**我们的实现**:
- 简化版状态机，支持基本的 HTML 标签、属性、文本、注释解析
- 记录每个 Token 在源码中的位置（start, end）

---

### 2. DOM Tree Builder（语法分析器）
**文件**: `src/engine/dom-builder.ts`

**浏览器原理**:
- 接收 Tokenizer 产生的 Token 流
- 使用**栈结构**维护当前打开的标签
- 遇到 StartTag 入栈，遇到 EndTag 出栈
- 逐步构建 DOM 树结构
- 处理自闭合标签、嵌套关系

**我们的实现**:
- 创建 document 根节点
- 维护节点栈，处理标签的父子关系
- 生成带 id 的 DOM 节点，便于可视化

---

### 3. CSS Parser（CSS 解析器）
**文件**: `src/engine/css-parser.ts`

**浏览器原理**:
- 解析 CSS 字符串，生成 CSSOM（CSS Object Model）
- CSS 解析也是词法分析 + 语法分析的过程
- 解析选择器、声明块（属性: 值）
- 计算选择器优先级（Specificity）

**我们的实现**:
- 简化版 CSS 解析器，支持基本选择器和声明
- 计算优先级：[inline, id, class, element] 四元组
- 跳过注释处理

---

### 4. Style Computation（样式计算）
**文件**: `src/engine/style-computer.ts`

**浏览器原理**:
- 将 CSSOM 中的规则匹配到 DOM 节点
- 计算每个节点的最终样式（Computed Style）
- 处理选择器匹配（元素、类、ID、后代选择器）
- 处理样式继承（color、font-size 等可继承属性）
- 处理优先级层叠（Specificity）

**我们的实现**:
- 递归遍历 DOM 树，为每个节点计算样式
- 支持元素选择器、类选择器、ID 选择器、后代选择器
- 按优先级排序规则，后面的覆盖前面的
- 处理可继承属性的继承

---

### 5. Render Tree（渲染树）
**文件**: `src/engine/render-tree.ts`

**浏览器原理**:
- DOM Tree + Computed Style → Render Tree
- 只包含可见节点
- `display: none` 的节点不在渲染树中
- `<head>`、`<script>`、`<style>` 等不渲染的标签被过滤
- 每个渲染节点包含最终样式信息

**我们的实现**:
- 递归遍历 StyledNode，过滤不可见节点
- 过滤 `display: none`
- 过滤 head、script、style、meta 等标签
- 生成精简的 RenderNode 结构

---

### 6. Layout（布局/回流）
**文件**: `src/engine/layout.ts`

**浏览器原理**:
- 计算每个节点的几何信息：位置（x, y）、大小（width, height）
- 盒模型计算：content、padding、border、margin
- 块级元素默认占满父容器宽度
- 高度由内容决定（除非显式指定）

**我们的实现**:
- 简化版块级布局算法
- 解析 CSS 长度值（px、%）
- 计算盒模型各部分
- 递归计算子节点位置
- 生成 LayoutBox 结构用于可视化

---

## 待实现

### 7. Paint（绘制）
**浏览器原理**:
- 将渲染树转换为绘制指令
- 确定绘制顺序（z-index、层叠上下文）
- 生成图层（Layer）

### 8. Composite（合成）
**浏览器原理**:
- 将多个图层合成最终画面
- GPU 加速
- transform、opacity 等属性触发独立图层

---

## 参考资料

- [HTML Living Standard - Tokenization](https://html.spec.whatwg.org/multipage/parsing.html#tokenization)
- [How Browsers Work](https://web.dev/howbrowserswork/)
- [浏览器渲染原理](https://developer.mozilla.org/zh-CN/docs/Web/Performance/How_browsers_work)
