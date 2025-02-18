<template>
  <div class="register-container">
    <el-card class="register-card">
      <template #header>
        <div class="card-header">
          <h2>用户注册</h2>
        </div>
      </template>
      
      <el-form 
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="120px"
        class="register-form"
      >
        <el-form-item label="用户名" prop="username">
          <el-input v-model="form.username" placeholder="请输入用户名" />
        </el-form-item>

        <el-form-item label="密码" prop="password">
          <el-input 
            v-model="form.password" 
            type="password" 
            placeholder="请输入密码"
            show-password 
          />
        </el-form-item>

        <el-form-item label="用户类型" prop="role">
          <el-select 
            v-model="form.role" 
            placeholder="请选择用户类型"
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
          <el-button type="primary" @click="handleRegister" :loading="loading">注册</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>

        <div class="login-link">
          已有账号？<router-link to="/login">立即登录</router-link>
        </div>
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
const formRef = ref(null)
const loading = ref(false)

const roleOptions = [
  { label: '司机', value: 'driver' },
  { label: '用户', value: 'user' }
]

const form = reactive({
  username: '',
  password: '',
  role: 'user'
})

const validateUsername = (rule, value, callback) => {
  if (!value) {
    callback(new Error('请输入用户名'))
  } else if (value.length < 3) {
    callback(new Error('用户名长度不能小于3个字符'))
  } else {
    callback()
  }
}

const validatePassword = (rule, value, callback) => {
  if (!value) {
    callback(new Error('请输入密码'))
  } else if (value.length < 6) {
    callback(new Error('密码长度不能小于6个字符'))
  } else {
    callback()
  }
}

const rules = reactive({
  username: [
    { required: true, validator: validateUsername, trigger: 'blur' }
  ],
  password: [
    { required: true, validator: validatePassword, trigger: 'blur' }
  ],
  role: [
    { required: true, message: '请选择用户类型', trigger: 'change' }
  ]
})

const handleRegister = async () => {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    loading.value = true
    
    const response = await authService.register({
      username: form.username,
      password: form.password,
      role: form.role
    })
    
    ElMessage.success(response.message || '注册成功')
    router.push('/login')
  } catch (error) {
    console.error('注册失败:', error)
    ElMessage.error(error.message || '注册失败，请稍后重试')
  } finally {
    loading.value = false
  }
}

const handleReset = () => {
  if (formRef.value) {
    formRef.value.resetFields()
  }
}
</script>

<style scoped>
.register-container {
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

.register-container::before {
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

.register-card {
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

.register-card::before {
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

.card-header h2 {
  text-align: center;
  margin: 0;
  color: rgba(255, 255, 255, 0.95);
  font-size: 26px;
  font-weight: 600;
  padding: 24px 0;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  letter-spacing: 1px;
}

.register-form {
  padding: 10px 35px;
}

:deep(.el-form-item) {
  margin-bottom: 15px;
}

:deep(.el-select) {
  width: 100%;
}

:deep(.el-select .el-input) {
  width: 100%;
}

:deep(.el-select__wrapper) {
  width: 100%;
  background-color: rgba(255, 255, 255, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  backdrop-filter: blur(8px);
}

:deep(.el-select .el-input__wrapper) {
  width: 100%;
  box-shadow: none !important;
  background: transparent;
  border: none;
}

:deep(.el-form-item__content) {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

:deep(.el-button) {
  width: 100%;
  height: 42px;
  font-size: 16px;
  border-radius: 8px;
  margin-top: 5px;
}

:deep(.el-button--primary) {
  background: linear-gradient(135deg, 
    var(--gradient-start) 0%,
    var(--gradient-end) 100%
  );
  border: 1px solid rgba(255, 255, 255, 0.2);
  font-weight: 500;
  color: rgba(255, 255, 255, 0.95);
  letter-spacing: 2px;
}

:deep(.el-button--default) {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: rgba(255, 255, 255, 0.8);
}

:deep(.el-select-dropdown__item) {
  color: rgba(255, 255, 255, 0.9) !important;
}

:deep(.el-select-dropdown__item.hover),
:deep(.el-select-dropdown__item:hover) {
  background-color: rgba(255, 255, 255, 0.1) !important;
}

:deep(.el-select-dropdown__item.selected) {
  background-color: rgba(76, 175, 80, 0.2) !important;
  color: #4CAF50 !important;
}

.login-link {
  text-align: center;
  margin-top: 10px;
  padding-bottom: 10px;
  font-size: 14px;
}

.login-link a {
  color: rgba(255, 255, 255, 0.8);
  text-decoration: none;
  font-weight: 500;
  transition: all 0.3s ease;
}

.login-link a:hover {
  color: rgba(255, 255, 255, 0.95);
  text-decoration: none;
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

:deep(.el-form-item__label) {
  color: rgba(255, 255, 255, 0.9);
  font-weight: 500;
  font-size: 14px;
}

:deep(.el-input__wrapper) {
  background-color: rgba(255, 255, 255, 0.15) !important;
  box-shadow: none !important;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

:deep(.el-input__inner) {
  color: rgba(255, 255, 255, 0.9) !important;
}

:deep(.el-input__inner::placeholder) {
  color: rgba(255, 255, 255, 0.6) !important;
}

:deep(.el-select-dropdown.el-popper) {
  background: rgba(48, 65, 86, 0.95) !important;
  border: 1px solid rgba(255, 255, 255, 0.1) !important;
  backdrop-filter: blur(16px);
}

/* 下拉菜单样式 */
:deep(.my-select-dropdown) {
  background: rgba(48, 65, 86, 0.95) !important;
  border: 1px solid rgba(255, 255, 255, 0.1) !important;
  backdrop-filter: blur(16px);
}

:deep(.my-select-dropdown .el-select-dropdown__item) {
  color: rgba(255, 255, 255, 0.9);
}

:deep(.my-select-dropdown .el-select-dropdown__item.hover),
:deep(.my-select-dropdown .el-select-dropdown__item:hover) {
  background-color: rgba(255, 255, 255, 0.1);
}

:deep(.my-select-dropdown .el-select-dropdown__item.selected) {
  background-color: rgba(76, 175, 80, 0.2);
  color: #4CAF50;
}

:deep(.el-select-dropdown__empty) {
  color: rgba(255, 255, 255, 0.6);
  padding: 10px 0;
}

:deep(.el-select__tags) {
  background-color: transparent;
}

:deep(.el-select .el-input__inner) {
  color: rgba(255, 255, 255, 0.9) !important;
}

:deep(.el-select .el-input__inner::placeholder) {
  color: rgba(255, 255, 255, 0.6) !important;
}
</style> 