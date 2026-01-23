import React, { type FormEventHandler } from 'react';
import { useThemeContext } from '../stores/themeContext';

function Editor({
  ref,
  onScroll,
}: {
  ref: React.RefObject<HTMLTextAreaElement | null>;
  onScroll: (percent: number) => void;
}) {
  const title = 'Input';

  const { markdown, setMarkdown } = useThemeContext();

  const handleInput: FormEventHandler<HTMLTextAreaElement> = (event) => {
    const target = event.target as HTMLTextAreaElement;
    setMarkdown(target.value);
  };

  const handleScroll = () => {
    if (!ref.current) return;
    const { scrollTop, scrollHeight, clientHeight } = ref.current;
    const maxScroll = scrollHeight - clientHeight;
    const percent = maxScroll > 0 ? scrollTop / maxScroll : 0;
    onScroll(percent);
  };

  return (
    <section className="panel editor">
      <header className="panel__header">
        <div className="panel__title">{title}</div>
      </header>
      <textarea
        ref={ref}
        className="editor__textarea"
        value={markdown}
        onInput={handleInput}
        onScroll={handleScroll}
        placeholder="开始输入 Markdown..."
      ></textarea>
    </section>
  );
}

export default Editor;
