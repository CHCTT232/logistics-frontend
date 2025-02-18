import request from '@/utils/request';
import { API_ENDPOINTS } from '@/config/api';

export const authService = {
  // 用户登录
  async login(credentials) {
    try {
      const response = await request({
        url: API_ENDPOINTS.AUTH.LOGIN,
        method: 'post',
        data: credentials
      });

      if (response && response.token) {
        localStorage.setItem('token', response.token);
        localStorage.setItem('userInfo', JSON.stringify(response.user));
        return response;
      } else {
        throw new Error('登录响应缺少token或用户信息');
      }
    } catch (error) {
      console.error('登录失败:', error);
      throw error;
    }
  },

  // 用户注册
  async register(userData) {
    try {
      const response = await request({
        url: API_ENDPOINTS.AUTH.REGISTER,
        method: 'post',
        data: userData
      });
      return response;
    } catch (error) {
      console.error('注册失败:', error);
      throw error;
    }
  },

  // 退出登录
  async logout() {
    try {
      await request({
        url: API_ENDPOINTS.AUTH.LOGOUT,
        method: 'post'
      });
      localStorage.removeItem('token');
      localStorage.removeItem('userInfo');
    } catch (error) {
      console.error('退出登录失败:', error);
      throw error;
    }
  },

  // 获取当前用户信息
  getCurrentUser() {
    try {
      const userInfoStr = localStorage.getItem('userInfo');
      return userInfoStr ? JSON.parse(userInfoStr) : null;
    } catch (error) {
      console.error('获取用户信息失败:', error);
      return null;
    }
  },

  // 检查是否已登录
  isAuthenticated() {
    return !!localStorage.getItem('token');
  },

  // 获取用户角色
  getUserRole() {
    const userInfo = this.getCurrentUser();
    return userInfo ? userInfo.role : null;
  }
}; 