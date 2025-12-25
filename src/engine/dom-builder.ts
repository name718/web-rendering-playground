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

  build(tokens: Token[]): DOMNode {
    nodeIdCounter = 0
    
    // 创建 document 根节点
    this.root = {
      id: generateId(),
      type: 'document',
      tagName: '#document',
      children: []
    }
    this.stack = [this.root]

    for (const token of tokens) {
      this.processToken(token)
    }

    return this.root
  }

  private processToken(token: Token): void {
    const current = this.stack[this.stack.length - 1]

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
      parent
    }
    
    parent.children.push(node)
    this.stack.push(node)
  }

  private handleEndTag(token: Token): void {
    // 从栈中弹出匹配的开始标签
    // 简化处理：直接弹出，不做严格匹配校验
    if (this.stack.length > 1) {
      // 找到匹配的标签并弹出
      for (let i = this.stack.length - 1; i > 0; i--) {
        if (this.stack[i].tagName === token.name) {
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
      parent
    }
    
    parent.children.push(node)
    // 自闭合标签不入栈
  }

  private handleText(token: Token, parent: DOMNode): void {
    const node: DOMNode = {
      id: generateId(),
      type: 'text',
      textContent: token.content,
      children: [],
      parent
    }
    
    parent.children.push(node)
  }

  private handleComment(token: Token, parent: DOMNode): void {
    const node: DOMNode = {
      id: generateId(),
      type: 'comment',
      textContent: token.content,
      children: [],
      parent
    }
    
    parent.children.push(node)
  }
}

export const domBuilder = new DOMBuilder()
