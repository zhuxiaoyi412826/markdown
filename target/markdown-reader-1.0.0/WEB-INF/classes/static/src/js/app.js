// ===== App State =====
const state = {
  documents: [],
  currentDocId: null,
  settings: {
    theme: 'light',
    fontSize: 16,
    lineHeight: 1.8,
    pageWidth: 'normal',
    showToc: true
  },
  scrollPositions: {},
  notes: {},
  highlights: {}
};

// ===== DOM Elements =====
const elements = {
  sidebarLeft: document.getElementById('sidebarLeft'),
  sidebarRight: document.getElementById('sidebarRight'),
  documentList: document.getElementById('documentList'),
  searchInput: document.getElementById('searchInput'),
  readerContainer: document.getElementById('readerContainer'),
  readerContent: document.getElementById('readerContent'),
  markdownBody: document.getElementById('markdownBody'),
  homepage: document.getElementById('homepage'),
  toolbarTitle: document.getElementById('toolbarTitle'),
  tocList: document.getElementById('tocList'),
  progressBar: document.getElementById('progressBar'),
  settingsPanel: document.getElementById('settingsPanel'),
  overlay: document.getElementById('overlay'),
  modalNewDoc: document.getElementById('modalNewDoc'),
  modalEdit: document.getElementById('modalEdit'),
  newDocTitle: document.getElementById('newDocTitle'),
  editContent: document.getElementById('editContent')
};

// ===== Storage Functions =====
// 把当前网站的所有 “状态数据” 保存到浏览器本地存储
function saveState() {
  localStorage.setItem('markdownReader', JSON.stringify({
    documents: state.documents,
    settings: state.settings,
    scrollPositions: state.scrollPositions,
    notes: state.notes,
    highlights: state.highlights
  }));
}

function loadState() {
  const saved = localStorage.getItem('markdownReader');
  
  // 检查是否是新会话（重新打开网站）
  // 使用 sessionStorage，关闭浏览器后会自动清除
  const sessionId = sessionStorage.getItem('sessionId');
  const isNewSession = !sessionId;
  sessionStorage.setItem('sessionId', Date.now().toString());
  
  if (saved) {
    const data = JSON.parse(saved);
    
    // 过滤过期的用户上传文件
    state.documents = (data.documents || []).filter(doc => {
      // biji 文件不受影响
      if (doc.isBiji) return true;
      
      // 用户上传的文件检查缓存是否过期
      if (doc.isUploaded && doc.cacheExpireAt) {
        const now = Date.now();
        // 缓存过期条件：重新打开网站（新会话） OR 超过1小时
        const isExpired = isNewSession || doc.cacheExpireAt <= now;
        return !isExpired;
      }
      
      // 其他文档（手动创建的）保留
      return !doc.isUploaded;
    });
    
    state.settings = { ...state.settings, ...data.settings };
    state.scrollPositions = data.scrollPositions || {};
    state.notes = data.notes || {};
    state.highlights = data.highlights || {};
  }
}

// ===== Load Biji Folder Documents =====
async function fetchBijiFiles() {
  try {
    const response = await fetch('api/biji-files');
    if (response.ok) {
      const data = await response.json();
      if (data.success && data.tree) {
        window.bijiTree = data.tree;
        // 默认不展开任何文件夹
        // collectFolders(window.bijiTree); // 注释掉这行，使文件夹默认关闭
        return true;
      }
    }
  } catch (err) {
    console.warn('无法获取 biji 文件列表:', err);
  }
  return false;
}

// 递归遍历树形结构，收集所有文件
function collectFilesFromTree(tree, parentPath = '', level = 1) {
  const files = [];
  for (const item of tree) {
    // 将 Windows 路径分隔符转换为 URL 安全的格式
    const safePath = item.path.replace(/\\/g, '/');
    
    if (item.type === 'file') {
      files.push({
        ...item,
        level: level,
        fullPath: safePath
      });
    } else if (item.type === 'folder' && item.children) {
      // 先添加文件夹占位（不加载内容）
      files.push({
        type: 'folder',
        name: item.name,
        path: safePath,
        level: level
      });
      // 递归处理子文件夹
      const childFiles = collectFilesFromTree(item.children, safePath, level + 1);
      files.push(...childFiles);
    }
  }
  return files;
}

async function loadBijiDocuments() {
  // 尝试从 localStorage 读取缓存的 biji 文件列表
  const saved = localStorage.getItem('markdownReader');
  const savedData = saved ? JSON.parse(saved) : {};
  const bijiCache = savedData.bijiCache || {};
  
  // 从树形结构收集所有文件
  const allItems = collectFilesFromTree(window.bijiTree || []);
  
  // 并行加载所有文件
  const loadPromises = allItems.map(async (item) => {
    if (item.type === 'folder') {
      // 将 Windows 路径分隔符转换为 URL 安全的格式
      const safePath = item.path.replace(/\\/g, '/');
      // 文件夹不加载内容，直接返回
      return {
        id: `folder-${safePath}`,
        title: item.name,
        content: '',
        createdAt: Date.now(),
        updatedAt: Date.now(),
        isBiji: true,
        isFolder: true,
        level: item.level,
        path: safePath
      };
    }
    
    try {
      // 将 Windows 路径分隔符转换为 URL 路径分隔符
      const urlPath = item.fullPath.replace(/\\/g, '/');
      // 只对路径中的特殊字符编码，但保留路径分隔符 /
      const encodedPath = urlPath.split('/').map(encodeURIComponent).join('/');
      // 使用 Spring Boot API 获取文件内容
      const response = await fetch(`api/biji-file/${encodedPath}`, {
        cache: 'default',
        headers: {
          'If-Modified-Since': bijiCache[item.fullPath] || ''
        }
      });
      
      if (response.ok) {
        const content = await response.text();
        // 将 Windows 路径分隔符转换为 URL 安全的格式
        const safePath = item.fullPath.replace(/\\/g, '/');
        return {
          id: `biji-${safePath}`,
          title: item.title,
          content: content,
          createdAt: Date.now(),
          updatedAt: Date.now(),
          isBiji: true,
          isFolder: false,
          level: item.level,
          path: item.fullPath
        };
      } else if (response.status === 304) {
        const cachedDoc = state.documents.find(d => d.id === `biji-${item.fullPath}`);
        return cachedDoc;
      }
    } catch (err) {
      console.warn(`无法加载文件 ${item.fullPath}:`, err);
    }
    return null;
  });
  
  const results = await Promise.all(loadPromises);
  return results.filter(doc => doc !== null);
}

async function loadBijiDocumentsAndRefresh() {
  const hasApi = await fetchBijiFiles();
  if (hasApi && window.bijiTree && window.bijiTree.length > 0) {
    const bijiDocs = await loadBijiDocuments();
    const nonBijiDocs = state.documents.filter(d => !d.isBiji);
    state.documents = [...bijiDocs, ...nonBijiDocs];
    renderDocuments();
    
    alert(`成功加载 ${bijiDocs.length} 个 biji 项目（文件夹和文件）！`);
  } else {
    alert('无法加载 biji 文档，请确保服务器正在运行');
  }
}

// 展开的文件夹状态
const expandedFolders = new Set();

// 递归收集所有文件夹路径（用于默认展开）
function collectFolders(tree) {
  for (const item of tree) {
    if (item.type === 'folder') {
      // 将 Windows 路径分隔符转换为 URL 安全的格式
      const safePath = item.path.replace(/\\/g, '/');
      expandedFolders.add(safePath);
      if (item.children) {
        collectFolders(item.children);
      }
    }
  }
}

// 扁平化渲染树形结构
function renderTree(tree, level = 1) {
  let html = '';
  
  for (const item of tree) {
    if (item.type === 'folder') {
      // 将 Windows 路径分隔符转换为 URL 安全的格式
      const safePath = item.path.replace(/\\/g, '/');
      const isExpanded = expandedFolders.has(safePath);
      const arrowClass = item.hasChildren ? `arrow ${isExpanded ? 'expanded' : ''}` : 'arrow empty';
      
      html += `
      <div class="doc-item folder level-${level}" data-id="folder-${safePath}" data-path="${safePath}">
        <div class="doc-title">
          <span class="${arrowClass}">▶</span>
          <span class="folder-icon">📁</span>
          <span class="folder-name">${escapeHtml(item.name)}</span>
        </div>
      </div>
      `;
      
      // 如果展开且有子项，递归渲染
      if (isExpanded && item.children) {
        html += renderTree(item.children, level + 1);
      }
    } else {
      // 将 Windows 路径分隔符转换为 URL 安全的格式
      const safePath = item.path.replace(/\\/g, '/');
      html += `
      <div class="doc-item file level-${level} ${state.currentDocId === `biji-${safePath}` ? 'active' : ''}" data-id="biji-${safePath}" data-path="${safePath}">
        <div class="doc-title">📄 ${escapeHtml(item.title)}</div>
        <div class="doc-date">${formatDate(Date.now())}</div>
      </div>
      `;
    }
  }
  
  return html;
}

// ===== Document Functions =====
function renderDocuments(filter = '') {
  // 如果有 bijiTree，渲染树形结构
  if (window.bijiTree && window.bijiTree.length > 0) {
    elements.documentList.innerHTML = renderTree(window.bijiTree, 1);
  } else {
    // 否则渲染普通文档列表
    const filtered = filter
      ? state.documents.filter(doc => 
          doc.title.toLowerCase().includes(filter.toLowerCase()) ||
          doc.content.toLowerCase().includes(filter.toLowerCase())
        )
      : state.documents;

    elements.documentList.innerHTML = filtered.map(doc => {
      return `
      <div class="doc-item file level-1 ${doc.id === state.currentDocId ? 'active' : ''}" data-id="${doc.id}">
        <div class="doc-title">📄 ${escapeHtml(doc.title)}</div>
        <div class="doc-date">${formatDate(doc.updatedAt)}</div>
        ${doc.isBiji ? '' : `
        <div class="doc-actions">
          <button class="btn-small delete" data-action="delete" data-id="${doc.id}">删除</button>
        </div>
        `}
      </div>
      `;
    }).join('');
  }

  // Add click events
  elements.documentList.querySelectorAll('.doc-item').forEach(item => {
    item.addEventListener('click', (e) => {
      if (e.target.classList.contains('delete')) return;
      
      if (item.classList.contains('folder')) {
        // 切换文件夹展开/收起状态
        const path = item.dataset.path;
        if (expandedFolders.has(path)) {
          expandedFolders.delete(path);
        } else {
          expandedFolders.add(path);
        }
        renderDocuments();
      } else {
        // 打开文档
        selectDocument(item.dataset.id);
      }
    });
  });

  // Delete buttons
  elements.documentList.querySelectorAll('[data-action="delete"]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      deleteDocument(btn.dataset.id);
    });
  });
}

async function selectDocument(id) {
  state.currentDocId = id;
  let doc = state.documents.find(d => d.id === id);
  
  // 如果文档不存在或内容为空（可能还没加载），尝试从API加载
  if (!doc || !doc.content) {
    // 从ID中提取路径（格式为 biji-xxx）
    if (id.startsWith('biji-')) {
      const filePath = id.replace('biji-', '');
      try {
        // 只对路径中的特殊字符编码，但保留路径分隔符 /
        const encodedPath = filePath.split('/').map(encodeURIComponent).join('/');
        const fullUrl = `api/biji-file/${encodedPath}`;
        console.log('尝试加载文档:', fullUrl);
        
        const response = await fetch(fullUrl);
        console.log('API响应状态:', response.status);
        
        if (response.ok) {
          const content = await response.text();
          console.log('文档内容加载成功，长度:', content.length);
          
          // 提取标题（从文件名中移除 .md）
          const title = filePath.split('/').pop().replace('.md', '');
          
          // 创建文档对象并添加到状态
          doc = {
            id: id,
            title: title,
            content: content,
            createdAt: Date.now(),
            updatedAt: Date.now(),
            isBiji: true,
            isFolder: false,
            path: filePath
          };
          
          // 添加到状态
          const existingIndex = state.documents.findIndex(d => d.id === id);
          if (existingIndex >= 0) {
            state.documents[existingIndex] = doc;
          } else {
            state.documents.push(doc);
          }
        } else {
          console.error('API请求失败，状态码:', response.status);
          alert(`加载文档失败，状态码: ${response.status}`);
        }
      } catch (err) {
        console.error('加载文档失败:', err);
        alert('加载文档失败，请检查控制台获取详细信息');
        return;
      }
    }
  }
  
  if (doc) {
    elements.toolbarTitle.textContent = doc.title;
    elements.homepage.style.display = 'none';
    elements.markdownBody.style.display = 'block';
    
    // Render markdown
    renderMarkdown(doc.content);
    
    // Restore scroll position
    setTimeout(() => {
      const savedPos = state.scrollPositions[id] || 0;
      elements.readerContainer.scrollTop = savedPos;
    }, 100);
    
    // Update URL
    history.pushState(null, '', `#doc-${id}`);
  }
  
  renderDocuments(elements.searchInput.value);
  saveState();
}

function createDocument(title) {
  const doc = {
    id: Date.now().toString(),
    title: title,
    content: `# ${title}\n\n开始编写你的文档...`,
    createdAt: Date.now(),
    updatedAt: Date.now()
  };
  state.documents.unshift(doc);
  saveState();
  renderDocuments();
  selectDocument(doc.id);
}

function deleteDocument(id) {
  const doc = state.documents.find(d => d.id === id);
  if (doc && doc.isBiji) {
    alert('biji 文件夹中的文档不能在应用中删除，请直接在文件夹中删除');
    return;
  }
  
  if (!confirm('确定要删除这个文档吗？')) return;
  
  state.documents = state.documents.filter(d => d.id !== id);
  if (state.currentDocId === id) {
    state.currentDocId = null;
    elements.homepage.style.display = 'block';
    elements.markdownBody.style.display = 'none';
    elements.toolbarTitle.textContent = 'Markdown 阅读器';
  }
  saveState();
  renderDocuments(elements.searchInput.value);
}

function updateDocument(id, content) {
  const doc = state.documents.find(d => d.id === id);
  if (doc) {
    doc.content = content;
    doc.updatedAt = Date.now();
    saveState();
    renderMarkdown(content);
    renderDocuments(elements.searchInput.value);
  }
}
// 函数的主要功能是处理用户上传的文件列表，将每个文件的内容读取后转换为文档对象并添加到应用的状态中。
// ===== Upload Functions =====
function handleFileUpload(files) {
  const fileArray = Array.from(files);
  let uploadedCount = 0;
  let errorCount = 0;

  fileArray.forEach(file => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const content = e.target.result;
        // 从文件名提取标题（去除扩展名）
        let title = file.name.replace(/\.(md|markdown|txt)$/i, '');
        
        // 创建新文档（带缓存时间戳）
        const doc = {
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          title: title,
          content: content,
          createdAt: Date.now(),
          updatedAt: Date.now(),
          isUploaded: true,        // 标记为用户上传的文件
          cacheExpireAt: Date.now() + 3600 * 1000  // 缓存有效期1小时
        };
        
        state.documents.unshift(doc);
        uploadedCount++;
        
        // 所有文件处理完成后保存并更新UI
        if (uploadedCount + errorCount === fileArray.length) {
          saveState();
          renderDocuments();
          // 如果只上传了一个文件，自动选中它
          if (uploadedCount === 1 && fileArray.length === 1) {
            selectDocument(doc.id);
          }
          alert(`成功上传 ${uploadedCount} 个文档${errorCount > 0 ? `，${errorCount} 个文件读取失败` : ''}`);
        }
      } catch (err) {
        errorCount++;
        console.error('文件读取错误:', err);
      }
    };
    
    reader.onerror = () => {
      errorCount++;
      console.error('文件读取失败:', file.name);
    };
    
    reader.readAsText(file);
  });
}

// ===== Markdown Rendering =====
function renderMarkdown(content) {
  // Configure marked
  marked.setOptions({
    highlight: function(code, lang) {
      if (lang && hljs.getLanguage(lang)) {
        return hljs.highlight(code, { language: lang }).value;
      }
      return hljs.highlightAuto(code).value;
    },
    breaks: true,
    gfm: true,
    renderer: createCodeBlockRenderer()
  });

  elements.markdownBody.innerHTML = marked.parse(content);
  
  // Generate TOC
  generateToc();
  
  // 添加复制按钮功能
  addCopyButtons();
  
  // 启用标题收起/展开功能
  enableHeadingToggle();
}

// 创建代码块渲染器
function createCodeBlockRenderer() {
  const renderer = new marked.Renderer();
  
  renderer.code = function({ text, lang }) {
    const language = lang && hljs.getLanguage(lang) ? lang : 'plaintext';
    const highlighted = lang && hljs.getLanguage(lang) 
      ? hljs.highlight(text, { language: lang }).value 
      : hljs.highlightAuto(text).value;
    
    // 生成行号
    const lines = text.split('\n');
    const lineNumbers = lines.map((_, i) => 
      `<span class="code-line-number">${i + 1}</span>`
    ).join('');
    
    // 获取代码块的唯一ID
    const codeBlockId = `code-block-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    return `
      <div class="code-block" id="${codeBlockId}">
        <div class="code-lang">
          <span>${language}</span>
          <button class="copy-btn" data-code-id="${codeBlockId}" title="复制代码">复制</button>
        </div>
        <div class="code-lines">${lineNumbers}</div>
        <div class="code-content">
          <pre><code class="hljs language-${language}">${highlighted}</code></pre>
        </div>
      </div>
    `;
  };
  
  return renderer;
}

// 添加复制按钮功能
function addCopyButtons() {
  const copyButtons = elements.markdownBody.querySelectorAll('.copy-btn');
  
  copyButtons.forEach(btn => {
    btn.addEventListener('click', async () => {
      const codeBlockId = btn.getAttribute('data-code-id');
      const codeBlock = document.getElementById(codeBlockId);
      if (!codeBlock) return;
      
      const codeElement = codeBlock.querySelector('code');
      if (!codeElement) return;
      
      try {
        await navigator.clipboard.writeText(codeElement.textContent);
        btn.textContent = '已复制';
        btn.classList.add('copied');
        
        setTimeout(() => {
          btn.textContent = '复制';
          btn.classList.remove('copied');
        }, 2000);
      } catch (err) {
        console.error('复制失败:', err);
      }
    });
  });
}

// ===== Export Functions =====
function showExportMenu() {
  // 创建导出菜单
  const menu = document.createElement('div');
  menu.className = 'export-menu';
  menu.innerHTML = `
    <h3>导出文档</h3>
    <div class="export-options">
      <button class="export-option" data-format="md">
        <span class="export-icon">📄</span>
        <span>Markdown (.md)</span>
      </button>
      <button class="export-option" data-format="html">
        <span class="export-icon">🌐</span>
        <span>HTML (.html)</span>
      </button>
      <button class="export-option" data-format="pdf">
        <span class="export-icon">📕</span>
        <span>PDF (.pdf)</span>
      </button>
    </div>
  `;
  
  // 创建遮罩层
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  
  document.body.appendChild(overlay);
  document.body.appendChild(menu);
  
  // 点击遮罩关闭菜单
  overlay.addEventListener('click', () => {
    document.body.removeChild(menu);
    document.body.removeChild(overlay);
  });
  
  // 点击导出选项
  const options = menu.querySelectorAll('.export-option');
  options.forEach(option => {
    option.addEventListener('click', () => {
      const format = option.getAttribute('data-format');
      exportDocument(format);
      document.body.removeChild(menu);
      document.body.removeChild(overlay);
    });
  });
}

// ===== Search Functions =====
let currentSearchType = 'all'; // 'title', 'content', 'all'

function initSearch() {
  const titleBtn = document.getElementById('searchTitle');
  const contentBtn = document.getElementById('searchContent');
  const allBtn = document.getElementById('searchAll');
  
  if (titleBtn) {
    titleBtn.addEventListener('click', () => setSearchType('title'));
  }
  if (contentBtn) {
    contentBtn.addEventListener('click', () => setSearchType('content'));
  }
  if (allBtn) {
    allBtn.addEventListener('click', () => setSearchType('all'));
  }
  
  // ESC键关闭搜索结果
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeSearchResults();
    }
  });
}

function setSearchType(type) {
  currentSearchType = type;
  
  // 更新按钮状态
  ['searchTitle', 'searchContent', 'searchAll'].forEach(id => {
    const btn = document.getElementById(id);
    if (btn) {
      btn.classList.toggle('active', id === `search${type.charAt(0).toUpperCase() + type.slice(1)}`);
    }
  });
  
  // 重新执行搜索
  const query = elements.searchInput.value;
  if (query.trim()) {
    performSearch(query);
  }
}

function performSearch(query) {
  if (!query.trim()) {
    closeSearchResults();
    return;
  }
  
  const results = [];
  const lowerQuery = query.toLowerCase();
  
  state.documents.forEach(doc => {
    if (!doc.content) return;
    
    let match = false;
    let titleMatch = false;
    let contentMatch = false;
    let preview = '';
    
    // 标题搜索
    if (currentSearchType === 'title' || currentSearchType === 'all') {
      if (doc.title.toLowerCase().includes(lowerQuery)) {
        titleMatch = true;
        match = true;
      }
    }
    
    // 内容搜索
    if (currentSearchType === 'content' || currentSearchType === 'all') {
      if (doc.content.toLowerCase().includes(lowerQuery)) {
        contentMatch = true;
        match = true;
        
        // 生成预览
        const idx = doc.content.toLowerCase().indexOf(lowerQuery);
        const start = Math.max(0, idx - 50);
        const end = Math.min(doc.content.length, idx + query.length + 100);
        preview = doc.content.substring(start, end);
        if (start > 0) preview = '...' + preview;
        if (end < doc.content.length) preview = preview + '...';
      }
    }
    
    if (match) {
      results.push({
        id: doc.id,
        title: doc.title,
        preview: preview,
        titleMatch,
        contentMatch
      });
    }
  });
  
  // 排序：标题匹配优先，然后按匹配位置排序
  results.sort((a, b) => {
    if (a.titleMatch && !b.titleMatch) return -1;
    if (!a.titleMatch && b.titleMatch) return 1;
    return 0;
  });
  
  showSearchResults(results, query);
}

function showSearchResults(results, query) {
  const searchResults = document.getElementById('searchResults');
  const resultsList = document.getElementById('searchResultsList');
  const resultsCount = document.getElementById('searchResultsCount');
  
  if (!searchResults || !resultsList) return;
  
  searchResults.classList.add('active');
  
  if (results.length === 0) {
    resultsList.innerHTML = '<div class="search-no-results">未找到匹配的文档</div>';
    resultsCount.textContent = '0 个结果';
    return;
  }
  
  resultsCount.textContent = `${results.length} 个结果`;
  
  resultsList.innerHTML = results.map(result => {
    const highlightedTitle = highlightText(result.title, query);
    const highlightedPreview = result.preview ? highlightText(result.preview, query) : '';
    
    return `
      <div class="search-result-item" data-id="${result.id}">
        <div class="search-result-title">${highlightedTitle}</div>
        ${highlightedPreview ? `<div class="search-result-preview">${highlightedPreview}</div>` : ''}
      </div>
    `;
  }).join('');
  
  // 添加点击事件
  resultsList.querySelectorAll('.search-result-item').forEach(item => {
    item.addEventListener('click', () => {
      selectDocument(item.dataset.id);
      closeSearchResults();
    });
  });
}

function highlightText(text, query) {
  if (!text || !query) return escapeHtml(text);
  
  const regex = new RegExp(`(${escapeRegex(query)})`, 'gi');
  return escapeHtml(text).replace(regex, '<span class="search-highlight">$1</span>');
}

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function closeSearchResults() {
  const searchResults = document.getElementById('searchResults');
  if (searchResults) {
    searchResults.classList.remove('active');
  }
}

// ===== Reader Mode Functions =====
function enterReaderMode() {
  if (!state.currentDocId) {
    alert('请先选择一个文档');
    return;
  }
  
  const doc = state.documents.find(d => d.id === state.currentDocId);
  if (!doc) return;
  
  // 创建阅读模式容器
  const readerMode = document.createElement('div');
  readerMode.className = 'reader-mode';
  readerMode.id = 'readerMode';
  
  readerMode.innerHTML = `
    <div class="reader-mode-header">
      <span class="reader-mode-title">${escapeHtml(doc.title)}</span>
      <div class="reader-mode-actions">
        <div class="font-size-control">
          <button class="font-size-btn" id="readerFontDecrease">-</button>
          <span class="font-size-display" id="readerFontSize">${state.settings.fontSize}px</span>
          <button class="font-size-btn" id="readerFontIncrease">+</button>
        </div>
        <button class="reader-mode-btn" id="btnFullscreen">全屏</button>
        <button class="exit-btn" id="btnExitReader">退出</button>
      </div>
    </div>
    <div class="reader-mode-content" id="readerModeContent">
      <article class="markdown-body" id="readerMarkdownBody"></article>
    </div>
  `;
  
  document.body.appendChild(readerMode);
  
  // 渲染Markdown内容
  const readerBody = document.getElementById('readerMarkdownBody');
  if (readerBody) {
    marked.setOptions({
      highlight: function(code, lang) {
        if (lang && hljs.getLanguage(lang)) {
          return hljs.highlight(code, { language: lang }).value;
        }
        return hljs.highlightAuto(code).value;
      },
      breaks: true,
      gfm: true
    });
    readerBody.innerHTML = marked.parse(doc.content);
    hljs.highlightAll();
  }
  
  // 设置字体大小
  updateReaderFontSize(state.settings.fontSize);
  
  // 添加事件监听
  document.getElementById('btnExitReader').addEventListener('click', exitReaderMode);
  document.getElementById('btnFullscreen').addEventListener('click', enterFullscreenMode);
  document.getElementById('readerFontDecrease').addEventListener('click', () => {
    adjustReaderFontSize(-2);
  });
  document.getElementById('readerFontIncrease').addEventListener('click', () => {
    adjustReaderFontSize(2);
  });
  
  // ESC键退出
  document.addEventListener('keydown', readerModeKeyHandler);
}

function exitReaderMode() {
  const readerMode = document.getElementById('readerMode');
  if (readerMode) {
    document.body.removeChild(readerMode);
  }
  document.removeEventListener('keydown', readerModeKeyHandler);
}

function readerModeKeyHandler(e) {
  if (e.key === 'Escape') {
    exitReaderMode();
  }
}

function enterFullscreenMode() {
  const readerMode = document.getElementById('readerMode');
  if (readerMode) {
    readerMode.classList.add('fullscreen-mode');
    document.getElementById('btnFullscreen').textContent = '退出全屏';
    document.getElementById('btnFullscreen').removeEventListener('click', enterFullscreenMode);
    document.getElementById('btnFullscreen').addEventListener('click', exitFullscreenMode);
    
    // 进入全屏API
    if (readerMode.requestFullscreen) {
      readerMode.requestFullscreen();
    } else if (readerMode.webkitRequestFullscreen) {
      readerMode.webkitRequestFullscreen();
    } else if (readerMode.mozRequestFullScreen) {
      readerMode.mozRequestFullScreen();
    }
  }
}

function exitFullscreenMode() {
  const readerMode = document.getElementById('readerMode');
  if (readerMode) {
    readerMode.classList.remove('fullscreen-mode');
    document.getElementById('btnFullscreen').textContent = '全屏';
    document.getElementById('btnFullscreen').removeEventListener('click', exitFullscreenMode);
    document.getElementById('btnFullscreen').addEventListener('click', enterFullscreenMode);
    
    // 退出全屏API
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if (document.webkitExitFullscreen) {
      document.webkitExitFullscreen();
    } else if (document.mozCancelFullScreen) {
      document.mozCancelFullScreen();
    }
  }
}

function updateReaderFontSize(size) {
  const content = document.getElementById('readerModeContent');
  const display = document.getElementById('readerFontSize');
  if (content) {
    content.style.fontSize = size + 'px';
  }
  if (display) {
    display.textContent = size + 'px';
  }
}

function adjustReaderFontSize(delta) {
  const currentSize = parseInt(document.getElementById('readerFontSize').textContent);
  const newSize = Math.max(12, Math.min(32, currentSize + delta));
  updateReaderFontSize(newSize);
}

// ===== Layout Mode Functions =====
function toggleSingleColumnMode() {
  const app = document.getElementById('app');
  app.classList.toggle('single-column-mode');
  
  // 更新按钮状态
  const btn = document.getElementById('btnSingleColumn');
  if (btn) {
    btn.classList.toggle('active', app.classList.contains('single-column-mode'));
  }
  
  // 如果进入单列模式，退出悬浮目录模式
  if (app.classList.contains('single-column-mode')) {
    app.classList.remove('toc-floating');
    const tocBtn = document.getElementById('btnTocFloat');
    if (tocBtn) {
      tocBtn.classList.remove('active');
    }
  }
}

function toggleTocFloating() {
  const app = document.getElementById('app');
  
  // 如果在单列模式下，先退出单列模式
  if (app.classList.contains('single-column-mode')) {
    app.classList.remove('single-column-mode');
    const btn = document.getElementById('btnSingleColumn');
    if (btn) {
      btn.classList.remove('active');
    }
  }
  
  app.classList.toggle('toc-floating');
  
  // 更新按钮状态
  const btn = document.getElementById('btnTocFloat');
  if (btn) {
    btn.classList.toggle('active', app.classList.contains('toc-floating'));
  }
}

function toggleSidebar() {
  const sidebar = document.querySelector('.sidebar-left');
  sidebar.classList.toggle('collapsed');
}

// ===== Heading Toggle Functions =====
function enableHeadingToggle() {
  const markdownBody = elements.markdownBody;
  if (!markdownBody) return;
  
  // 为每个标题添加收起/展开功能
  const headings = markdownBody.querySelectorAll('h1, h2, h3');
  
  headings.forEach((heading, index) => {
    // 获取下一个标题的位置
    const nextHeading = headings[index + 1];
    
    // 创建包装器
    const wrapper = document.createElement('div');
    wrapper.className = 'heading-wrapper';
    
    // 创建标题切换器
    const toggle = document.createElement('div');
    toggle.className = 'heading-toggle';
    
    const arrow = document.createElement('span');
    arrow.className = 'heading-arrow expanded';
    arrow.textContent = '▶';
    
    // 将箭头插入到标题内容前
    heading.parentNode.insertBefore(wrapper, heading);
    wrapper.appendChild(toggle);
    toggle.appendChild(arrow);
    toggle.appendChild(heading);
    
    // 创建内容容器
    const content = document.createElement('div');
    content.className = 'heading-content expanded';
    wrapper.appendChild(content);
    
    // 将标题后面的内容移动到内容容器中
    let nextSibling = heading.nextSibling;
    while (nextSibling && nextSibling !== nextHeading) {
      content.appendChild(nextSibling);
      nextSibling = heading.nextSibling;
    }
    
    // 添加点击事件
    toggle.addEventListener('click', () => {
      arrow.classList.toggle('expanded');
      content.classList.toggle('expanded');
      content.classList.toggle('collapsed');
    });
  });
}

function downloadFile(blob, filename) {
  
  // 定位菜单到导出按钮位置
  const btnExport = document.getElementById('btnExport');
  const rect = btnExport.getBoundingClientRect();
  menu.style.left = rect.left + 'px';
  menu.style.top = (rect.bottom + 8) + 'px';
}

function exportDocument(format) {
  if (!state.currentDocId) return;
  const doc = state.documents.find(d => d.id === state.currentDocId);
  if (!doc) return;
  
  switch (format) {
    case 'md':
      exportAsMD(doc);
      break;
    case 'html':
      exportAsHTML(doc);
      break;
    case 'pdf':
      exportAsPDF(doc);
      break;
  }
}

function exportAsMD(doc) {
  const blob = new Blob([doc.content], { type: 'text/markdown;charset=utf-8' });
  downloadFile(blob, doc.title + '.md');
}

function exportAsHTML(doc) {
  const htmlContent = generateHTML(doc);
  const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
  downloadFile(blob, doc.title + '.html');
}

function exportAsPDF(doc) {
  // 使用window.print()实现PDF导出
  const printWindow = window.open('', '_blank');
  const htmlContent = generateHTML(doc);
  
  printWindow.document.write(htmlContent);
  printWindow.document.close();
  
  // 等待页面加载完成后打印
  printWindow.onload = function() {
    printWindow.print();
    // 打印后延迟关闭
    setTimeout(() => {
      printWindow.close();
    }, 1000);
  };
}

function escapeContent(content) {
  return content.replace(/\\`/g, '\\\\`').replace(/\\\$/g, '\\\\\\$');
}

function generateHTML(doc) {
  // 先生成转义后的内容
  const escapedContent = escapeContent(doc.content);
  
  // 生成HTML内容
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${doc.title}</title>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/github-markdown-css/5.2.0/github-markdown.min.css">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/github.min.css">
  <script src="https://cdnjs.cloudflare.com/ajax/libs/marked/11.2.0/marked.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/highlight.min.js"></script>
  <style>
    body {
      max-width: 800px;
      margin: 0 auto;
      padding: 2rem;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }
    .markdown-body {
      box-sizing: border-box;
      min-width: 200px;
      max-width: 980px;
      margin: 0 auto;
      padding: 45px;
    }
    @media (max-width: 767px) {
      .markdown-body {
        padding: 15px;
      }
    }
    @media print {
      body {
        padding: 0;
      }
      .markdown-body {
        padding: 1rem;
        max-width: none;
      }
    }
  </style>
</head>
<body>
  <article class="markdown-body" id="content"></article>
  <script>
    marked.setOptions({
      highlight: function(code, lang) {
        if (lang && hljs.getLanguage(lang)) {
          return hljs.highlight(code, { language: lang }).value;
        }
        return hljs.highlightAuto(code).value;
      },
      breaks: true,
      gfm: true
    });
    document.getElementById('content').innerHTML = marked.parse(\`${escapedContent}\`);
    hljs.highlightAll();
  </script>
</body>
</html>`;
}

function downloadFile(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function generateToc() {
  const headings = elements.markdownBody.querySelectorAll('h1, h2, h3, h4, h5, h6');
  
  if (headings.length === 0) {
    elements.tocList.innerHTML = '<div class="toc-empty">暂无标题</div>';
    return;
  }

  elements.tocList.innerHTML = Array.from(headings).map((h, i) => {
    const id = `heading-${i}`;
    h.id = id;
    const level = parseInt(h.tagName.substring(1));
    return `<div class="toc-item level-${level}" data-id="${id}">${escapeHtml(h.textContent)}</div>`;
  }).join('');

  // Add click events
  elements.tocList.querySelectorAll('.toc-item').forEach(item => {
    item.addEventListener('click', () => {
      const heading = document.getElementById(item.dataset.id);
      if (heading) {
        heading.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });
}

// ===== Settings =====
function applySettings() {
  // Theme
  if (state.settings.theme === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark');
    document.getElementById('hljs-theme').href = 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/github-dark.min.css';
  } else {
    document.documentElement.removeAttribute('data-theme');
    document.getElementById('hljs-theme').href = 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/github.min.css';
  }

  // Font size
  elements.readerContent.style.fontSize = state.settings.fontSize + 'px';
  
  // Line height
  elements.readerContent.style.lineHeight = state.settings.lineHeight;
  
  // Page width
  elements.readerContent.classList.remove('wide', 'narrow');
  if (state.settings.pageWidth !== 'normal') {
    elements.readerContent.classList.add(state.settings.pageWidth);
  }

  // TOC visibility
  elements.sidebarRight.style.display = state.settings.showToc ? 'flex' : 'none';

  // Update UI toggles
  document.getElementById('toggleToc').classList.toggle('active', state.settings.showToc);
  document.getElementById('toggleTheme').classList.toggle('active', state.settings.theme === 'dark');

  // Update setting buttons
  document.querySelectorAll('#fontSizeOptions .setting-btn').forEach(btn => {
    btn.classList.toggle('active', parseInt(btn.dataset.size) === state.settings.fontSize);
  });
  document.querySelectorAll('#lineHeightOptions .setting-btn').forEach(btn => {
    btn.classList.toggle('active', parseFloat(btn.dataset.height) === state.settings.lineHeight);
  });
  document.querySelectorAll('#widthOptions .setting-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.width === state.settings.pageWidth);
  });
}

// ===== Utility Functions =====
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function formatDate(timestamp) {
  return new Date(timestamp).toLocaleDateString('zh-CN');
}

// ===== Event Listeners =====
function initEventListeners() {
  // 刷新 biji 文件夹
  document.getElementById('btnRefresh').addEventListener('click', async () => {
    await loadBijiDocumentsAndRefresh();
  });

  // Search
  elements.searchInput.addEventListener('input', (e) => {
    performSearch(e.target.value);
  });
  
  // 初始化搜索功能
  initSearch();

  // New document
  document.getElementById('btnNewDoc').addEventListener('click', () => {
    elements.modalNewDoc.classList.add('show');
    elements.overlay.classList.add('show');
    elements.newDocTitle.value = '';
    elements.newDocTitle.focus();
  });

  document.getElementById('btnCancelNewDoc').addEventListener('click', closeModal);
  document.getElementById('btnConfirmNewDoc').addEventListener('click', () => {
    const title = elements.newDocTitle.value.trim();
    if (title) {
      createDocument(title);
      closeModal();
    }
  });

  // Upload document
  const fileInput = document.getElementById('fileInput');
  document.getElementById('btnUploadDoc').addEventListener('click', () => {
    fileInput.click();
  });

  fileInput.addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
      handleFileUpload(e.target.files);
      e.target.value = ''; // 清空以便重复上传相同文件
    }
  });

  // Edit document
  document.getElementById('btnEdit').addEventListener('click', () => {
    if (!state.currentDocId) return;
    const doc = state.documents.find(d => d.id === state.currentDocId);
    if (doc) {
      elements.editContent.value = doc.content;
      elements.modalEdit.classList.add('show');
      elements.overlay.classList.add('show');
    }
  });

  document.getElementById('btnCancelEdit').addEventListener('click', closeModal);
  document.getElementById('btnSaveEdit').addEventListener('click', () => {
    if (state.currentDocId) {
      updateDocument(state.currentDocId, elements.editContent.value);
      closeModal();
    }
  });

  // Export
  document.getElementById('btnExport').addEventListener('click', () => {
    if (!state.currentDocId) return;
    showExportMenu();
  });

  // Theme toggle
  document.getElementById('btnTheme').addEventListener('click', () => {
    state.settings.theme = state.settings.theme === 'light' ? 'dark' : 'light';
    applySettings();
    saveState();
  });

  // TOC toggle
  document.getElementById('btnToc').addEventListener('click', () => {
    state.settings.showToc = !state.settings.showToc;
    applySettings();
    saveState();
  });
  
  // Reader mode
  document.getElementById('btnReaderMode').addEventListener('click', () => {
    enterReaderMode();
  });
  
  // Single column mode
  document.getElementById('btnSingleColumn').addEventListener('click', () => {
    toggleSingleColumnMode();
  });
  
  // TOC floating mode
  document.getElementById('btnTocFloat').addEventListener('click', () => {
    toggleTocFloating();
  });
  
  // Sidebar toggle
  document.getElementById('sidebarToggle').addEventListener('click', () => {
    toggleSidebar();
  });

  // Settings panel
  document.getElementById('btnSettings').addEventListener('click', () => {
    elements.settingsPanel.classList.add('open');
  });

  document.getElementById('btnCloseSettings').addEventListener('click', () => {
    elements.settingsPanel.classList.remove('open');
  });

  // Settings options
  document.querySelectorAll('#fontSizeOptions .setting-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      state.settings.fontSize = parseInt(btn.dataset.size);
      applySettings();
      saveState();
    });
  });

  document.querySelectorAll('#lineHeightOptions .setting-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      state.settings.lineHeight = parseFloat(btn.dataset.height);
      applySettings();
      saveState();
    });
  });

  document.querySelectorAll('#widthOptions .setting-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      state.settings.pageWidth = btn.dataset.width;
      applySettings();
      saveState();
    });
  });

  document.getElementById('toggleToc').addEventListener('click', () => {
    state.settings.showToc = !state.settings.showToc;
    applySettings();
    saveState();
  });

  document.getElementById('toggleTheme').addEventListener('click', () => {
    state.settings.theme = state.settings.theme === 'light' ? 'dark' : 'light';
    applySettings();
    saveState();
  });

  // Mobile menu
  document.getElementById('mobileMenuBtn').addEventListener('click', () => {
    elements.sidebarLeft.classList.toggle('open');
  });

  // Scroll handling
  elements.readerContainer.addEventListener('scroll', () => {
    // Save scroll position
    if (state.currentDocId) {
      state.scrollPositions[state.currentDocId] = elements.readerContainer.scrollTop;
    }

    // Update progress bar
    const scrollHeight = elements.readerContainer.scrollHeight - elements.readerContainer.clientHeight;
    const progress = scrollHeight > 0 ? (elements.readerContainer.scrollTop / scrollHeight) * 100 : 0;
    elements.progressBar.style.width = progress + '%';

    // Highlight current heading in TOC
    updateActiveTocItem();
  });

  // Close modals on overlay click
  elements.overlay.addEventListener('click', closeModal);

  // Keyboard shortcuts
  document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + N: New document
    if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
      e.preventDefault();
      document.getElementById('btnNewDoc').click();
    }
    // Escape: Close modals
    if (e.key === 'Escape') {
      closeModal();
      elements.settingsPanel.classList.remove('open');
    }
  });

  // URL hash 处理：如果 URL 包含文档 hash，自动打开对应文档
  // 例如：http://localhost:5000/#doc-biji-必备算法.md
  if (window.location.hash) {
    const docId = window.location.hash.replace('#doc-', '');
    if (docId && state.documents.find(d => d.id === docId)) {
      selectDocument(docId);
    }
  }
}

function closeModal() {
  elements.modalNewDoc.classList.remove('show');
  elements.modalEdit.classList.remove('show');
  elements.overlay.classList.remove('show');
}

function updateActiveTocItem() {
  const headings = elements.markdownBody.querySelectorAll('h1, h2, h3, h4, h5, h6');
  const containerRect = elements.readerContainer.getBoundingClientRect();
  
  let currentId = null;
  headings.forEach(h => {
    const rect = h.getBoundingClientRect();
    if (rect.top <= containerRect.top + 100) {
      currentId = h.id;
    }
  });

  elements.tocList.querySelectorAll('.toc-item').forEach(item => {
    item.classList.toggle('active', item.dataset.id === currentId);
  });
}

// ===== Initialize =====
async function init() {
  loadState();
  applySettings();
  initEventListeners();

  // 先加载 biji 文件结构（需要等待）
  await fetchBijiFiles();
  
  // 现在渲染文档列表（树形结构）
  renderDocuments();
  
  // 默认显示首页，不自动选择文档
  // 用户需要从左侧列表选择文档来阅读

  // 后台异步加载 biji 文档内容
  loadBijiDocumentsAsync();
}

async function loadBijiDocumentsAsync() {
  try {
    // 直接使用已加载的 bijiTree（在 init 中已加载）
    if (window.bijiTree && window.bijiTree.length > 0) {
      const bijiDocs = await loadBijiDocuments();
      const nonBijiDocs = state.documents.filter(d => !d.isBiji);
      
      // 检查是否有新文档或更新
      const existingBijiIds = new Set(state.documents.filter(d => d.isBiji).map(d => d.id));
      const newBijiIds = new Set(bijiDocs.map(d => d.id));
      
      const hasChanges = bijiDocs.length !== existingBijiIds.size || 
                        !bijiDocs.every(d => existingBijiIds.has(d.id));
      
      if (hasChanges) {
        state.documents = [...bijiDocs, ...nonBijiDocs];
        renderDocuments();
        
        // 默认显示首页，不自动选择文档
        // 用户需要从左侧列表选择文档来阅读
      }
      
      console.log('已加载 biji 文档:', bijiDocs.length, '个');
    }
  } catch (err) {
    console.warn('加载 biji 文档失败:', err);
  }
}

// Start the app when DOM is loaded
document.addEventListener('DOMContentLoaded', init);

// Initialize bijiFiles array
window.bijiFiles = [];
