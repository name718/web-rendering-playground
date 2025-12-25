<script setup lang="ts">
import { useSimulationStore } from '../stores/simulation'

const store = useSimulationStore()
</script>

<template>
  <div class="visualization-canvas h-full flex flex-col">
    <div class="panel-header px-3 py-2 border-b border-gray-700 text-sm font-medium text-gray-300">
      Visualization
    </div>
    <div class="flex-1 p-4 overflow-auto">
      <div v-if="!store.domTree" class="text-gray-500 text-center mt-20">
        点击「开始解析」查看可视化结果
      </div>
      <div v-else class="text-gray-300">
        <!-- DOM Tree 可视化将在这里渲染 -->
        <pre class="text-xs">{{ JSON.stringify(store.domTree, null, 2) }}</pre>
      </div>
    </div>
  </div>
</template>
