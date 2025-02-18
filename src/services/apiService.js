import request from '@/utils/request'
import { API_ENDPOINTS } from '@/config/api'

export const driverService = {
  // 获取司机信息
  getProfile() {
    return request({
      url: API_ENDPOINTS.DRIVER.PROFILE,
      method: 'get'
    })
  },

  // 更新车辆信息
  updateVehicle(data) {
    return request({
      url: API_ENDPOINTS.DRIVER.UPDATE_VEHICLE,
      method: 'put',
      data
    })
  },

  // 上传后备箱照片
  uploadTrunkPhoto(formData) {
    return request({
      url: API_ENDPOINTS.DRIVER.UPLOAD_PHOTO,
      method: 'post',
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      data: formData
    })
  },

  // 获取可用任务
  getAvailableTasks(latitude, longitude) {
    return request({
      url: API_ENDPOINTS.DRIVER.AVAILABLE_TASKS,
      method: 'get',
      params: { latitude, longitude }
    })
  },

  // 接受任务
  acceptTask(packageIds) {
    return request({
      url: API_ENDPOINTS.DRIVER.ACCEPT_TASK,
      method: 'post',
      data: { packageIds }
    })
  },

  // 更新配送状态
  updateDeliveryStatus(packageId, status, signature = null) {
    return request({
      url: API_ENDPOINTS.DRIVER.UPDATE_STATUS,
      method: 'put',
      data: {
        packageId,
        status,
        signature
      }
    })
  },

  // 获取当前任务
  getCurrentTasks() {
    return request({
      url: API_ENDPOINTS.DRIVER.CURRENT_TASKS,
      method: 'get'
    })
  },

  // 获取配送历史
  getDeliveryHistory() {
    return request({
      url: API_ENDPOINTS.DRIVER.DELIVERY_HISTORY,
      method: 'get'
    })
  },

  // 更新位置信息
  updateLocation(latitude, longitude) {
    return request({
      url: API_ENDPOINTS.DRIVER.LOCATION,
      method: 'put',
      data: {
        latitude,
        longitude
      }
    })
  },

  // 获取收入统计
  getEarnings() {
    return request({
      url: API_ENDPOINTS.DRIVER.EARNINGS,
      method: 'get'
    })
  }
}

export const packageService = {
  // 获取包裹详情
  getDetail(id) {
    return request({
      url: API_ENDPOINTS.PACKAGE.DETAIL.replace(':id', id),
      method: 'get'
    })
  },

  // 获取包裹追踪信息
  getTracking(id) {
    return request({
      url: API_ENDPOINTS.PACKAGE.TRACK.replace(':id', id),
      method: 'get'
    })
  }
}

export default {
  driver: driverService,
  package: packageService
} 