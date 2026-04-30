# Markdown 笔记阅读器

## 功能介绍

这是一个基于 Spring Boot 的 Markdown 笔记阅读网站，具有以下功能：

- ✅ 支持读取 `biji` 文件夹中的所有 Markdown 文件（支持树形结构）
- ✅ 左侧文档列表，支持搜索、展开/收起文件夹
- ✅ 中间 Markdown 阅读渲染区（支持代码高亮）
- ✅ 右侧文章标题目录栏
- ✅ 主题切换（日间/夜间）
- ✅ 本地存储（文档、设置、阅读进度）
- ✅ 文档导出功能
- ✅ 用户上传文件缓存（3600秒过期）

## 技术栈

- **后端**: Spring Boot 3.2.5 + Java 21
- **前端**: HTML5 + CSS3 + JavaScript ES6+
- **Markdown解析**: Marked.js
- **代码高亮**: Highlight.js
- **API文档**: Swagger3 (springdoc-openapi)

## 使用方法

### 1. 启动服务

```bash
# 进入项目目录
cd markdown

# 使用 Maven 启动
mvn spring-boot:run
```

然后在浏览器中打开：`http://localhost:8080`

### 2. 打包部署

#### 打包为 JAR（可直接运行）

```bash
# 打包
mvn clean package

# 运行
java -jar target/markdown-reader-1.0.0.jar
```

#### 打包为 WAR（部署到 Tomcat）

```bash
# 打包 WAR
mvn clean package -DskipTests

# 部署到 Tomcat
# 将 target/markdown-reader-1.0.0.war 复制到 Tomcat 的 webapps 目录
# 启动 Tomcat 后访问: http://localhost:8080/markdown-reader
```

### 3. 放置笔记文件

将您的 Markdown 笔记文件（.md 格式）放入 `biji` 文件夹中，服务器会自动加载并显示在文档列表中。

支持文件夹层级结构：
```
biji/
├── javase/
│   └── 哈希表.md
├── 数据结构/
│   ├── 数据结构.md
│   └── 树堆图.md
└── 算法/
    ├── 必备算法.md
    └── 算法.md
```

## 项目结构

```
markdown/
├── pom.xml                          # Maven 配置文件
├── biji/                            # 笔记文件夹（软链接）
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
                ├── biji/            # 笔记文件备份
                └── src/
                    ├── css/style.css
                    └── js/app.js
```

## API 接口

| 接口 | 方法 | 说明 |
|------|------|------|
| `/api/biji-files` | GET | 获取 biji 文件夹的树形结构 |
| `/api/biji-file/{path}` | GET | 获取指定 Markdown 文件内容 |

## Swagger3 文档

访问地址：`http://localhost:8080/swagger-ui.html`

## 注意事项

- `biji` 文件夹中的笔记会显示在文档列表中
- `biji` 文件夹中的笔记不能在应用中删除，需要直接在文件夹中操作
- 文件夹默认关闭，点击可展开/收起
- 用户上传的文件会缓存 3600 秒，重新打开网站时缓存失效
- 支持 URL 路由直接打开指定文档

## 开发命令

```bash
# 编译
mvn compile

# 运行测试
mvn test

# 清理
mvn clean
```