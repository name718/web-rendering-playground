/**
 * CSS Parser - CSS 解析器
 * 解析 CSS 字符串，生成 CSSOM（简化版）
 */

export interface CSSRule {
  selector: string
  declarations: CSSDeclaration[]
  specificity: number[]  // [inline, id, class, element]
}

export interface CSSDeclaration {
  property: string
  value: string
}

export class CSSParser {
  private input: string = ''
  private pos: number = 0

  parse(css: string): CSSRule[] {
    this.input = css
    this.pos = 0
    const rules: CSSRule[] = []

    this.skipWhitespaceAndComments()

    while (this.pos < this.input.length) {
      const rule = this.parseRule()
      if (rule) {
        rules.push(rule)
      }
      this.skipWhitespaceAndComments()
    }

    return rules
  }

  private parseRule(): CSSRule | null {
    // 解析选择器
    const selector = this.parseSelector()
    if (!selector) return null

    this.skipWhitespaceAndComments()

    // 期望 {
    if (this.char() !== '{') return null
    this.pos++

    // 解析声明块
    const declarations = this.parseDeclarations()

    // 期望 }
    if (this.char() === '}') {
      this.pos++
    }

    return {
      selector: selector.trim(),
      declarations,
      specificity: this.calculateSpecificity(selector)
    }
  }

  private parseSelector(): string {
    let selector = ''
    while (this.pos < this.input.length && this.char() !== '{') {
      selector += this.char()
      this.pos++
    }
    return selector.trim()
  }

  private parseDeclarations(): CSSDeclaration[] {
    const declarations: CSSDeclaration[] = []
    this.skipWhitespaceAndComments()

    while (this.pos < this.input.length && this.char() !== '}') {
      const declaration = this.parseDeclaration()
      if (declaration) {
        declarations.push(declaration)
      }
      this.skipWhitespaceAndComments()
    }

    return declarations
  }

  private parseDeclaration(): CSSDeclaration | null {
    this.skipWhitespaceAndComments()

    // 解析属性名
    let property = ''
    while (this.pos < this.input.length && this.char() !== ':' && this.char() !== '}') {
      property += this.char()
      this.pos++
    }
    property = property.trim()

    if (!property || this.char() !== ':') return null
    this.pos++ // skip ':'

    // 解析属性值
    let value = ''
    while (this.pos < this.input.length && this.char() !== ';' && this.char() !== '}') {
      value += this.char()
      this.pos++
    }
    value = value.trim()

    // 跳过分号
    if (this.char() === ';') {
      this.pos++
    }

    if (!property || !value) return null

    return { property, value }
  }

  /**
   * 计算选择器优先级
   * 返回 [inline, id, class/attr/pseudo-class, element/pseudo-element]
   */
  private calculateSpecificity(selector: string): number[] {
    let ids = 0
    let classes = 0
    let elements = 0

    // 计算 ID 选择器数量
    const idMatches = selector.match(/#[a-zA-Z_-][a-zA-Z0-9_-]*/g)
    if (idMatches) ids = idMatches.length

    // 计算类选择器、属性选择器、伪类数量
    const classMatches = selector.match(/\.[a-zA-Z_-][a-zA-Z0-9_-]*/g)
    const attrMatches = selector.match(/\[[^\]]+\]/g)
    const pseudoClassMatches = selector.match(/:[a-zA-Z-]+(?:\([^)]*\))?/g)
    if (classMatches) classes += classMatches.length
    if (attrMatches) classes += attrMatches.length
    if (pseudoClassMatches) classes += pseudoClassMatches.length

    // 计算元素选择器、伪元素数量
    // 先移除 ID、类、属性、伪类，剩下的单词就是元素选择器
    let cleaned = selector
      .replace(/#[a-zA-Z_-][a-zA-Z0-9_-]*/g, '')
      .replace(/\.[a-zA-Z_-][a-zA-Z0-9_-]*/g, '')
      .replace(/\[[^\]]+\]/g, '')
      .replace(/:[a-zA-Z-]+(?:\([^)]*\))?/g, '')
      .replace(/::[a-zA-Z-]+/g, (match) => {
        elements++ // 伪元素
        return ''
      })
    
    const elementMatches = cleaned.match(/[a-zA-Z][a-zA-Z0-9]*/g)
    if (elementMatches) elements += elementMatches.length

    return [0, ids, classes, elements]
  }

  private char(): string {
    return this.input[this.pos] ?? ''
  }

  private skipWhitespaceAndComments(): void {
    while (this.pos < this.input.length) {
      // 跳过空白
      if (/\s/.test(this.char())) {
        this.pos++
        continue
      }
      // 跳过注释 /* */
      if (this.char() === '/' && this.input[this.pos + 1] === '*') {
        this.pos += 2
        while (this.pos < this.input.length) {
          if (this.char() === '*' && this.input[this.pos + 1] === '/') {
            this.pos += 2
            break
          }
          this.pos++
        }
        continue
      }
      break
    }
  }
}

export const cssParser = new CSSParser()
