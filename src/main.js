import { createApp } from 'vue'
import './styles/styles.sass'
import App from './App.vue'
import router from './router.js'

createApp(App).use(router).mount('#app')
