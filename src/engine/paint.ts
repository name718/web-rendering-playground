import type { LayoutBox } from './layout'

export type PaintCommandType = 
  | 'background'
  | 'border'
  | 'text'

export interface PaintCommand {
  id: string
  type: PaintCommandType
  targetId: string
  tagName?: string
  description: string
  // 绘制区域
  x: number
  y: number
  width: number
  height: number
  // 样式
  color?: string
  backgroundColor?: string
  borderColor?: string
}

/**
 * Paint Generator - 绘制指令生成器
 * 将 LayoutBox 转换为绘制指令列表
 * 
 * 绘制顺序（Painting Order）：
 * 1. 背景色
 * 2. 边框
 * 3. 子元素（递归）
 * 4. 文本内容
 */
export class PaintGenerator {
  private commands: PaintCommand[] = []
  private commandId: number = 0

  generate(layoutTree: LayoutBox): PaintCommand[] {
    this.commands = []
    this.commandId = 0
    this.paintNode(layoutTree)
    return this.commands
  }

  private paintNode(box: LayoutBox): void {
    // 1. 绘制背景
    this.paintBackground(box)

    // 2. 绘制边框
    this.paintBorder(box)

    // 3. 递归绘制子元素
    for (const child of box.children) {
      this.paintNode(child)
    }

    // 4. 绘制文本
    if (box.textContent) {
      this.paintText(box)
    }
  }

  private paintBackground(box: LayoutBox): void {
    const bgColor = box.style['background-color']
    
    // 只有有背景色时才生成绘制指令
    if (bgColor && bgColor !== 'transparent') {
      this.commands.push({
        id: `paint-${++this.commandId}`,
        type: 'background',
        targetId: box.id,
        tagName: box.tagName,
        description: `绘制 <${box.tagName}> 背景: ${bgColor}`,
        x: box.x,
        y: box.y,
        width: box.width,
        height: box.height,
        backgroundColor: bgColor
      })
    }
  }

  private paintBorder(box: LayoutBox): void {
    const hasBorder = box.border.top > 0 || box.border.right > 0 || 
                      box.border.bottom > 0 || box.border.left > 0
    
    if (hasBorder) {
      const borderColor = box.style['border-color'] || '#000'
      this.commands.push({
        id: `paint-${++this.commandId}`,
        type: 'border',
        targetId: box.id,
        tagName: box.tagName,
        description: `绘制 <${box.tagName}> 边框`,
        x: box.x,
        y: box.y,
        width: box.width,
        height: box.height,
        borderColor
      })
    }
  }

  private paintText(box: LayoutBox): void {
    const color = box.style.color || '#000'
    const text = box.textContent || ''
    const displayText = text.length > 20 ? text.slice(0, 20) + '...' : text
    
    this.commands.push({
      id: `paint-${++this.commandId}`,
      type: 'text',
      targetId: box.id,
      description: `绘制文本: "${displayText}"`,
      x: box.x + box.padding.left,
      y: box.y + box.padding.top,
      width: box.width - box.padding.left - box.padding.right,
      height: box.height - box.padding.top - box.padding.bottom,
      color
    })
  }
}

export const paintGenerator = new PaintGenerator()
