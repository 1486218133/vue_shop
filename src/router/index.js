import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from '../components/login'
import Home from '../components/home'
import Welcome from '../components/welcome'
import User from '../components/user/Users'
import Rights from '../components/power/Rights'
import Roles from '../components/power/Roles'

Vue.use(VueRouter)
const routes = [
  { path: '/', redirect: '/Login' },
  { path: '/Login', component: Login },
  {
    path: '/home', component: Home, redirect:'/welcome',children: [
      { path: '/welcome', component: Welcome },
      {path:'/users',component:User},
      {path:'/rights',component:Rights},
      {path:'/roles',component:Roles}
    ]
  }
]
const router = new VueRouter({
  routes
})


router.beforeEach((to, from, next) => {
  // 如果访问的是登录页直接放行
  if (to.path === '/Login') return next()
  // 若访问不是登录页面先查看是否有token
  const tokens = window.sessionStorage.getItem('token')
  // 若token不存在则跳转至登录页
  if (!tokens) return next('/Login')
  // 若有token直接放行
  next()
})

export default router
