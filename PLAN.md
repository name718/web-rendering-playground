开发计划
Phase 1：基础架构 + HTML 解析（1-2 周）
项目脚手架搭建（React/Vue + TypeScript + Canvas/SVG）
核心数据模型定义（Token、Node、DOM Tree 结构）
HTML Tokenizer 实现（词法分析）
DOM Tree Builder 实现（语法分析）
基础 UI 框架：Source Panel + Visualization Canvas + Timeline
Phase 2：CSS 解析 + CSSOM（1 周）
CSS Tokenizer + Parser
CSSOM 数据结构
Selector 匹配引擎（简化版）
优先级计算
Phase 3：Render Tree + Layout（1-2 周）
DOM + CSSOM → Render Tree 合并逻辑
盒模型计算（content/padding/border/margin）
基础布局算法（block、inline）
Layout 可视化（盒模型高亮）
Phase 4：时间轴系统（1 周）
Action/State 架构实现
播放/暂停/单步/回退控制
状态快照 + 时间旅行
Phase 5：Paint + Reflow/Repaint 演示（1 周）
Paint 顺序可视化
Layer 概念展示
JS 修改样式触发 Reflow/Repaint 的演示
Phase 6：打磨 + 示例（持续）
内置多个教学示例
交互优化、动画效果
文档 + 部署


Vue 3 + TypeScript
Vite
Pinia（状态管理）
D3.js（树形可视化）
Canvas（Layout 盒模型）
UnoCSS 或 Tailwind CSS（样式）
