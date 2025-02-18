import { createRouter, createWebHistory } from 'vue-router';
import { authService } from '../services/auth';

// 布局组件
const DefaultLayout = () => import('../layouts/DefaultLayout.vue');
const AdminLayout = () => import('../layouts/AdminLayout.vue');
const StationAdminLayout = () => import('../layouts/StationAdminLayout.vue');
const DriverLayout = () => import('../layouts/DriverLayout.vue');
const UserLayout = () => import('../layouts/UserLayout.vue');

// 页面组件
const Login = () => import('../pages/auth/Login.vue');
const Register = () => import('../pages/auth/Register.vue');

// 系统管理员页面
const AdminDashboard = () => import('../pages/admin/Dashboard.vue');
const StationManagement = () => import('../pages/admin/StationManagement.vue');
const SystemSettings = () => import('../pages/admin/SystemSettings.vue');
const AdminManagement = () => import('../pages/admin/AdminManagement.vue');

// 站点管理员页面
const StationDashboard = () => import('../pages/station/Dashboard.vue');
const PackageManagement = () => import('../pages/station/PackageManagement.vue');

// 司机页面
const DriverDashboard = () => import('../pages/driver/Dashboard.vue');
const VehicleInfo = () => import('../pages/driver/VehicleInfo.vue');
const DeliveryTasks = () => import('../pages/driver/DeliveryTasks.vue');

// 用户页面
const UserDashboard = () => import('../pages/user/Dashboard.vue');
const MyPackages = () => import('../pages/user/MyPackages.vue');
const CreateOrder = () => import('../pages/user/CreateOrder.vue');

const routes = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/login',
    name: 'Login',
    component: Login
  },
  {
    path: '/register',
    name: 'Register',
    component: Register
  },
  {
    path: '/admin',
    component: AdminLayout,
    meta: { requiresAuth: true, role: 'admin' },
    children: [
      {
        path: '',
        name: 'AdminDashboard',
        component: AdminDashboard
      },
      {
        path: 'stations',
        name: 'StationManagement',
        component: StationManagement
      },
      {
        path: 'settings',
        name: 'SystemSettings',
        component: SystemSettings
      },
      {
        path: 'admins',
        name: 'AdminManagement',
        component: AdminManagement
      }
    ]
  },
  {
    path: '/station',
    component: StationAdminLayout,
    meta: { requiresAuth: true, role: 'station_admin' },
    children: [
      {
        path: '',
        name: 'StationDashboard',
        component: StationDashboard
      },
      {
        path: 'packages',
        name: 'PackageManagement',
        component: PackageManagement
      }
    ]
  },
  {
    path: '/driver',
    component: DriverLayout,
    meta: { requiresAuth: true, role: 'driver' },
    children: [
      {
        path: '',
        name: 'DriverDashboard',
        component: DriverDashboard
      },
      {
        path: 'vehicle',
        name: 'VehicleInfo',
        component: VehicleInfo
      },
      {
        path: 'tasks',
        name: 'DeliveryTasks',
        component: DeliveryTasks
      }
    ]
  },
  {
    path: '/user',
    component: UserLayout,
    meta: { requiresAuth: true, role: 'user' },
    children: [
      {
        path: '',
        name: 'UserDashboard',
        component: UserDashboard
      },
      {
        path: 'packages',
        name: 'MyPackages',
        component: MyPackages
      },
      {
        path: 'packages/:id',
        name: 'PackageDetail',
        component: () => import('../pages/user/PackageDetail.vue')
      },
      {
        path: 'create-order',
        name: 'CreateOrder',
        component: CreateOrder
      }
    ]
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

// 路由守卫
router.beforeEach((to, from, next) => {
  // 获取token和用户信息
  const token = localStorage.getItem('token');
  let userInfo = null;
  let role = null;

  try {
    const userInfoStr = localStorage.getItem('userInfo');
    console.log('从localStorage获取的用户信息:', userInfoStr);
    
    if (userInfoStr) {
      userInfo = JSON.parse(userInfoStr);
      role = userInfo.role;
      console.log('解析后的用户信息:', { ...userInfo, token: '***' });
      console.log('用户角色:', role);
    }
  } catch (error) {
    console.error('解析用户信息失败:', error);
  }

  console.log('路由守卫:', { 
    to: to.path, 
    from: from.path,
    role,
    hasToken: !!token,
    requiresAuth: to.meta.requiresAuth,
    requiredRole: to.meta.role
  });

  // 不需要登录的路由
  if (to.path === '/login' || to.path === '/register') {
    if (token && role) {
      // 已登录用户访问登录页，重定向到对应的首页
      const roleRoutes = {
        'admin': '/admin',
        'station_admin': '/station',
        'driver': '/driver',
        'user': '/user'
      };
      const targetRoute = roleRoutes[role];
      console.log('已登录用户访问登录页，重定向到:', targetRoute);
      next(targetRoute || '/');
    } else {
      next();
    }
    return;
  }

  // 需要登录的路由
  if (!token || !role) {
    console.log('未登录，重定向到登录页');
    next('/login');
    return;
  }

  // 检查角色权限
  const rolePathMap = {
    'admin': '/admin',
    'station_admin': '/station',
    'driver': '/driver',
    'user': '/user'
  };

  const userRolePath = rolePathMap[role];
  if (!userRolePath) {
    console.error('未知的用户角色:', role);
    next('/login');
    return;
  }

  // 检查用户是否访问其角色允许的路径
  if (to.path.startsWith(userRolePath)) {
    console.log('允许访问:', to.path);
    next();
  } else {
    console.warn('无权访问:', to.path, '重定向到:', userRolePath);
    next(userRolePath);
  }
});

export default router; 