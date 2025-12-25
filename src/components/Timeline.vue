<script setup lang="ts">
import { watch, onUnmounted } from 'vue'
import { useSimulationStore } from '../stores/simulation'
import { runPipeline } from '../engine'

const store = useSimulationStore()

let playTimer: number | null = null

// 开始解析 - 使用 Pipeline 统一处理
function handleStart() {
  if (!store.htmlSource.trim()) return
  
  store.reset()
  
  // 使用 Pipeline 运行完整流水线（CSS A）
  const result = runPipeline({
    html: store.htmlSource,
    css: store.cssSource,
    options: { containerWidth: 600 }
  })
  
  // 设置各阶段产物
  store.setTokens(result.tokens)
  store.setDomTree(result.domTree)
  store.setCssRules(result.cssRules)
  store.setStyledTree(result.styledTree)
  store.setRenderTree(result.renderTree)
  store.setLayoutTree(result.layoutTree)
  store.setPaintCommands(result.paintCommands)
  store.setLayers(result.layers)
  
  // 设置 Meta 信息
  result.meta.steps.forEach(meta => store.addStepMeta(meta))
  store.setFilterReasons(result.meta.filterReasons)
  store.setLayerReasons(result.meta.layerReasons)
  
  // Diff 模式：运行第二份 CSS
  if (store.diffMode && store.cssSourceB.trim()) {
    const resultB = runPipeline({
      html: store.htmlSource,
      css: store.cssSourceB,
      options: { containerWidth: 600 }
    })
    store.setResultB(resultB)
  }
  
  // 初始化：选中第一个 Token
  if (result.tokens.length > 0) {
    store.selectToken(0)
  }
}

// 播放下一个 Token
function nextToken() {
  const currentIndex = store.selectedTokenIndex ?? -1
  if (currentIndex < store.tokens.length - 1) {
    store.selectToken(currentIndex + 1)
  } else {
    // 播放完毕
    store.pause()
  }
}

// 上一个 Token
function prevToken() {
  const currentIndex = store.selectedTokenIndex ?? 0
  if (currentIndex > 0) {
    store.selectToken(currentIndex - 1)
  }
}

// 自动播放
function startAutoPlay() {
  store.play()
}

function stopAutoPlay() {
  store.pause()
  if (playTimer) {
    clearInterval(playTimer)
    playTimer = null
  }
}

// 监听播放状态
watch(() => store.isPlaying, (playing) => {
  if (playing) {
    playTimer = window.setInterval(() => {
      const currentIndex = store.selectedTokenIndex ?? -1
      if (currentIndex < store.tokens.length - 1) {
        store.selectToken(currentIndex + 1)
      } else {
        stopAutoPlay()
      }
    }, store.speed)
  } else {
    if (playTimer) {
      clearInterval(playTimer)
      playTimer = null
    }
  }
})

// 计算进度
function getProgress(): number {
  if (store.tokens.length === 0) return 0
  const index = store.selectedTokenIndex ?? -1
  return (index + 1) / store.tokens.length
}

// 清理
onUnmounted(() => {
  if (playTimer) {
    clearInterval(playTimer)
  }
})
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
        :disabled="store.selectedTokenIndex === null || store.selectedTokenIndex <= 0"
        @click="prevToken"
        title="上一个 Token"
      >
        ⏮
      </button>
      <button
        v-if="!store.isPlaying"
        class="p-1.5 hover:bg-gray-700 rounded transition disabled:opacity-50"
        :disabled="store.tokens.length === 0"
        @click="startAutoPlay"
        title="自动播放"
      >
        ▶
      </button>
      <button
        v-else
        class="p-1.5 hover:bg-gray-700 rounded transition"
        @click="stopAutoPlay"
        title="暂停"
      >
        ⏸
      </button>
      <button
        class="p-1.5 hover:bg-gray-700 rounded transition disabled:opacity-50"
        :disabled="store.selectedTokenIndex === null || store.selectedTokenIndex >= store.tokens.length - 1"
        @click="nextToken"
        title="下一个 Token"
      >
        ⏭
      </button>
    </div>

    <!-- 进度条 -->
    <div class="progress flex-1 h-2 bg-gray-700 rounded overflow-hidden">
      <div 
        class="h-full bg-blue-500 transition-all duration-300"
        :style="{ width: `${getProgress() * 100}%` }"
      />
    </div>

    <!-- 步骤信息 -->
    <div class="step-info text-sm text-gray-400 min-w-40">
      <span v-if="store.tokens.length > 0 && store.selectedTokenIndex !== null">
        Token {{ store.selectedTokenIndex + 1 }} / {{ store.tokens.length }}
      </span>
      <span v-else-if="store.tokens.length > 0">
        共 {{ store.tokens.length }} 个 Token
      </span>
      <span v-else>Ready</span>
    </div>

    <!-- 速度控制 -->
    <div class="speed-control flex items-center gap-2 text-sm text-gray-400">
      <span>速度:</span>
      <select 
        :value="store.speed"
        @change="store.setSpeed(Number(($event.target as HTMLSelectElement).value))"
        class="bg-gray-800 border border-gray-600 rounded px-2 py-1 text-xs"
      >
        <option :value="2000">慢 (2s)</option>
        <option :value="1000">中 (1s)</option>
        <option :value="500">快 (0.5s)</option>
        <option :value="200">极快 (0.2s)</option>
      </select>
    </div>
    
    <!-- Diff 模式开关 -->
    <button
      class="px-2 py-1 text-xs rounded transition"
      :class="store.diffMode ? 'bg-purple-600 text-white' : 'bg-gray-700 text-gray-400'"
      @click="store.setDiffMode(!store.diffMode)"
    >
      🔀 Diff
    </button>
  </div>
</template>
