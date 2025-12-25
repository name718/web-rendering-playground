<script setup lang="ts">
import { ref, watch, onMounted, computed } from 'vue'
import * as d3 from 'd3'
import type { RenderNode } from '../engine'
import { useSimulationStore } from '../stores/simulation'

const store = useSimulationStore()
const svgRef = ref<SVGSVGElement | null>(null)
const containerRef = ref<HTMLDivElement | null>(null)

// 节点显示文本
function getNodeLabel(node: RenderNode): string {
  if (node.textContent) {
    const text = node.textContent
    return `"${text.length > 10 ? text.slice(0, 10) + '...' : text}"`
  }
  return node.tagName || '?'
}

// 节点颜色（根据样式）
function getNodeColor(node: RenderNode): string {
  // 如果有 color 样式，使用它
  if (node.style.color) {
    return node.style.color
  }
  if (node.textContent) {
    return '#f59e0b'
  }
  return '#22c55e'
}

function renderTree() {
  if (!svgRef.value || !containerRef.value || !store.renderTree) return

  const container = containerRef.value
  const width = container.clientWidth
  const height = container.clientHeight

  d3.select(svgRef.value).selectAll('*').remove()

  const svg = d3.select(svgRef.value)
    .attr('width', width)
    .attr('height', height)

  const g = svg.append('g')
    .attr('transform', 'translate(40, 40)')

  const root = d3.hierarchy(store.renderTree, d => d.children)

  const treeLayout = d3.tree<RenderNode>()
    .size([width - 80, Math.max(height - 100, root.height * 60)])
    .separation((a, b) => (a.parent === b.parent ? 1.2 : 1.5))

  const treeData = treeLayout(root)

  // 连线
  g.selectAll('.link')
    .data(treeData.links())
    .enter()
    .append('path')
    .attr('class', 'link')
    .attr('fill', 'none')
    .attr('stroke', '#4b5563')
    .attr('stroke-width', 1.5)
    .attr('d', d3.linkVertical<d3.HierarchyPointLink<RenderNode>, d3.HierarchyPointNode<RenderNode>>()
      .x(d => d.x)
      .y(d => d.y)
    )

  // 节点
  const nodes = g.selectAll('.node')
    .data(treeData.descendants())
    .enter()
    .append('g')
    .attr('class', 'node')
    .attr('transform', d => `translate(${d.x}, ${d.y})`)

  nodes.append('circle')
    .attr('r', 6)
    .attr('fill', d => getNodeColor(d.data))
    .attr('stroke', '#1f2937')
    .attr('stroke-width', 2)

  nodes.append('text')
    .attr('dy', -14)
    .attr('text-anchor', 'middle')
    .attr('fill', '#e5e7eb')
    .attr('font-size', '10px')
    .attr('font-family', 'monospace')
    .text(d => getNodeLabel(d.data))
}

watch(() => store.renderTree, () => {
  renderTree()
}, { deep: true })

onMounted(() => {
  renderTree()
  if (containerRef.value) {
    const resizeObserver = new ResizeObserver(() => renderTree())
    resizeObserver.observe(containerRef.value)
  }
})
</script>

<template>
  <div ref="containerRef" class="render-tree-view w-full h-full relative">
    <svg ref="svgRef" class="w-full h-full" />
    <div v-if="!store.renderTree" class="absolute inset-0 flex items-center justify-center text-gray-500 text-sm">
      渲染树（过滤不可见节点）
    </div>
  </div>
</template>
