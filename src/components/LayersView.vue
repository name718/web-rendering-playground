<script setup lang="ts">
import { useSimulationStore } from '../stores/simulation'

const store = useSimulationStore()
</script>

<template>
  <div class="layers-view h-full flex flex-col">
    <div class="panel-header px-3 py-2 border-b border-gray-700 text-sm font-medium text-gray-300">
      Layers ({{ store.layers.length }})
    </div>
    <div class="flex-1 overflow-auto">
      <div v-if="store.layers.length === 0" class="text-gray-500 text-center mt-10 text-sm">
        点击「开始解析」查看图层
      </div>
      <div v-else class="p-2 space-y-2">
        <div
          v-for="(layer, index) in store.layers"
          :key="layer.id"
          class="layer-item p-3 rounded bg-gray-800 text-xs"
        >
          <div class="flex items-center gap-2 mb-2">
            <span class="text-purple-400 font-medium">Layer {{ index + 1 }}</span>
            <span class="text-gray-400">{{ layer.name }}</span>
          </div>
          <div class="text-green-400 font-mono text-xs">
            {{ layer.reason }}
          </div>
        </div>
        
        <!-- 提示信息 -->
        <div class="mt-4 p-3 bg-gray-800/50 rounded text-xs text-gray-400">
          <div class="font-medium text-gray-300 mb-2">💡 触发独立图层的 CSS 属性：</div>
          <ul class="space-y-1 list-disc list-inside">
            <li>transform (非 none)</li>
            <li>opacity &lt; 1</li>
            <li>position: fixed</li>
            <li>will-change</li>
            <li>filter</li>
          </ul>
          <div class="mt-2 text-gray-500">
            试试在 CSS 中添加 <code class="text-blue-400">opacity: 0.9</code> 或 <code class="text-blue-400">transform: translateZ(0)</code>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
