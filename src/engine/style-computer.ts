import type { DOMNode } from '../types'
import type { CSSRule } from './css-parser'

export interface ComputedStyle {
  [property: string]: string
}

export interface StyledNode {
  node: DOMNode
  computedStyle: ComputedStyle
  children: StyledNode[]
}

/**
 * Style Computer - 样式计算器
 * 将 CSS 规则匹配到 DOM 节点，计算最终样式
 */
export class StyleComputer {
  
  /**
   * 计算整棵树的样式
   */
  computeStyles(domTree: DOMNode, cssRules: CSSRule[]): StyledNode {
    return this.computeNodeStyle(domTree, cssRules, {})
  }

  private computeNodeStyle(
    node: DOMNode, 
    cssRules: CSSRule[], 
    inheritedStyle: ComputedStyle
  ): StyledNode {
    // 计算当前节点的样式
    const computedStyle = this.computeStyleForNode(node, cssRules, inheritedStyle)
    
    // 递归计算子节点
    const children = node.children.map(child => 
      this.computeNodeStyle(child, cssRules, computedStyle)
    )

    return {
      node,
      computedStyle,
      children
    }
  }

  private computeStyleForNode(
    node: DOMNode, 
    cssRules: CSSRule[], 
    inheritedStyle: ComputedStyle
  ): ComputedStyle {
    // 文本节点继承父样式
    if (node.type === 'text' || node.type === 'comment' || node.type === 'document') {
      return { ...inheritedStyle }
    }

    // 可继承的属性
    const inheritableProps = ['color', 'font-size', 'font-family', 'line-height', 'text-align']
    
    // 从继承样式中提取可继承属性
    const style: ComputedStyle = {}
    for (const prop of inheritableProps) {
      if (inheritedStyle[prop]) {
        style[prop] = inheritedStyle[prop]
      }
    }

    // 收集匹配的规则，按优先级排序
    const matchedRules: { rule: CSSRule; specificity: number[] }[] = []
    
    for (const rule of cssRules) {
      if (this.matchesSelector(node, rule.selector)) {
        matchedRules.push({ rule, specificity: rule.specificity })
      }
    }

    // 按优先级排序（低优先级在前，后面的会覆盖前面的）
    matchedRules.sort((a, b) => this.compareSpecificity(a.specificity, b.specificity))

    // 应用样式
    for (const { rule } of matchedRules) {
      for (const decl of rule.declarations) {
        style[decl.property] = decl.value
      }
    }

    return style
  }

  /**
   * 简化版选择器匹配
   * 支持：元素选择器、类选择器、ID选择器、后代选择器
   */
  private matchesSelector(node: DOMNode, selector: string): boolean {
    // 处理后代选择器（空格分隔）
    const parts = selector.trim().split(/\s+/)
    
    if (parts.length === 1) {
      return this.matchesSingleSelector(node, parts[0] ?? '')
    }

    // 后代选择器：最后一个部分必须匹配当前节点
    const lastPart = parts[parts.length - 1] ?? ''
    if (!this.matchesSingleSelector(node, lastPart)) {
      return false
    }

    // 检查祖先是否匹配前面的部分
    const remainingParts = parts.slice(0, -1)
    return this.ancestorMatches(node.parent, remainingParts)
  }

  private ancestorMatches(node: DOMNode | undefined, parts: string[]): boolean {
    if (parts.length === 0) return true
    if (!node) return false

    const lastPart = parts[parts.length - 1] ?? ''
    
    // 当前祖先匹配最后一个部分
    if (this.matchesSingleSelector(node, lastPart)) {
      return this.ancestorMatches(node.parent, parts.slice(0, -1))
    }

    // 继续向上查找
    return this.ancestorMatches(node.parent, parts)
  }

  /**
   * 匹配单个选择器（不含空格）
   */
  private matchesSingleSelector(node: DOMNode, selector: string): boolean {
    if (node.type !== 'element') return false

    // 解析选择器：div.class#id
    let remaining = selector
    let tagName: string | null = null
    const classes: string[] = []
    let id: string | null = null

    // 提取 ID
    const idMatch = remaining.match(/#([a-zA-Z_-][a-zA-Z0-9_-]*)/)
    if (idMatch && idMatch[1]) {
      id = idMatch[1]
      remaining = remaining.replace(/#[a-zA-Z_-][a-zA-Z0-9_-]*/, '')
    }

    // 提取类
    const classMatches = remaining.match(/\.([a-zA-Z_-][a-zA-Z0-9_-]*)/g)
    if (classMatches) {
      for (const match of classMatches) {
        classes.push(match.slice(1))
      }
      remaining = remaining.replace(/\.[a-zA-Z_-][a-zA-Z0-9_-]*/g, '')
    }

    // 剩下的是标签名
    const tagMatch = remaining.match(/^[a-zA-Z][a-zA-Z0-9]*/)
    if (tagMatch && tagMatch[0]) {
      tagName = tagMatch[0].toLowerCase()
    }

    // 检查匹配
    if (tagName && node.tagName !== tagName) {
      return false
    }

    if (id && node.attributes?.id !== id) {
      return false
    }

    if (classes.length > 0) {
      const nodeClasses = (node.attributes?.class || '').split(/\s+/)
      for (const cls of classes) {
        if (!nodeClasses.includes(cls)) {
          return false
        }
      }
    }

    return true
  }

  /**
   * 比较优先级
   */
  private compareSpecificity(a: number[], b: number[]): number {
    for (let i = 0; i < 4; i++) {
      if (a[i] !== b[i]) {
        return (a[i] ?? 0) - (b[i] ?? 0)
      }
    }
    return 0
  }
}

export const styleComputer = new StyleComputer()
