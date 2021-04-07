const state = {
  order: {
    faultNum: 0,
    orderNum: 0
  }
}

const getters = {
  getOrderInfo(state) {
    return state.order
  }
}

const mutations = {
  setOrderInfo(state, order) {
    state.order = order
  }
}

const actions = {
  setOrderInfo({
    commit
  }, order) {
    commit('getOrderInfo', order)
  }
}

export default {
  state,
  getters,
  mutations,
  actions
}
