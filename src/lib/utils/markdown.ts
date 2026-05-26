import MarkdownIt from 'markdown-it'
import container from 'markdown-it-container'
import type { Token } from 'markdown-it/index.js'
import hljs from 'highlight.js'

const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
  highlight: (code, lang): string => {
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

const defaultImageRender = md.renderer.rules.image;
md.renderer.rules.image = function(tokens, idx, options, env, self) {
  const token = tokens[idx];
  const src = token.attrGet('src') || '';
  const m = src.match(/^(.*?)\s*=\s*(\d*)\s*x\s*(\d*)\s*$/i);
  if (m) {
    token.attrSet('src', m[1].trim());
    if (m[2]) token.attrSet('width', m[2]);
    if (m[3]) token.attrSet('height', m[3]);
  }

  const imgHtml = defaultImageRender
    ? defaultImageRender(tokens, idx, options, env, self)
    : self.renderToken(tokens, idx, options);

  const altText = self.renderInlineAsText(token.children || [], options, env);
  if (altText) {
    return `<figure>${imgHtml}<figcaption>${md.utils.escapeHtml(altText)}</figcaption></figure>`;
  }
  return imgHtml;
};

const _render = md.render.bind(md);
md.render = function (src, env) {
  const processed = src.replace(
    /(!\[[^\]]*\]\([^)]*?)\s+=\s*(\d*)\s*x\s*(\d*)\)/gi,
    '$1=$2x$3)'
  );
  return _render(processed, env);
};

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

let imageGroupLabel = '';

// @ts-ignore
md.use(container, 'image-group', {
  render: function (tokens: any[], idx: number) {
    if (tokens[idx].nesting === 1) {
      const info = tokens[idx].info.trim().slice('image-group'.length).trim();
      imageGroupLabel = info ? md.utils.escapeHtml(info) : '';
      return '<section class="image-group">\n<section class="image-group-images">\n';
    }
    const label = imageGroupLabel ? `<p class="image-group-label">${imageGroupLabel}</p>\n` : '';
    imageGroupLabel = '';
    return `</section>\n${label}</section>\n`;
  }
});

md.use(todoTask);

md.use(replaceLiPlugin);

md.core.ruler.push('image-group-strip-p', function (state) {
  const tokens = state.tokens;
  let inRow = false;
  for (let i = 0; i < tokens.length; i++) {
    const t = tokens[i];
    if (t.type === 'container_image-group_open') { inRow = true; continue; }
    if (t.type === 'container_image-group_close') { inRow = false; continue; }
    if (inRow && t.type === 'paragraph_open') {
      const inline = tokens[i + 1];
      if (inline?.type === 'inline' && inline.children?.every(c => c.type === 'image' || !c.content.trim())) {
        t.hidden = true;
        if (tokens[i + 2]?.type === 'paragraph_close') tokens[i + 2].hidden = true;
      }
    }
  }
});

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

