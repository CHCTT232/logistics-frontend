import request from '@/utils/request'

// 更新后备箱空间信息
export function updateTrunkSpace(data) {
  return request({
    url: '/driver/trunk-space',
    method: 'put',
    data
  })
}

// 获取司机当前任务
export function getCurrentTasks() {
  return request({
    url: '/driver/current-tasks',
    method: 'get'
  })
}

// 更新任务状态
export function updateTaskStatus(taskId, status) {
  return request({
    url: `/driver/tasks/${taskId}/status`,
    method: 'put',
    data: { status }
  })
}

// 上传车辆信息
export function updateVehicleInfo(data) {
  return request({
    url: '/driver/vehicle',
    method: 'put',
    data
  })
}

// 获取历史配送记录
export function getDeliveryHistory(params) {
  return request({
    url: '/driver/delivery-history',
    method: 'get',
    params
  })
}

// 获取收益统计
export function getEarningsStats(params) {
  return request({
    url: '/driver/earnings',
    method: 'get',
    params
  })
}

// 更新位置信息
export function updateLocation(data) {
  return request({
    url: '/driver/location',
    method: 'put',
    data
  })
}

// 获取可用配送任务
export function getAvailableTasks(params) {
  return request({
    url: '/api/drivers/available-tasks',
    method: 'get',
    params
  })
}

// 接受配送任务
export function acceptTask(taskId) {
  return request({
    url: `/api/drivers/accept-task`,
    method: 'post',
    data: { packageIds: [taskId] }
  })
}

// 完成配送任务
export function completeTask(taskId, data) {
  return request({
    url: `/api/drivers/delivery-status`,
    method: 'put',
    data: {
      packageId: taskId,
      ...data
    }
  })
} 