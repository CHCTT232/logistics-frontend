<template>
  <div class="dashboard-container">
    <el-container>
      <el-aside width="200px">
        <el-menu
          :default-active="activeMenu"
          class="el-menu-vertical"
          @select="handleSelect"
        >
          <el-menu-item index="overview">
            <el-icon><DataLine /></el-icon>
            <span>我的概览</span>
          </el-menu-item>
          <el-menu-item index="packages">
            <el-icon><Box /></el-icon>
            <span>我的包裹</span>
          </el-menu-item>
          <el-menu-item index="history">
            <el-icon><List /></el-icon>
            <span>历史记录</span>
          </el-menu-item>
          <el-menu-item index="address">
            <el-icon><Location /></el-icon>
            <span>地址管理</span>
          </el-menu-item>
        </el-menu>
      </el-aside>
      
      <el-container>
        <el-header>
          <div class="header-content">
            <h2>用户中心</h2>
            <div class="user-info">
              <el-dropdown>
                <span class="el-dropdown-link">
                  {{ userInfo.username }}<el-icon class="el-icon--right"><arrow-down /></el-icon>
                </span>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item @click="handleProfile">个人信息</el-dropdown-item>
                    <el-dropdown-item @click="handleLogout">退出登录</el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </div>
          </div>
        </el-header>
        
        <el-main>
          <div v-if="activeMenu === 'overview'">
            <h3>我的概览</h3>
            <el-row :gutter="20">
              <el-col :span="6">
                <el-card shadow="hover">
                  <template #header>
                    <div class="card-header">
                      <span>待发货</span>
                    </div>
                  </template>
                  <div class="card-content">
                    <h2>{{ statistics.pendingShipment || 0 }}</h2>
                  </div>
                </el-card>
              </el-col>
              <el-col :span="6">
                <el-card shadow="hover">
                  <template #header>
                    <div class="card-header">
                      <span>运输中</span>
                    </div>
                  </template>
                  <div class="card-content">
                    <h2>{{ statistics.inTransit || 0 }}</h2>
                  </div>
                </el-card>
              </el-col>
              <el-col :span="6">
                <el-card shadow="hover">
                  <template #header>
                    <div class="card-header">
                      <span>待取件</span>
                    </div>
                  </template>
                  <div class="card-content">
                    <h2>{{ statistics.pendingPickup || 0 }}</h2>
                  </div>
                </el-card>
              </el-col>
              <el-col :span="6">
                <el-card shadow="hover">
                  <template #header>
                    <div class="card-header">
                      <span>本月完成</span>
                    </div>
                  </template>
                  <div class="card-content">
                    <h2>{{ statistics.monthlyCompleted || 0 }}</h2>
                  </div>
                </el-card>
              </el-col>
            </el-row>

            <div class="recent-packages">
              <h3>最近包裹</h3>
              <el-table :data="recentPackages" style="width: 100%">
                <el-table-column prop="tracking_number" label="运单号" width="180" />
                <el-table-column label="发货地址">
                  <template #default="{ row }">
                    {{ row.origin_station_name }}
                  </template>
                </el-table-column>
                <el-table-column label="收货地址">
                  <template #default="{ row }">
                    {{ row.destination_station_name }}
                  </template>
                </el-table-column>
                <el-table-column prop="status" label="状态">
                  <template #default="{ row }">
                    <el-tag :type="getStatusType(row.status)">
                      {{ getStatusText(row.status) }}
                    </el-tag>
                  </template>
                </el-table-column>
                <el-table-column label="司机信息" width="200">
                  <template #default="{ row }">
                    <div v-if="row.driver_name">
                      {{ row.driver_name }} ({{ row.driver_phone }})
                    </div>
                    <div v-else>暂无司机</div>
                  </template>
                </el-table-column>
                <el-table-column label="操作" width="150">
                  <template #default="{ row }">
                    <el-button type="primary" link @click="viewPackageDetail(row)">
                      查看详情
                    </el-button>
                  </template>
                </el-table-column>
              </el-table>
            </div>
          </div>
          
          <!-- 其他页面内容将根据activeMenu动态显示 -->
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { DataLine, Box, List, Location, ArrowDown } from '@element-plus/icons-vue'
import request from '@/utils/request'
import { API_ENDPOINTS } from '@/config/api'

const router = useRouter()
const activeMenu = ref('overview')
const statistics = ref({
  pendingShipment: 0,
  inTransit: 0,
  completed: 0,
  totalSpent: 0
})
const recentPackages = ref([])
const userInfo = ref({})

// 获取用户信息
const fetchUserInfo = async () => {
  try {
    const response = await request({
      url: API_ENDPOINTS.USER.INFO,
      method: 'get'
    })
    userInfo.value = response
  } catch (error) {
    console.error('获取用户信息失败:', error)
    ElMessage.error('获取用户信息失败')
  }
}

// 获取统计数据
const fetchStatistics = async () => {
  try {
    const response = await request({
      url: API_ENDPOINTS.USER.STATISTICS,
      method: 'get'
    })
    statistics.value = response
  } catch (error) {
    console.error('获取统计数据失败:', error)
    ElMessage.error('获取统计数据失败')
  }
}

// 获取最近包裹
const fetchRecentPackages = async () => {
  try {
    const response = await request({
      url: API_ENDPOINTS.USER.PACKAGES.RECENT,
      method: 'get'
    })
    recentPackages.value = response
  } catch (error) {
    console.error('获取最近包裹失败:', error)
    ElMessage.error('获取最近包裹失败')
  }
}

const handleSelect = async (key) => {
  activeMenu.value = key
  if (key === 'overview') {
    await Promise.all([
      fetchStatistics(),
      fetchRecentPackages()
    ])
  }
}

const handleProfile = () => {
  router.push('/user/profile')
}

const handleLogout = async () => {
  try {
    await ElMessageBox.confirm('确定要退出登录吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    await request({
      url: '/api/auth/logout',
      method: 'post'
    })
    localStorage.removeItem('token')
    localStorage.removeItem('userInfo')
    router.push('/login')
  } catch (error) {
    if (error !== 'cancel') {
      console.error('退出登录失败:', error)
      ElMessage.error('退出登录失败')
    }
  }
}

const getStatusType = (status) => {
  const types = {
    'pending': 'warning',
    'in_transit': 'primary',
    'delivered': 'success',
    'completed': 'info',
    'cancelled': 'danger'
  }
  return types[status] || 'info'
}

const getStatusText = (status) => {
  const texts = {
    'pending': '待发货',
    'in_transit': '运输中',
    'delivered': '已送达',
    'completed': '已完成',
    'cancelled': '已取消'
  }
  return texts[status] || '未知'
}

const viewPackageDetail = (row) => {
  router.push({
    name: 'PackageDetail',
    params: { id: row.id }
  })
}

// 组件挂载时获取数据
onMounted(async () => {
  try {
    await Promise.all([
      fetchUserInfo(),
      fetchStatistics(),
      fetchRecentPackages()
    ])
  } catch (error) {
    console.error('初始化数据失败:', error)
    ElMessage.error('初始化数据失败')
  }
})
</script>

<style scoped>
.dashboard-container {
  height: 100vh;
}

.el-container {
  height: 100%;
}

.el-aside {
  background-color: #304156;
  color: #fff;
}

.el-menu {
  border-right: none;
}

.el-menu-vertical {
  height: 100%;
  background-color: #304156;
}

.el-menu-item {
  color: #fff;
}

.el-menu-item:hover {
  background-color: #263445;
}

.el-menu-item.is-active {
  background-color: #1890ff;
}

.el-header {
  background-color: #fff;
  border-bottom: 1px solid #dcdfe6;
  padding: 0 20px;
}

.header-content {
  height: 60px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.user-info {
  display: flex;
  align-items: center;
}

.el-dropdown-link {
  cursor: pointer;
  display: flex;
  align-items: center;
  color: #409EFF;
}

.el-main {
  background-color: #f0f2f5;
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-content {
  text-align: center;
}

.card-content h2 {
  margin: 0;
  font-size: 24px;
  color: #303133;
}

.recent-packages {
  margin-top: 20px;
}

.recent-packages h3 {
  margin-bottom: 16px;
}
</style> 