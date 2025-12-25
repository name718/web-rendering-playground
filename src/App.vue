<script setup lang="ts">
import SourcePanel from './components/SourcePanel.vue'
import CSSPanel from './components/CSSPanel.vue'
import TokenList from './components/TokenList.vue'
import CSSOMView from './components/CSSOMView.vue'
import VisualizationCanvas from './components/VisualizationCanvas.vue'
import Timeline from './components/Timeline.vue'
</script>

<template>
  <div class="app h-screen w-screen flex flex-col bg-gray-900 text-white overflow-hidden">
    <!-- Header -->
    <header class="px-4 py-3 border-b border-gray-700 flex items-center justify-between">
      <h1 class="text-lg font-semibold">Browser Internals Visualizer</h1>
      <span class="text-xs text-gray-500">浏览器原理可视化工具</span>
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

      <!-- Right: Visualization -->
      <div class="flex-1 min-h-0">
        <VisualizationCanvas />
      </div>
    </main>

    <!-- Bottom: Timeline -->
    <Timeline />
  </div>
</template>
