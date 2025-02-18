<template>
  <el-container class="admin-layout">
    <el-aside width="200px">
      <el-menu
        :default-active="$route.path"
        router
        class="el-menu-vertical"
        background-color="#304156"
        text-color="#fff"
        active-text-color="#409EFF"
      >
        <el-menu-item index="/admin">
          <el-icon><DataLine /></el-icon>
          <span>系统概览</span>
        </el-menu-item>
        <el-menu-item index="/admin/stations">
          <el-icon><Location /></el-icon>
          <span>站点管理</span>
        </el-menu-item>
        <el-menu-item index="/admin/settings">
          <el-icon><Setting /></el-icon>
          <span>系统设置</span>
        </el-menu-item>
        <el-menu-item index="/admin/admins">
          <el-icon><User /></el-icon>
          <span>管理员管理</span>
        </el-menu-item>
      </el-menu>
    </el-aside>

    <el-container>
      <el-header>
        <div class="header-content">
          <h2>城乡物流配送系统 - 管理后台</h2>
          <el-dropdown @command="handleCommand">
            <span class="el-dropdown-link">
              {{ currentUser?.username || '管理员' }}
              <el-icon class="el-icon--right"><arrow-down /></el-icon>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="logout">退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>

      <el-main>
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { DataLine, Location, Setting, ArrowDown, User } from '@element-plus/icons-vue'
import { authService } from '@/services/auth'

const router = useRouter()
const currentUser = ref(authService.getCurrentUser())

const handleCommand = async (command) => {
  if (command === 'logout') {
    try {
      await ElMessageBox.confirm('确定要退出登录吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })

      await authService.logout()
      ElMessage.success('退出登录成功')
      router.push('/login')
    } catch (error) {
      if (error !== 'cancel') {
        console.error('退出登录失败:', error)
        // 即使退出登录失败，也要清除本地存储并跳转到登录页
        authService.clearAuth()
        router.push('/login')
      }
    }
  }
}
</script>

<style scoped>
.admin-layout {
  height: 100vh;
  background-image: url('../assets/loging-bg.jpg');
  background-position: center;
  background-repeat: no-repeat;
  background-size: cover;
  position: relative;
}

.admin-layout::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.10);
  backdrop-filter: blur(10px);
  z-index: 0;
}

.el-container {
  height: 100%;
  position: relative;
  z-index: 1;
}

.el-aside {
  background: rgba(48, 65, 86, 0.9);
  backdrop-filter: blur(8px);
  border-right: 1px solid rgba(255, 255, 255, 0.1);
}

.el-menu {
  border-right: none;
  background: transparent !important;
}

.el-header {
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(8px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  padding: 0 20px;
}

.header-content {
  height: 60px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-content h2 {
  margin: 0;
  font-size: 18px;
  color: rgba(255, 255, 255, 0.95);
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.el-dropdown-link {
  cursor: pointer;
  display: flex;
  align-items: center;
  color: rgba(255, 255, 255, 0.9);
}

.el-main {
  background: rgba(240, 242, 245, 0.1);
  backdrop-filter: blur(8px);
  padding: 20px;
}

:deep(.el-menu-item) {
  color: rgba(255, 255, 255, 0.7) !important;
}

:deep(.el-menu-item.is-active) {
  color: #409EFF !important;
  background: rgba(64, 158, 255, 0.1) !important;
}

:deep(.el-menu-item:hover) {
  background: rgba(255, 255, 255, 0.1) !important;
}
</style> 