import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { PiniaColada } from '@pinia/colada'
import '@fontsource/kode-mono/400.css'
import '@fontsource/kode-mono/700.css'
import './style.css'
import App from './App.vue'
import { router } from './router'

const pinia = createPinia()
const app = createApp(App)

app.use(pinia)
app.use(PiniaColada)
app.use(router)
app.mount('#app')
