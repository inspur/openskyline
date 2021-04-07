const state = {
  userInfo: {}
}

const getters = {
  getUserInfo(state) {
    return state.userInfo
  }
}

const mutations = {
  setUserInfo(state, userInfo) {
    state.userInfo = userInfo
  }
}

const actions = {
  setUserInfo({
    commit
  }, user) {
    commit('setUserInfo', user)
  }
}
export default {
  state,
  getters,
  mutations,
  actions
}
