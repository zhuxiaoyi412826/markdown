<template>
  <div class="document-list">
    <div v-if="documents.length === 0" class="doc-empty">
      📭 没有找到文档
    </div>
    
    <template v-for="doc in documents" :key="doc.id">
      <div 
        v-if="!doc.isFolder"
        class="doc-item file"
        :class="{ active: isActive(doc) }"
        :style="{ paddingLeft: `${doc.level * 0.75 + 0.5}rem` }"
        @click="handleSelectDoc(doc)"
      >
        <span class="doc-icon">📄</span>
        <span class="doc-title">{{ doc.title }}</span>
      </div>
      
      <div 
        v-else
        class="doc-item folder"
        :class="{ expanded: isExpanded(doc.path) }"
        :style="{ paddingLeft: `${doc.level * 0.75 + 0.5}rem` }"
        @click="handleToggleFolder(doc.path)"
      >
        <span class="arrow" :class="{ expanded: isExpanded(doc.path) }">▶</span>
        <span class="folder-icon">📁</span>
        <span class="doc-title">{{ doc.title }}</span>
      </div>
    </template>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const props = defineProps({
  documents: {
    type: Array,
    required: true
  },
  expandedFolders: {
    type: Set,
    required: true
  }
})

const emit = defineEmits(['toggle-folder', 'select-doc'])

const route = useRoute()

console.log('DocumentList: mounted, documents count:', props.documents.length)

function isExpanded(path) {
  return props.expandedFolders.has(path)
}

function isActive(doc) {
  return route.params.path === doc.path
}

function handleSelectDoc(doc) {
  console.log('DocumentList: handleSelectDoc called:', doc.title)
  emit('select-doc', doc)
}

function handleToggleFolder(path) {
  console.log('DocumentList: handleToggleFolder called:', path)
  emit('toggle-folder', path)
}
</script>

<style scoped>
.document-list {
  flex: 1;
  overflow-y: auto;
  padding: 0.5rem;
}

.doc-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.2s;
  font-size: 0.875rem;
}

.doc-item:hover {
  background: var(--hover-bg);
}

.doc-item.active {
  background: var(--active-bg);
  color: var(--primary-color);
}

.doc-item.folder {
  font-weight: 600;
  color: var(--primary-color);
}

.doc-item .doc-title {
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.doc-icon,
.folder-icon {
  flex-shrink: 0;
  font-size: 1rem;
}

.arrow {
  flex-shrink: 0;
  font-size: 0.625rem;
  transition: transform 0.2s;
  color: var(--text-secondary);
}

.arrow.expanded {
  transform: rotate(90deg);
}

.doc-empty {
  padding: 2rem;
  text-align: center;
  color: var(--text-secondary);
}
</style>
