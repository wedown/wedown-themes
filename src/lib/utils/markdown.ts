import MarkdownIt from 'markdown-it'
import container from 'markdown-it-container'
import type { Token } from 'markdown-it/index.js'
import hljs from 'highlight.js'

const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
  highlight(code, lang) {
    if (lang && hljs.getLanguage(lang)) {
      const value = hljs.highlight(code, {
        language: lang,
        ignoreIllegals: true,
      }).value
      return `<pre><code class="hljs language-${lang}">${value}</code></pre>`
    }
    const safe = md.utils.escapeHtml(code)
    return `<pre><code class="hljs">${safe}</code></pre>`
  },
})

/**
 * Remove frontmatter from markdown content
 */
export function removeFrontmatter(content: string): string {
  const frontmatterRegex = /^---\s*\n([\s\S]*?)\n---\s*\n?/;
  return content.replace(frontmatterRegex, '');
}

// Custom container helper
const createContainer = (klass: string, defaultTitle: string) => {
  return [container, klass, {
    render: function (tokens: any[], idx: number) {
      const token = tokens[idx];
      const info = token.info.trim().slice(klass.length).trim();

      if (token.nesting === 1) {
        // opening tag
        const title = info || defaultTitle;
        return `<section class="custom-container ${klass}">${title ? `<p class="custom-container-title">${title}</p>` : ''}\n`;
      } else {
        // closing tag
        return '</section>\n';
      }
    }
  }];
};

// Register containers
// @ts-ignore
md.use(...createContainer('tip'));
// @ts-ignore
md.use(...createContainer('info'));
// @ts-ignore
md.use(...createContainer('warning'));
// @ts-ignore
md.use(...createContainer('danger'));
// @ts-ignore
md.use(...createContainer('success'));
// @ts-ignore
md.use(...createContainer('container'));

md.use(todoTask);

md.use(replaceLiPlugin);

// 替换 li 标签，增加 section 包裹
function replaceLiPlugin(md: MarkdownIt) {
  md.renderer.rules.list_item_open = function (tokens, idx, options, env, self) {
    return `${self.renderToken(tokens, idx, options)}<section>`;
  };
  md.renderer.rules.list_item_close = function (tokens, idx, options, env, self) {
    return `</section>${self.renderToken(tokens, idx, options)}`;
  };
}

// 任务列表
function todoTask(md: MarkdownIt) {
  function isInline(token: Token) { return token.type === 'inline'; }
  function isParagraph(token: Token) { return token.type === 'paragraph_open'; }
  function isListItem(token: Token) { return token.type === 'list_item_open'; }

  function startsWithTodoMarkdown(token: Token) {
    // leading whitespace in a list item is already trimmed off by markdown-it
    return token.content.indexOf('[ ] ') === 0 || token.content.indexOf('[x] ') === 0 || token.content.indexOf('[X] ') === 0;
  }
  function isTodoItem(tokens: Token[], index: number) {
    return isInline(tokens[index]) &&
      isParagraph(tokens[index - 1]) &&
      isListItem(tokens[index - 2]) &&
      startsWithTodoMarkdown(tokens[index]);
  }

  function makeCheckbox(token: Token, TokenConstructor: any) {
    const checkbox = new TokenConstructor('html_inline', '', 0);
    if (token.content.indexOf('[ ] ') === 0) {
      checkbox.content = '<span class="checkbox" role="checkbox" aria-checked="false"></span>';
    } else if (token.content.indexOf('[x] ') === 0 || token.content.indexOf('[X] ') === 0) {
      checkbox.content = '<span class="checkbox checked" role="checkbox" aria-checked="true"></span>';
    }
    return checkbox;
  }

  function attrSet(token: Token, name: string, value: string) {
    const index = token.attrIndex(name);
    const attrA: [string, string] = [name, value];

    if (index < 0) {
      token.attrPush(attrA);
    } else {
      token.attrs![index] = attrA;
    }
  }

  function parentToken(tokens: Token[], index: number) {
    const targetLevel = tokens[index].level - 1;
    for (let i = index - 1; i >= 0; i--) {
      if (tokens[i].level === targetLevel) {
        return i;
      }
    }
    return -1;
  }

  md.core.ruler.after('inline', 'github-task-lists', function (state) {
    const tokens = state.tokens;
    for (let i = 2; i < tokens.length; i++) {
      const token = tokens[i];
      if (isTodoItem(tokens, i)) {
        token.children?.unshift(makeCheckbox(token, state.Token));
        token.children![1].content = token.children![1].content.slice(3);
        token.content = token.content.slice(3);

        attrSet(tokens[i - 2], 'class', 'task-list-item');
        attrSet(tokens[parentToken(tokens, i - 2)], 'class', 'task-list');
      }
    }
  });
}

export const renderMarkdown = (source: string) => md.render(source ?? '')

