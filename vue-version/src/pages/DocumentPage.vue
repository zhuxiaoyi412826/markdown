<template>
  <div class="document-page">
    <div v-if="loading" class="loading">
      加载中...
    </div>
    
    <div v-else-if="error" class="error">
      {{ error }}
    </div>
    
    <article v-else-if="content" class="markdown-body">
      <div class="article-stats">
        <span>📝 {{ wordCount }} 字</span>
        <span>⏱️ {{ readingTime }} 分钟</span>
      </div>
      
      <div v-html="renderedContent" ref="contentRef"></div>
    </article>
    
    <div v-else class="not-found">
      <h2>文档未找到</h2>
      <p>请从左侧列表选择一个文档</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import { useStore } from '../composables/useStore'
import { useMarkdown } from '../composables/useMarkdown'

const route = useRoute()
const emit = defineEmits(['update:title', 'update:headings'])
const { loadDocument, getScrollPosition, saveScrollPosition } = useStore()
const { renderMarkdown, extractHeadings, highlightCode } = useMarkdown()

const content = ref('')
const loading = ref(false)
const error = ref('')
const contentRef = ref(null)

const renderedContent = computed(() => {
  return renderMarkdown(content.value)
})

const wordCount = computed(() => {
  if (!content.value) return 0
  return content.value.replace(/[#*`\[\]()]/g, '').length
})

const readingTime = computed(() => {
  return Math.max(1, Math.ceil(wordCount.value / 400))
})

async function loadDoc() {
  console.log('DocumentPage: loadDoc called')
  
  const path = route.params.path
  console.log('DocumentPage: loadDoc called for path:', path)
  
  if (!path) {
    console.log('DocumentPage: path is empty')
    return
  }
  
  loading.value = true
  error.value = ''
  
  try {
    const doc = await loadDocument(path)
    console.log('DocumentPage: loadDocument returned:', doc)
    
    if (doc) {
      content.value = doc.content
      console.log('DocumentPage: content set, length:', content.value.length)
      
      // 提取标题并发送事件
      const headings = extractHeadings(doc.content)
      console.log('DocumentPage: 提取到标题:', headings)
      console.log('DocumentPage: 发送 update-headings 事件')
      emit('update-headings', headings)
      
      // 提取文档标题（第一个 # 标题）
      const titleMatch = doc.content.match(/^#\s+(.+)$/m)
      if (titleMatch) {
        emit('update:title', titleMatch[1])
      } else if (doc.title) {
        emit('update:title', doc.title)
      }
      
      await nextTick()
      highlightCode()
      addHeadingIds()
      restoreScrollPosition()
    } else {
      error.value = '无法加载文档'
    }
  } catch (e) {
    error.value = '加载文档时出错'
    console.error('DocumentPage: Error:', e)
  } finally {
    loading.value = false
  }
}

function addHeadingIds() {
  console.log('DocumentPage: addHeadingIds called, contentRef:', contentRef.value)
  
  if (!contentRef.value) {
    console.log('DocumentPage: contentRef is null')
    return
  }
  
  const headings = contentRef.value.querySelectorAll('h1, h2, h3')
  console.log('DocumentPage: found headings count:', headings.length)
  
  headings.forEach((heading, index) => {
    heading.id = `heading-${index}`
    console.log('DocumentPage: added id heading-' + index + ' to:', heading.textContent)
  })
}

function restoreScrollPosition() {
  let path = route.params.path
  const docPath = Array.isArray(path) ? path.join('/') : path
  if (!docPath) return
  
  const position = getScrollPosition(`doc-${docPath}`)
  if (position && contentRef.value) {
    contentRef.value.parentElement.scrollTop = position
  }
}

function setupScrollListener() {
  if (!contentRef.value) return
  
  const container = contentRef.value.parentElement
  container.addEventListener('scroll', () => {
    let path = route.params.path
    const docPath = Array.isArray(path) ? path.join('/') : path
    if (docPath) {
      saveScrollPosition(`doc-${docPath}`, container.scrollTop)
    }
  })
}

watch(() => route.params.path, () => {
  loadDoc()
})

onMounted(() => {
  loadDoc()
  setupScrollListener()
})
</script>

<style scoped>
.document-page {
  max-width: 900px;
  margin: 0 auto;
}

.loading,
.error,
.not-found {
  text-align: center;
  padding: 3rem;
  color: var(--text-secondary);
}

.error {
  color: var(--danger-color);
}

.article-stats {
  display: flex;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--border-color);
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.markdown-body {
  line-height: 1.8;
}

.markdown-body :deep(h1) {
  font-size: 2rem;
  margin: 1.5rem 0 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid var(--border-color);
}

.markdown-body :deep(h2) {
  font-size: 1.5rem;
  margin: 1.25rem 0 0.75rem;
}

.markdown-body :deep(h3) {
  font-size: 1.25rem;
  margin: 1rem 0 0.5rem;
}

.markdown-body :deep(p) {
  margin: 0.75rem 0;
}

.markdown-body :deep(code) {
  background: var(--code-bg);
  padding: 0.125rem 0.375rem;
  border-radius: 4px;
  font-family: monospace;
  font-size: 0.9em;
}

.markdown-body :deep(pre) {
  background: var(--code-bg);
  padding: 1rem;
  border-radius: 8px;
  overflow-x: auto;
  margin: 1rem 0;
}

.markdown-body :deep(pre code) {
  background: none;
  padding: 0;
}

.markdown-body :deep(ul),
.markdown-body :deep(ol) {
  padding-left: 1.5rem;
  margin: 0.75rem 0;
}

.markdown-body :deep(li) {
  margin: 0.25rem 0;
}

.markdown-body :deep(blockquote) {
  border-left: 4px solid var(--primary-color);
  padding-left: 1rem;
  margin: 1rem 0;
  color: var(--text-secondary);
}

.markdown-body :deep(table) {
  width: 100%;
  border-collapse: collapse;
  margin: 1rem 0;
}

.markdown-body :deep(th),
.markdown-body :deep(td) {
  border: 1px solid var(--border-color);
  padding: 0.5rem;
  text-align: left;
}

.markdown-body :deep(th) {
  background: var(--sidebar-bg);
}

.markdown-body :deep(img) {
  max-width: 100%;
  border-radius: 8px;
}

.markdown-body :deep(a) {
  color: var(--primary-color);
}
</style>
