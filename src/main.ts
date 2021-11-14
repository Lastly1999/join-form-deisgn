import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

import ElementPlus from "element-plus"

import {
  VueDraggableNext
} from "vue-draggable-next";

import 'element-plus/dist/index.css'

const app = createApp(App)
app.component('Draggable', VueDraggableNext)

app.use(ElementPlus).use(router).mount('#app')
