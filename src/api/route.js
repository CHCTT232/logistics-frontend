import request from '@/utils/request'

// 获取最优配送路线
export function getOptimalRoute(params) {
  return request({
    url: '/routes/optimal',
    method: 'get',
    params
  })
}

// 获取驾驶路线
export function getDrivingRoute(params) {
  return request({
    url: '/routes/driving',
    method: 'get',
    params
  })
}

// 更新司机位置
export function updateDriverLocation(data) {
  return request({
    url: '/driver/location',
    method: 'put',
    data
  })
}

// 获取站点列表
export function getStationList(params) {
  return request({
    url: '/stations',
    method: 'get',
    params
  })
}

// 获取站点详情
export function getStationDetail(id) {
  return request({
    url: `/stations/${id}`,
    method: 'get'
  })
}

// 获取可用的配送任务
export function getAvailableDeliveryTasks(params) {
  return request({
    url: '/driver/available-tasks',
    method: 'get',
    params
  })
}

// 接受配送任务
export function acceptDeliveryTask(taskId) {
  return request({
    url: `/driver/tasks/${taskId}/accept`,
    method: 'post'
  })
}

// 完成配送任务
export function completeDeliveryTask(taskId, data) {
  return request({
    url: `/driver/tasks/${taskId}/complete`,
    method: 'post',
    data
  })
} 