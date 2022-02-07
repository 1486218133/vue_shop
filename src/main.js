import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
// 全局css
import './assets/css/global.css'
// 按需引入elementui
import './plugins/element.js'
// incon图标
import './assets/fonts/iconfont.css'
import axios from 'axios'

import TreeTable from 'vue-table-with-tree-grid'
Vue.component('tree-table', TreeTable)


axios.defaults.baseURL='http://127.0.0.1:8888/api/private/v1/'
// 设置请求头
axios.interceptors.request.use( config =>{
  config.headers.Authorization=window.sessionStorage.getItem('token')
  return config
})
Vue.prototype.$http=axios
Vue.config.productionTip = false
new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
