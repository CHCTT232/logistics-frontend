import request from '@/utils/request'

// 上传后备箱照片进行分析
export function analyzeTrunkPhoto(data) {
  return request({
    url: '/trunk/analyze',
    method: 'post',
    headers: {
      'Content-Type': 'multipart/form-data'
    },
    data
  })
}

// 获取分析历史
export function getAnalysisHistory(params) {
  return request({
    url: '/trunk/history',
    method: 'get',
    params
  })
}

// 获取分析详情
export function getAnalysisDetail(id) {
  return request({
    url: `/trunk/${id}`,
    method: 'get'
  })
}

// 删除分析记录
export function deleteAnalysis(id) {
  return request({
    url: `/trunk/${id}`,
    method: 'delete'
  })
} 