<script setup lang="ts">
import { useSimulationStore } from '../stores/simulation'

const store = useSimulationStore()

// 格式化优先级显示
function formatSpecificity(spec: number[]): string {
  return `(${spec.join(', ')})`
}
</script>

<template>
  <div class="cssom-view h-full flex flex-col">
    <div class="panel-header px-3 py-2 border-b border-gray-700 text-sm font-medium text-gray-300">
      CSSOM ({{ store.cssRules.length }} 条规则)
    </div>
    <div class="flex-1 overflow-auto">
      <div v-if="store.cssRules.length === 0" class="text-gray-500 text-center mt-10 text-sm">
        暂无 CSS 规则
      </div>
      <div v-else class="p-2 space-y-2">
        <div
          v-for="(rule, index) in store.cssRules"
          :key="index"
          class="rule-item p-2 rounded bg-gray-800 text-xs font-mono"
        >
          <div class="flex items-center justify-between mb-1">
            <span class="text-purple-400 font-medium">{{ rule.selector }}</span>
            <span class="text-gray-500 text-xs" title="优先级 (inline, id, class, element)">
              {{ formatSpecificity(rule.specificity) }}
            </span>
          </div>
          <div class="pl-2 border-l-2 border-gray-600 space-y-0.5">
            <div
              v-for="(decl, i) in rule.declarations"
              :key="i"
              class="text-gray-300"
            >
              <span class="text-blue-400">{{ decl.property }}</span>
              <span class="text-gray-500">: </span>
              <span class="text-green-400">{{ decl.value }}</span>
              <span class="text-gray-500">;</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
