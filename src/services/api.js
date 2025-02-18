import axios from 'axios';
import { API_BASE_URL } from '../config/api';
import router from '@/router';
import { ElMessage } from 'element-plus';

// 创建 axios 实例
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // 调试日志
    console.log('发送请求:', {
      url: config.url,
      method: config.method,
      data: config.data,
      params: config.params
    });

    return config;
  },
  (error) => {
    console.error('请求错误:', error);
    return Promise.reject(error);
  }
);

// 响应拦截器
api.interceptors.response.use(
  (response) => {
    // 调试日志
    console.log('接收响应:', {
      url: response.config.url,
      status: response.status,
      data: response.data
    });

    return response.data;
  },
  (error) => {
    console.error('响应错误:', error);
    
    if (error.response) {
      const { status, data } = error.response;
      
      switch (status) {
        case 401:
          // 未授权，清除token并跳转到登录页
          localStorage.removeItem('token');
          localStorage.removeItem('userInfo');
          router.push('/login');
          ElMessage.error('登录已过期，请重新登录');
          break;
          
        case 403:
          ElMessage.error(data?.message || '没有权限访问该资源');
          break;
          
        case 404:
          ElMessage.error(data?.message || '请求的资源不存在');
          break;
          
        case 500:
          ElMessage.error(data?.message || '服务器内部错误');
          break;
          
        default:
          ElMessage.error(data?.message || '请求失败');
      }
      
      return Promise.reject(data);
    }
    
    if (error.request) {
      ElMessage.error('无法连接到服务器，请检查网络连接');
    } else {
      ElMessage.error('请求配置错误');
    }
    
    return Promise.reject(error);
  }
);

export default api; 