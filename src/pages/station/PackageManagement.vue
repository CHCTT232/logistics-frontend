<template>
  <div class="package-management">
    <!-- 搜索和筛选 -->
    <el-card class="search-card" shadow="hover">
      <el-form :model="searchForm" inline>
        <el-form-item label="运单号">
          <el-input
            v-model="searchForm.trackingNumber"
            placeholder="请输入运单号"
            clearable
          />
        </el-form-item>
        <el-form-item label="状态">
          <el-select
            v-model="searchForm.status"
            placeholder="请选择状态"
            clearable
          >
            <el-option label="待入库" value="pending" />
            <el-option label="已入库" value="stored" />
            <el-option label="待分配" value="unassigned" />
            <el-option label="已分配" value="assigned" />
            <el-option label="运输中" value="delivering" />
            <el-option label="已完成" value="completed" />
            <el-option label="异常" value="exception" />
          </el-select>
        </el-form-item>
        <el-form-item label="时间范围">
          <el-date-picker
            v-model="searchForm.dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="YYYY-MM-DD"
          />
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
          <el-button type="success" @click="showStorageDialog">
            <el-icon><Plus /></el-icon>
            入库登记
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-row :gutter="20" style="margin-top: 20px;">
      <!-- 包裹列表 -->
      <el-col :span="18">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>包裹列表</span>
              <el-radio-group v-model="listType" size="small">
                <el-radio-button :value="'all'">全部</el-radio-button>
                <el-radio-button :value="'today'">今日</el-radio-button>
                <el-radio-button :value="'unassigned'">待分配</el-radio-button>
              </el-radio-group>
            </div>
          </template>

          <el-table
            :data="filteredPackages"
            style="width: 100%"
            v-loading="loading"
          >
            <el-table-column prop="trackingNumber" label="运单号" width="180" />
            <el-table-column prop="fromStation" label="发货站点" width="120" />
            <el-table-column prop="toStation" label="目的站点" width="120" />
            <el-table-column label="尺寸" width="140">
              <template #default="{ row }">
                {{ row.length }}×{{ row.width }}×{{ row.height }}cm
              </template>
            </el-table-column>
            <el-table-column prop="weight" label="重量" width="100">
              <template #default="{ row }">
                {{ row.weight }}kg
              </template>
            </el-table-column>
            <el-table-column prop="storageLocation" label="储位" width="100" />
            <el-table-column prop="status" label="状态" width="100">
              <template #default="{ row }">
                <el-tag :type="getStatusType(row.status)">
                  {{ getStatusText(row.status) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="createTime" label="创建时间" width="180" />
            <el-table-column label="操作" width="200" fixed="right">
              <template #default="{ row }">
                <el-button
                  v-if="row.status === 'stored'"
                  type="primary"
                  link
                  @click="assignPackage(row)"
                >
                  分配司机
                </el-button>
                <el-button
                  v-if="row.status === 'exception'"
                  type="warning"
                  link
                  @click="handleException(row)"
                >
                  处理异常
                </el-button>
                <el-button
                  type="primary"
                  link
                  @click="viewPackageDetail(row)"
                >
                  查看详情
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

      <!-- 储物箱状态 -->
      <el-col :span="6">
        <el-card class="storage-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <span>储物箱状态</span>
              <el-button type="primary" link @click="manageStorage">
                管理储位
              </el-button>
            </div>
          </template>

          <div class="storage-stats">
            <div class="stat-item">
              <div class="stat-label">总容量</div>
              <div class="stat-value">{{ storageStats.totalVolume }}m³</div>
            </div>
            <div class="stat-item">
              <div class="stat-label">已使用</div>
              <div class="stat-value">{{ storageStats.usedVolume }}m³</div>
            </div>
            <div class="stat-item">
              <div class="stat-label">使用率</div>
              <el-progress
                :percentage="storageStats.usagePercentage"
                :status="storageStats.usagePercentage > 80 ? 'exception' : ''"
              />
            </div>
          </div>

          <el-divider>储位使用情况</el-divider>

          <el-scrollbar height="400px">
            <div class="storage-grid">
              <div
                v-for="cell in storageCells"
                :key="cell.id"
                class="storage-cell"
                :class="{
                  'cell-occupied': cell.occupied,
                  'cell-selected': selectedCell?.id === cell.id
                }"
                @click="selectStorageCell(cell)"
              >
                <div class="cell-id">{{ cell.id }}</div>
                <div class="cell-status">
                  {{ cell.occupied ? '已占用' : '空闲' }}
                </div>
                <div class="cell-info" v-if="cell.occupied">
                  {{ cell.packageId }}
                </div>
              </div>
            </div>
          </el-scrollbar>
        </el-card>
      </el-col>
    </el-row>

    <!-- 入库登记对话框 -->
    <el-dialog
      v-model="storageDialogVisible"
      title="包裹入库"
      width="600px"
    >
      <el-form
        ref="storageFormRef"
        :model="storageForm"
        :rules="storageRules"
        label-width="100px"
      >
        <el-form-item label="运单号" prop="trackingNumber">
          <el-input
            v-model="storageForm.trackingNumber"
            placeholder="请输入运单号"
          />
        </el-form-item>
        <el-form-item label="目的站点" prop="toStation">
          <el-select
            v-model="storageForm.toStation"
            placeholder="请选择目的站点"
            filterable
          >
            <el-option
              v-for="station in stations"
              :key="station.id"
              :label="station.name"
              :value="station.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="包裹尺寸">
          <el-row :gutter="10">
            <el-col :span="8">
              <el-form-item prop="length">
                <el-input-number
                  v-model="storageForm.length"
                  :min="20"
                  :step="20"
                  :step-strictly="true"
                  placeholder="长"
                />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item prop="width">
                <el-input-number
                  v-model="storageForm.width"
                  :min="20"
                  :step="20"
                  :step-strictly="true"
                  placeholder="宽"
                />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item prop="height">
                <el-input-number
                  v-model="storageForm.height"
                  :min="3"
                  :step="3"
                  :step-strictly="true"
                  placeholder="高"
                />
              </el-form-item>
            </el-col>
          </el-row>
        </el-form-item>
        <el-form-item label="重量(kg)" prop="weight">
          <el-input-number
            v-model="storageForm.weight"
            :min="0.1"
            :precision="1"
            :step="0.1"
          />
        </el-form-item>
        <el-form-item label="储位" prop="storageLocation">
          <el-select
            v-model="storageForm.storageLocation"
            placeholder="请选择储位"
          >
            <el-option
              v-for="cell in availableStorageCells"
              :key="cell.id"
              :label="cell.id"
              :value="cell.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="备注" prop="notes">
          <el-input
            v-model="storageForm.notes"
            type="textarea"
            rows="3"
            placeholder="请输入备注信息（选填）"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="storageDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitStorage" :loading="submitting">
            确定
          </el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 分配司机对话框 -->
    <el-dialog
      v-model="assignDialogVisible"
      title="分配司机"
      width="500px"
    >
      <el-form
        ref="assignFormRef"
        :model="assignForm"
        :rules="assignRules"
        label-width="80px"
      >
        <el-form-item label="司机" prop="driverId">
          <el-select
            v-model="assignForm.driverId"
            placeholder="请选择司机"
            filterable
          >
            <el-option
              v-for="driver in availableDrivers"
              :key="driver.id"
              :label="driver.name"
              :value="driver.id"
            >
              <div class="driver-option">
                <span>{{ driver.name }}</span>
                <span class="driver-info">
                  {{ driver.carNumber }} | 
                  剩余空间: {{ driver.availableSpace }}m³
                </span>
              </div>
            </el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="assignDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitAssign" :loading="submitting">
            确定
          </el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 异常处理对话框 -->
    <el-dialog
      v-model="exceptionDialogVisible"
      title="异常处理"
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
            <el-option label="包裹破损" value="damaged" />
            <el-option label="包裹丢失" value="lost" />
            <el-option label="地址错误" value="wrong_address" />
            <el-option label="其他" value="other" />
          </el-select>
        </el-form-item>
        <el-form-item label="处理方式" prop="solution">
          <el-select v-model="exceptionForm.solution" placeholder="请选择处理方式">
            <el-option label="重新包装" value="repack" />
            <el-option label="退回发件人" value="return" />
            <el-option label="联系收件人" value="contact" />
            <el-option label="其他" value="other" />
          </el-select>
        </el-form-item>
        <el-form-item label="备注" prop="notes">
          <el-input
            v-model="exceptionForm.notes"
            type="textarea"
            rows="3"
            placeholder="请输入处理备注"
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
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Refresh, Plus } from '@element-plus/icons-vue'
import request from '@/utils/request'
import { API_ENDPOINTS } from '@/config'

export default {
  name: 'PackageManagement',
  components: {
    Search,
    Refresh,
    Plus
  },
  setup() {
    const router = useRouter()
    const loading = ref(false)
    const submitting = ref(false)
    const currentPage = ref(1)
    const pageSize = ref(10)
    const total = ref(100)
    const listType = ref('all')
    const selectedCell = ref(null)

    // 搜索表单
    const searchForm = ref({
      trackingNumber: '',
      status: '',
      dateRange: []
    })

    // 入库表单
    const storageDialogVisible = ref(false)
    const storageFormRef = ref(null)
    const storageForm = ref({
      trackingNumber: '',
      toStation: '',
      length: 20,
      width: 20,
      height: 3,
      weight: 0.1,
      storageLocation: '',
      notes: ''
    })

    // 分配表单
    const assignDialogVisible = ref(false)
    const assignFormRef = ref(null)
    const assignForm = ref({
      driverId: ''
    })

    // 异常处理表单
    const exceptionDialogVisible = ref(false)
    const exceptionFormRef = ref(null)
    const exceptionForm = ref({
      type: '',
      solution: '',
      notes: ''
    })

    // 数据定义
    const stations = ref([])
    const packages = ref([])
    const storageStats = ref({
      totalVolume: 0,
      usedVolume: 0,
      usagePercentage: 0
    })
    const storageCells = ref([])
    const availableDrivers = ref([])

    // 获取包裹列表
    const fetchPackages = async () => {
      try {
        loading.value = true
        const response = await request({
          url: API_ENDPOINTS.STATION.PACKAGES,
          method: 'get',
          params: {
            page: currentPage.value,
            limit: pageSize.value,
            ...searchForm.value
          }
        })
        
        if (response && response.data) {
          packages.value = response.data.packages
          total.value = response.data.total
        }
      } catch (error) {
        console.error('获取包裹数据失败:', error)
        ElMessage.error('获取包裹列表失败')
      } finally {
        loading.value = false
      }
    }

    // 获取储物箱数据
    const fetchStorageData = async () => {
      try {
        const [statsResponse, cellsResponse] = await Promise.all([
          request({
            url: API_ENDPOINTS.STATION.STORAGE_STATS,
            method: 'get'
          }),
          request({
            url: API_ENDPOINTS.STATION.STORAGE_CELLS,
            method: 'get'
          })
        ])
        
        if (statsResponse && statsResponse.data) {
          storageStats.value = statsResponse.data
        }
        if (cellsResponse && cellsResponse.data && cellsResponse.data.cells) {
          storageCells.value = cellsResponse.data.cells
        }
      } catch (error) {
        console.error('获取储物箱数据失败:', error)
        ElMessage.error('获取储物箱数据失败')
      }
    }

    // 获取站点列表
    const fetchStations = async () => {
      try {
        loading.value = true
        const response = await request({
          url: API_ENDPOINTS.STATION.LIST,
          method: 'get'
        })
        
        if (response && response.data) {
          stations.value = response.data.stations
        }
      } catch (error) {
        console.error('获取站点数据失败:', error)
        ElMessage.error('获取站点列表失败')
      } finally {
        loading.value = false
      }
    }

    // 获取可用司机列表
    const fetchAvailableDrivers = async () => {
      try {
        const response = await request({
          url: API_ENDPOINTS.DRIVER.AVAILABLE_TASKS,
          method: 'get'
        })
        
        if (response && response.drivers) {
          availableDrivers.value = response.drivers
        }
      } catch (error) {
        console.error('获取司机数据失败:', error)
        ElMessage.error('获取可用司机列表失败')
      }
    }

    // 表单验证规则
    const storageRules = {
      trackingNumber: [
        { required: true, message: '请输入运单号', trigger: 'blur' }
      ],
      toStation: [
        { required: true, message: '请选择目的站点', trigger: 'change' }
      ],
      length: [
        { required: true, message: '请输入长度', trigger: 'blur' }
      ],
      width: [
        { required: true, message: '请输入宽度', trigger: 'blur' }
      ],
      height: [
        { required: true, message: '请输入高度', trigger: 'blur' }
      ],
      weight: [
        { required: true, message: '请输入重量', trigger: 'blur' }
      ],
      storageLocation: [
        { required: true, message: '请选择储位', trigger: 'change' }
      ]
    }

    const assignRules = {
      driverId: [
        { required: true, message: '请选择司机', trigger: 'change' }
      ]
    }

    const exceptionRules = {
      type: [
        { required: true, message: '请选择异常类型', trigger: 'change' }
      ],
      solution: [
        { required: true, message: '请选择处理方式', trigger: 'change' }
      ],
      notes: [
        { required: true, message: '请输入处理备注', trigger: 'blur' }
      ]
    }

    // 可用储位
    const availableStorageCells = computed(() => {
      return storageCells.value.filter(cell => !cell.occupied)
    })

    // 根据筛选条件过滤包裹
    const filteredPackages = computed(() => {
      let result = packages.value
      if (listType.value === 'today') {
        const today = new Date().toISOString().split('T')[0]
        result = result.filter(pkg => 
          pkg.createTime.startsWith(today)
        )
      } else if (listType.value === 'unassigned') {
        result = result.filter(pkg => 
          pkg.status === 'stored'
        )
      }
      return result
    })

    // 获取状态类型
    const getStatusType = (status) => {
      const types = {
        pending: 'info',
        stored: 'success',
        unassigned: 'warning',
        assigned: 'primary',
        delivering: 'success',
        completed: 'info',
        exception: 'danger'
      }
      return types[status] || 'info'
    }

    // 获取状态文本
    const getStatusText = (status) => {
      const texts = {
        pending: '待入库',
        stored: '已入库',
        unassigned: '待分配',
        assigned: '已分配',
        delivering: '运输中',
        completed: '已完成',
        exception: '异常'
      }
      return texts[status] || '未知'
    }

    // 搜索处理
    const handleSearch = async () => {
      loading.value = true
      try {
        await fetchPackages()
      } catch (error) {
        console.error('搜索失败:', error)
        ElMessage.error('搜索失败')
      } finally {
        loading.value = false
      }
    }

    // 重置搜索
    const resetSearch = () => {
      searchForm.value = {
        trackingNumber: '',
        status: '',
        dateRange: []
      }
      handleSearch()
    }

    // 显示入库对话框
    const showStorageDialog = () => {
      storageForm.value = {
        trackingNumber: '',
        toStation: '',
        length: 20,
        width: 20,
        height: 3,
        weight: 0.1,
        storageLocation: '',
        notes: ''
      }
      storageDialogVisible.value = true
    }

    // 提交入库
    const submitStorage = async () => {
      if (!storageFormRef.value) return

      try {
        await storageFormRef.value.validate()
        submitting.value = true

        const response = await request({
          url: '/api/station/packages/storage',
          method: 'post',
          data: storageForm.value
        })
        
        if (response.data) {
          ElMessage.success('入库成功')
          storageDialogVisible.value = false
          // 刷新数据
          await Promise.all([
            fetchPackages(),
            fetchStorageData()
          ])
        }
      } catch (error) {
        console.error('入库失败:', error)
        ElMessage.error(error.response?.data?.error || '入库失败')
      } finally {
        submitting.value = false
      }
    }

    // 分配包裹给司机
    const assignPackage = (pkg) => {
      currentPackage.value = pkg
      assignForm.value = {
        driverId: '',
        packageId: pkg.id
      }
      assignDialogVisible.value = true
    }

    // 提交分配
    const submitAssign = async () => {
      if (!assignFormRef.value) return

      try {
        await assignFormRef.value.validate()
        submitting.value = true

        const response = await request({
          url: '/api/station/packages/assign',
          method: 'post',
          data: {
            packageId: currentPackage.value.id,
            driverId: assignForm.value.driverId
          }
        })

        if (response.data) {
          ElMessage.success('分配成功')
          assignDialogVisible.value = false
          // 刷新包裹列表
          await fetchPackages()
        }
      } catch (error) {
        console.error('分配失败:', error)
        ElMessage.error(error.response?.data?.error || '分配失败')
      } finally {
        submitting.value = false
      }
    }

    // 处理异常
    const handleException = (pkg) => {
      currentPackage.value = pkg
      exceptionForm.value = {
        type: '',
        solution: '',
        notes: '',
        packageId: pkg.id
      }
      exceptionDialogVisible.value = true
    }

    // 提交异常处理
    const submitException = async () => {
      if (!exceptionFormRef.value) return

      try {
        await exceptionFormRef.value.validate()
        submitting.value = true

        const response = await request({
          url: '/api/station/packages/exception',
          method: 'post',
          data: {
            packageId: currentPackage.value.id,
            exceptionType: exceptionForm.value.type,
            description: exceptionForm.value.notes
          }
        })

        if (response.data) {
          ElMessage.success('处理成功')
          exceptionDialogVisible.value = false
          // 刷新包裹列表
          await fetchPackages()
        }
      } catch (error) {
        console.error('处理失败:', error)
        ElMessage.error(error.response?.data?.error || '处理失败')
      } finally {
        submitting.value = false
      }
    }

    // 查看包裹详情
    const viewPackageDetail = (pkg) => {
      router.push({
        path: '/station/packages/detail',
        query: { id: pkg.trackingNumber }
      })
    }

    // 管理储位
    const manageStorage = () => {
      router.push('/station/storage')
    }

    // 选择储位
    const selectStorageCell = (cell) => {
      selectedCell.value = cell
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

    // 组件挂载时获取数据
    onMounted(async () => {
      loading.value = true
      try {
        await Promise.all([
          fetchStations(),
          fetchPackages(),
          fetchStorageData(),
          fetchAvailableDrivers()
        ])
      } catch (error) {
        console.error('初始化数据失败:', error)
        ElMessage.error('初始化数据失败')
      } finally {
        loading.value = false
      }
    })

    return {
      loading,
      submitting,
      currentPage,
      pageSize,
      total,
      listType,
      searchForm,
      storageDialogVisible,
      storageFormRef,
      storageForm,
      storageRules,
      assignDialogVisible,
      assignFormRef,
      assignForm,
      assignRules,
      exceptionDialogVisible,
      exceptionFormRef,
      exceptionForm,
      exceptionRules,
      stations,
      packages,
      storageStats,
      storageCells,
      selectedCell,
      availableDrivers,
      availableStorageCells,
      filteredPackages,
      getStatusType,
      getStatusText,
      handleSearch,
      resetSearch,
      showStorageDialog,
      submitStorage,
      assignPackage,
      submitAssign,
      handleException,
      submitException,
      viewPackageDetail,
      manageStorage,
      selectStorageCell,
      handleSizeChange,
      handleCurrentChange
    }
  }
}
</script>

<style scoped>
.package-management {
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

.storage-card {
  height: calc(100vh - 180px);
}

.storage-stats {
  padding: 16px;
}

.stat-item {
  margin-bottom: 16px;
}

.stat-label {
  font-size: 14px;
  color: var(--el-text-color-secondary);
  margin-bottom: 8px;
}

.stat-value {
  font-size: 24px;
  font-weight: bold;
  color: var(--el-text-color-primary);
}

.storage-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  padding: 16px;
}

.storage-cell {
  border: 1px solid var(--el-border-color);
  border-radius: 4px;
  padding: 12px;
  cursor: pointer;
  transition: all 0.3s;
}

.storage-cell:hover {
  border-color: var(--el-color-primary);
}

.cell-occupied {
  background-color: var(--el-color-success-light-9);
  border-color: var(--el-color-success);
}

.cell-selected {
  border-color: var(--el-color-primary);
  background-color: var(--el-color-primary-light-9);
}

.cell-id {
  font-weight: bold;
  margin-bottom: 4px;
}

.cell-status {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  margin-bottom: 4px;
}

.cell-info {
  font-size: 12px;
  color: var(--el-text-color-regular);
  word-break: break-all;
}

.driver-option {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.driver-info {
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style> 