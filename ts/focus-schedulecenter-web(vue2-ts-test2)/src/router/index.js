import Vue from 'vue'
import VueRouter from 'vue-router'

import JobFlow from '../views/JobFlow'

//首页
import Home from '../views/Home'
import JobManagement from '../views/JobManagement'
import JobScheduling from '../views/JobScheduling'
import RunningHistory from '../views/RunningHistory'
import ExecutorManagement from '../views/ExecutorManagement'
import ByETLQueryTask from '../views/ByETLQueryTask'

Vue.use(VueRouter)

const routes = [
    {
        path: '/Home',
        name: 'Home',
        component: Home,
    },
    {
        path: '/JobManagement',
        name: 'JobManagement',
        component: JobManagement,
    },
    {
        path: '/JobScheduling',
        name: 'JobScheduling',
        component: JobScheduling,
    },
    {
        path: '/RunningHistory',
        name: 'RunningHistory',
        component: RunningHistory,
    },
    {
        path: '/ExecutorManagement',
        name: 'ExecutorManagement',
        component: ExecutorManagement,
    },
    {
        path: '/JobFlow',
        name: 'JobFlow',
        component: JobFlow,
    },
    {
        path: '/ByETLQueryTask',
        name: 'ByETLQueryTask',
        component: ByETLQueryTask,
    },
]

const router = new VueRouter({
    base: process.env.BASE_URL,
    routes,
})

export default router
