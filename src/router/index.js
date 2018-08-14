import Vue from 'vue'
import Router from 'vue-router'

// in development-env not use lazy-loading, because lazy-loading too many pages will cause webpack hot update too slow. so only in production use lazy-loading;
// detail: https://panjiachen.github.io/vue-element-admin-site/#/lazy-loading

Vue.use(Router)

/* Layout */
import Layout from '../views/layout/Layout'

/**
* hidden: true                   if `hidden:true` will not show in the sidebar(default is false)
* alwaysShow: true               if set true, will always show the root menu, whatever its child routes length
*                                if not set alwaysShow, only more than one route under the children
*                                it will becomes nested mode, otherwise not show the root menu
* redirect: noredirect           if `redirect:noredirect` will no redirct in the breadcrumb
* name:'router-name'             the name is used by <keep-alive> (must set!!!)
* meta : {
    title: 'title'               the name show in submenu and breadcrumb (recommend set)
    icon: 'svg-name'             the icon show in the sidebar,
  }
**/
export const constantRouterMap = [
  { path: '/login', component: () => import('@/views/login/index'), hidden: true },
  { path: '/404', component: () => import('@/views/404'), hidden: true },

  {
    path: '/',
    component: Layout,
    name: 'Dashboard',
    hidden: true,
    children: [{
      path: 'dashboard',
      component: () => import('@/views/dashboard/index')
    }]
  },

  {
    path: '/example',
    component: Layout,
    redirect: '/example/table',
    name: 'Example',
    meta: { title: '管理', icon: 'example' },
    children: [
      {
        path: 'member',
        name: 'member',
        component: () => import('@/views/table/member'),
        meta: { title: '用户列表', icon: 'table' }
      },
      {
        path: 'node',
        name: 'node',
        component: () => import('@/views/table/node'),
        meta: { title: '节点列表', icon: 'tree' }
      },
      {
        path: 'dapp',
        name: 'dapp',
        component: () => import('@/views/table/dapp'),
        meta: { title: 'Dapp列表', icon: 'tree' }
      },
      {
        path: 'dappDeploy',
        name: 'dappDeploy',
        component: () => import('@/views/table/dappDeploy'),
        meta: { title: 'Dapp部署', icon: 'tree' }
      }
    ]
  },
  {
    path: '/app',
    component: Layout,
    redirect: '/app/table',
    name: 'App',
    meta: { title: '版本配置', icon: 'example' },
    children: [
      {
        path: 'package',
        name: 'package',
        component: () => import('@/views/app/package'),
        meta: { title: '版本列表', icon: 'table' }
      }
    ]
  },

  { path: '*', redirect: '/404', hidden: true }
]

export default new Router({
  // mode: 'history', //后端支持可开
  scrollBehavior: () => ({ y: 0 }),
  routes: constantRouterMap
})

