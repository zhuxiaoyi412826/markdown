import { createApp } from 'vue'
import { createRouter, createWebHashHistory } from 'vue-router'
import App from './App.vue'
import HomePage from './pages/HomePage.vue'
import DocumentPage from './pages/DocumentPage.vue'
import './style.css'

const routes = [
  { path: '/', name: 'home', component: HomePage },
  { path: '/doc/:path+', name: 'document', component: DocumentPage }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

const app = createApp(App)
app.use(router)
app.mount('#app')
