<script lang="ts">
  import { createEventDispatcher } from 'svelte'
  import type { ThemeInfo } from '../stores/themeStore'

  export let themes: ThemeInfo[] = []
  export let activeThemeId: string | null = null
  export let highlightThemes: string[] = []
  export let highlightTheme = 'github'

  const dispatch = createEventDispatcher<{
    theme: string
    highlight: string
  }>()

  const handleThemeChange = (event: Event) => {
    const value = (event.target as HTMLSelectElement).value
    dispatch('theme', value)
  }

  const handleHighlightChange = (event: Event) => {
    const value = (event.target as HTMLSelectElement).value
    dispatch('highlight', value)
  }
</script>

<div class="selector">
  <div class="selector__group">
    <label for="theme-select">Theme</label>
    <select id="theme-select" on:change={handleThemeChange} bind:value={activeThemeId}>
      {#if themes.length === 0}
        <option value="" disabled>No themes found</option>
      {:else}
        {#each themes as item}
          <option value={item.id}>{item.name}</option>
        {/each}
      {/if}
    </select>
  </div>

  <div class="selector__group">
    <label for="highlight-select">Highlight</label>
    <select id="highlight-select" on:change={handleHighlightChange} bind:value={highlightTheme}>
      {#each highlightThemes as item}
        <option value={item}>{item}</option>
      {/each}
    </select>
  </div>
</div>

