<script setup lang="ts">
import { ref, watch, computed } from 'vue'
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

// 生成带高亮的 HTML
const highlightedHtml = computed(() => {
  const source = htmlInput.value
  const token = store.selectedToken
  
  if (!token) {
    return escapeHtml(source)
  }
  
  const before = source.slice(0, token.position.start)
  const highlighted = source.slice(token.position.start, token.position.end)
  const after = source.slice(token.position.end)
  
  return escapeHtml(before) + 
    '<mark class="bg-yellow-500 text-black">' + escapeHtml(highlighted) + '</mark>' + 
    escapeHtml(after)
})

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

// 是否显示高亮视图
const showHighlight = computed(() => store.selectedToken !== null)
</script>

<template>
  <div class="source-panel h-full flex flex-col">
    <div class="panel-header px-3 py-2 border-b border-gray-700 text-sm font-medium text-gray-300">
      HTML Source
    </div>
    
    <!-- 编辑模式 -->
    <textarea
      v-if="!showHighlight"
      v-model="htmlInput"
      class="flex-1 w-full p-3 bg-gray-900 text-gray-100 font-mono text-sm resize-none outline-none"
      placeholder="Enter HTML here..."
      spellcheck="false"
    />
    
    <!-- 高亮模式 -->
    <pre
      v-else
      class="flex-1 w-full p-3 bg-gray-900 text-gray-100 font-mono text-sm overflow-auto whitespace-pre-wrap"
      v-html="highlightedHtml"
    />
  </div>
</template>
