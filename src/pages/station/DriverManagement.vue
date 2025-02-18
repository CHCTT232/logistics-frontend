<template>
  <div class="driver-management">
    <!-- 搜索和筛选 -->
    <el-card class="search-card" shadow="hover">
      <el-form :model="searchForm" inline>
        <el-form-item label="司机姓名">
          <el-input
            v-model="searchForm.name"
            placeholder="请输入司机姓名"
            clearable
          />
        </el-form-item>
        <el-form-item label="车牌号">
          <el-input
            v-model="searchForm.carNumber"
            placeholder="请输入车牌号"
            clearable
          />
        </el-form-item>
        <el-form-item label="状态">
          <el-select
            v-model="searchForm.status"
            placeholder="请选择状态"
            clearable
          >
            <el-option label="在线" value="online" />
            <el-option label="离线" value="offline" />
            <el-option label="配送中" value="delivering" />
            <el-option label="休息" value="rest" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">
            <el-icon><Search /></el-icon>
            搜索
          </el-button>
          <el-button @click="resetSearch">
            <el-icon><Refresh /></el-icon>
            重置
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-row :gutter="20" style="margin-top: 20px;">
      <!-- 司机列表 -->
      <el-col :span="16">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>司机列表</span>
              <el-radio-group v-model="listType" size="small">
                <el-radio-button value="all">全部</el-radio-button>
                <el-radio-button value="online">在线</el-radio-button>
                <el-radio-button value="delivering">配送中</el-radio-button>
              </el-radio-group>
            </div>
          </template>

          <el-table
            :data="filteredDrivers"
            style="width: 100%"
            v-loading="loading"
          >
            <el-table-column type="expand">
              <template #default="{ row }">
                <el-descriptions :column="3" border>
                  <el-descriptions-item label="今日任务">{{ row.taskCount }}个</el-descriptions-item>
                  <el-descriptions-item label="完成任务">{{ row.completedCount }}个</el-descriptions-item>
                  <el-descriptions-item label="异常任务">{{ row.exceptionCount }}个</el-descriptions-item>
                  <el-descriptions-item label="总里程">{{ row.totalDistance }}km</el-descriptions-item>
                  <el-descriptions-item label="剩余空间">{{ row.availableSpace }}m³</el-descriptions-item>
                  <el-descriptions-item label="评分">
                    <el-rate v-model="row.rating" disabled show-score text-color="#ff9900" />
                  </el-descriptions-item>
                </el-descriptions>
              </template>
            </el-table-column>
            <el-table-column prop="name" label="司机姓名" width="120" />
            <el-table-column prop="phone" label="联系电话" width="140" />
            <el-table-column prop="carNumber" label="车牌号" width="120" />
            <el-table-column prop="carType" label="车型" width="120" />
            <el-table-column prop="status" label="状态" width="100">
              <template #default="{ row }">
                <el-tag :type="getStatusType(row.status)">
                  {{ getStatusText(row.status) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="location" label="当前位置" show-overflow-tooltip />
            <el-table-column label="操作" width="200" fixed="right">
              <template #default="{ row }">
                <el-button
                  type="primary"
                  link
                  @click="viewTasks(row)"
                >
                  任务详情
                </el-button>
                <el-button
                  type="primary"
                  link
                  @click="viewLocation(row)"
                >
                  实时位置
                </el-button>
                <el-button
                  type="warning"
                  link
                  v-if="row.status === 'delivering'"
                  @click="handleException(row)"
                >
                  上报异常
                </el-button>
              </template>
            </el-table-column>
          </el-table>

          <!-- 分页 -->
          <div class="pagination">
            <el-pagination
              v-model:current-page="currentPage"
              v-model:page-size="pageSize"
              :page-sizes="[10, 20, 50, 100]"
              :total="total"
              layout="total, sizes, prev, pager, next, jumper"
              @size-change="handleSizeChange"
              @current-change="handleCurrentChange"
            />
          </div>
        </el-card>
      </el-col>

      <!-- 实时监控 -->
      <el-col :span="8">
        <el-card class="monitor-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <span>实时监控</span>
              <el-switch
                v-model="autoRefresh"
                active-text="自动刷新"
                @change="toggleAutoRefresh"
              />
            </div>
          </template>

          <!-- 统计数据 -->
          <div class="monitor-stats">
            <el-row :gutter="20">
              <el-col :span="12">
                <div class="stat-card">
                  <div class="stat-value">{{ stats.onlineCount }}</div>
                  <div class="stat-label">在线司机</div>
                </div>
              </el-col>
              <el-col :span="12">
                <div class="stat-card">
                  <div class="stat-value">{{ stats.deliveringCount }}</div>
                  <div class="stat-label">配送中</div>
                </div>
              </el-col>
              <el-col :span="12">
                <div class="stat-card">
                  <div class="stat-value">{{ stats.completedTaskCount }}</div>
                  <div class="stat-label">今日完成</div>
                </div>
              </el-col>
              <el-col :span="12">
                <div class="stat-card">
                  <div class="stat-value">{{ stats.exceptionCount }}</div>
                  <div class="stat-label">异常情况</div>
                </div>
              </el-col>
            </el-row>
          </div>

          <!-- 实时动态 -->
          <div class="monitor-activities">
            <div class="section-title">实时动态</div>
            <el-scrollbar height="300px">
              <el-timeline>
                <el-timeline-item
                  v-for="activity in activities"
                  :key="activity.id"
                  :timestamp="activity.time"
                  :type="activity.type"
                >
                  {{ activity.content }}
                </el-timeline-item>
              </el-timeline>
            </el-scrollbar>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 任务详情对话框 -->
    <el-dialog
      v-model="taskDialogVisible"
      :title="currentDriver ? currentDriver.name + ' 的任务详情' : '任务详情'"
      width="800px"
    >
      <el-tabs v-model="taskTab">
        <el-tab-pane label="今日任务" name="today">
          <el-table :data="currentTasks" style="width: 100%">
            <el-table-column prop="id" label="任务编号" width="120" />
            <el-table-column prop="fromStation" label="起始站点" width="120" />
            <el-table-column prop="toStation" label="目的站点" width="120" />
            <el-table-column prop="packageCount" label="包裹数" width="100">
              <template #default="{ row }">
                {{ row.packageCount }}个
              </template>
            </el-table-column>
            <el-table-column prop="totalWeight" label="总重量" width="100">
              <template #default="{ row }">
                {{ row.totalWeight }}kg
              </template>
            </el-table-column>
            <el-table-column prop="distance" label="配送距离" width="100">
              <template #default="{ row }">
                {{ row.distance }}km
              </template>
            </el-table-column>
            <el-table-column prop="status" label="状态" width="100">
              <template #default="{ row }">
                <el-tag :type="getTaskStatusType(row.status)">
                  {{ getTaskStatusText(row.status) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="createTime" label="创建时间" width="180" />
          </el-table>
        </el-tab-pane>
        <el-tab-pane label="历史记录" name="history">
          <el-table :data="historyTasks" style="width: 100%">
            <el-table-column prop="date" label="日期" width="120" />
            <el-table-column prop="taskCount" label="任务数" width="100">
              <template #default="{ row }">
                {{ row.taskCount }}个
              </template>
            </el-table-column>
            <el-table-column prop="completedCount" label="完成数" width="100">
              <template #default="{ row }">
                {{ row.completedCount }}个
              </template>
            </el-table-column>
            <el-table-column prop="exceptionCount" label="异常数" width="100">
              <template #default="{ row }">
                {{ row.exceptionCount }}个
              </template>
            </el-table-column>
            <el-table-column prop="totalDistance" label="总里程" width="100">
              <template #default="{ row }">
                {{ row.totalDistance }}km
              </template>
            </el-table-column>
            <el-table-column prop="rating" label="评分" width="120">
              <template #default="{ row }">
                <el-rate v-model="row.rating" disabled show-score text-color="#ff9900" />
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-dialog>

    <!-- 实时位置对话框 -->
    <el-dialog
      v-model="locationDialogVisible"
      :title="currentDriver ? currentDriver.name + ' 的实时位置' : '实时位置'"
      width="800px"
    >
      <div class="map-container" style="height: 500px;">
        <!-- 这里将集成高德地图组件 -->
        <div id="location-map" style="height: 100%;"></div>
      </div>
    </el-dialog>

    <!-- 异常上报对话框 -->
    <el-dialog
      v-model="exceptionDialogVisible"
      title="异常上报"
      width="500px"
    >
      <el-form
        ref="exceptionFormRef"
        :model="exceptionForm"
        :rules="exceptionRules"
        label-width="80px"
      >
        <el-form-item label="异常类型" prop="type">
          <el-select v-model="exceptionForm.type" placeholder="请选择异常类型">
            <el-option label="车辆故障" value="vehicle_breakdown" />
            <el-option label="交通事故" value="traffic_accident" />
            <el-option label="路线阻塞" value="route_blocked" />
            <el-option label="其他" value="other" />
          </el-select>
        </el-form-item>
        <el-form-item label="严重程度" prop="severity">
          <el-select v-model="exceptionForm.severity" placeholder="请选择严重程度">
            <el-option label="轻微" value="low" />
            <el-option label="一般" value="medium" />
            <el-option label="严重" value="high" />
          </el-select>
        </el-form-item>
        <el-form-item label="详细说明" prop="description">
          <el-input
            v-model="exceptionForm.description"
            type="textarea"
            rows="3"
            placeholder="请输入详细说明"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="exceptionDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitException" :loading="submitting">
            确定
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import {
  Search,
  Refresh
} from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

export default {
  name: 'DriverManagement',
  components: {
    Search,
    Refresh
  },
  setup() {
    const loading = ref(false)
    const submitting = ref(false)
    const currentPage = ref(1)
    const pageSize = ref(10)
    const total = ref(100)
    const listType = ref('all')
    const autoRefresh = ref(true)
    let refreshTimer = null

    // 搜索表单
    const searchForm = ref({
      name: '',
      carNumber: '',
      status: ''
    })

    // 当前选中的司机
    const currentDriver = ref(null)

    // 对话框显示状态
    const taskDialogVisible = ref(false)
    const locationDialogVisible = ref(false)
    const exceptionDialogVisible = ref(false)

    // 任务标签页
    const taskTab = ref('today')

    // 异常表单
    const exceptionFormRef = ref(null)
    const exceptionForm = ref({
      type: '',
      severity: '',
      description: ''
    })

    // 表单验证规则
    const exceptionRules = {
      type: [
        { required: true, message: '请选择异常类型', trigger: 'change' }
      ],
      severity: [
        { required: true, message: '请选择严重程度', trigger: 'change' }
      ],
      description: [
        { required: true, message: '请输入详细说明', trigger: 'blur' }
      ]
    }

    // 模拟司机数据
    const drivers = ref([
      {
        id: 1,
        name: '张三',
        phone: '13800138001',
        carNumber: '京A12345',
        carType: '面包车',
        status: 'online',
        location: '北京市朝阳区建国路',
        taskCount: 5,
        completedCount: 3,
        exceptionCount: 0,
        totalDistance: 120,
        availableSpace: 2.5,
        rating: 4.5
      },
      {
        id: 2,
        name: '李四',
        phone: '13800138002',
        carNumber: '京B12345',
        carType: '货车',
        status: 'delivering',
        location: '北京市海淀区中关村',
        taskCount: 3,
        completedCount: 1,
        exceptionCount: 1,
        totalDistance: 80,
        availableSpace: 1.8,
        rating: 4.0
      }
    ])

    // 模拟统计数据
    const stats = ref({
      onlineCount: 8,
      deliveringCount: 5,
      completedTaskCount: 25,
      exceptionCount: 2
    })

    // 模拟实时动态
    const activities = ref([
      {
        id: 1,
        time: '10:00',
        type: 'success',
        content: '司机张三完成配送任务 #12345'
      },
      {
        id: 2,
        time: '09:30',
        type: 'warning',
        content: '司机李四报告路线阻塞，预计延迟30分钟'
      }
    ])

    // 模拟当前任务数据
    const currentTasks = ref([
      {
        id: 'T12345',
        fromStation: '北京站',
        toStation: '上海站',
        packageCount: 10,
        totalWeight: 50,
        distance: 1200,
        status: 'delivering',
        createTime: '2024-03-10 14:30:00'
      }
    ])

    // 模拟历史任务数据
    const historyTasks = ref([
      {
        date: '2024-03-09',
        taskCount: 8,
        completedCount: 8,
        exceptionCount: 0,
        totalDistance: 300,
        rating: 5
      }
    ])

    // 根据筛选条件过滤司机
    const filteredDrivers = computed(() => {
      let result = drivers.value
      if (listType.value !== 'all') {
        result = result.filter(driver => driver.status === listType.value)
      }
      return result
    })

    // 获取状态类型
    const getStatusType = (status) => {
      const types = {
        online: 'success',
        offline: 'info',
        delivering: 'primary',
        rest: 'warning'
      }
      return types[status] || 'info'
    }

    // 获取状态文本
    const getStatusText = (status) => {
      const texts = {
        online: '在线',
        offline: '离线',
        delivering: '配送中',
        rest: '休息'
      }
      return texts[status] || '未知'
    }

    // 获取任务状态类型
    const getTaskStatusType = (status) => {
      const types = {
        pending: 'info',
        delivering: 'primary',
        completed: 'success',
        exception: 'danger'
      }
      return types[status] || 'info'
    }

    // 获取任务状态文本
    const getTaskStatusText = (status) => {
      const texts = {
        pending: '待配送',
        delivering: '配送中',
        completed: '已完成',
        exception: '异常'
      }
      return texts[status] || '未知'
    }

    // 搜索
    const handleSearch = () => {
      loading.value = true
      // TODO: 调用搜索API
      setTimeout(() => {
        loading.value = false
        ElMessage.success('搜索成功')
      }, 1000)
    }

    // 重置搜索
    const resetSearch = () => {
      searchForm.value = {
        name: '',
        carNumber: '',
        status: ''
      }
      handleSearch()
    }

    // 查看任务详情
    const viewTasks = (driver) => {
      currentDriver.value = driver
      taskDialogVisible.value = true
    }

    // 查看实时位置
    const viewLocation = (driver) => {
      currentDriver.value = driver
      locationDialogVisible.value = true
      // TODO: 初始化地图并显示司机位置
    }

    // 处理异常
    const handleException = (driver) => {
      currentDriver.value = driver
      exceptionForm.value = {
        type: '',
        severity: '',
        description: ''
      }
      exceptionDialogVisible.value = true
    }

    // 提交异常
    const submitException = async () => {
      if (!exceptionFormRef.value) return

      try {
        await exceptionFormRef.value.validate()
        submitting.value = true

        // TODO: 调用异常上报API
        await new Promise(resolve => setTimeout(resolve, 1000))

        exceptionDialogVisible.value = false
        ElMessage.success('异常上报成功')
      } catch (error) {
        console.error('异常上报失败:', error)
      } finally {
        submitting.value = false
      }
    }

    // 切换自动刷新
    const toggleAutoRefresh = (value) => {
      if (value) {
        refreshTimer = setInterval(() => {
          // TODO: 刷新实时数据
        }, 30000)
      } else if (refreshTimer) {
        clearInterval(refreshTimer)
      }
    }

    // 处理分页大小变化
    const handleSizeChange = (val) => {
      pageSize.value = val
      handleSearch()
    }

    // 处理页码变化
    const handleCurrentChange = (val) => {
      currentPage.value = val
      handleSearch()
    }

    onMounted(() => {
      if (autoRefresh.value) {
        toggleAutoRefresh(true)
      }
    })

    onUnmounted(() => {
      if (refreshTimer) {
        clearInterval(refreshTimer)
      }
    })

    return {
      loading,
      submitting,
      currentPage,
      pageSize,
      total,
      listType,
      autoRefresh,
      searchForm,
      currentDriver,
      taskDialogVisible,
      locationDialogVisible,
      exceptionDialogVisible,
      taskTab,
      exceptionFormRef,
      exceptionForm,
      exceptionRules,
      drivers,
      stats,
      activities,
      currentTasks,
      historyTasks,
      filteredDrivers,
      getStatusType,
      getStatusText,
      getTaskStatusType,
      getTaskStatusText,
      handleSearch,
      resetSearch,
      viewTasks,
      viewLocation,
      handleException,
      submitException,
      toggleAutoRefresh,
      handleSizeChange,
      handleCurrentChange
    }
  }
}
</script>

<style scoped>
.driver-management {
  padding: 20px;
}

.search-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header span {
  font-size: 16px;
  font-weight: bold;
}

.monitor-card {
  height: calc(100vh - 180px);
}

.monitor-stats {
  padding: 16px;
}

.stat-card {
  background-color: var(--el-color-primary-light-9);
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
  text-align: center;
}

.stat-value {
  font-size: 24px;
  font-weight: bold;
  color: var(--el-color-primary);
  line-height: 1;
  margin-bottom: 8px;
}

.stat-label {
  font-size: 14px;
  color: var(--el-text-color-secondary);
}

.monitor-activities {
  padding: 16px;
}

.section-title {
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 16px;
  color: var(--el-text-color-primary);
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

:deep(.el-timeline-item__content) {
  color: var(--el-text-color-regular);
}

:deep(.el-descriptions) {
  padding: 16px;
}
</style> 