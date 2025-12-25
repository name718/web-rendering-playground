import type { Token, TokenType } from '../types'

/**
 * HTML Tokenizer - 词法分析器
 * 将 HTML 字符串拆分成 Token 流
 */
export class HTMLTokenizer {
  private input: string = ''
  private pos: number = 0
  private tokens: Token[] = []

  private char(): string {
    return this.input[this.pos] ?? ''
  }

  tokenize(html: string): Token[] {
    this.input = html
    this.pos = 0
    this.tokens = []

    while (this.pos < this.input.length) {
      if (this.match('<!DOCTYPE') || this.match('<!doctype')) {
        this.readDoctype()
      } else if (this.match('<!--')) {
        this.readComment()
      } else if (this.match('</')) {
        this.readEndTag()
      } else if (this.match('<')) {
        this.readStartTag()
      } else {
        this.readText()
      }
    }

    return this.tokens
  }

  private match(str: string): boolean {
    return this.input.slice(this.pos, this.pos + str.length).toLowerCase() === str.toLowerCase()
  }

  private readDoctype(): void {
    const start = this.pos
    this.pos += 9 // skip '<!DOCTYPE'
    
    // 跳过空格
    while (this.pos < this.input.length && /\s/.test(this.char())) {
      this.pos++
    }
    
    // 读取 doctype 内容直到 >
    let content = ''
    while (this.pos < this.input.length && this.char() !== '>') {
      content += this.char()
      this.pos++
    }
    this.pos++ // skip '>'

    this.tokens.push({
      type: 'DOCTYPE',
      content: content.trim(),
      position: { start, end: this.pos }
    })
  }

  private readComment(): void {
    const start = this.pos
    this.pos += 4 // skip '<!--'
    
    let content = ''
    while (this.pos < this.input.length) {
      if (this.match('-->')) {
        this.pos += 3
        break
      }
      content += this.char()
      this.pos++
    }

    this.tokens.push({
      type: 'Comment',
      content,
      position: { start, end: this.pos }
    })
  }

  private readEndTag(): void {
    const start = this.pos
    this.pos += 2 // skip '</'
    
    let tagName = ''
    while (this.pos < this.input.length && /[a-zA-Z0-9]/.test(this.char())) {
      tagName += this.char()
      this.pos++
    }
    
    // 跳到 >
    while (this.pos < this.input.length && this.char() !== '>') {
      this.pos++
    }
    this.pos++ // skip '>'

    this.tokens.push({
      type: 'EndTag',
      name: tagName.toLowerCase(),
      position: { start, end: this.pos }
    })
  }

  private readStartTag(): void {
    const start = this.pos
    this.pos++ // skip '<'
    
    // 读取标签名
    let tagName = ''
    while (this.pos < this.input.length && /[a-zA-Z0-9]/.test(this.char())) {
      tagName += this.char()
      this.pos++
    }

    // 读取属性
    const attributes: Record<string, string> = {}
    this.skipWhitespace()
    
    while (this.pos < this.input.length && this.char() !== '>' && this.char() !== '/') {
      const attr = this.readAttribute()
      if (attr) {
        attributes[attr.name] = attr.value
      }
      this.skipWhitespace()
    }

    // 检查是否自闭合
    let isSelfClosing = false
    if (this.char() === '/') {
      isSelfClosing = true
      this.pos++
    }
    
    // 跳过 >
    if (this.char() === '>') {
      this.pos++
    }

    // 自闭合标签列表
    const voidElements = ['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'source', 'track', 'wbr']
    if (voidElements.includes(tagName.toLowerCase())) {
      isSelfClosing = true
    }

    const tokenType: TokenType = isSelfClosing ? 'SelfClosingTag' : 'StartTag'

    this.tokens.push({
      type: tokenType,
      name: tagName.toLowerCase(),
      attributes: Object.keys(attributes).length > 0 ? attributes : undefined,
      position: { start, end: this.pos }
    })
  }

  private readAttribute(): { name: string; value: string } | null {
    let name = ''
    
    // 读取属性名
    while (this.pos < this.input.length && /[a-zA-Z0-9\-_:]/.test(this.char())) {
      name += this.char()
      this.pos++
    }

    if (!name) return null

    this.skipWhitespace()

    // 检查是否有 =
    if (this.char() !== '=') {
      return { name: name.toLowerCase(), value: '' }
    }
    this.pos++ // skip '='
    this.skipWhitespace()

    // 读取属性值
    let value = ''
    const quote = this.char()
    
    if (quote === '"' || quote === "'") {
      this.pos++ // skip opening quote
      while (this.pos < this.input.length && this.char() !== quote) {
        value += this.char()
        this.pos++
      }
      this.pos++ // skip closing quote
    } else {
      // 无引号的属性值
      while (this.pos < this.input.length && !/[\s>]/.test(this.char())) {
        value += this.char()
        this.pos++
      }
    }

    return { name: name.toLowerCase(), value }
  }

  private readText(): void {
    const start = this.pos
    let content = ''
    
    while (this.pos < this.input.length && this.char() !== '<') {
      content += this.char()
      this.pos++
    }

    // 忽略纯空白文本
    if (content.trim()) {
      this.tokens.push({
        type: 'Text',
        content: content,
        position: { start, end: this.pos }
      })
    }
  }

  private skipWhitespace(): void {
    while (this.pos < this.input.length && /\s/.test(this.char())) {
      this.pos++
    }
  }
}

// 导出单例便于使用
export const tokenizer = new HTMLTokenizer()
