<script setup lang="ts">
import { computed } from 'vue'
import { useSimulationStore } from '../stores/simulation'

const store = useSimulationStore()

// 步骤名称映射
const stepNames: Record<string, string> = {
  'tokenize': '词法分析',
  'build-dom': 'DOM 构建',
  'parse-css': 'CSS 解析',
  'build-cssom': '样式计算',
  'build-render-tree': '渲染树构建',
  'layout': '布局计算',
  'paint': '绘制',
  'composite': '合成'
}

// 过滤原因的中文描述
const filterReasonNames: Record<string, string> = {
  'display-none': 'display: none',
  'non-visual-tag': '非可视标签',
  'empty-text': '空白文本'
}

// 当前是否有 Meta 信息
const hasMeta = computed(() => store.stepMetas.length > 0)
</script>

<template>
  <div class="meta-panel h-full overflow-auto p-4 text-sm">
    <h3 class="text-lg font-semibold mb-4 text-blue-400">📖 渲染原理解析</h3>
    
    <div v-if="!hasMeta" class="text-gray-500 text-center py-8">
      点击「开始解析」查看每一步的原理解释
    </div>
    
    <div v-else class="space-y-4">
      <!-- 各阶段 Meta 信息 -->
      <div 
        v-for="meta in store.stepMetas" 
        :key="meta.step"
        class="bg-gray-800 rounded-lg p-3 border border-gray-700"
      >
        <div class="flex items-center gap-2 mb-2">
          <span class="px-2 py-0.5 bg-blue-600 text-xs rounded">
            {{ stepNames[meta.step] || meta.step }}
          </span>
        </div>
        
        <div class="text-gray-300 mb-1">
          <span class="text-gray-500">做了什么：</span>
          {{ meta.action }}
        </div>
        
        <div class="text-gray-300 mb-1">
          <span class="text-gray-500">为什么：</span>
          {{ meta.reason }}
        </div>
        
        <div v-if="meta.explanation" class="text-gray-400 text-xs mt-2 p-2 bg-gray-900 rounded">
          💡 {{ meta.explanation }}
        </div>
        
        <div v-if="meta.affectedNodes?.length" class="mt-2 text-xs text-gray-500">
          影响节点: {{ meta.affectedNodes.join(', ') }}
        </div>
      </div>
      
      <!-- 过滤原因详情 -->
      <div v-if="store.filterReasons.length > 0" class="bg-gray-800 rounded-lg p-3 border border-orange-700">
        <div class="text-orange-400 font-medium mb-2">🚫 被过滤的节点</div>
        <div 
          v-for="reason in store.filterReasons" 
          :key="reason.nodeId"
          class="mb-2 last:mb-0"
        >
          <div class="text-gray-300">
            <span class="text-orange-300">{{ reason.nodeName }}</span>
            <span class="text-gray-500 mx-1">→</span>
            <span class="text-xs px-1.5 py-0.5 bg-orange-900 rounded">
              {{ filterReasonNames[reason.reason] || reason.reason }}
            </span>
          </div>
          <div class="text-xs text-gray-500 mt-1">
            {{ reason.explanation }}
          </div>
        </div>
      </div>
      
      <!-- 图层创建原因 -->
      <div v-if="store.layerReasons.length > 0" class="bg-gray-800 rounded-lg p-3 border border-green-700">
        <div class="text-green-400 font-medium mb-2">🎨 独立图层</div>
        <div 
          v-for="reason in store.layerReasons" 
          :key="reason.nodeId"
          class="mb-2 last:mb-0"
        >
          <div class="text-gray-300">
            <span class="text-green-300">{{ reason.nodeName }}</span>
            <span class="text-gray-500 mx-1">→</span>
            <span class="text-xs px-1.5 py-0.5 bg-green-900 rounded">
              {{ reason.trigger }}
            </span>
          </div>
          <div class="text-xs text-gray-500 mt-1">
            {{ reason.explanation }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
