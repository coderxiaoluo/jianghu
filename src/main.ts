import './assets/scss/index.scss'
import { createApp } from 'vue'
import store from './stores/index'

import App from './App.vue'
const app = createApp(App)

app.use(store)
app.mount('#app')
