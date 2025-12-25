<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import * as d3 from 'd3'
import type { DOMNode } from '../types'

const props = defineProps<{
  tree: DOMNode | null
}>()

const svgRef = ref<SVGSVGElement | null>(null)
const containerRef = ref<HTMLDivElement | null>(null)

// 节点显示文本
function getNodeLabel(node: DOMNode): string {
  if (node.type === 'text') {
    const text = node.textContent || ''
    return `"${text.length > 15 ? text.slice(0, 15) + '...' : text}"`
  }
  if (node.type === 'comment') {
    return '<!-- -->'
  }
  return node.tagName || node.type
}

// 节点颜色
function getNodeColor(node: DOMNode): string {
  switch (node.type) {
    case 'document': return '#6366f1'
    case 'element': return '#22c55e'
    case 'text': return '#f59e0b'
    case 'comment': return '#6b7280'
    default: return '#ffffff'
  }
}

function renderTree() {
  if (!svgRef.value || !containerRef.value || !props.tree) return

  const container = containerRef.value
  const width = container.clientWidth
  const height = container.clientHeight

  // 清空之前的内容
  d3.select(svgRef.value).selectAll('*').remove()

  const svg = d3.select(svgRef.value)
    .attr('width', width)
    .attr('height', height)

  const g = svg.append('g')
    .attr('transform', 'translate(40, 40)')

  // 转换数据格式
  const root = d3.hierarchy(props.tree, d => d.children)

  // 创建树布局
  const treeLayout = d3.tree<DOMNode>()
    .size([width - 80, height - 100])
    .separation((a, b) => (a.parent === b.parent ? 1.5 : 2))

  const treeData = treeLayout(root)

  // 绘制连线
  g.selectAll('.link')
    .data(treeData.links())
    .enter()
    .append('path')
    .attr('class', 'link')
    .attr('fill', 'none')
    .attr('stroke', '#4b5563')
    .attr('stroke-width', 1.5)
    .attr('d', d3.linkVertical<d3.HierarchyPointLink<DOMNode>, d3.HierarchyPointNode<DOMNode>>()
      .x(d => d.x)
      .y(d => d.y)
    )

  // 绘制节点
  const nodes = g.selectAll('.node')
    .data(treeData.descendants())
    .enter()
    .append('g')
    .attr('class', 'node')
    .attr('transform', d => `translate(${d.x}, ${d.y})`)

  // 节点圆圈
  nodes.append('circle')
    .attr('r', 6)
    .attr('fill', d => getNodeColor(d.data))
    .attr('stroke', '#1f2937')
    .attr('stroke-width', 2)

  // 节点文字
  nodes.append('text')
    .attr('dy', -12)
    .attr('text-anchor', 'middle')
    .attr('fill', '#e5e7eb')
    .attr('font-size', '11px')
    .attr('font-family', 'monospace')
    .text(d => getNodeLabel(d.data))
}

// 监听树变化
watch(() => props.tree, () => {
  renderTree()
}, { deep: true })

// 监听容器大小变化
onMounted(() => {
  renderTree()
  
  if (containerRef.value) {
    const resizeObserver = new ResizeObserver(() => {
      renderTree()
    })
    resizeObserver.observe(containerRef.value)
  }
})
</script>

<template>
  <div ref="containerRef" class="dom-tree-view w-full h-full min-h-80">
    <svg ref="svgRef" class="w-full h-full" />
  </div>
</template>
