import Vue from 'vue'
import App from './App.vue'
import Vuex from 'vuex'
import '@/assets/theme/index.css'
import '@/assets/theme/self.css'
import ElementUI from 'element-ui'
import { storeConfig } from 'fusion-ui'

import router from './router'
Vue.use(Vuex)
const store = new Vuex.Store(storeConfig)

Vue.config.productionTip = false
Vue.use(ElementUI)

new Vue({
    router,
    store,
    render: (h) => h(App),
}).$mount('#app')
