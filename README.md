# Markdown 笔记阅读器

## 功能介绍

这是一个基于纯 HTML/CSS/JS 的 Markdown 笔记阅读网站，具有以下功能：

- ✅ 支持读取 `biji` 文件夹中的所有 Markdown 文件
- ✅ 左侧文档列表，支持搜索
- ✅ 中间 Markdown 阅读渲染区
- ✅ 右侧文章标题目录栏
- ✅ 代码高亮
- ✅ 主题切换（日间/夜间）
- ✅ 本地存储
- ✅ 导出功能

## 使用方法

### 1. 启动服务器

使用提供的 Python 服务器（推荐）：

```bash
python server.py
```

然后在浏览器中打开：`http://localhost:5000`

### 2. 放置笔记文件

将您的 Markdown 笔记文件（.md 格式）放入 `biji` 文件夹中，服务器会自动加载并显示在文档列表中。

### 3. 文件夹结构

```
markdown/
├── index.html          # 主页面
├── server.py           # 简单的 Python 服务器
├── biji/               # 笔记文件夹
│   ├── 算法.md
│   ├── 数据结构.md
│   └── ... (其他笔记)
└── public/             # 静态资源
```

## 服务器功能

`server.py` 提供了以下功能：

- 静态文件服务
- API 端点 `/api/biji-files` - 返回 `biji` 文件夹中的所有 .md 文件列表
- CORS 支持

## 注意事项

- `biji` 文件夹中的笔记会显示在文档列表的前面
- `biji` 文件夹中的笔记不能在应用中删除，需要直接在文件夹中操作
- 笔记标题后会显示 📁 图标表示它来自 `biji` 文件夹

## 备用方法

如果不想使用 Python 服务器，可以使用其他方式（但无法动态加载文件）：

```bash
# 使用 Python 内置服务器（无法动态加载文件）
python -m http.server 5000

# 或使用 npx serve（无法动态加载文件）
npx serve -l 5000
```
