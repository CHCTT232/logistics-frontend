import request from '@/utils/request'

// 创建新包裹
export function createPackage(data) {
  return request({
    url: '/packages',
    method: 'post',
    data
  })
}

// 获取包裹列表
export function getPackageList(params) {
  return request({
    url: '/packages',
    method: 'get',
    params
  })
}

// 获取包裹详情
export function getPackageDetail(id) {
  return request({
    url: `/packages/${id}`,
    method: 'get'
  })
}

// 更新包裹状态
export function updatePackageStatus(id, data) {
  return request({
    url: `/packages/${id}/status`,
    method: 'put',
    data
  })
}

// 获取用户的包裹列表
export function getUserPackages(params) {
  return request({
    url: '/user/packages',
    method: 'get',
    params
  })
}

// 获取站点的包裹列表
export function getStationPackages(stationId, params) {
  return request({
    url: `/stations/${stationId}/packages`,
    method: 'get',
    params
  })
}

// 获取司机的包裹列表
export function getDriverPackages(params) {
  return request({
    url: '/driver/packages',
    method: 'get',
    params
  })
}

// 获取包裹统计数据
export function getPackageStats() {
  return request({
    url: '/packages/stats',
    method: 'get'
  })
}

// 添加新包裹
export function addPackage(data) {
  return request({
    url: '/packages',
    method: 'post',
    data
  })
}

// 分配司机
export function assignDriver(id, data) {
  return request({
    url: `/packages/${id}/assign`,
    method: 'put',
    data
  })
}

// 获取可用司机列表
export function getAvailableDrivers() {
  return request({
    url: '/drivers/available',
    method: 'get'
  })
} 