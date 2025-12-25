<script setup lang="ts">
import { computed } from 'vue'
import { useSimulationStore } from '../stores/simulation'
import type { LayoutBox } from '../engine'

const store = useSimulationStore()

// 缩放比例
const scale = 0.5

// 过滤布局树：只保留 tokenIndex <= 当前选中 Token 的节点
function filterLayoutTree(box: LayoutBox, maxTokenIndex: number): LayoutBox | null {
  if (box.tokenIndex !== undefined && box.tokenIndex > maxTokenIndex) {
    return null
  }
  
  const filteredChildren: LayoutBox[] = []
  for (const child of box.children) {
    const filtered = filterLayoutTree(child, maxTokenIndex)
    if (filtered) {
      filteredChildren.push(filtered)
    }
  }
  
  return {
    ...box,
    children: filteredChildren
  }
}

// 当前可见的布局树
const visibleLayout = computed(() => {
  if (!store.layoutTree) return null
  if (store.selectedTokenIndex === null) return null
  return filterLayoutTree(store.layoutTree, store.selectedTokenIndex)
})

// 扁平化布局树用于渲染
function flattenBoxes(box: LayoutBox | null): LayoutBox[] {
  if (!box) return []
  const result: LayoutBox[] = [box]
  for (const child of box.children) {
    result.push(...flattenBoxes(child))
  }
  return result
}

const allBoxes = computed(() => flattenBoxes(visibleLayout.value))

// 获取盒子样式
function getBoxStyle(box: LayoutBox) {
  const isNew = box.tokenIndex === store.selectedTokenIndex
  return {
    left: `${box.x * scale}px`,
    top: `${box.y * scale}px`,
    width: `${box.width * scale}px`,
    height: `${box.height * scale}px`,
    backgroundColor: box.style['background-color'] || 'transparent',
    borderColor: isNew ? '#fbbf24' : '#4b5563',
    borderWidth: isNew ? '2px' : '1px',
    borderStyle: 'solid',
    zIndex: isNew ? 10 : 1
  }
}

// 获取标签颜色
function getTagColor(tagName?: string, isNew?: boolean): string {
  if (isNew) return '#fbbf24'
  if (!tagName) return '#f59e0b' // 文本节点用橙色
  const colors: Record<string, string> = {
    body: '#6366f1',
    div: '#22c55e',
    h1: '#f59e0b',
    p: '#3b82f6',
    span: '#ec4899'
  }
  return colors[tagName] || '#6b7280'
}
</script>

<template>
  <div class="layout-view h-full flex flex-col">
    <div class="panel-header px-3 py-2 border-b border-gray-700 text-sm font-medium text-gray-300">
      Layout (盒模型)
    </div>
    <div class="flex-1 overflow-auto p-4 relative">
      <div v-if="!visibleLayout" class="text-gray-500 text-center mt-10 text-sm">
        点击「开始解析」查看布局
      </div>
      
      <div v-else class="layout-container relative" style="min-height: 400px;">
        <div
          v-for="box in allBoxes"
          :key="box.id"
          class="layout-box absolute transition-all duration-200"
          :style="getBoxStyle(box)"
        >
          <div 
            class="box-label absolute top-0 left-0 text-xs px-1 rounded text-white"
            :style="{ backgroundColor: getTagColor(box.tagName, box.tokenIndex === store.selectedTokenIndex) }"
          >
            {{ box.tagName || (box.textContent ? `"${box.textContent.slice(0, 8)}..."` : '?') }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.layout-box {
  box-sizing: border-box;
}
.layout-box:hover {
  border-color: #60a5fa !important;
}
.box-label {
  white-space: nowrap;
  font-family: monospace;
}
</style>
