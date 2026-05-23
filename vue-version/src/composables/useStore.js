import { ref, computed } from 'vue'

const state = ref({
  fileTree: [],
  documents: [],
  currentDoc: null,
  settings: {
    theme: 'dark',
    fontSize: 16,
    fontFamily: 'default',
    lineHeight: 1.8,
    pageWidth: 'normal',
    showToc: true
  },
  scrollPositions: {},
  expandedFolders: new Set()
})

let storageAvailable = true

function saveState() {
  if (!storageAvailable) return
  try {
    const data = {
      currentDocId: state.value.currentDoc?.id,
      settings: state.value.settings,
      scrollPositions: state.value.scrollPositions,
      expandedFolders: Array.from(state.value.expandedFolders)
    }
    localStorage.setItem('markdownReader', JSON.stringify(data))
  } catch (e) {
    console.warn('Unable to save state:', e)
    storageAvailable = false
  }
}

function loadState() {
  if (!storageAvailable) return
  try {
    const saved = localStorage.getItem('markdownReader')
    if (saved) {
      const data = JSON.parse(saved)
      state.value.settings = { ...state.value.settings, ...data.settings }
      state.value.scrollPositions = data.scrollPositions || {}
      state.value.expandedFolders = new Set(data.expandedFolders || [])
    }
  } catch (e) {
    console.warn('Unable to load state:', e)
    storageAvailable = false
  }
}

function loadFileList() {
  return fetch('/file-list.json')
    .then(res => {
      if (!res.ok) throw new Error('Failed to load file list')
      return res.json()
    })
    .then(data => {
      state.value.fileTree = data.tree || []
      buildDocuments()
      return true
    })
    .catch(err => {
      console.error('Error loading file list:', err)
      return false
    })
}

function buildDocuments() {
  const docs = []
  
  function traverse(tree, parentPath = '', level = 1) {
    for (const item of tree) {
      if (item.isFolder) {
        docs.push({
          id: `folder-${item.path}`,
          title: item.name,
          content: '',
          createdAt: Date.now(),
          updatedAt: Date.now(),
          isFolder: true,
          level: level,
          path: item.path,
          children: item.children || []
        })
        
        if (item.children) {
          traverse(item.children, item.path, level + 1)
        }
      } else {
        docs.push({
          id: `doc-${item.path}`,
          title: item.name.replace('.md', ''),
          content: '',
          createdAt: item.updatedAt ? new Date(item.updatedAt * 1000).getTime() : Date.now(),
          updatedAt: item.updatedAt ? new Date(item.updatedAt * 1000).getTime() : Date.now(),
          isFolder: false,
          level: level,
          path: item.path
        })
      }
    }
  }
  
  traverse(state.value.fileTree)
  state.value.documents = docs
}

function loadDocument(path) {
  // 如果 path 是数组，把它连接成字符串
  let docPath
  let urlPath
  if (Array.isArray(path)) {
    docPath = path.join('/')
    urlPath = path.map(encodeURIComponent).join('/')
  } else {
    docPath = path
    // 如果路径包含 /，分段编码
    urlPath = path.split('/').map(encodeURIComponent).join('/')
  }
  
  console.log('useStore: loadDocument, docPath:', docPath)
  console.log('useStore: loadDocument, urlPath:', urlPath)
  
  return fetch(`/biji/${urlPath}`)
    .then(res => {
      console.log('useStore: fetch response status:', res.status)
      if (!res.ok) throw new Error(`Failed to load ${docPath}`)
      return res.text()
    })
    .then(content => {
      console.log('useStore: loaded content length:', content.length)
      console.log('useStore: loaded content start:', content.substring(0, 50))
      const doc = state.value.documents.find(d => d.path === docPath)
      if (doc) {
        state.value.currentDoc = { ...doc, content }
      }
      return { ...doc, content }
    })
    .catch(err => {
      console.error('Error loading document:', err)
      return null
    })
}

function toggleFolder(path) {
  if (state.value.expandedFolders.has(path)) {
    state.value.expandedFolders.delete(path)
  } else {
    state.value.expandedFolders.add(path)
  }
  saveState()
}

function isFolderExpanded(path) {
  return state.value.expandedFolders.has(path)
}

function updateSettings(newSettings) {
  state.value.settings = { ...state.value.settings, ...newSettings }
  saveState()
}

function saveScrollPosition(docId, position) {
  state.value.scrollPositions[docId] = position
  saveState()
}

function getScrollPosition(docId) {
  return state.value.scrollPositions[docId] || 0
}

export function useStore() {
  return {
    state,
    loadState,
    saveState,
    loadFileList,
    loadDocument,
    toggleFolder,
    isFolderExpanded,
    updateSettings,
    saveScrollPosition,
    getScrollPosition
  }
}
