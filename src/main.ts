import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import { initMonitoring } from './services/monitoring'
import './assets/main.css'

const app = createApp(App)

initMonitoring(app)
app.use(createPinia())
app.use(router)

app.mount('#app')
