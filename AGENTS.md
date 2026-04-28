# Markdown 笔记阅读网站

## 项目概览

这是一个基于纯 HTML/CSS/JS 的 Markdown 笔记阅读网站，采用三栏布局设计：
- 左侧：文档列表栏
- 中间：Markdown 阅读渲染区
- 右侧：文章标题目录栏

## 技术栈

- **HTML5**: 页面结构
- **CSS3**: 样式设计（CSS 变量、Flexbox、响应式设计）
- **JavaScript (ES6+)**: 交互逻辑
- **Marked.js**: Markdown 解析
- **Highlight.js**: 代码高亮

## 核心功能

### 左侧文档列表栏
- 展示所有 Markdown 文档
- 文档搜索功能
- 新建/删除文档
- 当前文档高亮显示

### 中间 Markdown 阅读渲染区
- 完整的 Markdown 语法渲染
- 代码块语法高亮
- 字体大小、行高、页面宽度调整
- 滚动位置记忆
- 日间/夜间主题切换

### 右侧标题目录栏
- 自动解析文档标题生成目录
- 点击跳转到对应位置
- 滚动时自动高亮当前标题
- 可折叠/展开

### 其他功能
- 本地存储（文档、设置、阅读进度）
- 响应式布局
- 暗黑模式
- URL 路由支持直接打开指定文档
- 文档导出（MD 文件）
- 在线编辑 Markdown

## 目录结构

```
.
├── index.html          # 主页面（包含所有 HTML/CSS/JS）
├── public/             # 静态资源
│   ├── favicon.svg
│   └── icons.svg
├── .coze               # Coze 配置文件
└── AGENTS.md           # 项目说明文档
```

## 开发命令

```bash
# 启动开发服务器（端口 5000）
python -m http.server 5000

# 或者使用 npx
npx serve -l 5000
```

## 数据存储

所有数据存储在浏览器的 localStorage 中：
- `markdownReader`: 包含文档列表、设置、阅读进度等

## 扩展功能

- 文档内高亮标注
- 添加笔记/评论
- 更多导出格式
