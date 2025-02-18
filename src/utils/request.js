import axios from 'axios'
import { ElMessage } from 'element-plus'
import router from '@/router'
import { API_BASE_URL } from '@/config/api'

// 创建axios实例
const request = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器
request.interceptors.request.use(
  config => {
    console.log('发送请求:', {
      url: config.url,
      method: config.method,
      baseURL: config.baseURL,
      headers: config.headers,
      data: config.data
    })
    
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  error => {
    console.error('请求错误:', error)
    return Promise.reject(error)
  }
)

// 响应拦截器
request.interceptors.response.use(
  response => {
    console.log('收到响应:', {
      url: response.config.url,
      status: response.status,
      data: response.data,
      headers: response.headers
    })
    
    return response.data
  },
  error => {
    console.error('响应错误:', {
      config: error.config,
      message: error.message,
      response: error.response,
      data: error.response?.data,
      status: error.response?.status
    })
    
    if (!error.response) {
      ElMessage.error('网络错误，请检查网络设置')
      return Promise.reject(new Error('网络错误，请检查网络设置'))
    }

    const { status, data } = error.response
    let message = data?.message || '未知错误'

    switch (status) {
      case 400:
        message = data?.message || '请求参数错误'
        break
      case 401:
        message = data?.message || '登录已过期，请重新登录'
        localStorage.removeItem('token')
        localStorage.removeItem('userInfo')
        router.push('/login')
        break
      case 403:
        message = data?.message || '没有权限访问该资源'
        break
      case 404:
        message = data?.message || '请求的资源不存在'
        break
      case 500:
        message = data?.message || '服务器错误，请稍后重试'
        break
      default:
        message = data?.message || '请求失败，请稍后重试'
    }

    ElMessage.error({
      message,
      duration: 3000,
      showClose: true
    })
    
    return Promise.reject(new Error(message))
  }
)

export default request 