import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Token, DOMNode, SimulationStep, CSSRule, StepMeta, FilterReason, LayerReason } from '../types'
import type { StyledNode, RenderNode, LayoutBox, PaintCommand, Layer, PipelineResult } from '../engine'

export const useSimulationStore = defineStore('simulation', () => {
  // 状态
  const htmlSource = ref('')
  const cssSource = ref('')
  const tokens = ref<Token[]>([])
  const domTree = ref<DOMNode | null>(null)
  const cssRules = ref<CSSRule[]>([])
  const styledTree = ref<StyledNode | null>(null)
  const renderTree = ref<RenderNode | null>(null)
  const layoutTree = ref<LayoutBox | null>(null)
  const paintCommands = ref<PaintCommand[]>([])
  const layers = ref<Layer[]>([])
  const steps = ref<SimulationStep[]>([])
  const currentStepIndex = ref(-1)
  const isPlaying = ref(false)
  const speed = ref(1000) // 毫秒
  const selectedTokenIndex = ref<number | null>(null) // 当前选中的 Token

  // Meta 信息 - 解释"为什么"
  const stepMetas = ref<StepMeta[]>([])
  const filterReasons = ref<FilterReason[]>([])
  const layerReasons = ref<LayerReason[]>([])

  // Diff 模式
  const diffMode = ref(false)
  const cssSourceB = ref('')  // 对比用的第二份 CSS
  const resultB = ref<PipelineResult | null>(null)  // 第二份渲染结果

  // 计算属性
  const currentStep = computed(() => 
    currentStepIndex.value >= 0 ? steps.value[currentStepIndex.value] : null
  )
  
  // 当前步骤的 Meta 信息
  const currentMeta = computed(() => {
    if (!currentStep.value) return null
    return stepMetas.value.find(m => m.step === currentStep.value?.type) || null
  })
  
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

  function setStyledTree(tree: StyledNode) {
    styledTree.value = tree
  }

  function setRenderTree(tree: RenderNode | null) {
    renderTree.value = tree
  }

  function setLayoutTree(tree: LayoutBox | null) {
    layoutTree.value = tree
  }

  function setPaintCommands(commands: PaintCommand[]) {
    paintCommands.value = commands
  }

  function setLayers(newLayers: Layer[]) {
    layers.value = newLayers
  }

  // Meta 信息操作
  function addStepMeta(meta: StepMeta) {
    // 避免重复添加
    const existing = stepMetas.value.findIndex(m => m.step === meta.step)
    if (existing >= 0) {
      stepMetas.value[existing] = meta
    } else {
      stepMetas.value.push(meta)
    }
  }

  function setFilterReasons(reasons: FilterReason[]) {
    filterReasons.value = reasons
  }

  function setLayerReasons(reasons: LayerReason[]) {
    layerReasons.value = reasons
  }

  // Diff 模式操作
  function setDiffMode(enabled: boolean) {
    diffMode.value = enabled
    if (!enabled) {
      resultB.value = null
    }
  }

  function setCssSourceB(css: string) {
    cssSourceB.value = css
  }

  function setResultB(result: PipelineResult | null) {
    resultB.value = result
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
    styledTree.value = null
    renderTree.value = null
    layoutTree.value = null
    paintCommands.value = []
    layers.value = []
    steps.value = []
    currentStepIndex.value = -1
    isPlaying.value = false
    selectedTokenIndex.value = null
    // 重置 Meta 信息
    stepMetas.value = []
    filterReasons.value = []
    layerReasons.value = []
    // 重置 Diff 结果（但保留模式和 CSS B）
    resultB.value = null
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
    styledTree,
    renderTree,
    layoutTree,
    paintCommands,
    layers,
    steps,
    currentStepIndex,
    isPlaying,
    speed,
    selectedTokenIndex,
    // Meta 信息
    stepMetas,
    filterReasons,
    layerReasons,
    // Diff 模式
    diffMode,
    cssSourceB,
    resultB,
    // 计算属性
    currentStep,
    currentMeta,
    canGoBack,
    canGoForward,
    progress,
    selectedToken,
    // 操作
    setHtmlSource,
    setCssSource,
    setCssRules,
    setStyledTree,
    setRenderTree,
    setLayoutTree,
    setPaintCommands,
    setLayers,
    addStepMeta,
    setFilterReasons,
    setLayerReasons,
    setDiffMode,
    setCssSourceB,
    setResultB,
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
