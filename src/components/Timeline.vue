<script setup lang="ts">
import { useSimulationStore } from '../stores/simulation'
import { tokenizer, domBuilder } from '../engine'

const store = useSimulationStore()

function handleStart() {
  if (!store.htmlSource.trim()) return
  
  // 重置状态
  store.reset()
  
  // Step 1: Tokenize
  const tokens = tokenizer.tokenize(store.htmlSource)
  store.setTokens(tokens)
  store.addStep({
    type: 'tokenize',
    description: `词法分析完成，生成 ${tokens.length} 个 Token`,
    data: tokens
  })
  
  // Step 2: Build DOM
  const domTree = domBuilder.build(tokens)
  store.setDomTree(domTree)
  store.addStep({
    type: 'build-dom',
    description: '构建 DOM 树完成',
    data: domTree
  })
  
  // 跳转到第一步
  store.jumpTo(0)
}
</script>

<template>
  <div class="timeline px-4 py-3 border-t border-gray-700 flex items-center gap-4">
    <!-- 控制按钮 -->
    <div class="controls flex items-center gap-2">
      <button
        class="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded transition"
        @click="handleStart"
      >
        开始解析
      </button>
      <button
        class="p-1.5 hover:bg-gray-700 rounded transition disabled:opacity-50"
        :disabled="!store.canGoBack"
        @click="store.backward"
      >
        ⏮
      </button>
      <button
        v-if="!store.isPlaying"
        class="p-1.5 hover:bg-gray-700 rounded transition"
        @click="store.play"
      >
        ▶
      </button>
      <button
        v-else
        class="p-1.5 hover:bg-gray-700 rounded transition"
        @click="store.pause"
      >
        ⏸
      </button>
      <button
        class="p-1.5 hover:bg-gray-700 rounded transition disabled:opacity-50"
        :disabled="!store.canGoForward"
        @click="store.forward"
      >
        ⏭
      </button>
    </div>

    <!-- 进度条 -->
    <div class="progress flex-1 h-2 bg-gray-700 rounded overflow-hidden">
      <div 
        class="h-full bg-blue-500 transition-all duration-300"
        :style="{ width: `${store.progress * 100}%` }"
      />
    </div>

    <!-- 步骤信息 -->
    <div class="step-info text-sm text-gray-400 min-w-32">
      <span v-if="store.currentStep">
        {{ store.currentStepIndex + 1 }} / {{ store.steps.length }}
      </span>
      <span v-else>Ready</span>
    </div>
  </div>
</template>
