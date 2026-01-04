<script lang="ts">
  import { renderMarkdown } from '../utils/markdown'
  import { getHighlightCssUrl } from '../utils/themes'
  import type { DeviceMode, ThemeInfo } from '../stores/themeStore'

  export let markdown = ''
  export let theme: ThemeInfo | null = null
  export let highlight = 'atom-one-dark'
  export let deviceMode: DeviceMode = 'mobile'

  let shadowHost: HTMLDivElement | undefined = undefined
  let shadowRoot: ShadowRoot | null = null

  $: html = renderMarkdown(markdown)

  let styleContainer: HTMLElement | null = null
  let contentContainer: HTMLElement | null = null

  const loadCssTextIntoStyle = async (styleId: string, url: string): Promise<void> => {
    if (!styleContainer) return
    
    let style = styleContainer.querySelector(`#${styleId}`)
    if (!style) {
      style = document.createElement('style')
      style.id = styleId
      styleContainer.appendChild(style)
    }

    try {
      const response = await fetch(url)
      if (!response.ok) {
        throw new Error(`Failed to fetch CSS: ${url}`)
      }
      const cssText = await response.text()
      style.textContent = cssText
    } catch (error) {
      console.warn(`Failed to load CSS from ${url}:`, error)
      style.textContent = '' // Clear if failed
    }
  }

  const initShadowRoot = () => {
    if (!shadowRoot) return

    // Clear existing content only if initializing
    if (shadowRoot.childElementCount > 0) return

    // Base Style for Host
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

    // Container for dynamic styles
    styleContainer = document.createElement('div')
    styleContainer.id = 'style-container'
    styleContainer.style.display = 'none'
    shadowRoot.appendChild(styleContainer)

    // Container for content
    contentContainer = document.createElement('div')
    contentContainer.id = 'wedown'
    shadowRoot.appendChild(contentContainer)
  }

  const updateStyles = async () => {
    if (!styleContainer) return

    // 1. Base Theme Styles (extends)
    if (theme?.extends) {
      const cssPath = theme.extends === 'base' ? '/themes/base.css' : `/themes/${theme.extends}/style.css`
      await loadCssTextIntoStyle('style-base', cssPath)
    } else {
      const style = styleContainer.querySelector('#style-base')
      if (style) style.textContent = ''
    }

    // 2. Highlight.js Styles
    const highlightUrl = getHighlightCssUrl(highlight)
    await loadCssTextIntoStyle('style-highlight', highlightUrl)

    // 3. Theme Styles
    if (theme?.cssPath) {
      await loadCssTextIntoStyle('style-theme', theme.cssPath)
    } else {
      const style = styleContainer.querySelector('#style-theme')
      if (style) style.textContent = ''
    }
  }

  const updateContent = () => {
    if (contentContainer) {
      contentContainer.innerHTML = html
    }
  }

  $: if (shadowHost && !shadowRoot) {
    shadowRoot = shadowHost.attachShadow({ mode: 'open' })
    initShadowRoot()
  }

  $: if (shadowHost) {
    // Update Shadow DOM class
    if (deviceMode === 'mobile') {
      shadowHost.classList.add('preview--mobile')
    } else {
      shadowHost.classList.remove('preview--mobile')
    }
  }

  $: if (shadowRoot) {
    // Ensure structure exists
    if (!styleContainer || !contentContainer) {
      initShadowRoot()
    }
  }

  // React to style changes
  $: if (shadowRoot && (theme || highlight)) {
    updateStyles()
  }

  // React to content changes
  $: if (shadowRoot && html) {
    updateContent()
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

