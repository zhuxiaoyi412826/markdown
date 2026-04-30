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
    const response = await fetch('/api/biji-files');
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
      // 使用 Spring Boot API 获取文件内容
      const response = await fetch(`/api/biji-file/${encodeURIComponent(urlPath)}`, {
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

function selectDocument(id) {
  state.currentDocId = id;
  const doc = state.documents.find(d => d.id === id);
  
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
    gfm: true
  });

  elements.markdownBody.innerHTML = marked.parse(content);
  
  // Generate TOC
  generateToc();
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
    renderDocuments(e.target.value);
  });

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
    const doc = state.documents.find(d => d.id === state.currentDocId);
    if (doc) {
      const blob = new Blob([doc.content], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = doc.title + '.md';
      a.click();
      URL.revokeObjectURL(url);
    }
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
