import { writable, derived, type Writable } from 'svelte/store'

export type DeviceMode = 'desktop' | 'mobile'

export type ThemeInfo = {
  id: string;
  name: string;
  description?: string;
  version?: string;
  preview?: string;
  extends?: string;
  cssPath: string;
  metaPath?: string;
};

export type ThemeState = {
  themes: ThemeInfo[]
  activeTheme: ThemeInfo | null
  highlightTheme: string
  deviceMode: DeviceMode
  markdown: string
}

const createThemeStore = () => {
  const themes: Writable<ThemeInfo[]> = writable([])
  const activeTheme: Writable<ThemeInfo | null> = writable(null)
  const highlightTheme = writable('atom-one-dark');
  const deviceMode = writable<DeviceMode>('mobile')
  const markdown = writable('')

  const setThemes = (list: ThemeInfo[]) => {
    themes.set(list)
    if (list.length > 0) {
      activeTheme.set(list[0])
    }
  }

  const selectTheme = (id: string) => {
    themes.update((list) => {
      const found = list.find((item) => item.id === id) ?? null
      activeTheme.set(found)
      return list
    })
  }

  const setHighlightTheme = (name: string) => highlightTheme.set(name)
  const setDeviceMode = (mode: DeviceMode) => deviceMode.set(mode)
  const setMarkdown = (value: string) => markdown.set(value)

  const store = derived(
    [themes, activeTheme, highlightTheme, deviceMode, markdown],
    ([$themes, $activeTheme, $highlightTheme, $deviceMode, $markdown]) => ({
      themes: $themes,
      activeTheme: $activeTheme,
      highlightTheme: $highlightTheme,
      deviceMode: $deviceMode,
      markdown: $markdown,
    }),
  )

  return {
    subscribe: store.subscribe,
    setThemes,
    selectTheme,
    setHighlightTheme,
    setDeviceMode,
    setMarkdown,
    themes,
    activeTheme,
    highlightTheme,
    deviceMode,
    markdown,
  }
}

export const themeStore = createThemeStore()

