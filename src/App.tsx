import { useEffect, useRef, useState } from 'react';
import Editor from './lib/components/Editor';
import Preview from './lib/components/Preview';
import ThemeSelector from './lib/components/ThemeSelector';
import DeviceToggle from './lib/components/DeviceToggle';
import { useThemeContext } from './lib/stores/themeContext';
import { loadLocalThemes, loadHighlightThemes, type HighlightThemeInfo } from './lib/utils/themes';

function App() {
  const { setThemes, setMarkdown } = useThemeContext();

  const [highlightThemes, setHighlightThemes] = useState<HighlightThemeInfo[]>([]);

  useEffect(() => {
    Promise.all([loadLocalThemes(), loadHighlightThemes()]).then(async ([themes, hlThemes]) => {
      setThemes(themes);
      setHighlightThemes(hlThemes);

      const response = await fetch('/sample.md');
      const text = await response.text();
      setMarkdown(text);
    });
  }, []);

  const editorRef = useRef<HTMLTextAreaElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);

  let isScrolling = false;
  let scrollTimeout: any;

  const handleScroll = (source: 'editor' | 'preview', percent: number) => {
    if (isScrolling) return;
    isScrolling = true;

    if (source === 'editor') {
      const { scrollHeight, clientHeight } = previewRef.current!;
      const maxScroll = scrollHeight - clientHeight;
      previewRef.current!.scrollTop = maxScroll * percent;
    } else {
      const { scrollHeight, clientHeight } = editorRef.current!;
      const maxScroll = scrollHeight - clientHeight;
      editorRef.current!.scrollTop = maxScroll * percent;
    }

    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(() => {
      isScrolling = false;
    }, 50);
  };

  return (
    <div className="app">
      <header className="app__topbar">
        <div className="app__header-left">
          <h1>Wedown Themes</h1>
          <a
            href="https://github.com/wedown/wedown-themes"
            target="_blank"
            rel="noopener noreferrer"
            className="app__github-link"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
            </svg>
          </a>
        </div>
        <div className="app__controls">
          <ThemeSelector highlightThemes={highlightThemes} />
          <DeviceToggle />
        </div>
      </header>

      <div className="workspace">
        <div className="column">
          <Editor ref={editorRef} onScroll={(e) => handleScroll('editor', e)} />
        </div>
        <div className="column">
          <Preview ref={previewRef} onScroll={(e) => handleScroll('preview', e)} />
        </div>
      </div>
    </div>
  );
}

export default App;
