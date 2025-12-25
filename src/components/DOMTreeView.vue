<script setup lang="ts">
import { ref, watch, onMounted, computed } from 'vue'
import * as d3 from 'd3'
import type { DOMNode } from '../types'
import { useSimulationStore } from '../stores/simulation'

const props = defineProps<{
  tree: DOMNode | null
}>()

const store = useSimulationStore()
const svgRef = ref<SVGSVGElement | null>(null)
const containerRef = ref<HTMLDivElement | null>(null)

// 过滤树：只保留 tokenIndex <= 当前选中 Token 的节点
function filterTree(node: DOMNode, maxTokenIndex: number): DOMNode | null {
  // document 节点始终显示
  if (node.tokenIndex === -1 || (node.tokenIndex !== undefined && node.tokenIndex <= maxTokenIndex)) {
    const filteredChildren: DOMNode[] = []
    for (const child of node.children) {
      const filteredChild = filterTree(child, maxTokenIndex)
      if (filteredChild) {
        filteredChildren.push(filteredChild)
      }
    }
    return {
      ...node,
      children: filteredChildren
    }
  }
  return null
}

// 当前应该显示的树
const visibleTree = computed(() => {
  if (!props.tree) return null
  if (store.selectedTokenIndex === null) return null
  return filterTree(props.tree, store.selectedTokenIndex)
})

// 节点显示文本
function getNodeLabel(node: DOMNode): string {
  if (node.type === 'text') {
    const text = node.textContent || ''
    return `"${text.length > 12 ? text.slice(0, 12) + '...' : text}"`
  }
  if (node.type === 'comment') {
    return '<!-- -->'
  }
  return node.tagName || node.type
}

// 节点颜色
function getNodeColor(node: DOMNode, isNew: boolean): string {
  if (isNew) return '#fbbf24' // 新节点高亮黄色
  switch (node.type) {
    case 'document': return '#6366f1'
    case 'element': return '#22c55e'
    case 'text': return '#f59e0b'
    case 'comment': return '#6b7280'
    default: return '#ffffff'
  }
}

function renderTree() {
  if (!svgRef.value || !containerRef.value || !visibleTree.value) return

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
  const root = d3.hierarchy(visibleTree.value, d => d.children)

  // 创建树布局
  const treeLayout = d3.tree<DOMNode>()
    .size([width - 80, Math.max(height - 100, root.height * 60)])
    .separation((a, b) => (a.parent === b.parent ? 1.2 : 1.5))

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

  // 当前 Token 索引
  const currentTokenIndex = store.selectedTokenIndex ?? -1

  // 绘制节点
  const nodes = g.selectAll('.node')
    .data(treeData.descendants())
    .enter()
    .append('g')
    .attr('class', 'node')
    .attr('transform', d => `translate(${d.x}, ${d.y})`)

  // 节点圆圈
  nodes.append('circle')
    .attr('r', d => d.data.tokenIndex === currentTokenIndex ? 8 : 6)
    .attr('fill', d => getNodeColor(d.data, d.data.tokenIndex === currentTokenIndex))
    .attr('stroke', d => d.data.tokenIndex === currentTokenIndex ? '#fbbf24' : '#1f2937')
    .attr('stroke-width', d => d.data.tokenIndex === currentTokenIndex ? 3 : 2)

  // 节点文字
  nodes.append('text')
    .attr('dy', -14)
    .attr('text-anchor', 'middle')
    .attr('fill', d => d.data.tokenIndex === currentTokenIndex ? '#fbbf24' : '#e5e7eb')
    .attr('font-size', '11px')
    .attr('font-weight', d => d.data.tokenIndex === currentTokenIndex ? 'bold' : 'normal')
    .attr('font-family', 'monospace')
    .text(d => getNodeLabel(d.data))
}

// 监听树和选中 Token 变化
watch([visibleTree, () => store.selectedTokenIndex], () => {
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
    <div v-if="!visibleTree" class="absolute inset-0 flex items-center justify-center text-gray-500">
      点击「开始解析」查看 DOM 树
    </div>
  </div>
</template>

<style scoped>
.dom-tree-view {
  position: relative;
}
</style>
