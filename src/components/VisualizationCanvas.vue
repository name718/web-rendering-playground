<script setup lang="ts">
import { ref } from 'vue'
import { useSimulationStore } from '../stores/simulation'
import DOMTreeView from './DOMTreeView.vue'
import RenderTreeView from './RenderTreeView.vue'
import LayoutView from './LayoutView.vue'
import PaintView from './PaintView.vue'

const store = useSimulationStore()
const activeTab = ref<'dom' | 'render' | 'layout' | 'paint'>('dom')
</script>

<template>
  <div class="visualization-canvas h-full flex flex-col">
    <!-- Tab 切换 -->
    <div class="panel-header px-3 py-2 border-b border-gray-700 flex items-center gap-4">
      <button
        class="text-sm font-medium transition"
        :class="activeTab === 'dom' ? 'text-blue-400' : 'text-gray-400 hover:text-gray-300'"
        @click="activeTab = 'dom'"
      >
        DOM Tree
      </button>
      <button
        class="text-sm font-medium transition"
        :class="activeTab === 'render' ? 'text-blue-400' : 'text-gray-400 hover:text-gray-300'"
        @click="activeTab = 'render'"
      >
        Render Tree
      </button>
      <button
        class="text-sm font-medium transition"
        :class="activeTab === 'layout' ? 'text-blue-400' : 'text-gray-400 hover:text-gray-300'"
        @click="activeTab = 'layout'"
      >
        Layout
      </button>
      <button
        class="text-sm font-medium transition"
        :class="activeTab === 'paint' ? 'text-blue-400' : 'text-gray-400 hover:text-gray-300'"
        @click="activeTab = 'paint'"
      >
        Paint
      </button>
    </div>
    
    <!-- 内容区 -->
    <div class="flex-1 overflow-auto">
      <template v-if="activeTab === 'dom'">
        <div v-if="!store.domTree" class="text-gray-500 text-center mt-20 text-sm">
          点击「开始解析」查看 DOM 树
        </div>
        <DOMTreeView v-else :tree="store.domTree" />
      </template>
      
      <template v-else-if="activeTab === 'render'">
        <div v-if="!store.renderTree" class="text-gray-500 text-center mt-20 text-sm">
          点击「开始解析」查看渲染树
        </div>
        <RenderTreeView v-else />
      </template>
      
      <template v-else-if="activeTab === 'layout'">
        <LayoutView />
      </template>
      
      <template v-else>
        <PaintView />
      </template>
    </div>
  </div>
</template>
