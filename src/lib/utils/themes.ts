import type { ThemeInfo } from '../stores/themeStore'

const THEME_LINK_ID = 'theme-stylesheet'
const HLJS_LINK_ID = 'hljs-stylesheet'

export const loadLocalThemes = async (): Promise<ThemeInfo[]> => {
  try {
    const response = await fetch('/themes.json');
    if (response.ok) {
      return await response.json();
    }
  } catch (error) {
    console.warn('Failed to load themes list:', error);
  }

  // 如果没有加载到任何主题，返回默认主题
  return [
    {
      id: 'default',
      name: '默认主题',
      description: '基础浅色阅读主题，配合代码高亮',
      version: '1.0.0',
      cssPath: '/themes/default/style.css',
      metaPath: '/themes/default/meta.json',
    },
  ];
};

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

export interface HighlightThemeInfo {
  value: string;
  label: string;
}

export const loadHighlightThemes = async (): Promise<HighlightThemeInfo[]> => {
  try {
    const response = await fetch('/hlcss.json');
    if (response.ok) {
      return await response.json();
    }
  } catch (error) {
    console.warn('Failed to load highlight themes:', error);
  }
  return [];
};

export const highlightThemes: HighlightThemeInfo[] = [];

