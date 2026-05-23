<template>
  <div class="homepage">
    <div class="homepage-content">
      <div class="homepage-icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
          <polyline points="14 2 14 8 20 8"></polyline>
          <line x1="16" y1="13" x2="8" y2="13"></line>
          <line x1="16" y1="17" x2="8" y2="17"></line>
        </svg>
      </div>
      
      <h1>Markdown 笔记阅读器</h1>
      <p class="homepage-subtitle">Vue 3 重构版本 - 优雅地阅读和管理您的 Markdown 笔记</p>
      
      <div class="homepage-features">
        <div class="feature-card">
          <h3>📝 实时渲染</h3>
          <p>支持完整的 Markdown 语法，代码高亮显示</p>
        </div>
        <div class="feature-card">
          <h3>📂 文件树</h3>
          <p>支持多层级文件夹结构，快速定位文档</p>
        </div>
        <div class="feature-card">
          <h3>🎨 主题切换</h3>
          <p>支持日间/夜间主题，保护您的眼睛</p>
        </div>
        <div class="feature-card">
          <h3>⚡ Vue 3</h3>
          <p>现代化的 Vue 3 + Composition API</p>
        </div>
      </div>
      
      <div class="homepage-usage">
        <h3>使用说明</h3>
        <ul>
          <li><strong>📁 biji 文件夹</strong> - 将 Markdown 文件放入 biji 文件夹</li>
          <li><strong>🔄 扫描文件</strong> - 运行 <code>python scan-files.py</code> 重新扫描文件</li>
          <li><strong>🚀 开发模式</strong> - 运行 <code>npm run dev</code> 启动开发服务器</li>
          <li><strong>🌐 部署</strong> - 使用 GitHub Actions 自动部署到 GitHub Pages</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<style scoped>
.homepage {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
}

.homepage-content {
  text-align: center;
}

.homepage-icon {
  width: 80px;
  height: 80px;
  margin: 0 auto 1.5rem;
  color: var(--primary-color);
}

.homepage-icon svg {
  width: 100%;
  height: 100%;
}

.homepage h1 {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  color: var(--text-color);
}

.homepage-subtitle {
  font-size: 1.125rem;
  color: var(--text-secondary);
  margin-bottom: 2rem;
}

.homepage-features {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.feature-card {
  background: var(--sidebar-bg);
  padding: 1.5rem;
  border-radius: 12px;
  text-align: left;
}

.feature-card h3 {
  font-size: 1rem;
  margin-bottom: 0.5rem;
  color: var(--text-color);
}

.feature-card p {
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.homepage-usage {
  background: var(--sidebar-bg);
  padding: 1.5rem;
  border-radius: 12px;
  text-align: left;
}

.homepage-usage h3 {
  font-size: 1rem;
  margin-bottom: 1rem;
  color: var(--text-color);
}

.homepage-usage ul {
  list-style: none;
  padding: 0;
}

.homepage-usage li {
  padding: 0.5rem 0;
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.homepage-usage li strong {
  color: var(--text-color);
}

.homepage-usage code {
  background: var(--code-bg);
  padding: 0.125rem 0.375rem;
  border-radius: 4px;
  font-family: monospace;
  font-size: 0.8rem;
}
</style>
