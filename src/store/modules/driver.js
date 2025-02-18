import {
  updateTrunkSpace,
  getCurrentTasks,
  updateTaskStatus,
  updateVehicleInfo,
  getDeliveryHistory,
  getEarningsStats
} from '@/api/driver'

import {
  analyzeTrunkSpace,
  getAnalysisHistory,
  deleteAnalysis,
  getAnalysisDetail
} from '@/api/trunk'

const state = {
  currentTasks: [],
  trunkSpace: null,
  vehicleInfo: null,
  deliveryHistory: [],
  earningsStats: null,
  loading: false,
  // 后备箱分析相关状态
  trunkAnalysis: {
    currentAnalysis: null,
    historyList: [],
    total: 0,
    loading: false
  }
}

const mutations = {
  SET_CURRENT_TASKS: (state, tasks) => {
    state.currentTasks = tasks
  },
  SET_TRUNK_SPACE: (state, space) => {
    state.trunkSpace = space
  },
  SET_VEHICLE_INFO: (state, info) => {
    state.vehicleInfo = info
  },
  SET_DELIVERY_HISTORY: (state, history) => {
    state.deliveryHistory = history
  },
  SET_EARNINGS_STATS: (state, stats) => {
    state.earningsStats = stats
  },
  SET_LOADING: (state, loading) => {
    state.loading = loading
  },
  // 设置当前分析结果
  SET_CURRENT_ANALYSIS(state, analysis) {
    state.trunkAnalysis.currentAnalysis = analysis
  },
  // 设置分析历史列表
  SET_ANALYSIS_HISTORY(state, { list, total }) {
    state.trunkAnalysis.historyList = list
    state.trunkAnalysis.total = total
  },
  // 设置加载状态
  SET_ANALYSIS_LOADING(state, loading) {
    state.trunkAnalysis.loading = loading
  },
  // 从历史列表中删除记录
  REMOVE_ANALYSIS_RECORD(state, id) {
    state.trunkAnalysis.historyList = state.trunkAnalysis.historyList.filter(
      item => item.id !== id
    )
    state.trunkAnalysis.total--
  }
}

const actions = {
  // 更新后备箱空间信息
  async updateTrunkSpace({ commit }, data) {
    commit('SET_LOADING', true)
    try {
      const response = await updateTrunkSpace(data)
      commit('SET_TRUNK_SPACE', response)
      return response
    } finally {
      commit('SET_LOADING', false)
    }
  },

  // 获取当前任务
  async getCurrentTasks({ commit }) {
    commit('SET_LOADING', true)
    try {
      const tasks = await getCurrentTasks()
      commit('SET_CURRENT_TASKS', tasks)
      return tasks
    } finally {
      commit('SET_LOADING', false)
    }
  },

  // 更新任务状态
  async updateTaskStatus({ dispatch }, { taskId, status }) {
    await updateTaskStatus(taskId, status)
    return dispatch('getCurrentTasks')
  },

  // 更新车辆信息
  async updateVehicleInfo({ commit }, data) {
    commit('SET_LOADING', true)
    try {
      const info = await updateVehicleInfo(data)
      commit('SET_VEHICLE_INFO', info)
      return info
    } finally {
      commit('SET_LOADING', false)
    }
  },

  // 获取配送历史
  async getDeliveryHistory({ commit }, params) {
    commit('SET_LOADING', true)
    try {
      const history = await getDeliveryHistory(params)
      commit('SET_DELIVERY_HISTORY', history)
      return history
    } finally {
      commit('SET_LOADING', false)
    }
  },

  // 获取收益统计
  async getEarningsStats({ commit }, params) {
    commit('SET_LOADING', true)
    try {
      const stats = await getEarningsStats(params)
      commit('SET_EARNINGS_STATS', stats)
      return stats
    } finally {
      commit('SET_LOADING', false)
    }
  },

  // 分析后备箱照片
  async analyzeTrunkSpace({ commit }, photo) {
    try {
      commit('SET_ANALYSIS_LOADING', true)
      const response = await analyzeTrunkSpace(photo)
      commit('SET_CURRENT_ANALYSIS', response.data)
      return response.data
    } finally {
      commit('SET_ANALYSIS_LOADING', false)
    }
  },

  // 获取分析历史
  async getAnalysisHistory({ commit }, params) {
    try {
      commit('SET_ANALYSIS_LOADING', true)
      const response = await getAnalysisHistory(params)
      commit('SET_ANALYSIS_HISTORY', {
        list: response.data.list,
        total: response.data.total
      })
      return response.data
    } finally {
      commit('SET_ANALYSIS_LOADING', false)
    }
  },

  // 删除分析记录
  async deleteAnalysis({ commit }, id) {
    await deleteAnalysis(id)
    commit('REMOVE_ANALYSIS_RECORD', id)
  },

  // 获取分析记录详情
  async getAnalysisDetail({ commit }, id) {
    try {
      commit('SET_ANALYSIS_LOADING', true)
      const response = await getAnalysisDetail(id)
      return response.data
    } finally {
      commit('SET_ANALYSIS_LOADING', false)
    }
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
} 