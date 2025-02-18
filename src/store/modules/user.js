import { login, logout, getUserInfo } from '@/api/auth'

const state = {
  token: localStorage.getItem('token'),
  userInfo: null,
  role: ''
}

const mutations = {
  SET_TOKEN: (state, token) => {
    state.token = token
  },
  SET_USER_INFO: (state, userInfo) => {
    state.userInfo = userInfo
    state.role = userInfo.role
  },
  CLEAR_USER: (state) => {
    state.token = null
    state.userInfo = null
    state.role = ''
  }
}

const actions = {
  // 登录
  async login({ commit }, userInfo) {
    try {
      const { token } = await login(userInfo)
      localStorage.setItem('token', token)
      commit('SET_TOKEN', token)
      return true
    } catch (error) {
      return false
    }
  },

  // 获取用户信息
  async getUserInfo({ commit }) {
    try {
      const userInfo = await getUserInfo()
      commit('SET_USER_INFO', userInfo)
      return userInfo
    } catch (error) {
      return null
    }
  },

  // 退出登录
  async logout({ commit }) {
    try {
      await logout()
      localStorage.removeItem('token')
      commit('CLEAR_USER')
      return true
    } catch (error) {
      return false
    }
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
} 