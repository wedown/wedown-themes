import { useEffect, useRef, type RefObject } from 'react';
import { renderMarkdown } from '../utils/markdown';
import { getHighlightCssUrl } from '../utils/themes';
import { useThemeContext } from '../stores/themeContext';

function Preview({ ref, onScroll }: { ref: RefObject<HTMLDivElement | null>; onScroll: (per: number) => void }) {
  const { markdown, activeTheme, highlightTheme, deviceMode } = useThemeContext();

  const shadowHost = useRef<HTMLDivElement>(null);

  const handleScroll = () => {
    if (!ref.current) return;
    const { scrollTop, scrollHeight, clientHeight } = ref.current;
    const maxScroll = scrollHeight - clientHeight;
    const percent = maxScroll > 0 ? scrollTop / maxScroll : 0;
    onScroll(percent);
  };

  let shadowRoot = useRef<ShadowRoot | null>(null);
  let styleContainer = useRef<HTMLElement | null>(null);
  let contentContainer = useRef<HTMLElement | null>(null);

  const html = renderMarkdown(markdown);

  const loadCssTextIntoStyle = async (styleId: string, url: string): Promise<void> => {
    if (!styleContainer.current) return;

    let style = styleContainer.current.querySelector(`#${styleId}`);
    if (!style) {
      style = document.createElement('style');
      style.id = styleId;
    } else {
      style.remove();
    }
    styleContainer.current.appendChild(style);

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch CSS: ${url}`);
      }
      const cssText = await response.text();
      style.textContent = cssText;
    } catch (error) {
      console.warn(`Failed to load CSS from ${url}:`, error);
      style.textContent = ''; // Clear if failed
    }
  };

  const initShadowRoot = () => {
    if (!shadowRoot.current) return;
    // Clear existing content only if initializing
    if (shadowRoot.current.childElementCount > 0) return;

    // Base Style for Host
    const baseStyle = document.createElement('style');
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
    `;
    shadowRoot.current.appendChild(baseStyle);

    // Container for dynamic styles
    styleContainer.current = document.createElement('div');
    styleContainer.current.id = 'style-container';
    styleContainer.current.style.display = 'none';
    shadowRoot.current.appendChild(styleContainer.current);

    // Container for content
    contentContainer.current = document.createElement('div');
    contentContainer.current.id = 'wedown';
    contentContainer.current.innerHTML = html;
    shadowRoot.current.appendChild(contentContainer.current);
  };

  const updateStyles = async () => {
    if (!styleContainer.current) return;

    // 1. Base Theme Styles (extends)
    if (activeTheme?.extends) {
      const cssPath = activeTheme.extends === 'base' ? '/themes/base.css' : `/themes/${activeTheme.extends}/style.css`;
      await loadCssTextIntoStyle('style-base', cssPath);
    } else {
      const style = styleContainer.current.querySelector('#style-base');
      style?.remove();
    }

    // 2. Highlight.js Styles
    const highlightUrl = getHighlightCssUrl(highlightTheme);
    await loadCssTextIntoStyle('style-highlight', highlightUrl);

    // 3. Theme Styles
    if (activeTheme?.cssPath) {
      await loadCssTextIntoStyle('style-theme', activeTheme.cssPath);
    } else {
      const style = styleContainer.current.querySelector('#style-theme');
      style?.remove();
    }
  };

  useEffect(() => {
    if (shadowHost.current && !shadowRoot.current) {
      shadowRoot.current = shadowHost.current.attachShadow({ mode: 'open' });
      initShadowRoot();
    } else if (shadowRoot.current) {
      // Ensure structure exists
      if (!styleContainer || !contentContainer) {
        initShadowRoot();
      }
    }
  }, []);

  useEffect(() => {
    if (shadowRoot && contentContainer && html) {
      contentContainer.current!.innerHTML = html;
    }
  }, [html]);

  // React to style changes
  useEffect(() => {
    if (shadowRoot && (activeTheme || highlightTheme)) {
      updateStyles();
    }
  }, [activeTheme, highlightTheme]);

  return (
    <section className="panel preview-panel">
      <header className="panel__header">
        <div className="panel__title">Preview</div>
        <div className="panel__hint">{activeTheme ? activeTheme.name : 'No theme selected'}</div>
      </header>
      <div
        ref={ref}
        onScroll={handleScroll}
        className={`preview-shell ${deviceMode === 'mobile' ? 'mobile' : 'desktop'}`}
      >
        <div
          ref={shadowHost}
          className={'preview-shadow-host' + (deviceMode === 'mobile' ? ' preview--mobile' : '')}
        ></div>
      </div>
    </section>
  );
}

export default Preview;
