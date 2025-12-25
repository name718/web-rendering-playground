import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Token, DOMNode, SimulationStep } from '../types'

export const useSimulationStore = defineStore('simulation', () => {
  // 状态
  const htmlSource = ref('')
  const tokens = ref<Token[]>([])
  const domTree = ref<DOMNode | null>(null)
  const steps = ref<SimulationStep[]>([])
  const currentStepIndex = ref(-1)
  const isPlaying = ref(false)
  const speed = ref(1000) // 毫秒

  // 计算属性
  const currentStep = computed(() => 
    currentStepIndex.value >= 0 ? steps.value[currentStepIndex.value] : null
  )
  
  const canGoBack = computed(() => currentStepIndex.value > 0)
  const canGoForward = computed(() => currentStepIndex.value < steps.value.length - 1)
  const progress = computed(() => 
    steps.value.length > 0 ? (currentStepIndex.value + 1) / steps.value.length : 0
  )

  // 操作
  function setHtmlSource(html: string) {
    htmlSource.value = html
    reset()
  }

  function addStep(step: Omit<SimulationStep, 'timestamp'>) {
    steps.value.push({
      ...step,
      timestamp: Date.now()
    })
  }

  function forward() {
    if (canGoForward.value) {
      currentStepIndex.value++
    }
  }

  function backward() {
    if (canGoBack.value) {
      currentStepIndex.value--
    }
  }

  function jumpTo(index: number) {
    if (index >= 0 && index < steps.value.length) {
      currentStepIndex.value = index
    }
  }

  function reset() {
    tokens.value = []
    domTree.value = null
    steps.value = []
    currentStepIndex.value = -1
    isPlaying.value = false
  }

  function setTokens(newTokens: Token[]) {
    tokens.value = newTokens
  }

  function setDomTree(tree: DOMNode) {
    domTree.value = tree
  }

  function play() {
    isPlaying.value = true
  }

  function pause() {
    isPlaying.value = false
  }

  function setSpeed(ms: number) {
    speed.value = ms
  }

  return {
    // 状态
    htmlSource,
    tokens,
    domTree,
    steps,
    currentStepIndex,
    isPlaying,
    speed,
    // 计算属性
    currentStep,
    canGoBack,
    canGoForward,
    progress,
    // 操作
    setHtmlSource,
    addStep,
    forward,
    backward,
    jumpTo,
    reset,
    setTokens,
    setDomTree,
    play,
    pause,
    setSpeed,
  }
})
