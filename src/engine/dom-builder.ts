import type { Token, DOMNode } from '../types'

let nodeIdCounter = 0

function generateId(): string {
  return `node-${++nodeIdCounter}`
}

/**
 * DOM Tree Builder - 语法分析器
 * 将 Token 流构建成 DOM 树
 */
export class DOMBuilder {
  private root: DOMNode | null = null
  private stack: DOMNode[] = []
  private currentTokenIndex: number = 0

  build(tokens: Token[]): DOMNode {
    nodeIdCounter = 0
    this.currentTokenIndex = 0
    
    // 创建 document 根节点
    this.root = {
      id: generateId(),
      type: 'document',
      tagName: '#document',
      children: [],
      tokenIndex: -1  // document 节点没有对应的 token
    }
    this.stack = [this.root]

    for (let i = 0; i < tokens.length; i++) {
      this.currentTokenIndex = i
      const token = tokens[i]
      if (token) {
        this.processToken(token)
      }
    }

    return this.root
  }

  private processToken(token: Token): void {
    const current = this.stack[this.stack.length - 1]
    if (!current) return

    switch (token.type) {
      case 'DOCTYPE':
        // DOCTYPE 作为 document 的信息，不创建节点
        break

      case 'StartTag':
        this.handleStartTag(token, current)
        break

      case 'EndTag':
        this.handleEndTag(token)
        break

      case 'SelfClosingTag':
        this.handleSelfClosingTag(token, current)
        break

      case 'Text':
        this.handleText(token, current)
        break

      case 'Comment':
        this.handleComment(token, current)
        break
    }
  }

  private handleStartTag(token: Token, parent: DOMNode): void {
    const node: DOMNode = {
      id: generateId(),
      type: 'element',
      tagName: token.name,
      attributes: token.attributes,
      children: [],
      parent,
      tokenIndex: this.currentTokenIndex
    }
    
    parent.children.push(node)
    this.stack.push(node)
  }

  private handleEndTag(token: Token): void {
    // 从栈中弹出匹配的开始标签
    if (this.stack.length > 1) {
      for (let i = this.stack.length - 1; i > 0; i--) {
        const stackNode = this.stack[i]
        if (stackNode && stackNode.tagName === token.name) {
          this.stack.splice(i)
          break
        }
      }
    }
  }

  private handleSelfClosingTag(token: Token, parent: DOMNode): void {
    const node: DOMNode = {
      id: generateId(),
      type: 'element',
      tagName: token.name,
      attributes: token.attributes,
      children: [],
      parent,
      tokenIndex: this.currentTokenIndex
    }
    
    parent.children.push(node)
  }

  private handleText(token: Token, parent: DOMNode): void {
    const node: DOMNode = {
      id: generateId(),
      type: 'text',
      textContent: token.content,
      children: [],
      parent,
      tokenIndex: this.currentTokenIndex
    }
    
    parent.children.push(node)
  }

  private handleComment(token: Token, parent: DOMNode): void {
    const node: DOMNode = {
      id: generateId(),
      type: 'comment',
      textContent: token.content,
      children: [],
      parent,
      tokenIndex: this.currentTokenIndex
    }
    
    parent.children.push(node)
  }
}

export const domBuilder = new DOMBuilder()
