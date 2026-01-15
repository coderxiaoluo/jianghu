import './assets/scss/index.scss'
import { createApp } from 'vue'
import store from './stores/index'
import router from './router/index'

import App from './App.vue'
const app = createApp(App)

app.use(store)
app.use(router)
app.mount('#app')
