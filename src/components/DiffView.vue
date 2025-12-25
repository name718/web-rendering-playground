<script setup lang="ts">
import { computed } from 'vue'
import { useSimulationStore } from '../stores/simulation'

const store = useSimulationStore()

// 计算 Render Tree 节点数差异
const renderTreeDiff = computed(() => {
  const countA = store.renderTree ? countNodes(store.renderTree) : 0
  const countB = store.resultB?.renderTree ? countNodes(store.resultB.renderTree) : 0
  return { a: countA, b: countB, diff: countB - countA }
})

// 计算 Paint 指令数差异
const paintDiff = computed(() => {
  const countA = store.paintCommands.length
  const countB = store.resultB?.paintCommands.length || 0
  return { a: countA, b: countB, diff: countB - countA }
})

// 计算图层数差异
const layerDiff = computed(() => {
  const countA = store.layers.length
  const countB = store.resultB?.layers.length || 0
  return { a: countA, b: countB, diff: countB - countA }
})

// 对比过滤原因
const filterDiff = computed(() => {
  const reasonsA = store.filterReasons.map(r => r.nodeName)
  const reasonsB = store.resultB?.meta.filterReasons.map(r => r.nodeName) || []
  
  const onlyInA = reasonsA.filter(n => !reasonsB.includes(n))
  const onlyInB = reasonsB.filter(n => !reasonsA.includes(n))
  
  return { onlyInA, onlyInB }
})

// 对比图层创建
const layerReasonDiff = computed(() => {
  const layersA = store.layerReasons.map(r => r.nodeName)
  const layersB = store.resultB?.meta.layerReasons.map(r => r.nodeName) || []
  
  const onlyInA = layersA.filter(n => !layersB.includes(n))
  const onlyInB = layersB.filter(n => !layersA.includes(n))
  
  return { onlyInA, onlyInB }
})

function countNodes(node: { children?: unknown[] } | null): number {
  if (!node) return 0
  let count = 1
  if (node.children) {
    for (const child of node.children) {
      count += countNodes(child as { children?: unknown[] })
    }
  }
  return count
}

function formatDiff(diff: number): string {
  if (diff > 0) return `+${diff}`
  if (diff < 0) return `${diff}`
  return '0'
}
</script>

<template>
  <div class="diff-view h-full overflow-auto p-4 text-sm">
    <h3 class="text-lg font-semibold mb-4 text-purple-400">🔀 对比分析</h3>
    
    <div v-if="!store.resultB" class="text-gray-500 text-center py-8">
      开启 Diff 模式后，点击「开始解析」查看对比结果
    </div>
    
    <div v-else class="space-y-4">
      <!-- 数量对比 -->
      <div class="bg-gray-800 rounded-lg p-3 border border-gray-700">
        <div class="text-gray-400 font-medium mb-3">📊 数量对比</div>
        
        <div class="grid grid-cols-4 gap-2 text-xs mb-2 text-gray-500">
          <div></div>
          <div class="text-center">CSS A</div>
          <div class="text-center">CSS B</div>
          <div class="text-center">差异</div>
        </div>
        
        <div class="space-y-2">
          <div class="grid grid-cols-4 gap-2 items-center">
            <div class="text-gray-400">Render 节点</div>
            <div class="text-center">{{ renderTreeDiff.a }}</div>
            <div class="text-center">{{ renderTreeDiff.b }}</div>
            <div 
              class="text-center font-medium"
              :class="{
                'text-green-400': renderTreeDiff.diff > 0,
                'text-red-400': renderTreeDiff.diff < 0,
                'text-gray-500': renderTreeDiff.diff === 0
              }"
            >
              {{ formatDiff(renderTreeDiff.diff) }}
            </div>
          </div>
          
          <div class="grid grid-cols-4 gap-2 items-center">
            <div class="text-gray-400">Paint 指令</div>
            <div class="text-center">{{ paintDiff.a }}</div>
            <div class="text-center">{{ paintDiff.b }}</div>
            <div 
              class="text-center font-medium"
              :class="{
                'text-green-400': paintDiff.diff > 0,
                'text-red-400': paintDiff.diff < 0,
                'text-gray-500': paintDiff.diff === 0
              }"
            >
              {{ formatDiff(paintDiff.diff) }}
            </div>
          </div>
          
          <div class="grid grid-cols-4 gap-2 items-center">
            <div class="text-gray-400">图层数</div>
            <div class="text-center">{{ layerDiff.a }}</div>
            <div class="text-center">{{ layerDiff.b }}</div>
            <div 
              class="text-center font-medium"
              :class="{
                'text-green-400': layerDiff.diff > 0,
                'text-red-400': layerDiff.diff < 0,
                'text-gray-500': layerDiff.diff === 0
              }"
            >
              {{ formatDiff(layerDiff.diff) }}
            </div>
          </div>
        </div>
      </div>
      
      <!-- 过滤差异 -->
      <div 
        v-if="filterDiff.onlyInA.length || filterDiff.onlyInB.length"
        class="bg-gray-800 rounded-lg p-3 border border-orange-700"
      >
        <div class="text-orange-400 font-medium mb-2">🚫 Render Tree 过滤差异</div>
        
        <div v-if="filterDiff.onlyInA.length" class="mb-2">
          <div class="text-xs text-gray-500 mb-1">仅在 A 中被过滤:</div>
          <div class="flex flex-wrap gap-1">
            <span 
              v-for="name in filterDiff.onlyInA" 
              :key="name"
              class="px-2 py-0.5 bg-red-900/50 text-red-300 text-xs rounded"
            >
              {{ name }}
            </span>
          </div>
        </div>
        
        <div v-if="filterDiff.onlyInB.length">
          <div class="text-xs text-gray-500 mb-1">仅在 B 中被过滤:</div>
          <div class="flex flex-wrap gap-1">
            <span 
              v-for="name in filterDiff.onlyInB" 
              :key="name"
              class="px-2 py-0.5 bg-green-900/50 text-green-300 text-xs rounded"
            >
              {{ name }}
            </span>
          </div>
        </div>
      </div>
      
      <!-- 图层差异 -->
      <div 
        v-if="layerReasonDiff.onlyInA.length || layerReasonDiff.onlyInB.length"
        class="bg-gray-800 rounded-lg p-3 border border-green-700"
      >
        <div class="text-green-400 font-medium mb-2">🎨 合成层差异</div>
        
        <div v-if="layerReasonDiff.onlyInA.length" class="mb-2">
          <div class="text-xs text-gray-500 mb-1">仅在 A 中创建图层:</div>
          <div class="flex flex-wrap gap-1">
            <span 
              v-for="name in layerReasonDiff.onlyInA" 
              :key="name"
              class="px-2 py-0.5 bg-red-900/50 text-red-300 text-xs rounded"
            >
              {{ name }}
            </span>
          </div>
        </div>
        
        <div v-if="layerReasonDiff.onlyInB.length">
          <div class="text-xs text-gray-500 mb-1">仅在 B 中创建图层:</div>
          <div class="flex flex-wrap gap-1">
            <span 
              v-for="name in layerReasonDiff.onlyInB" 
              :key="name"
              class="px-2 py-0.5 bg-green-900/50 text-green-300 text-xs rounded"
            >
              {{ name }}
            </span>
          </div>
        </div>
      </div>
      
      <!-- 结论 -->
      <div class="bg-gray-800 rounded-lg p-3 border border-blue-700">
        <div class="text-blue-400 font-medium mb-2">💡 分析结论</div>
        <div class="text-xs text-gray-300 space-y-1">
          <p v-if="renderTreeDiff.diff !== 0">
            Render Tree 节点数{{ renderTreeDiff.diff > 0 ? '增加' : '减少' }}了 {{ Math.abs(renderTreeDiff.diff) }} 个
          </p>
          <p v-if="paintDiff.diff !== 0">
            Paint 指令{{ paintDiff.diff > 0 ? '增加' : '减少' }}了 {{ Math.abs(paintDiff.diff) }} 条
          </p>
          <p v-if="layerDiff.diff !== 0">
            合成层{{ layerDiff.diff > 0 ? '增加' : '减少' }}了 {{ Math.abs(layerDiff.diff) }} 个
          </p>
          <p v-if="renderTreeDiff.diff === 0 && paintDiff.diff === 0 && layerDiff.diff === 0" class="text-gray-500">
            两份 CSS 的渲染结果相同
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
