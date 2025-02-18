<template>
  <div class="package-container">
    <!-- 包裹统计卡片 -->
    <el-row :gutter="20" class="statistics">
      <el-col :span="6">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>待发货</span>
              <el-tag type="warning">{{ pendingCount }}</el-tag>
            </div>
          </template>
          <div class="card-body">
            <el-progress
              type="dashboard"
              :percentage="Math.round((pendingCount / totalCount) * 100)"
              :color="'#E6A23C'"
            />
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>运输中</span>
              <el-tag type="primary">{{ inTransitCount }}</el-tag>
            </div>
          </template>
          <div class="card-body">
            <el-progress
              type="dashboard"
              :percentage="Math.round((inTransitCount / totalCount) * 100)"
              :color="'#409EFF'"
            />
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>待取件</span>
              <el-tag type="success">{{ readyForPickupCount }}</el-tag>
            </div>
          </template>
          <div class="card-body">
            <el-progress
              type="dashboard"
              :percentage="Math.round((readyForPickupCount / totalCount) * 100)"
              :color="'#67C23A'"
            />
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>已完成</span>
              <el-tag type="info">{{ completedCount }}</el-tag>
            </div>
          </template>
          <div class="card-body">
            <el-progress
              type="dashboard"
              :percentage="Math.round((completedCount / totalCount) * 100)"
              :color="'#909399'"
            />
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 包裹列表 -->
    <el-card class="package-list">
      <template #header>
        <div class="list-header">
          <h3>我的包裹</h3>
          <div class="header-actions">
            <el-input
              v-model="searchQuery"
              placeholder="搜索包裹编号/目的地"
              clearable
              style="width: 200px; margin-right: 16px;"
            >
              <template #prefix>
                <el-icon><Search /></el-icon>
              </template>
            </el-input>
            <el-select
              v-model="statusFilter"
              placeholder="状态筛选"
              clearable
              style="width: 120px; margin-right: 16px;"
            >
              <el-option label="待发货" value="pending" />
              <el-option label="运输中" value="in_transit" />
              <el-option label="待取件" value="ready_for_pickup" />
              <el-option label="已完成" value="completed" />
            </el-select>
            <el-button type="primary" @click="handleCreatePackage">
              新建包裹
            </el-button>
          </div>
        </div>
      </template>

      <el-table
        :data="filteredPackages"
        style="width: 100%"
        v-loading="loading"
      >
        <el-table-column prop="id" label="包裹编号" width="120" />
        <el-table-column prop="type" label="类型" width="100">
          <template #default="{ row }">
            <el-tag :type="row.type === 'express' ? 'primary' : 'success'">
              {{ row.type === 'express' ? '快递' : '普通' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="from" label="发货地址" show-overflow-tooltip />
        <el-table-column prop="to" label="收货地址" show-overflow-tooltip />
        <el-table-column prop="weight" label="重量" width="100">
          <template #default="{ row }">
            {{ row.weight }}kg
          </template>
        </el-table-column>
        <el-table-column prop="price" label="运费" width="100">
          <template #default="{ row }">
            ¥{{ row.price.toFixed(2) }}
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="120">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button
              type="primary"
              link
              @click="handleViewDetails(row)"
            >
              详情
            </el-button>
            <el-button
              type="success"
              link
              @click="handleTrack(row)"
              v-if="row.status === 'in_transit'"
            >
              追踪
            </el-button>
            <el-button
              type="danger"
              link
              @click="handleCancel(row)"
              v-if="row.status === 'pending'"
            >
              取消
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :total="totalPackages"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 新建包裹对话框 -->
    <el-dialog
      v-model="createDialogVisible"
      title="新建包裹"
      width="600px"
    >
      <el-form
        ref="createFormRef"
        :model="createForm"
        :rules="createRules"
        label-width="100px"
      >
        <el-form-item label="包裹类型" prop="type">
          <el-select v-model="createForm.type" placeholder="请选择包裹类型">
            <el-option label="快递" value="express" />
            <el-option label="普通" value="normal" />
          </el-select>
        </el-form-item>
        <el-form-item label="发货地址" prop="from">
          <el-input v-model="createForm.from" placeholder="请输入发货地址" />
        </el-form-item>
        <el-form-item label="收货地址" prop="to">
          <el-input v-model="createForm.to" placeholder="请输入收货地址" />
        </el-form-item>
        <el-form-item label="包裹重量" prop="weight">
          <el-input-number
            v-model="createForm.weight"
            :min="0.1"
            :max="100"
            :step="0.1"
            :precision="1"
          />
          <span class="unit">kg</span>
        </el-form-item>
        <el-form-item label="包裹尺寸" prop="size">
          <el-input-number
            v-model="createForm.length"
            :min="1"
            :max="100"
            :step="1"
            placeholder="长"
          />
          <span class="unit">×</span>
          <el-input-number
            v-model="createForm.width"
            :min="1"
            :max="100"
            :step="1"
            placeholder="宽"
          />
          <span class="unit">×</span>
          <el-input-number
            v-model="createForm.height"
            :min="1"
            :max="100"
            :step="1"
            placeholder="高"
          />
          <span class="unit">cm</span>
        </el-form-item>
        <el-form-item label="备注" prop="notes">
          <el-input
            v-model="createForm.notes"
            type="textarea"
            :rows="3"
            placeholder="请输入包裹备注信息"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="createDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSubmitCreate">
            确认创建
          </el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 包裹详情对话框 -->
    <el-dialog
      v-model="detailsDialogVisible"
      :title="currentPackage ? '包裹详情 - ' + currentPackage.id : '包裹详情'"
      width="800px"
    >
      <el-descriptions :column="2" border v-if="currentPackage">
        <el-descriptions-item label="包裹编号">{{ currentPackage.id }}</el-descriptions-item>
        <el-descriptions-item label="包裹类型">
          <el-tag :type="currentPackage.type === 'express' ? 'primary' : 'success'">
            {{ currentPackage.type === 'express' ? '快递' : '普通' }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="发货地址">{{ currentPackage.from }}</el-descriptions-item>
        <el-descriptions-item label="收货地址">{{ currentPackage.to }}</el-descriptions-item>
        <el-descriptions-item label="包裹重量">{{ currentPackage.weight }}kg</el-descriptions-item>
        <el-descriptions-item label="包裹尺寸">
          {{ currentPackage.length }}×{{ currentPackage.width }}×{{ currentPackage.height }}cm
        </el-descriptions-item>
        <el-descriptions-item label="运费">¥{{ currentPackage.price.toFixed(2) }}</el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="getStatusType(currentPackage.status)">
            {{ getStatusText(currentPackage.status) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ currentPackage.createTime }}</el-descriptions-item>
        <el-descriptions-item label="更新时间">{{ currentPackage.updateTime }}</el-descriptions-item>
        <el-descriptions-item label="备注" :span="2">{{ currentPackage.notes || '无' }}</el-descriptions-item>
      </el-descriptions>

      <el-timeline v-if="currentPackage && currentPackage.timeline">
        <el-timeline-item
          v-for="(activity, index) in currentPackage.timeline"
          :key="index"
          :timestamp="activity.time"
          :type="activity.type"
        >
          {{ activity.content }}
        </el-timeline-item>
      </el-timeline>
    </el-dialog>

    <!-- 包裹追踪对话框 -->
    <el-dialog
      v-model="trackDialogVisible"
      title="包裹追踪"
      width="800px"
    >
      <div class="track-map" v-if="currentPackage">
        <div id="trackMap" style="height: 400px;"></div>
      </div>
      <el-timeline v-if="currentPackage && currentPackage.timeline">
        <el-timeline-item
          v-for="(activity, index) in currentPackage.timeline"
          :key="index"
          :timestamp="activity.time"
          :type="activity.type"
        >
          {{ activity.content }}
        </el-timeline-item>
      </el-timeline>
    </el-dialog>
  </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search } from '@element-plus/icons-vue'

export default {
  name: 'PackageManagement',
  components: {
    Search
  },
  setup() {
    const loading = ref(false)
    const searchQuery = ref('')
    const statusFilter = ref('')
    const currentPage = ref(1)
    const pageSize = ref(10)
    const createDialogVisible = ref(false)
    const detailsDialogVisible = ref(false)
    const trackDialogVisible = ref(false)
    const currentPackage = ref(null)
    let trackMap = null

    // 模拟包裹数据
    const packages = ref([
      {
        id: 'P001',
        type: 'express',
        from: '北京市海淀区中关村大街1号',
        to: '上海市浦东新区陆家嘴1号',
        weight: 2.5,
        length: 30,
        width: 20,
        height: 15,
        price: 25.5,
        status: 'pending',
        createTime: '2024-03-20 10:00:00',
        updateTime: '2024-03-20 10:00:00',
        notes: '易碎品，请小心处理',
        timeline: [
          {
            time: '2024-03-20 10:00:00',
            content: '包裹已创建',
            type: 'primary'
          }
        ]
      },
      {
        id: 'P002',
        type: 'normal',
        from: '广州市天河区天河路1号',
        to: '深圳市南山区科技园2号',
        weight: 1.8,
        length: 25,
        width: 18,
        height: 12,
        price: 18.0,
        status: 'in_transit',
        createTime: '2024-03-19 15:30:00',
        updateTime: '2024-03-20 09:15:00',
        notes: '生鲜食品，加急配送',
        timeline: [
          {
            time: '2024-03-19 15:30:00',
            content: '包裹已创建',
            type: 'primary'
          },
          {
            time: '2024-03-19 16:00:00',
            content: '包裹已揽收',
            type: 'success'
          },
          {
            time: '2024-03-20 09:15:00',
            content: '包裹运输中',
            type: 'warning'
          }
        ]
      }
    ])

    // 统计数据
    const pendingCount = computed(() => 
      packages.value.filter(p => p.status === 'pending').length
    )
    const inTransitCount = computed(() => 
      packages.value.filter(p => p.status === 'in_transit').length
    )
    const readyForPickupCount = computed(() => 
      packages.value.filter(p => p.status === 'ready_for_pickup').length
    )
    const completedCount = computed(() => 
      packages.value.filter(p => p.status === 'completed').length
    )
    const totalCount = computed(() => packages.value.length)

    // 筛选后的包裹列表
    const filteredPackages = computed(() => {
      let result = packages.value

      if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase()
        result = result.filter(p => 
          p.id.toLowerCase().includes(query) ||
          p.to.toLowerCase().includes(query)
        )
      }

      if (statusFilter.value) {
        result = result.filter(p => p.status === statusFilter.value)
      }

      return result
    })

    const totalPackages = computed(() => filteredPackages.value.length)

    // 表单相关
    const createFormRef = ref(null)
    const createForm = ref({
      type: 'express',
      from: '',
      to: '',
      weight: 1,
      length: 20,
      width: 20,
      height: 20,
      notes: ''
    })

    const createRules = {
      type: [{ required: true, message: '请选择包裹类型', trigger: 'change' }],
      from: [{ required: true, message: '请输入发货地址', trigger: 'blur' }],
      to: [{ required: true, message: '请输入收货地址', trigger: 'blur' }],
      weight: [{ required: true, message: '请输入包裹重量', trigger: 'blur' }]
    }

    const getStatusType = (status) => {
      const types = {
        pending: 'warning',
        in_transit: 'primary',
        ready_for_pickup: 'success',
        completed: 'info'
      }
      return types[status] || 'info'
    }

    const getStatusText = (status) => {
      const texts = {
        pending: '待发货',
        in_transit: '运输中',
        ready_for_pickup: '待取件',
        completed: '已完成'
      }
      return texts[status] || status
    }

    const handleSizeChange = (val) => {
      pageSize.value = val
      currentPage.value = 1
    }

    const handleCurrentChange = (val) => {
      currentPage.value = val
    }

    const handleCreatePackage = () => {
      createForm.value = {
        type: 'express',
        from: '',
        to: '',
        weight: 1,
        length: 20,
        width: 20,
        height: 20,
        notes: ''
      }
      createDialogVisible.value = true
    }

    const handleSubmitCreate = async () => {
      if (!createFormRef.value) return

      try {
        await createFormRef.value.validate()
        
        loading.value = true
        // TODO: 调用API创建包裹
        await new Promise(resolve => setTimeout(resolve, 1000))

        const newPackage = {
          id: `P${String(packages.value.length + 1).padStart(3, '0')}`,
          ...createForm.value,
          price: createForm.value.weight * 10, // 模拟计算运费
          status: 'pending',
          createTime: new Date().toLocaleString(),
          updateTime: new Date().toLocaleString(),
          timeline: [
            {
              time: new Date().toLocaleString(),
              content: '包裹已创建',
              type: 'primary'
            }
          ]
        }

        packages.value.unshift(newPackage)
        createDialogVisible.value = false
        ElMessage.success('包裹创建成功')
      } catch (error) {
        console.error('创建包裹失败:', error)
        ElMessage.error('创建包裹失败，请检查表单')
      } finally {
        loading.value = false
      }
    }

    const handleViewDetails = (pkg) => {
      currentPackage.value = pkg
      detailsDialogVisible.value = true
    }

    const handleTrack = (pkg) => {
      currentPackage.value = pkg
      trackDialogVisible.value = true
      
      // 在对话框打开后初始化地图
      setTimeout(() => {
        if (!trackMap) {
          trackMap = new AMap.Map('trackMap', {
            zoom: 12,
            center: [116.397428, 39.90923]
          })
        }
        // TODO: 在地图上显示包裹位置和路线
      }, 0)
    }

    const handleCancel = async (pkg) => {
      try {
        await ElMessageBox.confirm(
          '确定要取消这个包裹吗？',
          '提示',
          {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }
        )

        loading.value = true
        // TODO: 调用API取消包裹
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        const index = packages.value.findIndex(p => p.id === pkg.id)
        if (index !== -1) {
          packages.value.splice(index, 1)
        }

        ElMessage.success('包裹已取消')
      } catch (error) {
        console.error('取消包裹失败:', error)
        if (error !== 'cancel') {
          ElMessage.error('取消包裹失败')
        }
      } finally {
        loading.value = false
      }
    }

    onMounted(() => {
      // TODO: 获取包裹列表
    })

    onUnmounted(() => {
      if (trackMap) {
        trackMap.destroy()
        trackMap = null
      }
    })

    return {
      loading,
      searchQuery,
      statusFilter,
      currentPage,
      pageSize,
      createDialogVisible,
      detailsDialogVisible,
      trackDialogVisible,
      currentPackage,
      packages,
      filteredPackages,
      totalPackages,
      pendingCount,
      inTransitCount,
      readyForPickupCount,
      completedCount,
      totalCount,
      createFormRef,
      createForm,
      createRules,
      getStatusType,
      getStatusText,
      handleSizeChange,
      handleCurrentChange,
      handleCreatePackage,
      handleSubmitCreate,
      handleViewDetails,
      handleTrack,
      handleCancel
    }
  }
}
</script>

<style scoped>
.package-container {
  padding: 20px;
}

.statistics {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-body {
  display: flex;
  justify-content: center;
  padding: 20px 0;
}

.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.list-header h3 {
  margin: 0;
  font-size: 18px;
  color: #303133;
}

.header-actions {
  display: flex;
  align-items: center;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.unit {
  margin: 0 8px;
  color: #909399;
}

:deep(.el-timeline-item__content) {
  color: #606266;
}
</style> 