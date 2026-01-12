import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as sass from 'sass';
import less from 'less';

// 获取 __dirname 的替代方案 (ESM)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROOT_DIR = path.resolve(__dirname, '..');
const SOURCE_THEMES_DIR = path.join(ROOT_DIR, 'themes');
const PUBLIC_THEMES_DIR = path.join(ROOT_DIR, 'dist/themes');
const OUTPUT_JSON_FILE = path.join(ROOT_DIR, 'dist/themes.json');

/**
 * 核心编译逻辑：返回 CSS 字符串
 * @param {string} themeId 
 * @returns {Promise<string|null>}
 */
export async function getThemeCss(themeId) {
  const themeDir = path.join(SOURCE_THEMES_DIR, themeId);
  if (!fs.existsSync(themeDir)) return null;
  
  const files = await fs.promises.readdir(themeDir);
  const styleFile = files.find(f => f.startsWith('style.'));
  if (!styleFile) return null;

  const ext = path.extname(styleFile);
  const sourcePath = path.join(themeDir, styleFile);

  try {
    if (ext === '.scss' || ext === '.sass') {
      const result = sass.compile(sourcePath, {
        style: 'expanded',
        charset: false,
      });
      return result.css;
    } else if (ext === '.less') {
      const content = await fs.promises.readFile(sourcePath, 'utf-8');
      const result = await less.render(content, { filename: sourcePath });
      return result.css;
    } else if (ext === '.css') {
      return await fs.promises.readFile(sourcePath, 'utf-8');
    }
  } catch (error) {
    console.error(`[Themes][Error] Failed to compile theme ${themeId}:`, error.message);
    throw error;
  }
  return null;
}

/**
 * 获取主题元数据列表
 * @returns {Promise<Array>}
 */
export async function getThemesMetadata() {
  if (!fs.existsSync(SOURCE_THEMES_DIR)) return [];
  
  const entries = await fs.promises.readdir(SOURCE_THEMES_DIR, { withFileTypes: true });
  const themeDirs = entries.filter(entry => entry.isDirectory());
  const themes = [];

  for (const dir of themeDirs) {
    const themeId = dir.name;
    const metaPath = path.join(SOURCE_THEMES_DIR, themeId, 'meta.json');
    
    let meta = {};
    if (fs.existsSync(metaPath)) {
      try {
        const metaContent = await fs.promises.readFile(metaPath, 'utf-8');
        meta = JSON.parse(metaContent);
      } catch (e) {
        console.error(`[Themes][Error] Failed to read meta.json for ${themeId}:`, e.message);
      }
    }

    themes.push({
      ...meta,
      id: themeId,
      name: meta.name || themeId,
      cssPath: `/themes/${themeId}.css`,
    });
  }
  return themes;
}

/**
 * 物理写入所有主题（供构建使用）
 */
export async function runAll() {
  if (!fs.existsSync(SOURCE_THEMES_DIR)) return;
  
  const themes = await getThemesMetadata();
  
  // 编译并写入 CSS
  for (const theme of themes) {
    try {
      const css = await getThemeCss(theme.id);
      if (css) {
        const outputPath = path.join(PUBLIC_THEMES_DIR, `${theme.id}.css`);
        if (!fs.existsSync(PUBLIC_THEMES_DIR)) {
          await fs.promises.mkdir(PUBLIC_THEMES_DIR, { recursive: true });
        }
        await fs.promises.writeFile(outputPath, css, 'utf-8');
        console.log(`[Themes] Compiled ${theme.id} -> dist/themes/${theme.id}.css`);
      }
    } catch (e) {
      // 容错处理
    }
  }

  // 写入 JSON
  const distDir = path.dirname(OUTPUT_JSON_FILE);
  if (!fs.existsSync(distDir)) {
    await fs.promises.mkdir(distDir, { recursive: true });
  }
  // 构建输出时压缩 JSON（不使用缩进）
  await fs.promises.writeFile(OUTPUT_JSON_FILE, JSON.stringify(themes), 'utf-8');
  console.log(`[Themes] Generated compressed themes.json in dist/`);
}

// 支持直接运行脚本
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  runAll().catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
  });
}
