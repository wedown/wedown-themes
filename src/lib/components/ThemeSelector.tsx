import { type ChangeEventHandler } from 'react';
import { useThemeContext, type ThemeInfo } from '../stores/themeContext';
import type { HighlightThemeInfo } from '../utils/themes';

function ThemeSelector({ highlightThemes }: { highlightThemes: HighlightThemeInfo[] }) {
  const { themes, activeTheme, selectTheme, highlightTheme, setHighlightTheme } = useThemeContext();

  const handleThemeChange: ChangeEventHandler<HTMLSelectElement> = (event) => {
    const value = (event.target as HTMLSelectElement).value;
    selectTheme(value);
  };

  const handleHighlightChange: ChangeEventHandler<HTMLSelectElement> = (event) => {
    const value = (event.target as HTMLSelectElement).value;
    setHighlightTheme(value);
  };

  return (
    <div className="selector">
      <div className="selector__group">
        <label htmlFor="theme-select">Theme</label>
        <select id="theme-select" onChange={handleThemeChange} value={activeTheme?.id}>
          {themes.length === 0 && (
            <option value="" disabled>
              No themes found
            </option>
          )}
          {themes.map((item) => (
            <option value={item.id} key={item.id}>{item.name}</option>
          ))}
        </select>
      </div>

      <div className="selector__group">
        <label htmlFor="highlight-select">Highlight</label>
        <select id="highlight-select" onChange={handleHighlightChange} value={highlightTheme}>
          {highlightThemes.map((item) => (
            <option value={item.value} key={item.value}>{item.label}</option>
          ))}
        </select>
      </div>
    </div>
  );
}

export default ThemeSelector;
