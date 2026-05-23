# Markdown 笔记阅读器 - Vue 3 版本

一个基于 Vue 3 的纯前端 Markdown 笔记阅读器，支持树形文件夹结构、代码高亮、主题切换等功能。

## 功能特性

- ✅ **Vue 3 + Composition API** - 现代化前端架构
- ✅ **树形文件夹结构** - 支持多层级文档组织
- ✅ **实时 Markdown 渲染** - 完整的 GFM 支持
- ✅ **代码语法高亮** - 基于 Highlight.js
- ✅ **主题切换** - 日间/夜间模式
- ✅ **响应式布局** - 适配桌面和移动端
- ✅ **GitHub Pages 部署** - 完整的 CI/CD 自动部署
- ✅ **本地存储** - 自动保存阅读进度和设置

## 快速开始

### 本地开发

```bash
# 克隆仓库
git clone https://github.com/你的用户名/markdown-reader.git
cd markdown-reader/vue-version

# 安装依赖
npm install

# 扫描文件列表
python scan-files.py

# 启动开发服务器
npm run dev
```

然后打开 http://localhost:5173

### 生产构建

```bash
# 构建生产版本
npm run build

# 预览生产版本
npm run preview
```

## 文件结构

```
vue-version/
├── public/
│   ├── img/              # 图片资源
│   └── vendor/           # 第三方库（CSS）
├── src/
│   ├── components/       # Vue 组件
│   │   ├── DocumentList.vue      # 文档列表组件
│   │   ├── TableOfContents.vue   # 目录组件
│   │   └── SettingsModal.vue      # 设置弹窗
│   ├── composables/      # 组合式函数
│   │   ├── useStore.js          # 状态管理
│   │   └── useMarkdown.js       # Markdown 处理
│   ├── pages/            # 页面组件
│   │   ├── HomePage.vue         # 主页
│   │   └── DocumentPage.vue     # 文档页
│   ├── App.vue           # 根组件
│   ├── main.js          # 入口文件
│   └── style.css        # 全局样式
├── .github/
│   └── workflows/
│       └── deploy.yml    # GitHub Actions 部署配置
├── index.html           # HTML 模板
├── package.json         # 项目配置
├── vite.config.js       # Vite 配置
├── scan-files.py        # 文件扫描脚本
└── README.md
```

## 部署到 GitHub Pages

### 方法 1: 自动部署（推荐）

1. **Fork 或复制此仓库到你的 GitHub 账号**

2. **启用 GitHub Pages**
   - 进入仓库 Settings > Pages
   - Source 选择 "GitHub Actions"

3. **推送代码到 main 分支**
   ```bash
   git add .
   git commit -m "feat: 初始化 Vue 版本"
   git push origin main
   ```

4. **查看部署状态**
   - 进入仓库 Actions 标签页
   - 等待 "Deploy to GitHub Pages" workflow 完成
   - 访问 `https://你的用户名.github.io/仓库名/`

### 方法 2: 手动部署

1. **本地构建**
   ```bash
   npm run build
   python scan-files.py
   ```

2. **创建 gh-pages 分支**
   ```bash
   git checkout -b gh-pages
   git add dist file-list.json
   git commit -m "Deploy to GitHub Pages"
   ```

3. **推送到 GitHub**
   ```bash
   git remote add origin https://github.com/你的用户名/仓库名.git
   git push origin gh-pages --force
   ```

4. **配置 GitHub Pages**
   - 进入仓库 Settings > Pages
   - Source 选择 "gh-pages" 分支

## 添加文档

### 1. 添加 Markdown 文件

将 `.md` 文件放入 `biji` 文件夹：

```
vue-version/biji/
├── javase/
│   └── API.md
├── 数据结构/
│   ├── 树.md
│   └── 图.md
└── 算法/
    └── 排序.md
```

### 2. 更新文件列表

每次添加/删除文件后，需要运行：

```bash
python scan-files.py
```

这会生成 `file-list.json`，包含所有文件的树形结构。

### 3. 提交并部署

```bash
git add .
git commit -m "docs: 添加新文章"
git push origin main
```

GitHub Actions 会自动构建并部署。

## 常用命令

```bash
# 安装依赖
npm install

# 开发模式
npm run dev

# 构建生产版本
npm run build

# 预览构建结果
npm run preview

# 扫描文件列表
python scan-files.py
```

## 技术栈

- **框架**: Vue 3.4 + Composition API
- **路由**: Vue Router 4
- **构建**: Vite 5
- **Markdown**: Marked.js
- **代码高亮**: Highlight.js
- **部署**: GitHub Actions + Pages

## 浏览器支持

- Chrome/Edge 90+
- Firefox 90+
- Safari 14+

## License

MIT License
