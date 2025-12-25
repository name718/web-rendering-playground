<script setup lang="ts">
import SourcePanel from './components/SourcePanel.vue'
import TokenList from './components/TokenList.vue'
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
    <main class="flex-1 flex overflow-hidden">
      <!-- Left: Source Panel -->
      <div class="w-72 border-r border-gray-700 flex-shrink-0">
        <SourcePanel />
      </div>

      <!-- Middle: Token List -->
      <div class="w-64 border-r border-gray-700 flex-shrink-0">
        <TokenList />
      </div>

      <!-- Right: Visualization -->
      <div class="flex-1">
        <VisualizationCanvas />
      </div>
    </main>

    <!-- Bottom: Timeline -->
    <Timeline />
  </div>
</template>
