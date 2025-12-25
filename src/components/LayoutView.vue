<script setup lang="ts">
import { computed } from 'vue'
import { useSimulationStore } from '../stores/simulation'
import type { LayoutBox } from '../engine'

const store = useSimulationStore()

// 缩放比例
const scale = 0.5

// 递归渲染盒子
function renderBox(box: LayoutBox, depth: number = 0): any {
  return {
    box,
    depth,
    children: box.children.map(child => renderBox(child, depth + 1))
  }
}

const layoutData = computed(() => {
  if (!store.layoutTree) return null
  return renderBox(store.layoutTree)
})

// 获取盒子样式
function getBoxStyle(box: LayoutBox) {
  return {
    left: `${box.x * scale}px`,
    top: `${box.y * scale}px`,
    width: `${box.width * scale}px`,
    height: `${box.height * scale}px`,
    backgroundColor: box.style['background-color'] || 'transparent',
    borderColor: '#4b5563',
    borderWidth: '1px',
    borderStyle: 'solid'
  }
}

// 获取标签颜色
function getTagColor(tagName?: string): string {
  const colors: Record<string, string> = {
    body: '#6366f1',
    div: '#22c55e',
    h1: '#f59e0b',
    p: '#3b82f6',
    span: '#ec4899'
  }
  return colors[tagName || ''] || '#6b7280'
}
</script>

<template>
  <div class="layout-view h-full flex flex-col">
    <div class="panel-header px-3 py-2 border-b border-gray-700 text-sm font-medium text-gray-300">
      Layout (盒模型)
    </div>
    <div class="flex-1 overflow-auto p-4 relative">
      <div v-if="!layoutData" class="text-gray-500 text-center mt-10 text-sm">
        点击「开始解析」查看布局
      </div>
      
      <div v-else class="layout-container relative" style="min-height: 400px;">
        <!-- 递归渲染盒子 -->
        <template v-for="item in [layoutData]" :key="item.box.id">
          <div
            class="layout-box absolute"
            :style="getBoxStyle(item.box)"
          >
            <div 
              class="box-label absolute -top-4 left-0 text-xs px-1 rounded"
              :style="{ backgroundColor: getTagColor(item.box.tagName) }"
            >
              {{ item.box.tagName || '"text"' }}
            </div>
          </div>
          
          <!-- 子盒子 -->
          <template v-for="child in item.children" :key="child.box.id">
            <div
              class="layout-box absolute"
              :style="getBoxStyle(child.box)"
            >
              <div 
                class="box-label absolute -top-4 left-0 text-xs px-1 rounded text-white"
                :style="{ backgroundColor: getTagColor(child.box.tagName) }"
              >
                {{ child.box.tagName || '"..."' }}
              </div>
            </div>
            
            <!-- 孙子盒子 -->
            <template v-for="grandchild in child.children" :key="grandchild.box.id">
              <div
                class="layout-box absolute"
                :style="getBoxStyle(grandchild.box)"
              >
                <div 
                  class="box-label absolute -top-4 left-0 text-xs px-1 rounded text-white"
                  :style="{ backgroundColor: getTagColor(grandchild.box.tagName) }"
                >
                  {{ grandchild.box.tagName || '"..."' }}
                </div>
              </div>
            </template>
          </template>
        </template>
      </div>
    </div>
  </div>
</template>

<style scoped>
.layout-box {
  box-sizing: border-box;
  transition: all 0.2s;
}
.layout-box:hover {
  border-color: #fbbf24 !important;
  z-index: 10;
}
.box-label {
  white-space: nowrap;
  font-family: monospace;
}
</style>
