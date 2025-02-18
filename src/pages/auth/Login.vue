<template>
  <div class="login-container">
    <el-card class="login-card">
      <template #header>
        <h2 class="login-title">城乡物流配送系统</h2>
      </template>
      
      <el-form 
        ref="loginFormRef"
        :model="loginForm"
        :rules="loginRules"
        label-width="80px"
        class="login-form"
      >
        <el-form-item label="用户名" prop="username">
          <el-input 
            v-model="loginForm.username"
            placeholder="请输入用户名"
          />
        </el-form-item>

        <el-form-item label="密码" prop="password">
          <el-input 
            v-model="loginForm.password"
            type="password"
            placeholder="请输入密码"
            show-password
          />
        </el-form-item>

        <el-form-item label="角色" prop="role">
          <el-select 
            v-model="loginForm.role"
            placeholder="请选择角色"
            style="width: 100%"
            popper-class="my-select-dropdown"
          >
            <el-option 
              v-for="item in roleOptions" 
              :key="item.value" 
              :label="item.label" 
              :value="item.value"
            />
          </el-select>
        </el-form-item>

        <el-form-item>
          <el-button 
            type="primary" 
            :loading="loading"
            class="login-button"
            @click="handleLogin"
          >
            登录
          </el-button>
          <div class="register-link">
            <el-link type="primary" @click="goToRegister">还没有账号？立即注册</el-link>
          </div>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { authService } from '@/services/auth'

const router = useRouter()
const loading = ref(false)
const loginFormRef = ref(null)

const roleOptions = [
  { label: '管理员', value: 'admin' },
  { label: '站点管理员', value: 'station_admin' },
  { label: '司机', value: 'driver' },
  { label: '用户', value: 'user' }
]

const loginForm = reactive({
  username: '',
  password: '',
  role: ''
})

const loginRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度必须在6-20个字符之间', trigger: 'blur' }
  ],
  role: [
    { required: true, message: '请选择角色', trigger: 'change' }
  ]
}

const handleLogin = async () => {
  if (!loginFormRef.value) return

  try {
    await loginFormRef.value.validate()
    loading.value = true

    console.log('开始登录:', {
      username: loginForm.username,
      role: loginForm.role
    })

    const response = await authService.login({
      username: loginForm.username,
      password: loginForm.password,
      role: loginForm.role
    })

    console.log('登录响应:', response)
    
    if (response && response.token) {
      // 存储用户信息和token
      const userInfo = {
        ...response.user,
        role: loginForm.role
      }
      console.log('存储的用户信息:', userInfo)
      
      localStorage.setItem('token', response.token)
      localStorage.setItem('userInfo', JSON.stringify(userInfo))

      ElMessage.success('登录成功')

      // 根据角色跳转到相应的页面
      const roleRoutes = {
        'admin': '/admin',
        'station_admin': '/station',
        'driver': '/driver',
        'user': '/user'
      }

      const targetRoute = roleRoutes[loginForm.role]
      console.log('目标路由:', targetRoute)
      
      if (targetRoute) {
        console.log('准备跳转到:', targetRoute)
        await router.push(targetRoute)
        console.log('跳转完成')
      } else {
        console.error('未知的用户角色:', loginForm.role)
        ElMessage.error('未知的用户角色')
      }
    } else {
      console.error('登录响应格式不正确:', response)
      ElMessage.error('登录失败：响应数据格式不正确')
    }
  } catch (error) {
    console.error('登录失败:', error)
    ElMessage.error(error.message || '登录失败')
  } finally {
    loading.value = false
  }
}

const goToRegister = () => {
  router.push('/register')
}
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding: 300px 20px 20px;
  background-color: #f0f2f5;
  background-image: url('../../assets/loging-bg.jpg');
  background-position: center;
  background-repeat: no-repeat;
  background-size: cover;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  animation: fadeIn 0.8s ease-out;
}

.login-container::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(to right, 
    rgba(0, 0, 0, 0) 0%,
    rgba(0, 0, 0, 0.1) 50%,
    rgba(0, 0, 0, 0.2) 100%
  );
  pointer-events: none;
}

.login-card {
  height: 500px;
  width: 600px;
  max-width: 80%;
  background: rgba(255, 255, 255, 0.10);
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(16px);
  animation: slideIn 0.6s ease-out;
  position: relative;
  z-index: 1;
  overflow: visible;
}

.login-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(to right, 
    var(--gradient-start),
    var(--gradient-end)
  );
}

.login-title {
  text-align: center;
  margin: 0;
  color: rgba(255, 255, 255, 0.95);
  font-size: 26px;
  font-weight: 600;
  padding: 24px 0;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  letter-spacing: 1px;
}

.login-form {
  padding: 10px 35px 25px;
}

.login-button {
  width: 100%;
  margin-top: 25px;
  height: 42px;
  font-size: 16px;
  border-radius: 8px;
  transition: all 0.3s ease;
  letter-spacing: 2px;
}

.register-link {
  text-align: center;
  margin-top: 16px;
  padding-bottom: 16px;
  font-size: 14px;
  opacity: 0.9;
}

:deep(.el-form-item) {
  margin-bottom: 22px;
}

:deep(.el-form-item__label) {
  color: rgba(255, 255, 255, 0.9);
  font-weight: 500;
  font-size: 14px;
}

:deep(.el-input__wrapper) {
  background-color: rgba(255, 255, 255, 0.15);
  box-shadow: none !important;
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: all 0.3s ease;
  border-radius: 8px;
  padding: 4px 12px;
  backdrop-filter: blur(8px);
}

:deep(.el-input__wrapper:hover) {
  background-color: rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.3);
}

:deep(.el-input__wrapper.is-focus) {
  background-color: rgba(255, 255, 255, 0.25);
  border-color: var(--primary-light);
  box-shadow: 0 0 0 2px rgba(76, 175, 80, 0.1) !important;
}

:deep(.el-button--primary) {
  background: linear-gradient(135deg, 
    var(--gradient-start) 0%,
    var(--gradient-end) 100%
  );
  border: 1px solid rgba(255, 255, 255, 0.2);
  font-weight: 500;
  color: rgba(255, 255, 255, 0.95);
}

:deep(.el-button--primary:hover) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(76, 175, 80, 0.2);
  background: linear-gradient(135deg, 
    var(--hover-gradient-start) 0%,
    var(--hover-gradient-end) 100%
  );
  border-color: rgba(255, 255, 255, 0.3);
}

:deep(.el-select__wrapper) {
  background-color: rgba(255, 255, 255, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  backdrop-filter: blur(8px);
}

:deep(.el-input__inner) {
  color: rgba(255, 255, 255, 0.9) !important;
}

:deep(.el-input__inner::placeholder) {
  color: rgba(255, 255, 255, 0.6);
}

.register-link :deep(.el-link) {
  color: rgba(255, 255, 255, 0.8);
  font-weight: 500;
}

.register-link :deep(.el-link:hover) {
  color: rgba(255, 255, 255, 0.95);
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(40px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}
</style> 