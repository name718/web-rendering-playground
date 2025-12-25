<script setup lang="ts">
import { ref } from 'vue'
import SourcePanel from './components/SourcePanel.vue'
import CSSPanel from './components/CSSPanel.vue'
import TokenList from './components/TokenList.vue'
import CSSOMView from './components/CSSOMView.vue'
import StyleView from './components/StyleView.vue'
import VisualizationCanvas from './components/VisualizationCanvas.vue'
import Timeline from './components/Timeline.vue'
import MetaPanel from './components/MetaPanel.vue'

// 是否显示 Meta 面板
const showMeta = ref(true)
</script>

<template>
  <div class="app h-screen w-screen flex flex-col bg-gray-900 text-white overflow-hidden">
    <!-- Header -->
    <header class="px-4 py-3 border-b border-gray-700 flex items-center justify-between">
      <h1 class="text-lg font-semibold">Browser Internals Visualizer</h1>
      <div class="flex items-center gap-4">
        <button 
          class="text-xs px-2 py-1 rounded transition"
          :class="showMeta ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-400'"
          @click="showMeta = !showMeta"
        >
          📖 原理解析
        </button>
        <span class="text-xs text-gray-500">浏览器原理可视化工具</span>
      </div>
    </header>

    <!-- Main Content -->
    <main class="flex-1 flex overflow-hidden min-h-0">
      <!-- Left: Source Panels -->
      <div class="w-64 border-r border-gray-700 flex-shrink-0 flex flex-col min-h-0">
        <div class="h-1/2 border-b border-gray-700 overflow-hidden">
          <SourcePanel />
        </div>
        <div class="h-1/2 overflow-hidden">
          <CSSPanel />
        </div>
      </div>

      <!-- Middle: Token & CSSOM -->
      <div class="w-56 border-r border-gray-700 flex-shrink-0 flex flex-col min-h-0">
        <div class="h-1/2 border-b border-gray-700 overflow-hidden">
          <TokenList />
        </div>
        <div class="h-1/2 overflow-hidden">
          <CSSOMView />
        </div>
      </div>

      <!-- Center: DOM Tree & Style -->
      <div class="flex-1 flex flex-col min-h-0">
        <div class="flex-1 min-h-0">
          <VisualizationCanvas />
        </div>
        <div class="h-32 border-t border-gray-700 overflow-hidden">
          <StyleView />
        </div>
      </div>
      
      <!-- Right: Meta Panel (可切换) -->
      <div 
        v-if="showMeta"
        class="w-72 border-l border-gray-700 flex-shrink-0 overflow-hidden"
      >
        <MetaPanel />
      </div>
    </main>

    <!-- Bottom: Timeline -->
    <Timeline />
  </div>
</template>
