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
            <span>站点概览</span>
          </el-menu-item>
          <el-menu-item index="packages">
            <el-icon><Box /></el-icon>
            <span>包裹管理</span>
          </el-menu-item>
          <el-menu-item index="storage">
            <el-icon><Files /></el-icon>
            <span>仓储管理</span>
          </el-menu-item>
          <el-menu-item index="dispatch">
            <el-icon><Van /></el-icon>
            <span>配送管理</span>
          </el-menu-item>
          <el-menu-item index="settings">
            <el-icon><Setting /></el-icon>
            <span>站点设置</span>
          </el-menu-item>
        </el-menu>
      </el-aside>
      
      <el-container>
        <el-header>
          <div class="header-content">
            <h2>站点管理控制台</h2>
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
            <h3>站点概览</h3>
            <el-row :gutter="20">
              <el-col :span="6">
                <el-card shadow="hover">
                  <template #header>
                    <div class="card-header">
                      <span>待处理包裹</span>
                    </div>
                  </template>
                  <div class="card-content">
                    <h2>{{ statistics.pendingPackages || 0 }}</h2>
                  </div>
                </el-card>
              </el-col>
              <el-col :span="6">
                <el-card shadow="hover">
                  <template #header>
                    <div class="card-header">
                      <span>今日入库</span>
                    </div>
                  </template>
                  <div class="card-content">
                    <h2>{{ statistics.todayInbound || 0 }}</h2>
                  </div>
                </el-card>
              </el-col>
              <el-col :span="6">
                <el-card shadow="hover">
                  <template #header>
                    <div class="card-header">
                      <span>今日出库</span>
                    </div>
                  </template>
                  <div class="card-content">
                    <h2>{{ statistics.todayOutbound || 0 }}</h2>
                  </div>
                </el-card>
              </el-col>
              <el-col :span="6">
                <el-card shadow="hover">
                  <template #header>
                    <div class="card-header">
                      <span>仓储使用率</span>
                    </div>
                  </template>
                  <div class="card-content">
                    <h2>{{ statistics.storageUsage || 0 }}%</h2>
                  </div>
                </el-card>
              </el-col>
            </el-row>
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
import { DataLine, Box, Files, Van, Setting, ArrowDown } from '@element-plus/icons-vue'
import request from '@/utils/request'
import { API_ENDPOINTS } from '@/config/api'

const router = useRouter()
const activeMenu = ref('overview')
const statistics = ref({
  pendingPackages: 0,
  todayInbound: 0,
  todayOutbound: 0,
  storageUsage: 0
})
const userInfo = ref({})

// 获取用户信息
const fetchUserInfo = async () => {
  try {
    console.log('开始获取用户信息')
    const response = await request({
      url: '/api/auth/user-info',
      method: 'get'
    })
    console.log('用户信息响应:', response)
    if (response && typeof response === 'object') {
      userInfo.value = response
      if (!response.station) {
        ElMessage.error('当前账号未关联站点，请联系管理员')
        router.push('/login')
        return false
      }
      return true
    } else {
      console.error('用户信息格式不正确:', response)
      ElMessage.warning('获取用户信息格式不正确')
      return false
    }
  } catch (error) {
    console.error('获取用户信息失败:', error)
    ElMessage.error('获取用户信息失败')
    router.push('/login')
    return false
  }
}

// 获取统计数据
const fetchStatistics = async () => {
  try {
    console.log('开始获取统计数据')
    const response = await request({
      url: '/api/station-admin/statistics',
      method: 'get'
    })
    console.log('统计数据响应:', response)
    if (response && typeof response === 'object') {
      statistics.value = {
        pendingPackages: response?.pendingPackages ?? 0,
        todayInbound: response?.todayInbound ?? 0,
        todayOutbound: response?.todayOutbound ?? 0,
        storageUsage: response?.storageUsage ?? 0
      }
    } else {
      console.error('统计数据格式不正确:', response)
      ElMessage.warning('获取统计数据格式不正确')
    }
  } catch (error) {
    console.error('获取统计数据失败:', error)
    if (error?.error === '未找到管理员所属站点') {
      ElMessage.error('当前账号未关联站点，请联系管理员')
      router.push('/login')
    } else {
      ElMessage.error('获取统计数据失败')
    }
  }
}

const handleSelect = async (key) => {
  activeMenu.value = key
  if (key === 'overview') {
    await fetchStatistics()
  }
}

const handleProfile = () => {
  router.push('/station/profile')
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

// 组件挂载时获取数据
onMounted(async () => {
  try {
    const hasUserInfo = await fetchUserInfo()
    if (hasUserInfo) {
      await fetchStatistics()
    }
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
</style> 