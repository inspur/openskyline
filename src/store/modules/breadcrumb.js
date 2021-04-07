const state = {
  routers: [{
    name: '',
    path: ''
  }]
}

const getters = {
  getRouters(state) {
    return state.routers
  }
}

const mutations = {
  setRouters(state, routers) {
    state.routers = routers
  }
}

const actions = {
  setRouters({
    commit
  }, routers) {
    commit('setRouters', routers)
  }
}

export default {
  state,
  getters,
  mutations,
  actions
}
