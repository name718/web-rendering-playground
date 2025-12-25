<script setup lang="ts">
import { computed } from 'vue'
import { useSimulationStore } from '../stores/simulation'
import type { StyledNode } from '../engine'

const store = useSimulationStore()

// 根据当前选中的 Token 找到对应的 StyledNode
const currentStyledNode = computed(() => {
  if (!store.styledTree || store.selectedTokenIndex === null) return null
  
  // 递归查找 tokenIndex 匹配的节点
  function findNode(node: StyledNode): StyledNode | null {
    if (node.node.tokenIndex === store.selectedTokenIndex) {
      return node
    }
    for (const child of node.children) {
      const found = findNode(child)
      if (found) return found
    }
    return null
  }
  
  return findNode(store.styledTree)
})

const styleEntries = computed(() => {
  if (!currentStyledNode.value) return []
  return Object.entries(currentStyledNode.value.computedStyle)
})
</script>

<template>
  <div class="style-view h-full flex flex-col">
    <div class="panel-header px-3 py-2 border-b border-gray-700 text-sm font-medium text-gray-300">
      Computed Style
    </div>
    <div class="flex-1 overflow-auto p-2">
      <div v-if="!currentStyledNode" class="text-gray-500 text-center mt-4 text-xs">
        选择一个元素节点查看样式
      </div>
      <div v-else-if="styleEntries.length === 0" class="text-gray-500 text-center mt-4 text-xs">
        该节点无样式
      </div>
      <div v-else class="space-y-1">
        <div class="text-xs text-gray-400 mb-2">
          &lt;{{ currentStyledNode.node.tagName }}&gt;
        </div>
        <div
          v-for="[prop, value] in styleEntries"
          :key="prop"
          class="text-xs font-mono flex"
        >
          <span class="text-blue-400 w-24 flex-shrink-0">{{ prop }}:</span>
          <span class="text-green-400">{{ value }}</span>
        </div>
      </div>
    </div>
  </div>
</template>
