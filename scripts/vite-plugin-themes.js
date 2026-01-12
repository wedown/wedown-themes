import { getThemeCss, getThemesMetadata, runAll } from './generate-themes.js';

/** @returns {import('vite').Plugin} */
export default function vitePluginThemes() {
  return {
    name: 'vite-plugin-themes',
    
    // 开发服务器中间件：按需编译
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (req.url?.startsWith('/themes')) {
          let fileName = req.url.slice(1).split('?')[0];
          fileName = fileName.split('/').pop() || '';
          
          try {
            if (fileName === 'themes.json') {
              const themes = await getThemesMetadata();
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify(themes, null, 2));
              return;
            } 
            
            if (fileName.endsWith('.css')) {
              const themeId = fileName.slice(0, -4);
              const css = await getThemeCss(themeId);
              if (css) {
                res.setHeader('Content-Type', 'text/css');
                res.end(css);
                return;
              }
            }
          } catch (error) {
            console.error(`[Themes][Middleware Error] ${error.message}`);
            res.statusCode = 500;
            res.end(error.message);
            return;
          }
        }
        next();
      });
    },

    // 构建结束后（此时 dist 已被 vite 清理并填充了其它资源）再写入主题
    async closeBundle() {
      // 仅在生产构建时执行物理写入
      if (process.env.NODE_ENV === 'production' || !this.meta?.watchMode) {
        console.log('[Themes] Generating theme assets for build...');
        await runAll();
      }
    }
  };
}
