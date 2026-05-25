import { createContext, useContext, useState } from 'react';

export type DeviceMode = 'desktop' | 'mobile';

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
  themes: ThemeInfo[];
  activeTheme: ThemeInfo | null;
  highlightTheme: string;
  deviceMode: DeviceMode;
  markdown: string;
};

const ThemeContext = createContext<{
  themes: ThemeInfo[];
  activeTheme: ThemeInfo | null;
  highlightTheme: string;
  deviceMode: DeviceMode;
  markdown: string;
  setThemes: (list: ThemeInfo[]) => void;
  selectTheme: (id: string) => void;
  setHighlightTheme: (ht: string) => void;
  setDeviceMode: (dm: DeviceMode) => void;
  setMarkdown: (text: string) => void;
}>({
  themes: [],
  activeTheme: null,
  highlightTheme: 'atom-one-dark',
  deviceMode: 'mobile',
  markdown: '',
});

const ThemeProvider: React.FC<any> = ({ children }) => {
  const [themes, _setThemes] = useState<ThemeInfo[]>([]);
  const [activeTheme, setActiveTheme] = useState<ThemeInfo | null>(null);
  const [highlightTheme, setHighlightTheme] = useState('atom-one-dark');
  const [deviceMode, setDeviceMode] = useState<DeviceMode>('mobile');
  const [markdown, setMarkdown] = useState('');

  const setThemes = (list: ThemeInfo[]) => {
    _setThemes(list);
    if (list.length > 0) {
      const id = window.localStorage.getItem('activeTheme');
      setActiveTheme(list.find((item) => item.id === id) ?? list[0]);
    }
  };

  const selectTheme = (id: string) => {
    // 本地化缓存
    window.localStorage.setItem('activeTheme', id);
    // 刷新页面
    _setThemes((list) => {
      const found = list?.find((item) => item.id === id) ?? null;
      setActiveTheme(found);
      return list;
    });
  };

  return (
    <ThemeContext.Provider
      value={{
        themes,
        activeTheme,
        highlightTheme,
        deviceMode,
        markdown,
        setThemes,
        selectTheme,
        setHighlightTheme,
        setDeviceMode,
        setMarkdown,
      }}
    >{children}</ThemeContext.Provider>
  );
};

export const useThemeContext = () => useContext(ThemeContext);

export default ThemeProvider;
