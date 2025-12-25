import type { LayoutBox } from './layout'

export interface Layer {
  id: string
  name: string
  reason: string  // 为什么创建独立图层
  box: LayoutBox
  children: Layer[]
}

/**
 * Composite Analyzer - 合成层分析器
 * 分析哪些元素会创建独立的合成层
 * 
 * 触发独立图层的常见情况：
 * - transform (非 none)
 * - opacity < 1
 * - position: fixed
 * - will-change
 * - filter
 * - 3D transforms
 */
export class CompositeAnalyzer {
  
  analyze(layoutTree: LayoutBox): Layer[] {
    const layers: Layer[] = []
    
    // 根图层
    const rootLayer: Layer = {
      id: 'root-layer',
      name: 'Root Layer',
      reason: '文档根图层',
      box: layoutTree,
      children: []
    }
    layers.push(rootLayer)
    
    // 分析子节点
    this.analyzeNode(layoutTree, layers)
    
    return layers
  }

  private analyzeNode(box: LayoutBox, layers: Layer[]): void {
    const layerReason = this.getLayerReason(box)
    
    if (layerReason) {
      layers.push({
        id: `layer-${box.id}`,
        name: box.tagName || 'text',
        reason: layerReason,
        box,
        children: []
      })
    }
    
    for (const child of box.children) {
      this.analyzeNode(child, layers)
    }
  }

  private getLayerReason(box: LayoutBox): string | null {
    const style = box.style
    
    // transform
    if (style.transform && style.transform !== 'none') {
      return `transform: ${style.transform}`
    }
    
    // opacity < 1
    if (style.opacity && parseFloat(style.opacity) < 1) {
      return `opacity: ${style.opacity}`
    }
    
    // position: fixed
    if (style.position === 'fixed') {
      return 'position: fixed'
    }
    
    // will-change
    if (style['will-change'] && style['will-change'] !== 'auto') {
      return `will-change: ${style['will-change']}`
    }
    
    // filter
    if (style.filter && style.filter !== 'none') {
      return `filter: ${style.filter}`
    }
    
    // z-index with position
    if (style['z-index'] && style.position && style.position !== 'static') {
      return `z-index: ${style['z-index']} (stacking context)`
    }
    
    return null
  }
}

export const compositeAnalyzer = new CompositeAnalyzer()
