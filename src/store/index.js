import Vue from 'vue'
import Vuex from 'vuex'
import myStorage from 'utils/localstore'
import login from './modules/login'
import standardInspec from './modules/standardInspec'

Vue.use(Vuex)

const store = new Vuex.Store({
  state: {
    // 左侧菜单栏数据
    menuItems: [
      {
        name: 'data-manage', // 要跳转的路由名称 不是路径
        text: '数据管理', // 文本内容
        type: 'md-pie', // 图标
        size: 20 // 图标大小
      },
      {
        name: 'inspect-detail',
        text: '检验详情',
        hidden: true
      },
      {
        name: 'inspect-item',
        text: '检验项目',
        type: 'ios-list-box',
        size: 22
      },
      {
        name: 'param-unit',
        text: '参数单位',
        type: 'ios-options',
        size: 22
      },
      // {
      //   name: 'category-Inspec',
      //   text: '检验类别',
      //   type: 'logo-buffer',
      //   size: 22
      // },
      {
        name: 'goods-Inspec',
        text: '检验商品类目',
        type: 'ios-cube',
        size: 20

      },
      {
        name: 'methods-Inspec',
        text: '检验方法',
        type: 'md-bulb',
        size: 22
      },
      {
        name: 'standard-Inspec',
        text: '检验标准管理',
        type: 'ios-contrast',
        size: 22
      },
      {
        name: 'category-mange',
        text: '品类管理',
        hidden: true
      },
      {
        name: 'add-category',
        text: '新增品类',
        hidden: true
      },
      {
        name: 'category-detail',
        text: '品类详情',
        hidden: true
      },
      {
        name: 'laboratory-manage',
        text: '实验室管理',
        type: 'ios-flask',
        size: 22
      },
      {
        name: 'organization-manage',
        text: '组织管理',
        type: 'md-git-branch',
        size: 22
      },
      {
        name: 'account-manage',
        text: '账号管理',
        type: 'md-people',
        size: 23
      },
      {
        name: 'site-arrange',
        text: '管理点配置',
        hidden: true
      }
    ],

    showMenuItems: [],

    // 下次直接登录
    autoLoginNext: myStorage.get('autoLoginNext'),
    
    // token
    token: myStorage.get('token'),

    // 用户信息
    userInfo: myStorage.get('userInfo')
  },
  getters: {
    // 初始化登录要跳转的菜单
    initMenus(state) {
      if(state.showMenuItems.length === 0) {
        return 'error'
      }

      let item = state.showMenuItems[0]
      if(item) return item.name
    }
  },
  mutations: {
    // 设置菜单
    setMenus(state,playload) {
      state.showMenuItems = playload ? state.menuItems.slice(0,playload) : state.menuItems.slice(0)
    }
  },
  modules: {
    login,
    standardInspec
  }
})

export default store