import { marked } from 'marked'
import hljs from 'highlight.js'

marked.setOptions({
  breaks: true,
  gfm: true
})

export function useMarkdown() {
  function renderMarkdown(content) {
    if (!content) return ''
    
    let rendered
    try {
      if (typeof marked.parse === 'function') {
        rendered = marked.parse(content)
      } else if (typeof marked === 'function') {
        rendered = marked(content)
      } else {
        rendered = `<pre>${content}</pre>`
      }
    } catch (e) {
      console.error('useMarkdown: 渲染错误', e)
      rendered = `<pre>${content}</pre>`
    }
    
    return rendered
  }
  
  function highlightCode() {
    document.querySelectorAll('pre code').forEach(block => {
      if (hljs.highlightElement) {
        hljs.highlightElement(block)
      }
    })
  }
  
  function extractHeadings(content) {
    const headings = []
    const lines = content.split('\n')
    
    console.log('useMarkdown: extractHeadings, first 10 lines:', lines.slice(0, 10))
    
    lines.forEach((line, index) => {
      // 移除末尾的 \r 字符（Windows 换行符）
      const cleanLine = line.replace(/\r$/, '')
      const match = cleanLine.match(/^(#{1,3})\s+(.+)$/)
      if (match) {
        console.log('useMarkdown: 匹配到标题:', cleanLine)
        headings.push({
          level: match[1].length,
          text: match[2],
          line: index
        })
      }
    })
    
    console.log('useMarkdown: 提取到的标题列表:', headings)
    return headings
  }
  
  function renderAndHighlight(content) {
    const html = renderMarkdown(content)
    
    setTimeout(() => {
      highlightCode()
    }, 0)
    
    return html
  }
  
  return {
    renderMarkdown,
    renderAndHighlight,
    highlightCode,
    extractHeadings
  }
}
