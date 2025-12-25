// HTML Token 类型
export type TokenType = 
  | 'DOCTYPE'
  | 'StartTag'
  | 'EndTag'
  | 'SelfClosingTag'
  | 'Text'
  | 'Comment'

export interface Token {
  type: TokenType
  name?: string        // 标签名
  content?: string     // 文本内容
  attributes?: Record<string, string>
  position: { start: number; end: number }
}

// DOM 节点类型
export type NodeType = 'element' | 'text' | 'comment' | 'document'

export interface DOMNode {
  id: string
  type: NodeType
  tagName?: string
  textContent?: string
  attributes?: Record<string, string>
  children: DOMNode[]
  parent?: DOMNode
  tokenIndex?: number  // 创建该节点的 Token 索引
}

// 模拟步骤
export type StepType = 
  | 'tokenize'
  | 'build-dom'
  | 'parse-css'
  | 'build-cssom'
  | 'build-render-tree'
  | 'layout'
  | 'paint'
  | 'composite'

// Step Meta 信息 - 解释"为什么"
export interface StepMeta {
  step: StepType
  action: string           // 做了什么
  reason: string           // 为什么这样做
  affectedNodes?: string[] // 影响了哪些节点
  explanation?: string     // 详细解释（面试知识点）
}

// 过滤原因（Render Tree 阶段）
export interface FilterReason {
  nodeId: string
  nodeName: string
  reason: 'display-none' | 'non-visual-tag' | 'empty-text'
  explanation: string
}

// 图层创建原因（Composite 阶段）
export interface LayerReason {
  nodeId: string
  nodeName: string
  trigger: string          // 触发属性
  explanation: string
}

// CSS 规则
export interface CSSRule {
  selector: string
  declarations: { property: string; value: string }[]
  specificity: number[]
}

export interface SimulationStep {
  type: StepType
  description: string
  data: unknown
  timestamp: number
}

// 模拟状态
export interface SimulationState {
  currentStep: number
  tokens: Token[]
  domTree: DOMNode | null
  isPlaying: boolean
  speed: number
}
