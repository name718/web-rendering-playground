<script setup lang="ts">
import { ref } from 'vue'
import { useSimulationStore } from '../stores/simulation'
import { demos, type Demo } from '../demos'

const store = useSimulationStore()
const isOpen = ref(false)
const selectedDemo = ref<Demo | null>(null)

function selectDemo(demo: Demo) {
  selectedDemo.value = demo
  store.setHtmlSource(demo.html)
  store.setCssSource(demo.css)
  isOpen.value = false
}

function toggleDropdown() {
  isOpen.value = !isOpen.value
}
</script>

<template>
  <div class="demo-selector relative">
    <button 
      class="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-sm rounded flex items-center gap-2 transition"
      @click="toggleDropdown"
    >
      <span>🎯</span>
      <span>{{ selectedDemo?.title || '选择 Demo' }}</span>
      <span class="text-xs">▼</span>
    </button>
    
    <!-- 下拉菜单 -->
    <div 
      v-if="isOpen"
      class="absolute top-full left-0 mt-1 w-80 bg-gray-800 border border-gray-600 rounded-lg shadow-xl z-50 overflow-hidden"
    >
      <div class="p-2 border-b border-gray-700 text-xs text-gray-400">
        选择一个 Demo 场景，探索浏览器渲染原理
      </div>
      
      <div class="max-h-80 overflow-auto">
        <button
          v-for="demo in demos"
          :key="demo.id"
          class="w-full text-left p-3 hover:bg-gray-700 transition border-b border-gray-700 last:border-0"
          :class="{ 'bg-gray-700': selectedDemo?.id === demo.id }"
          @click="selectDemo(demo)"
        >
          <div class="font-medium text-blue-400 mb-1">{{ demo.title }}</div>
          <div class="text-xs text-gray-400 mb-2">{{ demo.question }}</div>
          <div class="text-xs text-green-400 bg-green-900/30 p-2 rounded">
            💡 {{ demo.answer }}
          </div>
        </button>
      </div>
    </div>
    
    <!-- 点击外部关闭 -->
    <div 
      v-if="isOpen" 
      class="fixed inset-0 z-40" 
      @click="isOpen = false"
    />
  </div>
</template>
