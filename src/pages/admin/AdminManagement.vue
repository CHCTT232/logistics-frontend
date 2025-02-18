<template>
  <div class="admin-management">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>管理员账号管理</span>
          <el-button type="primary" @click="handleAdd">添加管理员</el-button>
        </div>
      </template>

      <!-- 搜索表单 -->
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="用户名">
          <el-input v-model="searchForm.username" placeholder="请输入用户名" clearable />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>

      <!-- 管理员列表 -->
      <el-table :data="adminList" v-loading="loading" style="width: 100%">
        <el-table-column prop="username" label="用户名" />
        <el-table-column prop="email" label="邮箱" />
        <el-table-column prop="phone" label="手机号" />
        <el-table-column prop="createdAt" label="创建时间">
          <template #default="scope">
            {{ new Date(scope.row.createdAt).toLocaleString() }}
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态">
          <template #default="scope">
            <el-tag :type="scope.row.status === 'active' ? 'success' : 'danger'">
              {{ scope.row.status === 'active' ? '正常' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200">
          <template #default="scope">
            <el-button 
              type="primary" 
              link
              @click="handleEdit(scope.row)"
            >
              编辑
            </el-button>
            <el-button 
              type="danger" 
              link
              @click="handleDelete(scope.row)"
            >
              删除
            </el-button>
            <el-button 
              :type="scope.row.status === 'active' ? 'warning' : 'success'" 
              link
              @click="handleToggleStatus(scope.row)"
            >
              {{ scope.row.status === 'active' ? '禁用' : '启用' }}
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next"
          :total="total"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 添加/编辑对话框 -->
    <el-dialog
      :title="dialogType === 'add' ? '添加管理员' : '编辑管理员'"
      v-model="dialogVisible"
      width="500px"
      @close="handleDialogClose"
      destroy-on-close
    >
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="80px"
        class="admin-form"
      >
        <el-form-item label="用户名" prop="username">
          <el-input 
            v-model="form.username" 
            placeholder="请输入用户名"
            clearable
          />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input 
            v-model="form.email" 
            placeholder="请输入邮箱"
            clearable
          />
        </el-form-item>
        <el-form-item label="手机号" prop="phone">
          <el-input 
            v-model="form.phone" 
            placeholder="请输入手机号"
            clearable
          />
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input
            v-model="form.password"
            type="password"
            placeholder="请输入密码"
            show-password
            clearable
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSubmit" :loading="loading">
            确定
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import request from '@/utils/request'
import { API_ENDPOINTS } from '@/config/api'

// 数据定义
const loading = ref(false)
const adminList = ref([])
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const dialogVisible = ref(false)
const dialogType = ref('add')
const formRef = ref(null)

// 搜索表单
const searchForm = ref({
  username: ''
})

// 添加/编辑表单
const form = ref({
  username: '',
  email: '',
  phone: '',
  password: '',
  role: 'admin'
})

// 表单验证规则
const rules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '长度在 3 到 20 个字符', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
  ],
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入11位手机号，以1开头', trigger: ['blur', 'change'] }
  ],
  password: [
    { required: dialogType.value === 'add', message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '长度在 6 到 20 个字符', trigger: 'blur' }
  ]
}

// 监听对话框类型变化，动态更新密码验证规则
watch(dialogType, (newType) => {
  rules.password[0].required = newType === 'add'
})

// 获取管理员列表
const fetchAdminList = async () => {
  try {
    loading.value = true
    const response = await request({
      url: API_ENDPOINTS.ADMIN.ADMINS,
      method: 'get',
      params: {
        page: currentPage.value,
        pageSize: pageSize.value,
        ...searchForm.value
      }
    })
    
    if (response) {
      adminList.value = response.items || []
      total.value = response.total || 0
    }
  } catch (error) {
    console.error('获取管理员列表失败:', error)
    ElMessage.error('获取管理员列表失败')
  } finally {
    loading.value = false
  }
}

// 重置表单
const resetForm = () => {
  form.value = {
    username: '',
    email: '',
    phone: '',
    password: '',
    role: 'admin'
  }
  if (formRef.value) {
    formRef.value.resetFields()
  }
}

// 处理添加
const handleAdd = () => {
  dialogType.value = 'add'
  resetForm()
  dialogVisible.value = true
}

// 处理编辑
const handleEdit = (row) => {
  dialogType.value = 'edit'
  form.value = {
    id: row.id,
    username: row.username,
    email: row.email,
    phone: row.phone,
    role: 'admin',
    password: ''
  }
  dialogVisible.value = true
}

// 处理删除
const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm('确定要删除该管理员吗？', '提示', {
      type: 'warning'
    })
    
    await request({
      url: API_ENDPOINTS.ADMIN.ADMIN_DETAIL(row.id),
      method: 'delete'
    })
    
    ElMessage.success('删除成功')
    fetchAdminList()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败：' + error.message)
    }
  }
}

// 处理状态切换
const handleToggleStatus = async (row) => {
  try {
    const newStatus = row.status === 'active' ? 'inactive' : 'active'
    await request({
      url: `${API_ENDPOINTS.ADMIN.ADMIN_DETAIL(row.id)}/status`,
      method: 'put',
      data: { status: newStatus }
    })
    
    ElMessage.success('状态更新成功')
    fetchAdminList()
  } catch (error) {
    ElMessage.error('状态更新失败：' + error.message)
  }
}

// 处理表单提交
const handleSubmit = async () => {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    loading.value = true

    // 构造请求URL
    const url = dialogType.value === 'add' ? API_ENDPOINTS.ADMIN.ADMINS : `${API_ENDPOINTS.ADMIN.ADMINS}/${form.value.id}`
    const method = dialogType.value === 'add' ? 'post' : 'put'
    
    // 如果是编辑且密码为空，则不提交密码字段
    const submitData = { ...form.value }
    if (dialogType.value === 'edit' && !submitData.password) {
      delete submitData.password
    }

    console.log('发送请求:', { url, method, data: submitData })

    const response = await request({
      url,
      method,
      data: submitData
    })

    if (response) {
      ElMessage.success(dialogType.value === 'add' ? '添加成功' : '更新成功')
      dialogVisible.value = false
      fetchAdminList()
    }
  } catch (error) {
    console.error('表单提交失败:', error)
    ElMessage.error(error.response?.data?.error || '操作失败')
  } finally {
    loading.value = false
  }
}

// 监听对话框关闭
const handleDialogClose = () => {
  resetForm()
}

// 处理搜索
const handleSearch = () => {
  currentPage.value = 1
  fetchAdminList()
}

// 重置搜索
const resetSearch = () => {
  searchForm.value = {
    username: ''
  }
  handleSearch()
}

// 处理分页
const handleSizeChange = (val) => {
  pageSize.value = val
  fetchAdminList()
}

const handleCurrentChange = (val) => {
  currentPage.value = val
  fetchAdminList()
}

// 初始化
onMounted(() => {
  fetchAdminList()
})
</script>

<style scoped>
.admin-management {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.search-form {
  margin-bottom: 20px;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style> 