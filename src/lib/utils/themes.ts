import type { ThemeInfo } from '../stores/themeStore'

const THEME_LINK_ID = 'theme-stylesheet'
const HLJS_LINK_ID = 'hljs-stylesheet'

// 已知的主题列表（可以从构建时生成或运行时扫描）
const KNOWN_THEMES = ['default']

export const loadLocalThemes = async (): Promise<ThemeInfo[]> => {
  const themes: ThemeInfo[] = []
  
  for (const themeId of KNOWN_THEMES) {
    try {
      const metaResponse = await fetch(`/themes/${themeId}/meta.json`)
      if (metaResponse.ok) {
        const meta = await metaResponse.json()
        themes.push({
          id: themeId,
          name: meta.name ?? themeId,
          description: meta.description,
          version: meta.version,
          preview: meta.preview,
          cssPath: `/themes/${themeId}/style.css`,
          metaPath: `/themes/${themeId}/meta.json`,
        })
      }
    } catch (error) {
      console.warn(`Failed to load theme ${themeId}:`, error)
    }
  }
  
  // 如果没有加载到任何主题，返回默认主题
  if (themes.length === 0) {
    return [
      {
        id: 'default',
        name: '默认主题',
        description: '基础浅色阅读主题，配合代码高亮',
        version: '1.0.0',
        cssPath: '/themes/default/style.css',
        metaPath: '/themes/default/meta.json',
      },
    ]
  }
  
  return themes
}

export const ensureLinkTag = (id: string, href: string) => {
  let link = document.getElementById(id) as HTMLLinkElement | null
  if (!link) {
    link = document.createElement('link')
    link.id = id
    link.rel = 'stylesheet'
    document.head.appendChild(link)
  }
  link.href = href
}

export const applyThemeCss = (href: string) => {
  if (href) {
    ensureLinkTag(THEME_LINK_ID, href)
  }
}

export const getHighlightCssUrl = (name: string) =>
  `https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.11.1/styles/${name}.min.css`

export const applyHighlightCss = (name: string) => {
  ensureLinkTag(HLJS_LINK_ID, getHighlightCssUrl(name))
}

export const highlightThemes = [
  'github',
  'github-dark',
  'atom-one-light',
  'atom-one-dark',
  'vs',
  'vs2015',
  'monokai',
  // 'dracula',
  // 'solarized-light',
  // 'solarized-dark',
]

