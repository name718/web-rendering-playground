<script setup lang="ts">
import { useSimulationStore } from '../stores/simulation'

const store = useSimulationStore()

// 获取指令类型颜色
function getTypeColor(type: string): string {
  const colors: Record<string, string> = {
    'background': '#22c55e',
    'border': '#3b82f6',
    'text': '#f59e0b'
  }
  return colors[type] || '#6b7280'
}

// 获取指令类型中文名
function getTypeName(type: string): string {
  const names: Record<string, string> = {
    'background': '背景',
    'border': '边框',
    'text': '文本'
  }
  return names[type] || type
}
</script>

<template>
  <div class="paint-view h-full flex flex-col">
    <div class="panel-header px-3 py-2 border-b border-gray-700 text-sm font-medium text-gray-300">
      Paint Commands ({{ store.paintCommands.length }})
    </div>
    <div class="flex-1 overflow-auto">
      <div v-if="store.paintCommands.length === 0" class="text-gray-500 text-center mt-10 text-sm">
        点击「开始解析」查看绘制指令
      </div>
      <div v-else class="p-2 space-y-1">
        <div
          v-for="(cmd, index) in store.paintCommands"
          :key="cmd.id"
          class="paint-item p-2 rounded bg-gray-800 text-xs font-mono flex items-start gap-2"
        >
          <span class="text-gray-500 w-6 flex-shrink-0">{{ index + 1 }}.</span>
          <div class="flex-1">
            <div class="flex items-center gap-2 mb-1">
              <span 
                class="px-1.5 py-0.5 rounded text-white text-xs"
                :style="{ backgroundColor: getTypeColor(cmd.type) }"
              >
                {{ getTypeName(cmd.type) }}
              </span>
              <span v-if="cmd.tagName" class="text-purple-400">&lt;{{ cmd.tagName }}&gt;</span>
            </div>
            <div class="text-gray-400">{{ cmd.description }}</div>
            <div class="text-gray-500 text-xs mt-1">
              位置: ({{ cmd.x.toFixed(0) }}, {{ cmd.y.toFixed(0) }}) 
              尺寸: {{ cmd.width.toFixed(0) }}×{{ cmd.height.toFixed(0) }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
