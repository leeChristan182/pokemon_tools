// src/main.js
import { createApp } from 'vue'
import App from './App.vue'
import router from './router' 
import './assets/styles.css'

const app = createApp(App)
app.use(router)
app.mount('#app')

fetch('http://localhost:5000/')
  .then(res => res.text())
  .then(data => console.log('Backend:', data))
  .catch(err => console.error('Backend not running:', err))
