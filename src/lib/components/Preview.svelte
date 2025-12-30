<script lang="ts">
  import { renderMarkdown } from '../utils/markdown'
  import { getHighlightCssUrl } from '../utils/themes'
  import type { DeviceMode, ThemeInfo } from '../stores/themeStore'

  export let markdown = ''
  export let theme: ThemeInfo | null = null
  export let highlight = 'github'
  export let deviceMode: DeviceMode = 'mobile'

  let shadowHost: HTMLDivElement | undefined = undefined
  let shadowRoot: ShadowRoot | null = null

  $: html = renderMarkdown(markdown)

  const loadCssTextIntoShadow = async (shadowRoot: ShadowRoot, url: string): Promise<void> => {
    try {
      const response = await fetch(url)
      if (!response.ok) {
        throw new Error(`Failed to fetch CSS: ${url}`)
      }
      const cssText = await response.text()
      const style = document.createElement('style')
      style.textContent = cssText
      shadowRoot.appendChild(style)
    } catch (error) {
      console.warn(`Failed to load CSS from ${url}:`, error)
    }
  }

  const updateShadowContent = async () => {
    if (!shadowRoot) return

    // 清空现有内容
    shadowRoot.innerHTML = ''

    // 添加基础样式
    const baseStyle = document.createElement('style')
    baseStyle.textContent = `
      :host {
        display: block;
        width: 100%;
        height: 100%;
        min-height: 100%;
      }
      #wedown {
        background: #fff;
        color: #1a1a1a;
        padding: 40px;
        min-height: 100%;
        box-sizing: border-box;
      }
      :host(.preview--mobile) #wedown {
        width: 375px;
        max-width: 100%;
        margin: 0 auto;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      }
    `
    shadowRoot.appendChild(baseStyle)

    // 加载主题样式
    if (theme?.cssPath) {
      await loadCssTextIntoShadow(shadowRoot, theme.cssPath)
    }

    // 加载 highlight.js 样式
    const highlightUrl = getHighlightCssUrl(highlight)
    await loadCssTextIntoShadow(shadowRoot, highlightUrl)

    // 创建预览容器
    const container = document.createElement('div')
    container.id = 'wedown'
    container.innerHTML = html
    shadowRoot.appendChild(container)
  }

  $: if (shadowHost && !shadowRoot) {
    shadowRoot = shadowHost.attachShadow({ mode: 'open' })
  }

  $: if (shadowHost) {
    // 更新 Shadow DOM 的 class
    if (deviceMode === 'mobile') {
      shadowHost.classList.add('preview--mobile')
    } else {
      shadowHost.classList.remove('preview--mobile')
    }
  }
  $: if (shadowRoot && html) {
    updateShadowContent()
  }

  $: if (highlight || theme) {
    if (shadowRoot) {
      loadCssTextIntoShadow(shadowRoot, getHighlightCssUrl(highlight))
      if (theme?.cssPath) {
        loadCssTextIntoShadow(shadowRoot, theme.cssPath)
      }
    }
  }
</script>

<section class="panel preview-panel">
  <header class="panel__header">
    <div class="panel__title">Preview</div>
    <div class="panel__hint">
      {theme ? theme.name : 'No theme selected'}
    </div>
  </header>
  <div class={`preview-shell ${deviceMode === 'mobile' ? 'mobile' : 'desktop'}`}>
    <div bind:this={shadowHost} class="preview-shadow-host" class:preview--mobile={deviceMode === 'mobile'}></div>
  </div>
</section>

<style>
  .preview-shadow-host {
    width: 100%;
    height: 100%;
    min-height: 100%;
  }

  .preview-shell.mobile .preview-shadow-host {
    width: 375px;
    max-width: 100%;
    margin: 0 auto;
  }
</style>

