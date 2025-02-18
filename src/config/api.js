// API配置
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

// API路径配置
export const API_ENDPOINTS = {
  // 认证相关
  AUTH: {
    LOGIN: '/api/auth/login',
    REGISTER: '/api/auth/register',
    LOGOUT: '/api/auth/logout',
    USER_INFO: '/api/auth/user-info'
  },
  
  // 管理员相关
  ADMIN: {
    STATISTICS: '/api/admin/statistics',
    ORDER_TREND: '/api/admin/order-trend',
    INCOME_TREND: '/api/admin/income-trend',
    STATION_ADMINS: '/api/admin/station-admins',
    ADMINS: '/api/admin/admins',
    USERS: '/api/admin/users',
    DRIVERS: '/api/admin/drivers',
    STATIONS: '/api/admin/stations',
    SETTINGS: '/api/admin/settings',
    STATION_DETAIL: (id) => `/api/admin/stations/${id}`,
    STATION_STATUS: (id) => `/api/admin/stations/${id}/status`,
    STATION_ADMIN: (id) => `/api/admin/stations/${id}/admin`
  },

  // 站点相关
  STATION: {
    LIST: '/api/station/list',
    DETAIL: (id) => `/api/station/${id}`,
    PACKAGES: '/api/station/packages',
    DRIVERS: (id) => `/api/station/${id}/drivers`,
    PROFILE: '/api/station/profile'
  },

  // 站点管理员相关
  STATION_ADMIN: {
    STATISTICS: '/api/station-admin/statistics',
    PACKAGES: '/api/station-admin/packages',
    STATION_INFO: '/api/station-admin/station',
    UPDATE_PACKAGE: (id) => `/api/station-admin/packages/${id}/status`,
    STORAGE_STATS: '/api/station-admin/storage/stats',
    STORAGE_CELLS: '/api/station-admin/storage/cells',
    AVAILABLE_DRIVERS: '/api/station-admin/available-drivers'
  },

  // 司机相关
  DRIVER: {
    INFO: '/api/driver/info',
    PROFILE: '/api/driver/profile',
    VEHICLE: '/api/driver/vehicle',
    TRUNK_SPACE: '/api/driver/trunk-space',
    TASKS: '/api/driver/tasks',
    EARNINGS: '/api/driver/earnings',
    LOCATION: '/api/driver/location',
    ROUTES: '/api/driver/routes',
    PACKAGES: '/api/driver/packages',
    TRUNK_ANALYSIS: '/api/driver/trunk-analysis',
    STATISTICS: '/api/driver/statistics',
    AVAILABLE_TASKS: '/api/driver/available-tasks',
    ACCEPT_TASK: '/api/driver/accept-task',
    CALCULATE_ROUTE: '/api/driver/calculate-route'
  },

  // 用户相关
  USER: {
    PROFILE: '/api/user/profile',
    PACKAGES: '/api/user/packages',
    STATISTICS: '/api/user/statistics'
  },
  
  // 包裹相关
  PACKAGE: {
    CREATE: '/api/packages',
    UPDATE: (id) => `/api/packages/${id}`,
    DELETE: (id) => `/api/packages/${id}`,
    LIST: '/api/packages',
    DETAIL: (id) => `/api/packages/${id}`,
    TRACK: (id) => `/api/packages/${id}/track`
  },

  // 后备箱分析相关
  TRUNK: {
    ANALYZE: '/api/trunk/analyze',
    HISTORY: '/api/trunk/history',
    DETAIL: (id) => `/api/trunk/${id}`
  }
}; 