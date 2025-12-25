import type { StyledNode, ComputedStyle } from './style-computer'

export interface RenderNode {
  id: string
  tagName?: string
  textContent?: string
  style: ComputedStyle
  children: RenderNode[]
  tokenIndex?: number
}

/**
 * Render Tree Builder - 渲染树构建器
 * 将 StyledNode 转换为 RenderNode，过滤不可见节点
 */
export class RenderTreeBuilder {
  
  /**
   * 构建渲染树
   * - 过滤 display: none 的节点
   * - 过滤 head、script、style 等不渲染的标签
   */
  build(styledTree: StyledNode): RenderNode | null {
    return this.buildNode(styledTree)
  }

  private buildNode(styledNode: StyledNode): RenderNode | null {
    const { node, computedStyle, children } = styledNode

    // 过滤不渲染的节点类型
    if (node.type === 'comment') {
      return null
    }

    // 过滤不渲染的标签
    const hiddenTags = ['head', 'script', 'style', 'meta', 'link', 'title']
    if (node.tagName && hiddenTags.includes(node.tagName)) {
      return null
    }

    // 过滤 display: none
    if (computedStyle['display'] === 'none') {
      return null
    }

    // 递归构建子节点
    const renderChildren: RenderNode[] = []
    for (const child of children) {
      const renderChild = this.buildNode(child)
      if (renderChild) {
        renderChildren.push(renderChild)
      }
    }

    // 文本节点
    if (node.type === 'text') {
      // 空白文本不渲染
      if (!node.textContent?.trim()) {
        return null
      }
      return {
        id: node.id,
        textContent: node.textContent,
        style: computedStyle,
        children: [],
        tokenIndex: node.tokenIndex
      }
    }

    // document 节点特殊处理 - 直接返回 body 的内容
    if (node.type === 'document') {
      // 找到 html -> body 路径
      const html = renderChildren.find(c => c.tagName === 'html')
      if (html) {
        const body = html.children.find(c => c.tagName === 'body')
        if (body) {
          return body
        }
        return html
      }
      // 没有 html 标签，返回所有子节点的容器
      return {
        id: node.id,
        tagName: '#document',
        style: computedStyle,
        children: renderChildren,
        tokenIndex: node.tokenIndex
      }
    }

    // 元素节点
    return {
      id: node.id,
      tagName: node.tagName,
      style: computedStyle,
      children: renderChildren,
      tokenIndex: node.tokenIndex
    }
  }
}

export const renderTreeBuilder = new RenderTreeBuilder()
