<template>
  <div class="app-container" :data-theme="settings.theme">
    <div class="app-layout">
      <aside class="sidebar-left" :class="{ collapsed: !showLeftSidebar }">
        <div class="sidebar-header">
          <h2>📚 文档</h2>
        </div>
        
        <div class="search-container">
          <div class="search-box">
            <span class="search-icon">🔍</span>
            <input 
              type="text" 
              v-model="searchQuery" 
              placeholder="搜索文档..."
              class="search-input"
            />
            <button v-if="searchQuery" class="search-clear" @click="searchQuery = ''">✕</button>
          </div>
          <button 
            class="btn-refresh" 
            :class="{ spinning: isRefreshing }"
            @click="handleRefresh" 
            title="刷新"
          >
            🔄
          </button>
        </div>
        
        <DocumentList 
          :documents="filteredDocuments"
          :expanded-folders="expandedFolders"
          @toggle-folder="toggleFolder"
          @select-doc="selectDocument"
        />
      </aside>
      
      <main class="main-content">
        <div class="toolbar">
          <div class="toolbar-left">
            <button class="mobile-menu-btn" @click="showLeftSidebar = !showLeftSidebar">
              ☰
            </button>
            <span class="toolbar-title">{{ currentTitle }}</span>
          </div>
          
          <div class="toolbar-actions">
            <button class="btn-toolbar" @click="toggleFocusMode" title="专注模式">
              🎯 专注
            </button>
            <button class="btn-toolbar" @click="toggleTheme" title="切换主题">
              {{ settings.theme === 'dark' ? '☀️' : '🌙' }}
            </button>
            <button class="btn-toolbar" @click="showToc = !showToc" title="目录">
              📑
            </button>
            <button class="btn-toolbar" @click="showSettings = true" title="设置">
              ⚙️
            </button>
          </div>
        </div>
        
        <div class="reader-container">
          <router-view 
            :key="$route.path"
            @update-title="currentTitle = $event"
            @update-headings="updateHeadings"
          />
        </div>
      </main>
      
      <aside class="sidebar-right" :class="{ collapsed: !showToc }">
        <TableOfContents :headings="headings" />
      </aside>
    </div>
    
    <SettingsModal 
      v-if="showSettings" 
      :settings="settings"
      @update="updateSettings"
      @close="showSettings = false"
    />
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useStore } from './composables/useStore'
import DocumentList from './components/DocumentList.vue'
import TableOfContents from './components/TableOfContents.vue'
import SettingsModal from './components/SettingsModal.vue'

const router = useRouter()
const { state, loadState, saveState, loadFileList, toggleFolder: storeToggleFolder, isFolderExpanded } = useStore()

const searchQuery = ref('')
const showLeftSidebar = ref(true)
const showToc = ref(true)
const showSettings = ref(false)
const headings = ref([])
const currentTitle = ref('Markdown 笔记阅读器')
const isRefreshing = ref(false)

function updateHeadings(newHeadings) {
  console.log('App.vue: updateHeadings called with:', newHeadings)
  headings.value = newHeadings
}

watch(headings, (newVal) => {
  console.log('App.vue: headings changed:', newVal)
}, { deep: true })

const settings = computed(() => state.value.settings)
const expandedFolders = computed(() => state.value.expandedFolders)
const documents = computed(() => state.value.documents)

const filteredDocuments = computed(() => {
  if (!searchQuery.value) return documents.value
  
  const query = searchQuery.value.toLowerCase()
  return documents.value.filter(doc => 
    doc.title.toLowerCase().includes(query)
  )
})

function toggleFolder(path) {
  storeToggleFolder(path)
}

async function handleRefresh() {
  isRefreshing.value = true
  
  try {
    // 先调用 API 扫描文件
    const scanResponse = await fetch('/api/scan', {
      method: 'POST'
    })
    
    const scanResult = await scanResponse.json()
    console.log('App.vue: scan result:', scanResult)
    
    // 然后重新加载文件列表
    await loadFileList()
    
    return scanResult
  } catch (err) {
    console.error('App.vue: refresh error:', err)
    throw err
  } finally {
    // 保持动画至少运行 500ms
    setTimeout(() => {
      isRefreshing.value = false
    }, 500)
  }
}

async function selectDocument(doc) {
  console.log('App.vue: selectDocument called with:', doc)
  
  if (!doc.isFolder) {
    currentTitle.value = doc.title
    console.log('App.vue: navigating to:', `/doc/${doc.path}`)
    
    try {
      await router.push(`/doc/${doc.path}`)
      console.log('App.vue: navigation successful')
    } catch (error) {
      console.error('App.vue: navigation error:', error)
    }
  }
}

function toggleTheme() {
  updateSettings({ theme: settings.value.theme === 'dark' ? 'light' : 'dark' })
}

function toggleFocusMode() {
  showLeftSidebar.value = !showLeftSidebar.value
  showToc.value = false
}

function updateSettings(newSettings) {
  const store = useStore()
  store.updateSettings(newSettings)
  applyTheme(newSettings.theme)
}

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme)
}

onMounted(async () => {
  loadState()
  applyTheme(settings.value.theme)
  await loadFileList()
})
</script>

<style scoped>
.app-layout {
  display: flex;
  height: 100vh;
  overflow: hidden;
}

.sidebar-left {
  width: var(--sidebar-width);
  background: var(--sidebar-bg);
  border-right: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
  transition: width 0.3s;
}

.sidebar-header {
  padding: 1rem;
  border-bottom: 1px solid var(--border-color);
}

.sidebar-header h2 {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-color);
}

.search-container {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem;
  border-bottom: 1px solid var(--border-color);
}

.search-box {
  flex: 1;
  position: relative;
  display: flex;
  align-items: center;
  background: var(--bg-color);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 0.5rem 0.75rem;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.search-box:focus-within {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.search-icon {
  margin-right: 0.5rem;
  color: var(--text-secondary);
  font-size: 0.875rem;
}

.search-input {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  color: var(--text-color);
  font-size: 0.875rem;
}

.search-input::placeholder {
  color: var(--text-secondary);
}

.search-clear {
  background: transparent;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 4px;
  transition: background 0.2s, color 0.2s;
}

.search-clear:hover {
  background: var(--hover-bg);
  color: var(--text-color);
}

.btn-refresh {
  background: var(--bg-color);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 0.5rem;
  cursor: pointer;
  font-size: 1rem;
  transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
}

.btn-refresh:hover {
  border-color: var(--primary-color);
  background: rgba(59, 130, 246, 0.05);
}

.btn-refresh:active {
  transform: scale(0.95);
}

.btn-refresh.spinning {
  animation: spin 0.5s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.sidebar-left.collapsed {
  width: 0;
  overflow: hidden;
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.sidebar-right {
  width: var(--toc-width);
  background: var(--sidebar-bg);
  border-left: 1px solid var(--border-color);
  overflow-y: auto;
  transition: width 0.3s;
}

.sidebar-right.collapsed {
  width: 0;
  overflow: hidden;
}

.toolbar {
  height: var(--header-height);
  background: var(--bg-color);
  border-bottom: 1px solid var(--border-color);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 1rem;
}

.toolbar-left {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.toolbar-title {
  font-weight: 600;
  color: var(--text-color);
}

.toolbar-actions {
  display: flex;
  gap: 0.5rem;
}

.btn-toolbar {
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-size: 0.875rem;
  color: var(--text-color);
  background: transparent;
  transition: background 0.2s;
}

.btn-toolbar:hover {
  background: var(--hover-bg);
}

.reader-container {
  flex: 1;
  overflow-y: auto;
  padding: 2rem;
}

.mobile-menu-btn {
  display: none;
  padding: 0.5rem;
  font-size: 1.5rem;
}

@media (max-width: 768px) {
  .mobile-menu-btn {
    display: block;
  }
  
  .sidebar-left,
  .sidebar-right {
    position: fixed;
    top: var(--header-height);
    bottom: 0;
    z-index: 100;
  }
  
  .sidebar-left {
    left: 0;
  }
  
  .sidebar-right {
    right: 0;
  }
}
</style>
