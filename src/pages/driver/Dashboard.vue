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
            <span>工作概览</span>
          </el-menu-item>
          <el-menu-item index="tasks">
            <el-icon><List /></el-icon>
            <span>配送任务</span>
          </el-menu-item>
          <el-menu-item index="route">
            <el-icon><Location /></el-icon>
            <span>路线规划</span>
          </el-menu-item>
          <el-menu-item index="earnings">
            <el-icon><Money /></el-icon>
            <span>收入统计</span>
          </el-menu-item>
          <el-menu-item index="vehicle">
            <el-icon><Van /></el-icon>
            <span>车辆信息</span>
          </el-menu-item>
        </el-menu>
      </el-aside>
      
      <el-container>
        <el-header>
          <div class="header-content">
            <h2>司机工作台</h2>
            <div class="user-info">
              <el-dropdown @command="handleCommand">
                <span class="el-dropdown-link">
                  {{ currentUser?.username }}
                  <el-icon class="el-icon--right"><arrow-down /></el-icon>
                </span>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item command="logout">退出登录</el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </div>
          </div>
        </el-header>
        
        <el-main>
          <el-row :gutter="20">
            <el-col :span="16">
              <el-card class="task-list-container mb-4">
                <template #header>
                  <div class="card-header">
                    <span>可用任务列表</span>
                    <el-button type="primary" @click="refreshTasks">刷新任务</el-button>
                  </div>
                </template>
                <div class="task-list">
                  <el-table v-if="availableTasks && availableTasks.length > 0" :data="availableTasks" style="width: 100%">
                    <el-table-column prop="id" label="任务ID" width="100" />
                    <el-table-column prop="sourceStation.name" label="起点站点" />
                    <el-table-column prop="targetStation.name" label="目标站点" />
                    <el-table-column prop="weight" label="重量(kg)" width="100" />
                    <el-table-column label="操作" width="120">
                      <template #default="{ row }">
                        <el-button type="primary" size="small" @click="acceptDeliveryTask(row)">接受任务</el-button>
                      </template>
                    </el-table-column>
                  </el-table>
                  <el-empty v-else description="暂无可用任务"></el-empty>
                </div>
              </el-card>
              <el-card class="map-container">
                <template #header>
                  <div class="card-header">
                    <span>路线规划</span>
                    <el-button type="primary" @click="startDelivery" :disabled="!selectedRoute">
                      开始配送
                    </el-button>
                  </div>
                </template>
                <div id="container" class="amap-container"></div>
              </el-card>
            </el-col>
            
            <el-col :span="8">
              <el-card>
                <template #header>
                  <div class="card-header">
                    <span>配送信息</span>
                  </div>
                </template>
                <div class="delivery-info">
                  <div class="route-info" v-if="selectedRoute">
                    <p>预计配送距离：{{ selectedRoute.distance }}公里</p>
                    <p>预计配送时间：{{ selectedRoute.duration }}分钟</p>
                    <p>预计收入：{{ calculateIncome(selectedRoute.distance) }}元</p>
                  </div>
                  <div v-else>
                    <el-empty description="请在地图上选择起点和终点"></el-empty>
                  </div>
                </div>
              </el-card>
              
              <el-card class="mt-4">
                <template #header>
                  <div class="card-header">
                    <span>配送路线</span>
                  </div>
                </template>
                <div class="route-list">
                  <el-steps direction="vertical" :active="activeStep">
                    <el-step v-for="(point, index) in deliveryPoints" :key="index" 
                      :title="point.name" 
                      :description="point.address">
                    </el-step>
                  </el-steps>
                </div>
              </el-card>
            </el-col>
          </el-row>
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { DataLine, List, Location, Money, Van, ArrowDown } from '@element-plus/icons-vue'
import request from '@/utils/request'
import { API_ENDPOINTS } from '@/config/api'
import AMapLoader from '@amap/amap-jsapi-loader'
import { MAP_CONFIG } from '@/config/map'

const router = useRouter()
const activeMenu = ref('overview')
const map = ref(null)
const selectedRoute = ref(null)
const deliveryPoints = ref([])
const activeStep = ref(0)
const userInfo = ref({})
const statistics = ref({
  todayTasks: 0,
  completedTasks: 0,
  totalDistance: 0,
  todayEarnings: 0
})
const currentUser = ref(null)
const availableTasks = ref([])

// 获取用户信息
const fetchUserInfo = async () => {
  try {
    const response = await request({
      url: API_ENDPOINTS.DRIVER.INFO,
      method: 'get'
    })
    userInfo.value = response
    currentUser.value = response
  } catch (error) {
    console.error('获取用户信息失败:', error)
    ElMessage.error('获取用户信息失败')
  }
}

// 获取统计数据
const fetchStatistics = async () => {
  try {
    const response = await request({
      url: API_ENDPOINTS.DRIVER.STATISTICS,
      method: 'get'
    })
    if (response && response.data) {
      statistics.value = response.data
    }
  } catch (error) {
    console.error('获取统计数据失败:', error)
    ElMessage.error(error.message || '获取统计数据失败')
  }
}

// 获取最近包裹
const fetchRecentPackages = async () => {
  try {
    const response = await request({
      url: API_ENDPOINTS.DRIVER.PACKAGES,
      method: 'get'
    })
    if (response && response.data) {
      recentPackages.value = response.data
    }
  } catch (error) {
    console.error('获取最近包裹失败:', error)
    ElMessage.error(error.message || '获取最近包裹失败')
  }
}

// 获取可用任务
const fetchAvailableTasks = async () => {
  try {
    const response = await request({
      url: API_ENDPOINTS.DRIVER.AVAILABLE_TASKS,
      method: 'get'
    })
    if (response && response.data) {
      availableTasks.value = response.data
    }
  } catch (error) {
    console.error('获取可用任务失败:', error)
    ElMessage.error(error.message || '获取可用任务失败')
  }
}

// 初始化地图
const initMap = async () => {
  try {
    const AMap = await AMapLoader.load(MAP_CONFIG)

    map.value = new AMap.Map('container', {
      zoom: 11,
      center: [116.397428, 39.90923] // 默认中心点
    })

    // 添加地图控件
    map.value.addControl(new AMap.ToolBar())
    map.value.addControl(new AMap.Scale())
    map.value.addControl(new AMap.HawkEye())
    map.value.addControl(new AMap.MapType())

    // 监听地图点击事件，用于选择起点和终点
    map.value.on('click', handleMapClick)
  } catch (error) {
    console.error('地图加载失败：', error)
    ElMessage.error('地图加载失败')
  }
}

const handleSelect = async (key) => {
  activeMenu.value = key
  if (key === 'overview') {
    await fetchStatistics()
  }
}

const handleProfile = () => {
  router.push('/driver/profile')
}

const handleLogout = async () => {
  try {
    await ElMessageBox.confirm('确定要退出登录吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    await request({
      url: API_ENDPOINTS.AUTH.LOGOUT,
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

// 处理地图点击事件
const handleMapClick = (e) => {
  const lnglat = e.lnglat
  if (!deliveryPoints.value.length) {
    // 添加起点
    addMarker(lnglat, '起点')
    deliveryPoints.value.push({
      name: '起点',
      address: `${lnglat.getLng()}, ${lnglat.getLat()}`,
      lnglat
    })
  } else if (deliveryPoints.value.length === 1) {
    // 添加终点并规划路线
    addMarker(lnglat, '终点')
    deliveryPoints.value.push({
      name: '终点',
      address: `${lnglat.getLng()}, ${lnglat.getLat()}`,
      lnglat
    })
    planRoute()
  }
}

// 添加标记点
const addMarker = (lnglat, title) => {
  const marker = new AMap.Marker({
    position: lnglat,
    title: title,
    map: map.value
  })
  return marker
}

// 规划路线
const planRoute = () => {
  const driving = new AMap.Driving({
    map: map.value,
    panel: "panel"
  })

  const points = deliveryPoints.value
  driving.search(
    points[0].lnglat,
    points[1].lnglat,
    (status, result) => {
      if (status === 'complete') {
        const route = result.routes[0]
        selectedRoute.value = {
          distance: (route.distance / 1000).toFixed(2),
          duration: Math.ceil(route.time / 60)
        }
      } else {
        ElMessage.error('路线规划失败')
      }
    }
  )
}

// 计算预计收入
const calculateIncome = (distance) => {
  // 基础运费：6元/50公里
  const baseRate = 6 / 50
  return (distance * baseRate).toFixed(2)
}

// 开始配送
const startDelivery = async () => {
  if (!selectedRoute.value) {
    ElMessage.warning('请先选择配送路线')
    return
  }
  
  try {
    await request({
      url: `${API_ENDPOINTS.DRIVER.ROUTES}/start`,
      method: 'post',
      data: {
        routeId: selectedRoute.value.id
      }
    })
    ElMessage.success('开始配送')
    activeStep.value = 1
  } catch (error) {
    console.error('开始配送失败:', error)
    ElMessage.error('开始配送失败')
  }
}

// 接受配送任务
const acceptDeliveryTask = async (task) => {
  try {
    await request({
      url: `${API_ENDPOINTS.DRIVER.ROUTES}/accept/${task.id}`,
      method: 'post'
    })
    ElMessage.success('接受任务成功')
    refreshTasks()
  } catch (error) {
    console.error('接受任务失败:', error)
    ElMessage.error('接受任务失败')
  }
}

// 获取可用任务列表
const refreshTasks = async () => {
  try {
    const response = await request({
      url: API_ENDPOINTS.DRIVER.PACKAGES,
      method: 'get'
    })
    availableTasks.value = response.data
  } catch (error) {
    console.error('获取任务列表失败:', error)
    ElMessage.error('获取任务列表失败')
  }
}

// 组件挂载时获取数据
onMounted(async () => {
  await Promise.all([
    fetchUserInfo(),
    fetchStatistics(),
    initMap(),
    refreshTasks()
  ])
})

// 组件卸载时清理地图
onUnmounted(() => {
  if (map.value) {
    map.value.destroy()
  }
})

const handleCommand = (command) => {
  switch (command) {
    case 'logout':
      handleLogout()
      break
    case 'profile':
      handleProfile()
      break
  }
}
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
}

.el-main {
  background-color: #f0f2f5;
  padding: 20px;
}

.map-container {
  height: calc(100vh - 140px);
}

.amap-container {
  height: 100%;
  min-height: 500px;
}

.mt-4 {
  margin-top: 16px;
}

.delivery-info {
  padding: 10px;
}

.route-info p {
  margin: 8px 0;
  font-size: 14px;
}

.route-list {
  max-height: 300px;
  overflow-y: auto;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.task-list-container {
  margin-bottom: 20px;
}

.task-list {
  min-height: 200px;
}

.mb-4 {
  margin-bottom: 1rem;
}
</style> 