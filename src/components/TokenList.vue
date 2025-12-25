<script setup lang="ts">
import { useSimulationStore } from '../stores/simulation'

const store = useSimulationStore()

// Token 类型对应的颜色
function getTokenColor(type: string): string {
  const colors: Record<string, string> = {
    'DOCTYPE': '#a855f7',
    'StartTag': '#22c55e',
    'EndTag': '#ef4444',
    'SelfClosingTag': '#3b82f6',
    'Text': '#f59e0b',
    'Comment': '#6b7280'
  }
  return colors[type] || '#ffffff'
}

// Token 类型中文名
function getTokenTypeName(type: string): string {
  const names: Record<string, string> = {
    'DOCTYPE': '文档类型',
    'StartTag': '开始标签',
    'EndTag': '结束标签',
    'SelfClosingTag': '自闭合标签',
    'Text': '文本',
    'Comment': '注释'
  }
  return names[type] || type
}
</script>

<template>
  <div class="token-list h-full flex flex-col">
    <div class="panel-header px-3 py-2 border-b border-gray-700 text-sm font-medium text-gray-300">
      Token 列表 ({{ store.tokens.length }})
    </div>
    <div class="flex-1 overflow-auto">
      <div v-if="store.tokens.length === 0" class="text-gray-500 text-center mt-10 text-sm">
        暂无 Token
      </div>
      <div v-else class="p-2 space-y-1">
        <div
          v-for="(token, index) in store.tokens"
          :key="index"
          class="token-item p-2 rounded bg-gray-800 hover:bg-gray-750 text-xs font-mono"
        >
          <div class="flex items-center gap-2 mb-1">
            <span 
              class="px-1.5 py-0.5 rounded text-white text-xs"
              :style="{ backgroundColor: getTokenColor(token.type) }"
            >
              {{ getTokenTypeName(token.type) }}
            </span>
            <span class="text-gray-500">
              {{ token.position.start }}-{{ token.position.end }}
            </span>
          </div>
          <div class="text-gray-300">
            <span v-if="token.name" class="text-green-400">&lt;{{ token.name }}&gt;</span>
            <span v-if="token.content" class="text-yellow-400">"{{ token.content.slice(0, 30) }}{{ token.content.length > 30 ? '...' : '' }}"</span>
            <span v-if="token.attributes" class="text-blue-400 ml-2">
              {{ Object.keys(token.attributes).map(k => `${k}="${token.attributes![k]}"`).join(' ') }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.hover\:bg-gray-750:hover {
  background-color: #374151;
}
</style>
