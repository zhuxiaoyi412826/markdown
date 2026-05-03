# Markdown 笔记阅读网站

## 项目概览

这是一个基于 Spring Boot + HTML/CSS/JS 的 Markdown 笔记阅读网站，采用三栏布局设计：
- 左侧：文档列表栏（支持树形结构）
- 中间：Markdown 阅读渲染区（支持代码高亮、行号显示）
- 右侧：文章标题目录栏（可折叠/展开）

## 技术栈

- **后端**: Spring Boot 3.2.5 + Java 21
- **前端**: HTML5 + CSS3 + JavaScript ES6+
- **Markdown解析**: Marked.js
- **代码高亮**: Highlight.js
- **API文档**: Swagger3 (springdoc-openapi)

## 核心功能

### 左侧文档列表栏
- 展示所有 Markdown 文档（支持树形结构）
- 文档搜索功能（Trie字典树搜索联想）
- 新建/删除文档
- 当前文档高亮显示
- 文件夹展开/收起（点击三角符号）
- 大纲栏收缩/展开按钮

### 中间 Markdown 阅读渲染区
- 完整的 Markdown 语法渲染
- 代码块语法高亮（识别 Java/JS/SQL/Python 等语言）
- 代码行号显示、代码复制、全屏查看
- 字体大小、行高、页面宽度调整
- 11种字体选择（思源黑体、思源宋体、苹方、微软雅黑、楷体、宋体等）
- 滚动位置记忆
- 日间/夜间主题切换（默认暗色主题）
- 专注阅读模式（隐藏侧边栏，沉浸式阅读）
- 文档内搜索（Ctrl+F 唤起，支持高亮跳转）
- 文章统计（阅读人数、字数、阅读时长）
- 文章评论功能

### 右侧标题目录栏
- 自动解析文档标题生成目录
- 点击跳转到对应位置
- 滚动时自动高亮当前标题
- 可折叠/展开

### 其他功能
- 本地存储（文档、设置、阅读进度）
- 响应式布局
- URL 路由支持直接打开指定文档
- 文档导出（MD、HTML、PDF、Word）
- 在线编辑 Markdown（密码保护）
- 用户上传文件缓存（3600秒过期）

## 目录结构

```
markdown/
├── pom.xml                          # Maven 配置文件
├── biji/                            # 笔记文件夹
└── src/
    └── main/
        ├── java/com/example/
        │   ├── Application.java     # Spring Boot 启动类
        │   ├── controller/
        │   │   └── BijiController.java  # REST API 控制器
        │   └── config/
        │       ├── OpenApiConfig.java   # Swagger3 配置
        │       └── WebConfig.java       # Web 配置
        └── resources/
            ├── application.yml      # 应用配置
            └── static/              # 静态资源
                ├── index.html       # 主页面
                ├── biji/            # 笔记文件
                └── src/
                    ├── css/style.css
                    └── js/app.js
```

## 开发命令

```bash
# 使用 Maven 启动
mvn spring-boot:run

# 打包为 JAR
mvn clean package
java -jar target/markdown-reader-1.0.0.jar

# 打包为 WAR（部署到 Tomcat）
mvn clean package -DskipTests
```

## 数据存储

- **浏览器端**: localStorage 存储文档、设置、阅读进度等
- **服务器端**: `biji` 文件夹存储 Markdown 笔记文件

## API 接口

| 接口 | 方法 | 说明 |
|------|------|------|
| `/api/biji-files` | GET | 获取 biji 文件夹的树形结构 |
| `/api/biji-file/{path}` | GET | 获取指定 Markdown 文件内容 |

## Swagger3 文档

访问地址：`http://localhost:8080/swagger-ui.html`

## 扩展功能

- 文档收藏功能
- 文档内高亮标注
- 文档版本历史
- 快捷键增强
- PWA 离线支持
