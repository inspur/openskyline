//我们组装模块并导出 store 的地方
import Vue from 'vue'
import Vuex from 'vuex'
import actions from './actions'
import mutations from './mutations'
import getters from './getters'

import user from './modules/user'
import breadcrumb from './modules/breadcrumb'
import order from './modules/order'
Vue.use(Vuex)

const debug = process.env.NODE_ENV !== 'production'

const state = {
  message: {}
}

const store = new Vuex.Store({
  state,
  getters,
  mutations,
  actions,
  modules: {
    user,
    breadcrumb,
    order
  }
})

export default store
// // 假设 getData() 和 getOtherData() 返回的是 Promise

// actions: {
//   async actionA ({ commit }) {
//     commit('gotData', await getData())
//   },
//   async actionB ({ dispatch, commit }) {
//     await dispatch('actionA') // 等待 actionA 完成
//     commit('gotOtherData', await getOtherData())
//   }
// }
