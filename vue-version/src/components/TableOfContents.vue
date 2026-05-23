<template>
  <div class="toc-container">
    <div class="toc-header">
      <h3>目录</h3>
    </div>
    
    <div class="toc-list" v-if="headings.length > 0">
      <a
        v-for="(heading, index) in headings"
        :key="index"
        :href="`#heading-${index}`"
        class="toc-item"
        :class="`level-${heading.level}`"
        @click.prevent="scrollToHeading(index)"
      >
        {{ heading.text }}
      </a>
    </div>
    
    <div v-else class="toc-empty">
      暂无标题
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  headings: {
    type: Array,
    default: () => []
  }
})

console.log('TableOfContents: headings props:', props.headings)

function scrollToHeading(index) {
  console.log('TableOfContents: scrollToHeading called with index:', index)
  
  const element = document.getElementById(`heading-${index}`)
  console.log('TableOfContents: element found:', element)
  
  if (element) {
    // 找到滚动容器
    const container = document.querySelector('.reader-container')
    console.log('TableOfContents: container found:', container)
    
    if (container) {
      // 计算元素相对于容器顶部的位置
      const rect = element.getBoundingClientRect()
      const containerRect = container.getBoundingClientRect()
      const scrollTop = container.scrollTop + (rect.top - containerRect.top - 50)
      
      console.log('TableOfContents: scrollTop:', scrollTop)
      
      // 在容器内滚动
      container.scrollTo({
        top: scrollTop,
        behavior: 'smooth'
      })
    } else {
      // 备用方案：滚动整个页面
      console.log('TableOfContents: using scrollIntoView')
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }
}
</script>

<style scoped>
.toc-container {
  padding: 1rem;
}

.toc-header {
  margin-bottom: 1rem;
}

.toc-header h3 {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-color);
}

.toc-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.toc-item {
  font-size: 0.875rem;
  color: var(--text-secondary);
  padding: 0.25rem 0;
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  transition: color 0.2s;
}

.toc-item:hover {
  color: var(--primary-color);
  text-decoration: none;
}

.toc-item.level-2 {
  padding-left: 1rem;
}

.toc-item.level-3 {
  padding-left: 2rem;
  font-size: 0.8rem;
}

.toc-empty {
  color: var(--text-secondary);
  font-size: 0.875rem;
  text-align: center;
  padding: 2rem 0;
}
</style>
