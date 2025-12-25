<script setup lang="ts">
import { computed } from 'vue'
import { useSimulationStore } from '../stores/simulation'
import type { DOMNode } from '../types'

const store = useSimulationStore()

// 移除循环引用的序列化函数
function serializeNode(node: DOMNode): object {
  return {
    id: node.id,
    type: node.type,
    tagName: node.tagName,
    textContent: node.textContent,
    attributes: node.attributes,
    children: node.children.map(serializeNode)
  }
}

const serializedTree = computed(() => {
  if (!store.domTree) return null
  return serializeNode(store.domTree)
})
</script>

<template>
  <div class="visualization-canvas h-full flex flex-col">
    <div class="panel-header px-3 py-2 border-b border-gray-700 text-sm font-medium text-gray-300">
      Visualization
    </div>
    <div class="flex-1 p-4 overflow-auto">
      <div v-if="!serializedTree" class="text-gray-500 text-center mt-20">
        点击「开始解析」查看可视化结果
      </div>
      <div v-else class="text-gray-300">
        <!-- DOM Tree 可视化将在这里渲染 -->
        <pre class="text-xs">{{ JSON.stringify(serializedTree, null, 2) }}</pre>
      </div>
    </div>
  </div>
</template>
