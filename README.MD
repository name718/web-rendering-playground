# 🌐 Browser Rendering Playground

[![License: CC BY-NC 4.0](https://img.shields.io/badge/License-CC%20BY--NC%204.0-lightgrey.svg)](https://creativecommons.org/licenses/by-nc/4.0/)
[![Deploy](https://img.shields.io/badge/Demo-Vercel-black)](https://web-rendering-playground.vercel.app/)

> 可视化浏览器渲染流水线，让抽象的渲染原理"看得见"

🔗 **在线体验**: [https://web-rendering-playground.vercel.app/](https://web-rendering-playground.vercel.app/)

## ✨ 功能特性

### 🔄 完整渲染流水线可视化

展示浏览器从 HTML 到页面的 8 个核心阶段：

| 阶段 | 说明 |
|------|------|
| **Tokenize** | HTML 词法分析，逐字符扫描生成 Token |
| **DOM Build** | 语法分析，构建 DOM 树 |
| **CSS Parse** | 解析 CSS，生成 CSSOM |
| **Style Compute** | 选择器匹配，计算最终样式 |
| **Render Tree** | 过滤不可见节点，生成渲染树 |
| **Layout** | 计算盒模型，确定位置和大小 |
| **Paint** | 生成绘制指令 |
| **Composite** | 分析合成层 |

### 📖 原理解析面板

每一步都能回答"为什么"：
- 为什么 `display:none` 不进 Render Tree？
- 为什么 `transform` 创建独立图层？
- 为什么改 `color` 不触发回流？

### 🎯 预置 Demo 场景

5 个面试高频问题，一键加载：
- `display:none` vs `visibility:hidden`
- 改 `color` vs 改 `width`（回流 vs 重绘）
- `position:absolute` 脱离文档流
- `transform` 合成层优化
- `will-change` 使用场景

### 🔀 Diff 对比模式

同样的 HTML，不同的 CSS，对比渲染差异：
- Render Tree 节点数变化
- Paint 指令数变化
- 合成层数量变化
- 自动生成分析结论

### ⏯️ 时间轴控制

- ▶️ 自动播放 Token 解析过程
- ⏮️ ⏭️ 单步前进/后退
- 🎚️ 速度调节
- 源码高亮同步

## 🛠️ 技术栈

- **Vue 3** + Composition API
- **TypeScript** - 类型安全
- **Pinia** - 状态管理
- **D3.js** - 树形可视化
- **UnoCSS** - 原子化 CSS
- **Vite** - 构建工具

## 🏗️ 架构设计

```
src/
├── engine/          # 纯计算引擎（零 UI 依赖）
│   ├── tokenizer.ts
│   ├── dom-builder.ts
│   ├── css-parser.ts
│   ├── style-computer.ts
│   ├── render-tree.ts
│   ├── layout.ts
│   ├── paint.ts
│   ├── composite.ts
│   ├── meta.ts      # Meta 信息生成
│   └── pipeline.ts  # 统一流水线 API
├── components/      # Vue 组件
├── stores/          # Pinia 状态
├── demos/           # 预置 Demo
└── types/           # TypeScript 类型
```

Engine 与 UI 完全解耦，支持：
- 单元测试
- CLI 使用
- JSON 输出

## 🚀 本地开发

```bash
# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev

# 构建生产版本
pnpm build
```

## 📄 License

本项目采用 [CC BY-NC 4.0](https://creativecommons.org/licenses/by-nc/4.0/) 协议。

- ✅ 可以自由分享、修改
- ✅ 需要注明出处
- ❌ **禁止商业用途**
