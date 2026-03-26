import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { PiniaColada } from '@pinia/colada'
import './style.css'
import App from './App.vue'
import { router } from './router'

const pinia = createPinia()
const app = createApp(App)

app.use(pinia)
app.use(PiniaColada)
app.use(router)
app.mount('#app')
