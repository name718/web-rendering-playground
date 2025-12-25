/**
 * Pipeline - 完整渲染流水线封装
 * 
 * 特点：
 * - 纯计算，零 UI 依赖
 * - 可单测、可 CLI 跑
 * - 输出完整的中间产物和 Meta 信息
 */

import { tokenizer } from './tokenizer'
import { domBuilder } from './dom-builder'
import { cssParser, type CSSRule } from './css-parser'
import { styleComputer, type StyledNode } from './style-computer'
import { renderTreeBuilder, type RenderNode } from './render-tree'
import { layoutEngine, type LayoutBox } from './layout'
import { paintGenerator, type PaintCommand } from './paint'
import { compositeAnalyzer, type Layer } from './composite'
import {
  analyzeFilterReasons,
  analyzeLayerReasons,
  generateTokenizeMeta,
  generateDOMBuildMeta,
  generateCSSParseMeta,
  generateStyleComputeMeta,
  generateRenderTreeMeta,
  generateLayoutMeta,
  generatePaintMeta,
  generateCompositeMeta
} from './meta'
import type { Token, DOMNode, StepMeta, FilterReason, LayerReason } from '../types'

/**
 * Pipeline 输入配置
 */
export interface PipelineInput {
  html: string
  css?: string
  options?: {
    containerWidth?: number  // 容器宽度，默认 800
  }
}

/**
 * Pipeline 输出结果
 */
export interface PipelineResult {
  // 各阶段产物
  tokens: Token[]
  domTree: DOMNode
  cssRules: CSSRule[]
  styledTree: StyledNode
  renderTree: RenderNode | null
  layoutTree: LayoutBox | null
  paintCommands: PaintCommand[]
  layers: Layer[]
  
  // Meta 信息
  meta: {
    steps: StepMeta[]
    filterReasons: FilterReason[]
    layerReasons: LayerReason[]
  }
  
  // 统计信息
  stats: {
    tokenCount: number
    domNodeCount: number
    cssRuleCount: number
    renderNodeCount: number
    paintCommandCount: number
    layerCount: number
  }
}

/**
 * 计算节点数量
 */
function countNodes(node: { children?: unknown[] } | null): number {
  if (!node) return 0
  let count = 1
  if (node.children) {
    for (const child of node.children) {
      count += countNodes(child as { children?: unknown[] })
    }
  }
  return count
}

/**
 * 运行完整渲染流水线
 */
export function runPipeline(input: PipelineInput): PipelineResult {
  const { html, css = '', options = {} } = input
  const containerWidth = options.containerWidth ?? 800
  
  const steps: StepMeta[] = []
  
  // Step 1: Tokenize
  const tokens = tokenizer.tokenize(html)
  steps.push(generateTokenizeMeta(tokens.length))
  
  // Step 2: Build DOM
  const domTree = domBuilder.build(tokens)
  const domNodeCount = countNodes(domTree)
  steps.push(generateDOMBuildMeta(domNodeCount))
  
  // Step 3: Parse CSS
  const cssRules = css.trim() ? cssParser.parse(css) : []
  if (cssRules.length > 0) {
    steps.push(generateCSSParseMeta(cssRules.length))
  }
  
  // Step 4: Compute Styles
  const styledTree = styleComputer.computeStyles(domTree, cssRules)
  steps.push(generateStyleComputeMeta())
  
  // Step 5: Build Render Tree
  const filterReasons = analyzeFilterReasons(styledTree)
  const renderTree = renderTreeBuilder.build(styledTree)
  const totalNodes = countNodes(styledTree)
  const renderNodeCount = countNodes(renderTree)
  steps.push(generateRenderTreeMeta(totalNodes, renderNodeCount, filterReasons))
  
  // Step 6-8: Layout, Paint, Composite
  let layoutTree: LayoutBox | null = null
  let paintCommands: PaintCommand[] = []
  let layers: Layer[] = []
  let layerReasons: LayerReason[] = []
  
  if (renderTree) {
    // Step 6: Layout
    layoutTree = layoutEngine.compute(renderTree, containerWidth)
    steps.push(generateLayoutMeta())
    
    // Step 7: Paint
    paintCommands = paintGenerator.generate(layoutTree)
    steps.push(generatePaintMeta(paintCommands.length))
    
    // Step 8: Composite
    layers = compositeAnalyzer.analyze(layoutTree)
    layerReasons = analyzeLayerReasons(layers)
    steps.push(generateCompositeMeta(layers.length, layerReasons))
  }
  
  return {
    tokens,
    domTree,
    cssRules,
    styledTree,
    renderTree,
    layoutTree,
    paintCommands,
    layers,
    meta: {
      steps,
      filterReasons,
      layerReasons
    },
    stats: {
      tokenCount: tokens.length,
      domNodeCount,
      cssRuleCount: cssRules.length,
      renderNodeCount,
      paintCommandCount: paintCommands.length,
      layerCount: layers.length
    }
  }
}

/**
 * Pipeline 类 - 支持链式调用和分步执行
 */
export class Pipeline {
  private html: string = ''
  private css: string = ''
  private containerWidth: number = 800
  
  /**
   * 设置 HTML 源码
   */
  setHTML(html: string): this {
    this.html = html
    return this
  }
  
  /**
   * 设置 CSS 源码
   */
  setCSS(css: string): this {
    this.css = css
    return this
  }
  
  /**
   * 设置容器宽度
   */
  setContainerWidth(width: number): this {
    this.containerWidth = width
    return this
  }
  
  /**
   * 运行流水线
   */
  run(): PipelineResult {
    return runPipeline({
      html: this.html,
      css: this.css,
      options: { containerWidth: this.containerWidth }
    })
  }
  
  /**
   * 输出 JSON（便于 CLI 使用）
   */
  toJSON(): string {
    const result = this.run()
    return JSON.stringify(result, null, 2)
  }
}

/**
 * 创建 Pipeline 实例
 */
export function createPipeline(): Pipeline {
  return new Pipeline()
}
