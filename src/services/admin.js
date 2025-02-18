import api from '@/utils/api'
import { API_ENDPOINTS } from '@/config/api'

export const adminService = {
  async getStatistics() {
    try {
      const response = await api.get(API_ENDPOINTS.ADMIN.STATISTICS)
      return response.data || {
        totalPackages: 0,
        totalDrivers: 0,
        totalUsers: 0,
        totalIncome: 0
      }
    } catch (error) {
      console.error('Error fetching statistics:', error)
      throw error
    }
  },

  async getOrderTrend() {
    try {
      const response = await api.get(API_ENDPOINTS.ADMIN.ORDER_TREND)
      return response.data || []
    } catch (error) {
      console.error('Error fetching order trend:', error)
      throw error
    }
  },

  async getIncomeTrend() {
    try {
      const response = await api.get(API_ENDPOINTS.ADMIN.INCOME_TREND)
      return response.data || []
    } catch (error) {
      console.error('Error fetching income trend:', error)
      throw error
    }
  },

  async getStationAdmins() {
    try {
      const response = await api.get(API_ENDPOINTS.ADMIN.STATION_ADMINS)
      return response.data
    } catch (error) {
      console.error('Error fetching station admins:', error)
      throw error
    }
  },

  async createStationAdmin(adminData) {
    try {
      const response = await api.post(API_ENDPOINTS.ADMIN.STATION_ADMINS, adminData)
      return response.data
    } catch (error) {
      console.error('Error creating station admin:', error)
      throw error
    }
  },

  async updateStationAdmin(adminId, adminData) {
    try {
      const response = await api.put(`${API_ENDPOINTS.ADMIN.STATION_ADMINS}/${adminId}`, adminData)
      return response.data
    } catch (error) {
      console.error('Error updating station admin:', error)
      throw error
    }
  },

  async deleteStationAdmin(adminId) {
    try {
      const response = await api.delete(`${API_ENDPOINTS.ADMIN.STATION_ADMINS}/${adminId}`)
      return response.data
    } catch (error) {
      console.error('Error deleting station admin:', error)
      throw error
    }
  },

  async getAdminList(params) {
    try {
      const response = await api.get(API_ENDPOINTS.ADMIN.ADMINS, { params })
      return response.data
    } catch (error) {
      console.error('Error fetching admin list:', error)
      throw error
    }
  },

  async createAdmin(adminData) {
    try {
      const response = await api.post(API_ENDPOINTS.ADMIN.ADMINS, adminData)
      return response.data
    } catch (error) {
      console.error('Error creating admin:', error)
      throw error
    }
  },

  async updateAdmin(adminId, adminData) {
    try {
      const response = await api.put(`${API_ENDPOINTS.ADMIN.ADMINS}/${adminId}`, adminData)
      return response.data
    } catch (error) {
      console.error('Error updating admin:', error)
      throw error
    }
  },

  async deleteAdmin(adminId) {
    try {
      const response = await api.delete(`${API_ENDPOINTS.ADMIN.ADMINS}/${adminId}`)
      return response.data
    } catch (error) {
      console.error('Error deleting admin:', error)
      throw error
    }
  }
} 