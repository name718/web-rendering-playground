<script setup lang="ts">
import { ref, watch } from 'vue'
import { useSimulationStore } from '../stores/simulation'

const store = useSimulationStore()

const cssInput = ref(`.container {
  width: 100%;
  padding: 20px;
}

h1 {
  color: blue;
  font-size: 24px;
}

p {
  color: #333;
  line-height: 1.5;
}

.container h1 {
  color: red;
}`)

watch(cssInput, (val) => {
  store.setCssSource(val)
}, { immediate: true })
</script>

<template>
  <div class="css-panel h-full flex flex-col">
    <div class="panel-header px-3 py-2 border-b border-gray-700 text-sm font-medium text-gray-300">
      CSS Source
    </div>
    <textarea
      v-model="cssInput"
      class="flex-1 w-full p-3 bg-gray-900 text-gray-100 font-mono text-sm resize-none outline-none"
      placeholder="Enter CSS here..."
      spellcheck="false"
    />
  </div>
</template>
