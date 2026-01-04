<script lang="ts">
  import { onMount } from 'svelte'
  import Editor from './lib/components/Editor.svelte'
  import Preview from './lib/components/Preview.svelte'
  import ThemeSelector from './lib/components/ThemeSelector.svelte'
  import DeviceToggle from './lib/components/DeviceToggle.svelte'
  import { themeStore } from './lib/stores/themeStore'
  import { loadLocalThemes, loadHighlightThemes, type HighlightThemeInfo } from './lib/utils/themes'

  const store = themeStore
  $: state = $store

  let highlightThemes: HighlightThemeInfo[] = []

  onMount(async () => {
    const [themes, hlThemes] = await Promise.all([
      loadLocalThemes(),
      loadHighlightThemes()
    ])
    
    themeStore.setThemes(themes)
    highlightThemes = hlThemes

    const response = await fetch('/sample.md')
    const text = await response.text()
    themeStore.setMarkdown(text)
  })

  const handleEditorInput = (event: CustomEvent<string>) => {
    themeStore.setMarkdown(event.detail)
  }

  const handleThemeChange = (event: CustomEvent<string>) => {
    themeStore.selectTheme(event.detail)
  }

  const handleHighlightChange = (event: CustomEvent<string>) => {
    themeStore.setHighlightTheme(event.detail)
  }

  const handleDeviceChange = (event: CustomEvent<'desktop' | 'mobile'>) => {
    themeStore.setDeviceMode(event.detail)
  }
  let editor: Editor
  let preview: Preview
  let isScrolling = false
  let scrollTimeout: any

  const handleScroll = (source: 'editor' | 'preview', event: CustomEvent<number>) => {
    if (isScrolling) return
    isScrolling = true
    
    const percent = event.detail
    if (source === 'editor') {
      preview?.scrollTo(percent)
    } else {
      editor?.scrollTo(percent)
    }

    clearTimeout(scrollTimeout)
    scrollTimeout = setTimeout(() => {
      isScrolling = false
    }, 50)
  }
</script>

<div class="app">
  <header class="app__topbar">
    <div class="app__header-left">
      <h1>Wedown Themes</h1>
      <!-- svelte-ignore a11y_consider_explicit_label -->
      <a href="https://github.com/wedown/wedown-themes" target="_blank" rel="noopener noreferrer" class="app__github-link">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
        </svg>
      </a>
    </div>
    <div class="app__controls">
      <ThemeSelector
        themes={state.themes}
        activeThemeId={state.activeTheme?.id ?? null}
        highlightThemes={highlightThemes}
        highlightTheme={state.highlightTheme}
        on:theme={handleThemeChange}
        on:highlight={handleHighlightChange}
      />
      <DeviceToggle mode={state.deviceMode} on:change={handleDeviceChange} />
    </div>
  </header>

  <div class="workspace">
    <div class="column">
      <Editor
        bind:this={editor}
        value={state.markdown}
        on:input={handleEditorInput}
        on:scroll={(e) => handleScroll('editor', e)}
      />
    </div>
    <div class="column">
      <Preview
        bind:this={preview}
        markdown={state.markdown}
        theme={state.activeTheme}
        highlight={state.highlightTheme}
        deviceMode={state.deviceMode}
        on:scroll={(e) => handleScroll('preview', e)}
      />
    </div>
  </div>
</div>
