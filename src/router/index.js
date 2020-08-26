import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

const commonRoutes = [
    {
        path: '/login',
        name: 'login',
        component: () => import('views/login/login.vue'),
        meta: {keepAlive: false}  // 设置面包屑等级
    }
] 

// 增加meta的 keepAlive 来判断该页面是否需要缓存

// 需要动态生成路由
export const asyncRoutes = {
    // 数据管理
    'data-manage': {
        path: 'dataManage',
        name: 'data-manage',
        component: () => import('views/dataManage/dataManage.vue'),
        meta: {title: '数据管理',breadNumber: 1,keepAlive: true}  // 设置面包屑等级
    },

    // 数据管理 - 查看详情
    'inspect-detail': {
        path: 'inspectDetail/:batchNo',
        name: 'inspect-detail',
        component: () => import('views/dataManage/inspectDetail.vue'),
        meta: {title: '检验详情',breadNumber: 2,keepAlive: false} 
    },

    // 检验项目
    'inspect-item': {
        path: 'inspectItem',
        name: 'inspect-item',
        component: () => import('views/inspectItem/inspectItem.vue'),
        meta: {title: '检验项目',breadNumber: 1,keepAlive: false}
    },

    // 参数单位
    'param-unit': {
        path: 'paramUnit',
        name: 'param-unit',
        component: () => import('views/paramUnit/paramUnit.vue'),
        meta: {title: '参数单位',breadNumber: 1,keepAlive: false}
    },

     // 检验类别
     'category-Inspec': {
        path: 'categoryInspec',
        name: 'category-Inspec',
        component: () => import('views/categoryInspec/categoryInspec.vue'),
        meta: {title: '检验类别',breadNumber: 1,keepAlive: false}
    },

    // 检验商品
    'goods-Inspec': {
        path: 'goodsInspec',
        name: 'goods-Inspec',
        component: () => import('views/goodsInspec/goodsInspec.vue'),
        meta: {title: '检验商品类目',breadNumber: 1,keepAlive: false}
    },

    // 检验方法
    'methods-Inspec': {
        path: 'methodsInspec',
        name: 'methods-Inspec',
        component: () => import('views/methodsInspec/methodsInspec.vue'),
        meta: {title: '检验方法',breadNumber: 1,keepAlive: false}
    },
   
    // 检验标准管理
    'standard-Inspec': {
        path: 'standardInspec',
        name: 'standard-Inspec',
        component: () => import('views/standardInspec/standardInspec.vue'),
        meta: {title: '检验标准管理',breadNumber: 1,keepAlive: true}
    },

    // 品类管理
    'category-mange': {
        path: 'categoryMange/:paramObj',
        name: 'category-mange',
        component: () => import('views/standardInspec/categoryMange.vue'),
        meta: {title: '品类管理',breadNumber: 2,keepAlive: true}
    },

    // 新增品类管理
    'add-category': {
        path: 'addCategory/:paramObj',
        name: 'add-category',
        component: () => import('views/standardInspec/addCategory.vue'),
        meta: {title: '操作品类',breadNumber: 3,keepAlive: false}
    },

    // 品类管理详情
    // classifyId=1&standardId
    'category-detail': {
        path : 'categoryDetail/:paramObj',
        name: 'category-detail',
        component: () => import('views/standardInspec/categoryDetail.vue'),
        meta: {title: '品类详情',breadNumber: 3,keepAlive: false}
    },

    // 实验室管理
    'laboratory-manage': {
        path: 'laboratoryManage',
        name: 'laboratory-manage',
        component: () => import('views/laboratoryManage/laboratoryManage.vue'),
        meta: {title: '实验室管理',breadNumber: 1,keepAlive: false}
    },

     // 组织管理
     'organization-manage': {
        path: 'organizationManage',
        name: 'organization-manage',
        component: () => import('views/organizationManage/organizationManage.vue'),
        meta: {title: '组织管理',breadNumber: 1,keepAlive: true}
    },

    // 账号管理
    'account-manage': {
        path: 'accountManage',
        name: 'account-manage',
        component: () => import('views/accountManage/accountManage.vue'),
        meta: {title: '账号管理',breadNumber: 1,keepAlive: false}
    },

    // 管理点配置
    'site-arrange': {
        path: 'siteArrange/:organizationId',
        name: 'site-arrange',
        component: () => import('views/organizationManage/siteArrange.vue'),
        meta: {title: '管理点配置',breadNumber: 2,keepAlive: false}
    }
}

const createRouter = () => new Router({
    routes: commonRoutes
})

const router = createRouter()

export function resetRouter() {
  const newRouter = createRouter()
  router.matcher = newRouter.matcher 
}

export default router