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

### 7. Paint（绘制）
**文件**: `src/engine/paint.ts`

**浏览器原理**:
- 将渲染树转换为绘制指令（Paint Commands）
- 绘制顺序很重要：
  1. 背景色
  2. 边框
  3. 子元素（递归）
  4. 文本内容
- 这个顺序确保了正确的层叠效果

**我们的实现**:
- 递归遍历 LayoutBox
- 按顺序生成绘制指令：background → border → children → text
- 每个指令包含类型、位置、尺寸、颜色等信息

---

### 8. Composite（合成）
**文件**: `src/engine/composite.ts`

**浏览器原理**:
- 将多个图层合成最终画面
- 某些 CSS 属性会触发独立图层（GPU 加速）
- 独立图层可以单独重绘，不影响其他图层
- 触发条件：transform、opacity < 1、position: fixed、will-change、filter 等

**我们的实现**:
- 分析 LayoutBox 的样式
- 检测触发独立图层的 CSS 属性
- 生成图层列表，标注创建原因

---

## 待实现功能

### ✅ 1. Step Meta 信息（解释"为什么"）- 已实现

**文件**: `src/engine/meta.ts`, `src/components/MetaPanel.vue`

**实现内容**:
- `StepMeta` 类型定义（action/reason/explanation/affectedNodes）
- `FilterReason` 类型 - 记录 Render Tree 过滤原因
- `LayerReason` 类型 - 记录图层创建原因
- 8 个阶段的 Meta 生成函数
- MetaPanel 组件展示所有解释信息

**可回答的问题**:
- 为什么 display:none 不进 Render Tree？
- 为什么 transform 创建独立图层？
- 为什么 head/script 标签被过滤？

---

### ⭐ 2. 对比实验场景（Diff Mode）

**目标**: 同样 DOM，改一个 CSS，对比差异

**功能设计**:
- 左右两栏对比模式
- 高亮差异节点
- 显示：Render Tree 差异、Layout 差异、Paint 指令变化

**预置对比实验**:

| 实验名称 | 场景 A | 场景 B | 教学点 |
|---------|--------|--------|--------|
| display vs visibility | `display: none` | `visibility: hidden` | Render Tree 差异 |
| color vs width | 改 `color` | 改 `width` | 回流 vs 重绘 |
| position static vs absolute | `position: static` | `position: absolute` | 文档流 |
| transform vs left | 用 `left` 移动 | 用 `transform` 移动 | 合成层优化 |

---

### ✅ 3. Engine 与 UI 彻底解耦 - 已实现

**文件**: `src/engine/pipeline.ts`

**实现内容**:
- `runPipeline()` 函数 - 一次调用完成全部 8 个阶段
- `Pipeline` 类 - 支持链式调用
- `PipelineResult` 类型 - 包含所有中间产物 + Meta + 统计信息

**使用示例**:
```typescript
import { runPipeline, createPipeline } from './engine'

// 方式 1: 函数调用
const result = runPipeline({
  html: '<div>Hello</div>',
  css: 'div { color: red; }',
  options: { containerWidth: 800 }
})

// 方式 2: 链式调用
const result2 = createPipeline()
  .setHTML('<div>Hello</div>')
  .setCSS('div { color: red; }')
  .setContainerWidth(800)
  .run()

// 输出 JSON（CLI 使用）
const json = createPipeline()
  .setHTML('<div>Hello</div>')
  .toJSON()
```

**输出结构**:
```typescript
{
  tokens, domTree, cssRules, styledTree,
  renderTree, layoutTree, paintCommands, layers,
  meta: { steps, filterReasons, layerReasons },
  stats: { tokenCount, domNodeCount, ... }
}
```

---

### ✅ 5. 预置 Demo 场景 - 已实现

**文件**: `src/demos/index.ts`, `src/components/DemoSelector.vue`

**5 个 Demo 场景**:

| Demo | 面试问题 | 重点阶段 |
|------|----------|----------|
| display:none vs visibility | 两者有什么区别？ | Render Tree |
| color vs width | 为什么改 color 不回流？ | Layout, Paint |
| position:absolute | 为什么脱离文档流？ | Layout |
| transform 合成层 | 为什么 transform 性能好？ | Composite |
| will-change | 什么时候用 will-change？ | Composite |

**使用方式**:
- 点击顶部「🎯 选择 Demo」按钮
- 选择一个场景，自动填充 HTML/CSS
- 点击「开始解析」查看渲染过程
- 右侧面板显示原理解释

---

### ⭐ 6. 对比实验场景（Diff Mode）

**目标**: 5 个 Demo，每个解决 1 个面试问题

| Demo | 问题 | 演示内容 |
|------|------|----------|
| Demo 1 | 为什么改 color 不回流？ | 对比 color vs width 的 Paint 指令差异 |
| Demo 2 | 为什么 offsetHeight 会触发 Layout？ | 展示强制同步布局的过程 |
| Demo 3 | 为什么 absolute 脱离文档流？ | 对比 static vs absolute 的 Layout 差异 |
| Demo 4 | display:none vs visibility:hidden？ | 对比 Render Tree 差异 |
| Demo 5 | 为什么 transform 性能好？ | 展示合成层，不触发回流重绘 |

---

### ⭐ 5. 可视化增强（D3 升级）

**目标**: 用动画展示渲染流程

**增强点**:
- DOM Tree 节点生长动画
- Layout 盒子展开动画
- Paint 指令逐条执行动画
- 节点高亮联动（点击任意视图，其他视图同步高亮）

**注意**: D3 只在 UI 层，永远不进 Engine

---

## 优先级排序

1. ~~**Step Meta 信息**~~ ✅ 已完成
2. ~~**Engine 解耦 + Pipeline**~~ ✅ 已完成
3. ~~**预置 Demo 场景**~~ ✅ 已完成
4. **对比实验模式** - 面试官眼前一亮的功能
5. **可视化动画** - 锦上添花

---

## 参考资料

- [HTML Living Standard - Tokenization](https://html.spec.whatwg.org/multipage/parsing.html#tokenization)
- [How Browsers Work](https://web.dev/howbrowserswork/)
- [浏览器渲染原理](https://developer.mozilla.org/zh-CN/docs/Web/Performance/How_browsers_work)
- [Rendering Performance](https://web.dev/rendering-performance/)
- [CSS Triggers](https://csstriggers.com/) - 哪些属性触发回流/重绘
