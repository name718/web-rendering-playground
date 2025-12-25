<script setup lang="ts">
import { ref, watch } from 'vue'
import { useSimulationStore } from '../stores/simulation'

const store = useSimulationStore()

const htmlInput = ref(`<!DOCTYPE html>
<html>
<head>
  <title>Demo</title>
</head>
<body>
  <div class="container">
    <h1>Hello World</h1>
    <p>This is a paragraph.</p>
  </div>
</body>
</html>`)

watch(htmlInput, (val) => {
  store.setHtmlSource(val)
}, { immediate: true })
</script>

<template>
  <div class="source-panel h-full flex flex-col">
    <div class="panel-header px-3 py-2 border-b border-gray-700 text-sm font-medium text-gray-300">
      HTML Source
    </div>
    <textarea
      v-model="htmlInput"
      class="flex-1 w-full p-3 bg-gray-900 text-gray-100 font-mono text-sm resize-none outline-none"
      placeholder="Enter HTML here..."
      spellcheck="false"
    />
  </div>
</template>
