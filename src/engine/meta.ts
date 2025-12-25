/**
 * Step Meta Generator - 为每个渲染阶段生成"为什么"的解释
 */

import type { StepMeta, FilterReason, LayerReason } from '../types'
import type { StyledNode } from './style-computer'
import type { Layer } from './composite'

// 不可见标签列表
const NON_VISUAL_TAGS = ['head', 'script', 'style', 'meta', 'link', 'title']

/**
 * 分析 Render Tree 过滤原因
 * 回答：为什么某些节点没有进入 Render Tree？
 */
export function analyzeFilterReasons(styledNode: StyledNode): FilterReason[] {
  const reasons: FilterReason[] = []
  
  function traverse(node: StyledNode) {
    const nodeName = node.node.tagName || node.node.textContent?.slice(0, 20) || 'unknown'
    
    // 检查 display: none
    if (node.computedStyle.display === 'none') {
      reasons.push({
        nodeId: node.node.id,
        nodeName,
        reason: 'display-none',
        explanation: 'display:none 完全从渲染树移除，不占据任何空间。与 visibility:hidden 不同，后者仍占据空间但不可见。'
      })
    }
    
    // 检查非可视标签
    if (node.node.tagName && NON_VISUAL_TAGS.includes(node.node.tagName.toLowerCase())) {
      reasons.push({
        nodeId: node.node.id,
        nodeName,
        reason: 'non-visual-tag',
        explanation: `<${node.node.tagName}> 是非可视标签，不产生渲染内容。这类标签用于元数据、脚本或样式定义。`
      })
    }
    
    // 检查空文本节点
    if (node.node.type === 'text' && !node.node.textContent?.trim()) {
      reasons.push({
        nodeId: node.node.id,
        nodeName: '(空白文本)',
        reason: 'empty-text',
        explanation: '空白文本节点（只包含空格、换行）通常会被忽略，除非在 white-space: pre 等情况下。'
      })
    }
    
    node.children.forEach(traverse)
  }
  
  traverse(styledNode)
  return reasons
}

/**
 * 分析图层创建原因
 * 回答：为什么某些节点创建了独立图层？
 */
export function analyzeLayerReasons(layers: Layer[]): LayerReason[] {
  const reasons: LayerReason[] = []
  
  const explanations: Record<string, string> = {
    'transform': 'transform 属性会创建合成层，在 GPU 上处理，不触发回流和重绘，性能最优。',
    'opacity': 'opacity < 1 会创建合成层，透明度变化只需要合成，不需要重绘。',
    'position: fixed': 'fixed 定位元素相对于视口固定，创建独立图层可以在滚动时高效处理。',
    'will-change': 'will-change 提示浏览器该元素将发生变化，提前创建合成层优化性能。',
    'filter': 'filter 效果（如 blur、drop-shadow）需要独立图层来应用滤镜。',
    'root': '根图层是整个页面的基础图层，所有其他内容都在其上绘制。'
  }
  
  layers.forEach(layer => {
    if (layer.reason !== 'root') {
      reasons.push({
        nodeId: layer.id,
        nodeName: layer.name,
        trigger: layer.reason,
        explanation: explanations[layer.reason] || `${layer.reason} 触发了独立图层创建。`
      })
    }
  })
  
  return reasons
}

/**
 * 生成 Tokenize 阶段的 Meta
 */
export function generateTokenizeMeta(tokenCount: number): StepMeta {
  return {
    step: 'tokenize',
    action: `将 HTML 字符串解析为 ${tokenCount} 个 Token`,
    reason: '词法分析是解析的第一步，将字符流转换为有意义的标记',
    explanation: '浏览器使用状态机逐字符扫描 HTML，识别标签、属性、文本等。这是一个流式过程，边接收边解析。'
  }
}

/**
 * 生成 DOM 构建阶段的 Meta
 */
export function generateDOMBuildMeta(nodeCount: number): StepMeta {
  return {
    step: 'build-dom',
    action: `构建包含 ${nodeCount} 个节点的 DOM 树`,
    reason: '将扁平的 Token 流转换为树形结构，建立父子关系',
    explanation: '使用栈结构处理标签嵌套：遇到开始标签入栈，遇到结束标签出栈。这确保了正确的层级关系。'
  }
}

/**
 * 生成 CSS 解析阶段的 Meta
 */
export function generateCSSParseMeta(ruleCount: number): StepMeta {
  return {
    step: 'parse-css',
    action: `解析出 ${ruleCount} 条 CSS 规则`,
    reason: '将 CSS 文本转换为结构化的规则对象，便于后续匹配',
    explanation: 'CSS 解析生成 CSSOM（CSS Object Model），包含选择器和声明。同时计算选择器优先级（Specificity）。'
  }
}

/**
 * 生成样式计算阶段的 Meta
 */
export function generateStyleComputeMeta(): StepMeta {
  return {
    step: 'build-cssom',
    action: `为 DOM 节点匹配样式规则`,
    reason: '确定每个节点的最终样式，处理继承和层叠',
    explanation: '样式计算涉及：1) 选择器匹配 2) 优先级排序 3) 继承处理 4) 默认值填充。这是 CSS 层叠的核心。'
  }
}

/**
 * 生成 Render Tree 阶段的 Meta
 */
export function generateRenderTreeMeta(
  totalNodes: number, 
  renderedNodes: number,
  filterReasons: FilterReason[]
): StepMeta {
  const filtered = totalNodes - renderedNodes
  return {
    step: 'build-render-tree',
    action: `从 ${totalNodes} 个节点过滤出 ${renderedNodes} 个可渲染节点`,
    reason: `${filtered} 个节点被过滤（不可见或非可视标签）`,
    affectedNodes: filterReasons.map(r => r.nodeName),
    explanation: 'Render Tree = DOM Tree + Computed Style - 不可见节点。display:none、<head>、<script> 等不进入渲染树。'
  }
}

/**
 * 生成 Layout 阶段的 Meta
 */
export function generateLayoutMeta(): StepMeta {
  return {
    step: 'layout',
    action: '计算每个节点的几何信息（位置和大小）',
    reason: '确定元素在页面上的精确位置，这是绘制的前提',
    explanation: 'Layout（回流/Reflow）计算盒模型：content + padding + border + margin。块级元素默认占满父容器宽度。'
  }
}

/**
 * 生成 Paint 阶段的 Meta
 */
export function generatePaintMeta(commandCount: number): StepMeta {
  return {
    step: 'paint',
    action: `生成 ${commandCount} 条绘制指令`,
    reason: '将布局信息转换为具体的绘制操作',
    explanation: '绘制顺序：背景 → 边框 → 子元素 → 文本。这个顺序确保了正确的视觉层叠效果。'
  }
}

/**
 * 生成 Composite 阶段的 Meta
 */
export function generateCompositeMeta(layerCount: number, layerReasons: LayerReason[]): StepMeta {
  return {
    step: 'composite',
    action: `分析出 ${layerCount} 个图层`,
    reason: layerCount > 1 ? '某些 CSS 属性触发了独立图层创建' : '所有内容在同一图层',
    affectedNodes: layerReasons.map(r => r.nodeName),
    explanation: '合成层（Compositing Layer）在 GPU 上处理，transform/opacity 动画不触发回流重绘，性能最优。'
  }
}
