import { 
  getPackageList, 
  getPackageDetail,
  getUserPackages,
  getStationPackages,
  getDriverPackages,
  updatePackageStatus
} from '@/api/package'

const state = {
  packageList: [],
  currentPackage: null,
  totalCount: 0,
  loading: false
}

const mutations = {
  SET_PACKAGE_LIST: (state, { list, total }) => {
    state.packageList = list
    state.totalCount = total
  },
  SET_CURRENT_PACKAGE: (state, packageData) => {
    state.currentPackage = packageData
  },
  SET_LOADING: (state, loading) => {
    state.loading = loading
  }
}

const actions = {
  // 获取包裹列表
  async getPackages({ commit, rootState }, params) {
    commit('SET_LOADING', true)
    try {
      let response
      switch (rootState.user.role) {
        case 'user':
          response = await getUserPackages(params)
          break
        case 'station_admin':
          response = await getStationPackages(rootState.user.userInfo.stationId, params)
          break
        case 'driver':
          response = await getDriverPackages(params)
          break
        default:
          response = await getPackageList(params)
      }
      commit('SET_PACKAGE_LIST', response)
      return response
    } finally {
      commit('SET_LOADING', false)
    }
  },

  // 获取包裹详情
  async getPackageDetail({ commit }, id) {
    commit('SET_LOADING', true)
    try {
      const packageData = await getPackageDetail(id)
      commit('SET_CURRENT_PACKAGE', packageData)
      return packageData
    } finally {
      commit('SET_LOADING', false)
    }
  },

  // 更新包裹状态
  async updateStatus({ dispatch }, { id, status }) {
    await updatePackageStatus(id, { status })
    return dispatch('getPackageDetail', id)
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
} 