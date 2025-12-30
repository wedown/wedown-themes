import MarkdownIt from 'markdown-it'
import hljs from 'highlight.js'

const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
  highlight(code, lang) {
    if (lang && hljs.getLanguage(lang)) {
      const value = hljs.highlight(code, {
        language: lang,
        ignoreIllegals: true,
      }).value
      return `<pre><code class="hljs language-${lang}">${value}</code></pre>`
    }
    const safe = md.utils.escapeHtml(code)
    return `<pre><code class="hljs">${safe}</code></pre>`
  },
})

export const renderMarkdown = (source: string) => md.render(source ?? '')

