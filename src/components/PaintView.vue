<script setup lang="ts">
import { computed } from 'vue'
import { useSimulationStore } from '../stores/simulation'
import type { LayoutBox } from '../engine'

const store = useSimulationStore()

// 根据当前 Token 索引过滤绘制指令
// 需要找出当前可见的所有节点 ID
function getVisibleNodeIds(box: LayoutBox | null, maxTokenIndex: number): Set<string> {
  const ids = new Set<string>()
  if (!box) return ids
  
  function traverse(node: LayoutBox) {
    if (node.tokenIndex === undefined || node.tokenIndex <= maxTokenIndex) {
      ids.add(node.id)
      for (const child of node.children) {
        traverse(child)
      }
    }
  }
  
  traverse(box)
  return ids
}

const visibleCommands = computed(() => {
  if (store.selectedTokenIndex === null) return []
  const visibleIds = getVisibleNodeIds(store.layoutTree, store.selectedTokenIndex)
  return store.paintCommands.filter(cmd => visibleIds.has(cmd.targetId))
})

// 当前 Token 对应的指令
const currentTokenCommands = computed(() => {
  if (store.selectedTokenIndex === null) return new Set<string>()
  
  // 找到当前 Token 对应的节点 ID
  function findNodeId(box: LayoutBox | null): string | null {
    if (!box) return null
    if (box.tokenIndex === store.selectedTokenIndex) return box.id
    for (const child of box.children) {
      const found = findNodeId(child)
      if (found) return found
    }
    return null
  }
  
  const currentNodeId = findNodeId(store.layoutTree)
  if (!currentNodeId) return new Set<string>()
  
  return new Set(
    store.paintCommands
      .filter(cmd => cmd.targetId === currentNodeId)
      .map(cmd => cmd.id)
  )
})

// 获取指令类型颜色
function getTypeColor(type: string): string {
  const colors: Record<string, string> = {
    'background': '#22c55e',
    'border': '#3b82f6',
    'text': '#f59e0b'
  }
  return colors[type] || '#6b7280'
}

// 获取指令类型中文名
function getTypeName(type: string): string {
  const names: Record<string, string> = {
    'background': '背景',
    'border': '边框',
    'text': '文本'
  }
  return names[type] || type
}
</script>

<template>
  <div class="paint-view h-full flex flex-col">
    <div class="panel-header px-3 py-2 border-b border-gray-700 text-sm font-medium text-gray-300">
      Paint Commands ({{ visibleCommands.length }}/{{ store.paintCommands.length }})
    </div>
    <div class="flex-1 overflow-auto">
      <div v-if="visibleCommands.length === 0" class="text-gray-500 text-center mt-10 text-sm">
        点击「开始解析」查看绘制指令
      </div>
      <div v-else class="p-2 space-y-1">
        <div
          v-for="(cmd, index) in visibleCommands"
          :key="cmd.id"
          class="paint-item p-2 rounded text-xs font-mono flex items-start gap-2 transition-all"
          :class="currentTokenCommands.has(cmd.id) ? 'bg-yellow-900/50 ring-1 ring-yellow-500' : 'bg-gray-800'"
        >
          <span class="text-gray-500 w-6 flex-shrink-0">{{ index + 1 }}.</span>
          <div class="flex-1">
            <div class="flex items-center gap-2 mb-1">
              <span 
                class="px-1.5 py-0.5 rounded text-white text-xs"
                :style="{ backgroundColor: getTypeColor(cmd.type) }"
              >
                {{ getTypeName(cmd.type) }}
              </span>
              <span v-if="cmd.tagName" class="text-purple-400">&lt;{{ cmd.tagName }}&gt;</span>
              <span v-if="currentTokenCommands.has(cmd.id)" class="text-yellow-400 text-xs">← 当前</span>
            </div>
            <div class="text-gray-400">{{ cmd.description }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
