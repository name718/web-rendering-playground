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
