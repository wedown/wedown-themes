import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// 获取 __dirname 的替代方案 (ESM)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROOT_DIR = path.resolve(__dirname, '..');
const THEMES_DIR = path.join(ROOT_DIR, 'public/themes');
const PUBLIC_DIR = path.join(ROOT_DIR, 'public');
const OUTPUT_FILE = path.join(PUBLIC_DIR, 'themes.json');

console.log(`Generating themes.json...`);
console.log(`Themes Directory: ${THEMES_DIR}`);
console.log(`Output File: ${OUTPUT_FILE}`);

async function generateThemes() {
  try {
    if (!fs.existsSync(THEMES_DIR)) {
      console.warn(`Themes directory not found at ${THEMES_DIR}`);
      return;
    }

    const entries = await fs.promises.readdir(THEMES_DIR, { withFileTypes: true });

    // 只处理目录
    const themeDirs = entries.filter(entry => entry.isDirectory());

    const themes = [];

    for (const dir of themeDirs) {
      const themeId = dir.name;
      const metaPath = path.join(THEMES_DIR, themeId, 'meta.json');

      let meta = {};
      if (fs.existsSync(metaPath)) {
        try {
          const metaContent = await fs.promises.readFile(metaPath, 'utf-8');
          meta = JSON.parse(metaContent);
        } catch (e) {
          console.error(`Error reading meta.json for theme ${themeId}:`, e);
        }
      }

      // 构造 ThemeInfo 对象
      // 注意：这里的路径是相对于 web 根目录的
      themes.push({
        id: themeId,
        name: meta.name || themeId,
        description: meta.description || '',
        version: meta.version || '0.0.0',
        preview: meta.preview || '',
        cssPath: `/themes/${themeId}/style.css`,
        metaPath: `/themes/${themeId}/meta.json`,
      });
    }

    // 确保 public 目录存在
    if (!fs.existsSync(PUBLIC_DIR)) {
      await fs.promises.mkdir(PUBLIC_DIR, { recursive: true });
    }

    await fs.promises.writeFile(OUTPUT_FILE, JSON.stringify(themes, null, 2), 'utf-8');
    console.log(`Successfully generated themes.json with ${themes.length} themes.`);

  } catch (error) {
    console.error('Failed to generate themes.json:', error);
    process.exit(1);
  }
}

generateThemes();
