//根级别的 actions
import * as types from './mutation-types'
export default {
  setMsg({
    commit
  }, msg) {
    commit('setMsg', msg)
  }
}
