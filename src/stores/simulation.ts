import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Token, DOMNode, SimulationStep, CSSRule } from '../types'

export const useSimulationStore = defineStore('simulation', () => {
  // 状态
  const htmlSource = ref('')
  const cssSource = ref('')
  const tokens = ref<Token[]>([])
  const domTree = ref<DOMNode | null>(null)
  const cssRules = ref<CSSRule[]>([])
  const steps = ref<SimulationStep[]>([])
  const currentStepIndex = ref(-1)
  const isPlaying = ref(false)
  const speed = ref(1000) // 毫秒
  const selectedTokenIndex = ref<number | null>(null) // 当前选中的 Token

  // 计算属性
  const currentStep = computed(() => 
    currentStepIndex.value >= 0 ? steps.value[currentStepIndex.value] : null
  )
  
  const canGoBack = computed(() => currentStepIndex.value > 0)
  const canGoForward = computed(() => currentStepIndex.value < steps.value.length - 1)
  const progress = computed(() => 
    steps.value.length > 0 ? (currentStepIndex.value + 1) / steps.value.length : 0
  )

  // 当前选中的 Token
  const selectedToken = computed(() => 
    selectedTokenIndex.value !== null ? tokens.value[selectedTokenIndex.value] : null
  )

  // 操作
  function setHtmlSource(html: string) {
    htmlSource.value = html
    reset()
  }

  function setCssSource(css: string) {
    cssSource.value = css
  }

  function setCssRules(rules: CSSRule[]) {
    cssRules.value = rules
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
    cssRules.value = []
    steps.value = []
    currentStepIndex.value = -1
    isPlaying.value = false
    selectedTokenIndex.value = null
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

  function selectToken(index: number | null) {
    selectedTokenIndex.value = index
  }

  return {
    // 状态
    htmlSource,
    cssSource,
    tokens,
    domTree,
    cssRules,
    steps,
    currentStepIndex,
    isPlaying,
    speed,
    selectedTokenIndex,
    // 计算属性
    currentStep,
    canGoBack,
    canGoForward,
    progress,
    selectedToken,
    // 操作
    setHtmlSource,
    setCssSource,
    setCssRules,
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
    selectToken,
  }
})
