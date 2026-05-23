<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-content">
      <div class="modal-header">
        <h3>设置</h3>
        <button class="btn-close" @click="$emit('close')">✕</button>
      </div>
      
      <div class="modal-body">
        <div class="setting-group">
          <label class="setting-label">字体大小</label>
          <div class="setting-options">
            <button
              v-for="size in fontSizes"
              :key="size"
              class="setting-btn"
              :class="{ active: settings.fontSize === size }"
              @click="updateSetting('fontSize', size)"
            >
              {{ size }}px
            </button>
          </div>
        </div>
        
        <div class="setting-group">
          <label class="setting-label">字体</label>
          <select 
            class="setting-select"
            :value="settings.fontFamily"
            @change="updateSetting('fontFamily', $event.target.value)"
          >
            <option value="default">默认</option>
            <option value="source-sans">思源黑体</option>
            <option value="source-serif">思源宋体</option>
            <option value="wenquanyi">文泉驿微米黑</option>
            <option value="monospace">等宽字体</option>
            <option value="noto-sans">Noto Sans SC</option>
            <option value="noto-serif">Noto Serif SC</option>
          </select>
        </div>
        
        <div class="setting-group">
          <label class="setting-label">行高</label>
          <div class="setting-options">
            <button
              v-for="height in lineHeights"
              :key="height"
              class="setting-btn"
              :class="{ active: settings.lineHeight === height }"
              @click="updateSetting('lineHeight', height)"
            >
              {{ height }}
            </button>
          </div>
        </div>
        
        <div class="setting-group">
          <label class="setting-label">页面宽度</label>
          <div class="setting-options">
            <button
              v-for="width in pageWidths"
              :key="width.value"
              class="setting-btn"
              :class="{ active: settings.pageWidth === width.value }"
              @click="updateSetting('pageWidth', width.value)"
            >
              {{ width.label }}
            </button>
          </div>
        </div>
        
        <div class="setting-group">
          <label class="setting-label">主题</label>
          <div class="setting-toggle">
            <button 
              class="toggle-btn"
              :class="{ active: settings.theme === 'dark' }"
              @click="updateSetting('theme', 'dark')"
            >
              🌙 暗色
            </button>
            <button 
              class="toggle-btn"
              :class="{ active: settings.theme === 'light' }"
              @click="updateSetting('theme', 'light')"
            >
              ☀️ 亮色
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  settings: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['update', 'close'])

const fontSizes = [14, 16, 18, 20]
const lineHeights = [1.5, 1.8, 2.0, 2.2]
const pageWidths = [
  { value: 'narrow', label: '窄' },
  { value: 'normal', label: '正常' },
  { value: 'wide', label: '宽' }
]

function updateSetting(key, value) {
  emit('update', { [key]: value })
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: var(--bg-color);
  border-radius: 12px;
  width: 90%;
  max-width: 480px;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: var(--shadow);
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid var(--border-color);
}

.modal-header h3 {
  font-size: 1.125rem;
  font-weight: 600;
}

.btn-close {
  width: 32px;
  height: 32px;
  border-radius: 6px;
  font-size: 1rem;
  color: var(--text-secondary);
  transition: background 0.2s;
}

.btn-close:hover {
  background: var(--hover-bg);
}

.modal-body {
  padding: 1.5rem;
}

.setting-group {
  margin-bottom: 1.5rem;
}

.setting-label {
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  margin-bottom: 0.75rem;
  color: var(--text-color);
}

.setting-options {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.setting-btn {
  padding: 0.5rem 1rem;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  font-size: 0.875rem;
  color: var(--text-color);
  background: var(--bg-color);
  transition: all 0.2s;
}

.setting-btn:hover {
  border-color: var(--primary-color);
}

.setting-btn.active {
  background: var(--primary-color);
  border-color: var(--primary-color);
  color: white;
}

.setting-select {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  font-size: 0.875rem;
  background: var(--bg-color);
  color: var(--text-color);
}

.setting-toggle {
  display: flex;
  gap: 0.5rem;
}

.toggle-btn {
  flex: 1;
  padding: 0.5rem 1rem;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  font-size: 0.875rem;
  color: var(--text-color);
  background: var(--bg-color);
  transition: all 0.2s;
}

.toggle-btn.active {
  background: var(--primary-color);
  border-color: var(--primary-color);
  color: white;
}
</style>
