<script setup lang="ts">
import { useSimulationStore } from '../stores/simulation'
import DOMTreeView from './DOMTreeView.vue'

const store = useSimulationStore()
</script>

<template>
  <div class="visualization-canvas h-full flex flex-col">
    <div class="panel-header px-3 py-2 border-b border-gray-700 text-sm font-medium text-gray-300">
      DOM Tree
    </div>
    <div class="flex-1 overflow-auto">
      <div v-if="!store.domTree" class="text-gray-500 text-center mt-20">
        点击「开始解析」查看可视化结果
      </div>
      <DOMTreeView v-else :tree="store.domTree" />
    </div>
  </div>
</template>
