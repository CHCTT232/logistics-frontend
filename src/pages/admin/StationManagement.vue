<template>
  <div class="station-management">
    <!-- 搜索和添加按钮 -->
    <div class="header-actions">
      <el-input
        v-model="searchQuery"
        placeholder="搜索站点名称或地址"
        class="search-input"
        clearable
      />
      <el-button type="primary" @click="showAddDialog">
        添加站点
      </el-button>
    </div>

    <!-- 站点列表表格 -->
    <el-table
      v-loading="loading"
      :data="filteredStations"
      style="width: 100%"
      border
    >
      <el-table-column prop="name" label="站点名称" />
      <el-table-column prop="address" label="地址" />
      <el-table-column label="经纬度" width="180">
        <template #default="{ row }">
          {{ row.longitude.toFixed(4) }}, {{ row.latitude.toFixed(4) }}
        </template>
      </el-table-column>
      <el-table-column label="管理员" width="200">
        <template #default="{ row }">
          <div v-if="row.manager">
            <div>{{ row.manager.username }}</div>
            <div class="admin-info">
              <small>{{ row.manager.email }}</small>
              <small>{{ row.manager.phone }}</small>
            </div>
          </div>
          <el-tag v-else type="info">未设置</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="状态" width="100">
        <template #default="{ row }">
          <el-tag :type="row.status === 'active' ? 'success' : 'danger'">
            {{ row.status === 'active' ? '运营中' : '已关闭' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="280">
        <template #default="{ row }">
          <el-button-group>
            <el-button
              type="primary"
              @click="showAdminDialog(row)"
            >
              {{ row.manager ? '更新管理员' : '设置管理员' }}
            </el-button>
            <el-button
              type="warning"
              @click="handleToggleStatus(row)"
            >
              {{ row.status === 'active' ? '关闭' : '启用' }}
            </el-button>
            <el-button
              type="primary"
              @click="showEditDialog(row)"
            >
              编辑
            </el-button>
            <el-button
              type="danger"
              @click="handleDelete(row)"
            >
              删除
            </el-button>
          </el-button-group>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <div class="pagination-container">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :total="total"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>

    <!-- 站点表单对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogType === 'add' ? '添加站点' : '编辑站点'"
      width="500px"
    >
      <el-form
        ref="stationFormRef"
        :model="stationForm"
        :rules="rules"
        label-width="100px"
      >
        <el-form-item label="站点名称" prop="name">
          <el-input v-model="stationForm.name" />
        </el-form-item>
        <el-form-item label="地址" prop="address">
          <el-input v-model="stationForm.address" />
        </el-form-item>
        <el-form-item label="经度" prop="longitude">
          <el-input-number
            v-model="stationForm.longitude"
            :precision="6"
            :step="0.000001"
          />
        </el-form-item>
        <el-form-item label="纬度" prop="latitude">
          <el-input-number
            v-model="stationForm.latitude"
            :precision="6"
            :step="0.000001"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>

    <!-- 管理员表单对话框 -->
    <el-dialog
      v-model="adminDialogVisible"
      :title="currentStation?.manager ? '更新管理员' : '设置管理员'"
      width="500px"
    >
      <el-form
        ref="adminFormRef"
        :model="adminForm"
        :rules="adminRules"
        label-width="100px"
      >
        <el-form-item
          v-if="!currentStation?.manager"
          label="用户名"
          prop="username"
        >
          <el-input v-model="adminForm.username" />
        </el-form-item>
        <el-form-item
          v-if="!currentStation?.manager"
          label="密码"
          prop="password"
        >
          <el-input
            v-model="adminForm.password"
            type="password"
            show-password
          />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="adminForm.email" />
        </el-form-item>
        <el-form-item label="电话" prop="phone">
          <el-input v-model="adminForm.phone" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="adminDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleAdminSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Search } from '@element-plus/icons-vue'
import request from '@/utils/request'
import { API_ENDPOINTS } from '@/config/api'

export default {
  name: 'StationManagement',
  components: {
    Plus,
    Search
  },
  setup() {
    // 站点列表数据
    const stations = ref([])
    const searchQuery = ref('')
    const currentPage = ref(1)
    const pageSize = ref(10)
    const total = ref(0)
    const loading = ref(false)

    // 获取站点列表
    const fetchStations = async () => {
      try {
        loading.value = true
        console.log('开始获取站点列表, URL:', API_ENDPOINTS.ADMIN.STATIONS)
        
        const response = await request({
          url: API_ENDPOINTS.ADMIN.STATIONS,
          method: 'get',
          params: {
            page: currentPage.value,
            pageSize: pageSize.value,
            name: searchQuery.value
          }
        })
        
        console.log('获取站点列表响应:', response)
        
        if (response && response.items) {
          stations.value = response.items.map(station => ({
            id: station.id,
            name: station.name,
            address: station.address,
            longitude: station.longitude,
            latitude: station.latitude,
            status: station.status,
            storage_capacity: station.storage_capacity,
            manager: station.manager ? {
              id: station.manager.id,
              username: station.manager.username,
              role: station.manager.role,
              status: station.manager.status
            } : null,
            created_at: station.created_at,
            updated_at: station.updated_at
          }))
          total.value = response.total
          currentPage.value = response.page
          pageSize.value = response.pageSize
          console.log('处理后的站点列表:', stations.value)
        } else {
          console.warn('响应数据格式不正确:', response)
          ElMessage.warning('获取站点列表的响应格式不正确')
        }
      } catch (error) {
        console.error('获取站点列表失败:', error)
        if (error.response?.data?.error) {
          ElMessage.error(error.response.data.error)
        } else {
          ElMessage.error('获取站点列表失败')
        }
      } finally {
        loading.value = false
      }
    }

    // 过滤后的站点列表
    const filteredStations = computed(() => {
      return stations.value.filter(station =>
        station.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
        station.address.toLowerCase().includes(searchQuery.value.toLowerCase())
      )
    })

    // 对话框控制
    const dialogVisible = ref(false)
    const dialogType = ref('add')
    const adminDialogVisible = ref(false)

    // 表单数据
    const stationForm = ref({
      name: '',
      address: '',
      longitude: 0,
      latitude: 0,
      storage_capacity: 1000000 // 默认 1,000,000 立方厘米 (1 立方米)
    })

    const adminForm = ref({
      id: '',
      username: '',
      password: '',
      email: '',
      phone: ''
    })

    // 表单验证规则
    const rules = {
      name: [
        { required: true, message: '请输入站点名称', trigger: 'blur' },
        { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
      ],
      address: [
        { required: true, message: '请输入地址', trigger: 'blur' }
      ],
      longitude: [
        { required: true, message: '请输入经度', trigger: 'blur' },
        { type: 'number', message: '经度必须是数字', trigger: 'blur' }
      ],
      latitude: [
        { required: true, message: '请输入纬度', trigger: 'blur' },
        { type: 'number', message: '纬度必须是数字', trigger: 'blur' }
      ]
    }

    // 管理员表单验证规则
    const adminRules = {
      username: [
        { required: true, message: '请输入用户名', trigger: 'blur' },
        { pattern: /^[a-zA-Z0-9_]{4,20}$/, message: '用户名只能包含字母、数字和下划线，长度4-20位', trigger: 'blur' }
      ],
      password: [
        { required: true, message: '请输入密码', trigger: 'blur' },
        { min: 6, max: 20, message: '密码长度必须在6-20个字符之间', trigger: 'blur' }
      ],
      email: [
        { required: true, message: '请输入邮箱', trigger: 'blur' },
        { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
      ],
      phone: [
        { required: true, message: '请输入电话', trigger: 'blur' },
        { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }
      ]
    }

    // 表单引用
    const stationFormRef = ref(null)
    const adminFormRef = ref(null)

    // 处理表单提交
    const handleSubmit = async () => {
      if (!stationFormRef.value) return
      
      try {
        // 等待表单验证完成
        await stationFormRef.value.validate()
        loading.value = true

        const url = dialogType.value === 'add' ? 
          API_ENDPOINTS.ADMIN.STATIONS : 
          API_ENDPOINTS.ADMIN.STATION_DETAIL(stationForm.value.id)
        const method = dialogType.value === 'add' ? 'post' : 'put'
        
        const response = await request({
          url,
          method,
          data: stationForm.value
        })

        if (response) {
          ElMessage.success(dialogType.value === 'add' ? '添加站点成功' : '更新站点成功')
          dialogVisible.value = false
          fetchStations()
        }
      } catch (error) {
        if (error.fields) {
          // 表单验证错误
          console.error('表单验证失败:', error.fields)
          ElMessage.error('请填写所有必填字段')
        } else {
          // API 请求错误
          console.error('表单提交失败:', error)
          ElMessage.error(error.response?.data?.error || '操作失败')
        }
      } finally {
        loading.value = false
      }
    }

    // 显示添加对话框
    const showAddDialog = () => {
      dialogType.value = 'add'
      stationForm.value = {
        name: '',
        address: '',
        longitude: 116.4551,  // 默认经度（北京）
        latitude: 39.9080,     // 默认纬度（北京）
        storage_capacity: 1000000 // 默认 1,000,000 立方厘米 (1 立方米)
      }
      // 重置表单验证状态
      if (stationFormRef.value) {
        stationFormRef.value.resetFields()
      }
      dialogVisible.value = true
    }

    // 显示编辑对话框
    const showEditDialog = (row) => {
      dialogType.value = 'edit'
      stationForm.value = { ...row }
      // 重置表单验证状态
      if (stationFormRef.value) {
        stationFormRef.value.resetFields()
      }
      dialogVisible.value = true
    }

    // 显示管理员设置对话框
    const currentStation = ref(null)
    const showAdminDialog = async (row) => {
      currentStation.value = row
      console.log('显示管理员设置对话框:', row)
      
      // 重置表单
      adminForm.value = {
        id: '',
        username: '',
        password: '',
        email: '',
        phone: ''
      }
      
      // 如果站点已有管理员，获取管理员信息
      if (row.manager) {
        console.log('当前站点管理员信息:', row.manager)
        adminForm.value = {
          id: row.manager.id,
          username: row.manager.username,
          email: row.manager.email || '',
          phone: row.manager.phone || ''
        }
      }
      
      // 重置表单验证状态
      if (adminFormRef.value) {
        adminFormRef.value.resetFields()
      }
      
      adminDialogVisible.value = true
    }

    // 处理管理员表单提交
    const handleAdminSubmit = async () => {
      if (!adminFormRef.value) return
      
      try {
        await adminFormRef.value.validate()
        loading.value = true

        // 检查是新建还是更新
        const isCreating = !currentStation.value.manager
        console.log('当前操作:', isCreating ? '新建管理员' : '更新管理员')
        console.log('当前站点信息:', currentStation.value)
        console.log('表单数据:', adminForm.value)

        // 构造提交数据
        const submitData = {
          email: adminForm.value.email.trim(),
          phone: adminForm.value.phone.trim()
        }

        if (isCreating) {
          // 新建管理员需要用户名和密码
          if (!adminForm.value.username || adminForm.value.username.trim() === '') {
            ElMessage.error('请输入用户名')
            loading.value = false
            return
          }
          if (!adminForm.value.password || adminForm.value.password.trim() === '') {
            ElMessage.error('请输入密码')
            loading.value = false
            return
          }
          if (adminForm.value.password.length < 6 || adminForm.value.password.length > 20) {
            ElMessage.error('密码长度必须在6-20个字符之间')
            loading.value = false
            return
          }

          submitData.username = adminForm.value.username.trim()
          submitData.password = adminForm.value.password.trim()
          submitData.role = 'station_admin'
          submitData.status = 'active'
        }

        // 验证邮箱格式
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(adminForm.value.email.trim())) {
          ElMessage.error('请输入正确的邮箱地址')
          loading.value = false
          return
        }

        // 验证手机号格式
        const phoneRegex = /^1[3-9]\d{9}$/
        if (!phoneRegex.test(adminForm.value.phone.trim())) {
          ElMessage.error('请输入正确的手机号码')
          loading.value = false
          return
        }

        // 使用 API_ENDPOINTS 常量
        const url = API_ENDPOINTS.ADMIN.STATION_ADMIN(currentStation.value.id)
        console.log('提交管理员数据:', {
          url,
          method: 'put',
          data: submitData
        })

        const response = await request({
          url,
          method: 'put',
          data: submitData
        })

        console.log('设置管理员响应:', response)
        ElMessage.success('管理员设置成功')
        adminDialogVisible.value = false
        await fetchStations()
      } catch (error) {
        console.error('管理员设置失败:', error)
        if (error.response?.data?.error) {
          const errorMsg = error.response.data.error
          if (errorMsg.includes('用户名已被使用')) {
            ElMessage.error('用户名已被使用')
          } else if (errorMsg.includes('Validation error')) {
            if (errorMsg.includes('username')) {
              ElMessage.error('用户名格式不正确，只能包含字母、数字和下划线')
            } else if (errorMsg.includes('email')) {
              ElMessage.error('请输入正确的邮箱地址')
            } else if (errorMsg.includes('phone')) {
              ElMessage.error('请输入正确的手机号码')
            } else if (errorMsg.includes('password')) {
              ElMessage.error('密码格式不正确，长度必须在6-20个字符之间')
            } else {
              ElMessage.error('表单验证失败：' + errorMsg)
            }
          } else {
            ElMessage.error(errorMsg)
          }
        } else {
          ElMessage.error('设置管理员失败，请检查输入是否正确')
        }
      } finally {
        loading.value = false
      }
    }

    // 切换站点状态
    const toggleStatus = (row) => {
      ElMessageBox.confirm(
        `确定要${row.status === 'active' ? '关闭' : '启用'}该站点吗？`,
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      )
        .then(() => {
          // TODO: 调用API
          row.status = row.status === 'active' ? 'inactive' : 'active'
          ElMessage.success('操作成功')
        })
        .catch(() => {
          // 取消操作
        })
    }

    // 处理删除
    const handleDelete = async (row) => {
      try {
        await ElMessageBox.confirm('确定要删除该站点吗？', '提示', {
          type: 'warning'
        })
        
        await request({
          url: API_ENDPOINTS.ADMIN.STATION_DETAIL(row.id),
          method: 'delete'
        })
        
        ElMessage.success('删除成功')
        fetchStations()
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
          url: API_ENDPOINTS.ADMIN.STATION_STATUS(row.id),
          method: 'put',
          data: { status: newStatus }
        })
        
        ElMessage.success('状态更新成功')
        fetchStations()
      } catch (error) {
        ElMessage.error('状态更新失败：' + error.message)
      }
    }

    // 分页处理
    const handleSizeChange = (val) => {
      pageSize.value = val
      // TODO: 重新加载数据
    }

    const handleCurrentChange = (val) => {
      currentPage.value = val
      // TODO: 重新加载数据
    }

    // 组件挂载时获取数据
    onMounted(() => {
      fetchStations()
    })

    return {
      stations,
      searchQuery,
      currentPage,
      pageSize,
      total,
      loading,
      filteredStations,
      dialogVisible,
      dialogType,
      adminDialogVisible,
      stationForm,
      adminForm,
      rules,
      adminRules,
      stationFormRef,
      adminFormRef,
      showAddDialog,
      showEditDialog,
      showAdminDialog,
      handleToggleStatus,
      handleSubmit,
      handleAdminSubmit,
      handleSizeChange,
      handleCurrentChange,
      currentStation,
      handleDelete
    }
  }
}
</script>

<style scoped>
.station-management {
  padding: 20px;
}

.header-actions {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
}

.search-input {
  width: 300px;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.admin-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-top: 4px;
  color: #666;
}

.el-button-group {
  display: flex;
  gap: 8px;
}
</style> 