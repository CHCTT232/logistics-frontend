export const API_BASE_URL = ''  // 使用相对路径，让代理配置生效

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/api/auth/login',
    REGISTER: '/api/auth/register',
    LOGOUT: '/api/auth/logout',
    CURRENT_USER: '/api/auth/current-user'
  },
  ADMIN: {
    STATISTICS: '/api/admin/statistics',
    ORDER_TREND: '/api/admin/order-trend',
    INCOME_TREND: '/api/admin/income-trend',
    STATION_ADMINS: '/api/admin/station-admins'
  },
  STATION: {
    PACKAGES: '/api/station/packages',
    DRIVERS: '/api/station/drivers',
    NOTIFICATIONS: '/api/station/notifications'
  },
  DRIVER: {
    PROFILE: '/api/driver/profile',
    ROUTES: '/api/driver/routes',
    TRUNK_SPACE: '/api/driver/trunk-space',
    PACKAGES: '/api/driver/packages'
  },
  USER: {
    PACKAGES: '/api/user/packages',
    NOTIFICATIONS: '/api/user/notifications'
  }
}

export const MAP_CONFIG = {
  API_KEY: process.env.VUE_APP_AMAP_KEY || '',
  VERSION: '2.0',
  PLUGINS: [
    'AMap.ToolBar',
    'AMap.Scale',
    'AMap.HawkEye',
    'AMap.MapType',
    'AMap.Geolocation',
    'AMap.Autocomplete',
    'AMap.PlaceSearch',
    'AMap.PolyEditor',
    'AMap.CircleEditor',
    'AMap.Driving'
  ]
}

export const PACKAGE_CONFIG = {
  MAX_WEIGHT: 100, // kg
  THROW_RATIO: 6000,
  BASE_PRICE: {
    VOLUME: 40 * 40 * 40, // cm³
    DISTANCE: 50, // km
    PRICE: 6 // yuan
  },
  DRIVER_SHARE: 0.833 // 5/6
}

export const TRUNK_CONFIG = {
  PLATE_SIZE: {
    LENGTH: 20,
    WIDTH: 20,
    HEIGHT: 3
  }
}

// 高德地图配置
export const AMAP_KEY = {
  key: '1c002838c5e6fbd5f968b0024e6b3485',
  version: '2.0',
  plugins: [
    'AMap.ToolBar',
    'AMap.Scale',
    'AMap.HawkEye',
    'AMap.MapType',
    'AMap.Geolocation',
    'AMap.Driving',
    'AMap.Autocomplete',
    'AMap.PlaceSearch',
    'AMap.PolyEditor',
    'AMap.CircleEditor'
  ],
  securityConfig: {
    securityJsCode: '1c002838c5e6fbd5f968b0024e6b3485'
  }
}

// 其他配置
export const APP_CONFIG = {
  name: '城乡物流配送系统',
  version: '1.0.0',
  description: '基于Vue 3和Express的城乡物流配送管理系统'
}

// 系统常量
export const CONSTANTS = {
  // 包裹状态
  PACKAGE_STATUS: {
    PENDING: 'pending',
    ACCEPTED: 'accepted',
    DELIVERING: 'delivering',
    DELIVERED: 'delivered',
    CANCELLED: 'cancelled'
  },
  
  // 司机状态
  DRIVER_STATUS: {
    OFFLINE: 'offline',
    ONLINE: 'online',
    DELIVERING: 'delivering'
  },
  
  // 站点类型
  STATION_TYPE: {
    HUB: 'hub',
    BRANCH: 'branch',
    PICKUP: 'pickup'
  }
}

// 路由配置
export const ROUTE_CONFIG = {
  // 登录后的默认路由
  DEFAULT_ROUTES: {
    admin: '/admin',
    station_admin: '/station',
    driver: '/driver',
    user: '/user'
  },
  
  // 需要认证的路由
  AUTH_ROUTES: [
    '/admin',
    '/station',
    '/driver',
    '/user'
  ]
} 