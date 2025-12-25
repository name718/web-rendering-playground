/**
 * 预置 Demo 场景
 * 每个 Demo 解决一个面试常见问题
 */

export interface Demo {
  id: string
  title: string
  question: string      // 面试问题
  answer: string        // 简短答案
  html: string
  css: string
  highlight: string[]   // 重点关注的阶段
}

export const demos: Demo[] = [
  {
    id: 'display-none-vs-visibility',
    title: 'display:none vs visibility:hidden',
    question: 'display:none 和 visibility:hidden 有什么区别？',
    answer: 'display:none 完全从渲染树移除，不占空间；visibility:hidden 仍在渲染树中，占据空间但不可见。',
    html: `<div class="container">
  <div class="box hidden-display">display:none</div>
  <div class="box hidden-visibility">visibility:hidden</div>
  <div class="box visible">可见元素</div>
</div>`,
    css: `.container {
  padding: 10px;
}
.box {
  width: 100px;
  height: 30px;
  margin: 5px;
  background: #3b82f6;
}
.hidden-display {
  display: none;
}
.hidden-visibility {
  visibility: hidden;
}`,
    highlight: ['build-render-tree']
  },
  
  {
    id: 'color-vs-width',
    title: '改 color vs 改 width',
    question: '为什么改 color 不会触发回流，改 width 会？',
    answer: 'color 是非几何属性，只触发重绘(Repaint)；width 是几何属性，会触发回流(Reflow)+重绘。',
    html: `<div class="box">
  <p class="text">这是一段文字</p>
</div>`,
    css: `.box {
  width: 200px;
  padding: 20px;
  background: #1e293b;
}
.text {
  color: #3b82f6;
  font-size: 16px;
}`,
    highlight: ['layout', 'paint']
  },
  
  {
    id: 'position-absolute',
    title: 'absolute 脱离文档流',
    question: '为什么 position:absolute 会脱离文档流？',
    answer: 'absolute 定位元素相对于最近的定位祖先定位，不再参与正常的块级布局流，不影响其他元素位置。',
    html: `<div class="container">
  <div class="normal">正常流元素1</div>
  <div class="absolute">absolute定位</div>
  <div class="normal">正常流元素2</div>
</div>`,
    css: `.container {
  position: relative;
  padding: 10px;
  background: #1e293b;
}
.normal {
  background: #3b82f6;
  padding: 10px;
  margin: 5px 0;
}
.absolute {
  position: absolute;
  top: 10px;
  right: 10px;
  background: #ef4444;
  padding: 10px;
}`,
    highlight: ['layout']
  },
  
  {
    id: 'transform-layer',
    title: 'transform 创建合成层',
    question: '为什么 transform 动画性能比 left/top 好？',
    answer: 'transform 会创建独立合成层，在 GPU 上处理，不触发回流和重绘；left/top 改变会触发回流。',
    html: `<div class="container">
  <div class="box use-transform">transform</div>
  <div class="box use-left">left/top</div>
</div>`,
    css: `.container {
  position: relative;
  height: 100px;
}
.box {
  width: 80px;
  height: 30px;
  background: #3b82f6;
  margin: 10px;
}
.use-transform {
  transform: translateX(50px);
}
.use-left {
  position: relative;
  left: 50px;
}`,
    highlight: ['composite']
  },
  
  {
    id: 'will-change',
    title: 'will-change 优化',
    question: 'will-change 是什么？什么时候用？',
    answer: 'will-change 提示浏览器元素将发生变化，提前创建合成层。用于即将有动画的元素，但不要滥用。',
    html: `<div class="container">
  <div class="box optimized">will-change</div>
  <div class="box normal">普通元素</div>
</div>`,
    css: `.container {
  padding: 10px;
}
.box {
  width: 100px;
  height: 30px;
  background: #3b82f6;
  margin: 10px;
}
.optimized {
  will-change: transform;
}`,
    highlight: ['composite']
  }
]

/**
 * 根据 ID 获取 Demo
 */
export function getDemoById(id: string): Demo | undefined {
  return demos.find(d => d.id === id)
}
