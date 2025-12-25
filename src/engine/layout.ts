import type { RenderNode } from './render-tree'
import type { ComputedStyle } from './style-computer'

export interface LayoutBox {
  id: string
  tagName?: string
  textContent?: string
  // 盒模型
  x: number
  y: number
  width: number
  height: number
  // 盒模型各部分
  margin: { top: number; right: number; bottom: number; left: number }
  padding: { top: number; right: number; bottom: number; left: number }
  border: { top: number; right: number; bottom: number; left: number }
  // 样式
  style: ComputedStyle
  // 子节点
  children: LayoutBox[]
  tokenIndex?: number
}

/**
 * Layout Engine - 布局引擎
 * 计算每个节点的位置和大小（简化版块级布局）
 */
export class LayoutEngine {
  private containerWidth: number = 800

  /**
   * 计算布局
   */
  compute(renderTree: RenderNode, containerWidth: number = 800): LayoutBox {
    this.containerWidth = containerWidth
    return this.layoutNode(renderTree, 0, 0, containerWidth)
  }

  private layoutNode(
    node: RenderNode,
    x: number,
    y: number,
    availableWidth: number
  ): LayoutBox {
    const style = node.style

    // 解析盒模型值
    const margin = this.parseBoxValues(style, 'margin')
    const padding = this.parseBoxValues(style, 'padding')
    const border = this.parseBoxValues(style, 'border')

    // 计算内容区宽度
    const contentWidth = this.calculateWidth(style, availableWidth, margin, padding, border)

    // 计算子节点布局
    const children: LayoutBox[] = []
    let childY = y + margin.top + border.top + padding.top
    let maxChildWidth = 0

    for (const child of node.children) {
      const childBox = this.layoutNode(
        child,
        x + margin.left + border.left + padding.left,
        childY,
        contentWidth
      )
      children.push(childBox)
      childY += childBox.height + childBox.margin.top + childBox.margin.bottom
      maxChildWidth = Math.max(maxChildWidth, childBox.width)
    }

    // 计算高度
    const contentHeight = this.calculateHeight(style, childY - (y + margin.top + border.top + padding.top))

    // 总尺寸
    const totalWidth = margin.left + border.left + padding.left + contentWidth + padding.right + border.right + margin.right
    const totalHeight = margin.top + border.top + padding.top + contentHeight + padding.bottom + border.bottom + margin.bottom

    return {
      id: node.id,
      tagName: node.tagName,
      textContent: node.textContent,
      x: x + margin.left,
      y: y + margin.top,
      width: contentWidth + padding.left + padding.right + border.left + border.right,
      height: contentHeight + padding.top + padding.bottom + border.top + border.bottom,
      margin,
      padding,
      border,
      style,
      children,
      tokenIndex: node.tokenIndex
    }
  }

  private parseBoxValues(
    style: ComputedStyle,
    property: 'margin' | 'padding' | 'border'
  ): { top: number; right: number; bottom: number; left: number } {
    const defaultValue = { top: 0, right: 0, bottom: 0, left: 0 }

    // 尝试解析简写属性
    const shorthand = style[property]
    if (shorthand) {
      const value = this.parseLength(shorthand)
      return { top: value, right: value, bottom: value, left: value }
    }

    // 尝试解析各方向属性
    return {
      top: this.parseLength(style[`${property}-top`] || '0'),
      right: this.parseLength(style[`${property}-right`] || '0'),
      bottom: this.parseLength(style[`${property}-bottom`] || '0'),
      left: this.parseLength(style[`${property}-left`] || '0')
    }
  }

  private parseLength(value: string | undefined): number {
    if (!value) return 0
    
    // 处理 px 值
    const pxMatch = value.match(/^(\d+(?:\.\d+)?)\s*px$/i)
    if (pxMatch) {
      return parseFloat(pxMatch[1] ?? '0')
    }

    // 处理百分比（简化：相对于容器宽度）
    const percentMatch = value.match(/^(\d+(?:\.\d+)?)\s*%$/)
    if (percentMatch) {
      return (parseFloat(percentMatch[1] ?? '0') / 100) * this.containerWidth
    }

    // 处理纯数字
    const num = parseFloat(value)
    if (!isNaN(num)) {
      return num
    }

    return 0
  }

  private calculateWidth(
    style: ComputedStyle,
    availableWidth: number,
    margin: { left: number; right: number },
    padding: { left: number; right: number },
    border: { left: number; right: number }
  ): number {
    const widthValue = style.width

    if (widthValue && widthValue !== 'auto') {
      return this.parseLength(widthValue)
    }

    // 块级元素默认占满可用宽度
    const display = style.display || 'block'
    if (display === 'block') {
      return availableWidth - margin.left - margin.right - padding.left - padding.right - border.left - border.right
    }

    // inline 元素根据内容（简化处理）
    return 100
  }

  private calculateHeight(style: ComputedStyle, contentHeight: number): number {
    const heightValue = style.height

    if (heightValue && heightValue !== 'auto') {
      return this.parseLength(heightValue)
    }

    // 默认根据内容高度，最小 20px
    return Math.max(contentHeight, 20)
  }
}

export const layoutEngine = new LayoutEngine()
