import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import { createPinia } from 'pinia'
import router from './router'
import { registerSW } from 'virtual:pwa-register'
import naive from 'naive-ui'

registerSW({ immediate: true })

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(naive)

app.mount('#app')
