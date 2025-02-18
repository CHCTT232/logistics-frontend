import {
  getOptimalRoute,
  getDrivingRoute,
  updateDriverLocation,
  getAvailableDeliveryTasks,
  acceptDeliveryTask,
  completeDeliveryTask
} from '@/api/route'

const state = {
  currentRoute: null,
  availableTasks: [],
  loading: false,
  driverLocation: null
}

const mutations = {
  SET_CURRENT_ROUTE: (state, route) => {
    state.currentRoute = route
  },
  SET_AVAILABLE_TASKS: (state, tasks) => {
    state.availableTasks = tasks
  },
  SET_LOADING: (state, loading) => {
    state.loading = loading
  },
  SET_DRIVER_LOCATION: (state, location) => {
    state.driverLocation = location
  }
}

const actions = {
  // 获取最优配送路线
  async getOptimalRoute({ commit }, params) {
    commit('SET_LOADING', true)
    try {
      const route = await getOptimalRoute(params)
      commit('SET_CURRENT_ROUTE', route)
      return route
    } finally {
      commit('SET_LOADING', false)
    }
  },

  // 获取驾驶路线
  async getDrivingRoute({ commit }, params) {
    commit('SET_LOADING', true)
    try {
      const route = await getDrivingRoute(params)
      commit('SET_CURRENT_ROUTE', route)
      return route
    } finally {
      commit('SET_LOADING', false)
    }
  },

  // 更新司机位置
  async updateLocation({ commit }, location) {
    await updateDriverLocation(location)
    commit('SET_DRIVER_LOCATION', location)
  },

  // 获取可用配送任务
  async getAvailableTasks({ commit }, params) {
    commit('SET_LOADING', true)
    try {
      const tasks = await getAvailableDeliveryTasks(params)
      commit('SET_AVAILABLE_TASKS', tasks)
      return tasks
    } finally {
      commit('SET_LOADING', false)
    }
  },

  // 接受配送任务
  async acceptTask({ dispatch }, taskId) {
    await acceptDeliveryTask(taskId)
    return dispatch('getAvailableTasks')
  },

  // 完成配送任务
  async completeTask({ dispatch }, { taskId, data }) {
    await completeDeliveryTask(taskId, data)
    return dispatch('getAvailableTasks')
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
} 