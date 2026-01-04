# Wedown Themes

这里是 [Wedown](https://wedown.app) 的官方主题库。欢迎贡献你的主题！

## 开发

1. 安装依赖
```bash
npm install
```

2. 启动开发服务器
```bash
npm run dev
```

开发服务器启动后，可以访问 `http://localhost:5173` 预览主题效果。

## 如何贡献主题

所有的主题都存放在 `public/themes` 目录下。要添加一个新主题，请按照以下步骤操作：

### 1. 创建主题目录

在 `public/themes` 下创建一个新的文件夹，文件夹名称即为主题的 ID（例如 `my-theme`）。

### 2. 添加 `meta.json`

在主题目录中创建 `meta.json` 文件，填写主题的元数据。

```json
{
  "name": "我的主题",
  "description": "这是一个很棒的主题",
  "author": "你的名字",
  "version": "v1",
  "extends": "base",
  "colors": {
    "primary": "#007bff",
    "text": "#333333"
  },
  "preview": ""
}
```

**字段说明：**

*   `name` (必填): 主题的显示名称。
*   `description` (可选): 主题的简短描述。
*   `author` (可选): 作者名称。
*   `version` (可选): 版本号。
*   `extends` (可选): 继承的基础主题，通常填写 `"base"`。
*   `colors` (可选): 主题的关键颜色，用于在选择器中展示预览。
    *   `primary`: 主色调。
    *   `text`: 文本颜色。
*   `preview` (可选): 预览图片的 URL（目前暂未使用）。

### 3. 添加 `style.css`

在主题目录中创建 `style.css` 文件，编写你的 CSS 样式。

**样式编写指南：**

Wedown 使用 Shadow DOM 来隔离样式，因此你不需要担心样式污染全局。

*   **基础样式**: 默认情况下，预览区域有一个 ID `#wedown`。推荐继承 `base` 主题，它已经定义了良好的排版基础。
*   **CSS 变量**: 你可以覆盖 `base.css` 中定义的 CSS 变量来快速定制主题。

```css
#wedown {
  --primary-color: #e91e63; /* 修改主色 */
  --text-color: #2c3e50;    /* 修改文字颜色 */
}

/* 自定义更多样式 */
h1 {
  border-bottom: 2px solid var(--primary-color);
}
```

### 4. 提交 Pull Request

完成开发后，请提交 Pull Request 到本仓库。

## 目录结构

```
public/
  themes/
    base.css        # 基础样式库
    default/        # 默认主题
      meta.json
      style.css
    your-theme/     # 你的主题
      meta.json
      style.css
```

## 构建

运行以下命令构建项目：

```bash
npm run build
```

构建过程中会自动执行 `scripts/generate-themes.js`，扫描 `public/themes` 目录并生成 `public/themes.json` 主题列表文件。
