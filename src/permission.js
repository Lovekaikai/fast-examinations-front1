import router from './router'
import store from './store'
import { menusToRoutes, resetTokenAndClearUser } from './utils'
import VueCookies from 'vue-cookies' 
import myStorage from 'utils/localstore'
import { LoadingBar } from 'view-design'
import axios from 'axios'

// 是否有菜单数据
let hasMenus = false
router.beforeEach(async (to, from, next) => {
    LoadingBar.start()
    if (VueCookies.get('token')) {
        if (to.path === '/login') {
            // next({path: '/'})  // 重定向要主页
            next({name: from.name ? from.name : '/'})
        } else {
            if (hasMenus) {
                next()
            } else {
                try {
                    // 这里可以用 await 配合请求后台数据来生成路由
                    // const data = await axios.get('xxx')
                    // const routes = menusToRoutes(data)
                    const { role } = myStorage.get('userData')
                    console.log(role)
                    if(role && role.roleId ===  2) {
                        store.commit('setMenus',3)
                    }else if(role && role.roleId ===  1) {
                        store.commit('setMenus')
                    }
                    let routes = menusToRoutes(store.state.showMenuItems)
                    
                   console.log(store.state.showMenuItems,"store.state.showMenuItems")
                    console.log(routes,"routes")
                    // 动态添加路由
                    router.addRoutes(routes)
                    hasMenus = true
                    console.log(to.path,"to.path")
                    next({path: to.path || '/'})    
                    // next({path: '/'})    // 让每次页面都进入首页
                } catch (error) {
                    console.log(error)
                    resetTokenAndClearUser()
                    next(`/login?redirect=${to.path}`)
                }
            }
        }
    } else {
        hasMenus = false
        myStorage.remove('userData')
        if (to.path === '/login') {
            next()
        } else {
            next(`/login?redirect=${to.path}`)
        }
    }
})

router.afterEach(() => {
    LoadingBar.finish()
})