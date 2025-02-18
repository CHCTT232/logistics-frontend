<template>
  <div class="my-packages">
    <!-- 搜索栏 -->
    <el-card class="search-card" shadow="never">
      <el-form :model="searchForm" inline>
        <el-form-item label="运单号">
          <el-input
            v-model="searchForm.tracking_number"
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
            <el-option label="待发货" value="pending" />
            <el-option label="运输中" value="in_transit" />
            <el-option label="已送达" value="delivered" />
            <el-option label="已完成" value="completed" />
            <el-option label="已取消" value="cancelled" />
          </el-select>
        </el-form-item>
        <el-form-item label="时间范围">
          <el-date-picker
            v-model="searchForm.date_range"
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
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 包裹列表 -->
    <el-card class="package-list" shadow="never">
      <template #header>
        <div class="card-header">
          <span>包裹列表</span>
          <el-button type="primary" @click="$router.push('/user/create-order')">
            创建订单
          </el-button>
        </div>
      </template>

      <el-table
        :data="packageList"
        style="width: 100%"
        v-loading="loading"
      >
        <el-table-column prop="tracking_number" label="运单号" width="180" />
        <el-table-column label="发货站点" width="180">
          <template #default="{ row }">
            {{ row.origin_station_name }}
          </template>
        </el-table-column>
        <el-table-column label="目的站点" width="180">
          <template #default="{ row }">
            {{ row.destination_station_name }}
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="创建时间" width="180">
          <template #default="{ row }">
            {{ formatDate(row.created_at) }}
          </template>
        </el-table-column>
        <el-table-column label="更新时间" width="180">
          <template #default="{ row }">
            {{ formatDate(row.updated_at) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="showPackageDetail(row)">
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

    <!-- 包裹详情对话框 -->
    <el-dialog
      v-model="detailDialogVisible"
      title="包裹详情"
      width="800px"
    >
      <el-descriptions :column="2" border v-if="currentPackage">
        <el-descriptions-item label="运单号">{{ currentPackage.tracking_number }}</el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="getStatusType(currentPackage.status)">
            {{ getStatusText(currentPackage.status) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="发货站点">{{ currentPackage.origin_station_name }}</el-descriptions-item>
        <el-descriptions-item label="目的站点">{{ currentPackage.destination_station_name }}</el-descriptions-item>
        <el-descriptions-item label="收件人">{{ currentPackage.receiver_name }}</el-descriptions-item>
        <el-descriptions-item label="收件人电话">{{ currentPackage.receiver_phone }}</el-descriptions-item>
        <el-descriptions-item label="收件地址">{{ currentPackage.receiver_address }}</el-descriptions-item>
        <el-descriptions-item label="司机信息">
          <template v-if="currentPackage.driver_name">
            {{ currentPackage.driver_name }} ({{ currentPackage.driver_phone }})
          </template>
          <template v-else>暂未分配</template>
        </el-descriptions-item>
        <el-descriptions-item label="包裹尺寸">
          {{ currentPackage.dimensions?.length }}×{{ currentPackage.dimensions?.width }}×{{ currentPackage.dimensions?.height }} cm
        </el-descriptions-item>
        <el-descriptions-item label="包裹重量">{{ currentPackage.weight }} kg</el-descriptions-item>
        <el-descriptions-item label="体积">{{ currentPackage.volume }} cm³</el-descriptions-item>
        <el-descriptions-item label="运费">¥{{ currentPackage.price }}</el-descriptions-item>
        <el-descriptions-item label="预计送达时间" v-if="currentPackage.estimated_delivery_time">
          {{ formatDate(currentPackage.estimated_delivery_time) }}
        </el-descriptions-item>
        <el-descriptions-item label="实际送达时间" v-if="currentPackage.actual_delivery_time">
          {{ formatDate(currentPackage.actual_delivery_time) }}
        </el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ formatDate(currentPackage.created_at) }}</el-descriptions-item>
        <el-descriptions-item label="更新时间">{{ formatDate(currentPackage.updated_at) }}</el-descriptions-item>
        <el-descriptions-item label="备注" :span="2">{{ currentPackage.notes || '无' }}</el-descriptions-item>
      </el-descriptions>

      <el-divider>物流轨迹</el-divider>

      <el-timeline v-if="currentPackage?.timeline?.length">
        <el-timeline-item
          v-for="(activity, index) in currentPackage.timeline"
          :key="index"
          :type="activity.type || 'primary'"
          :timestamp="formatDate(activity.time)"
          :hollow="activity.hollow"
        >
          {{ activity.content }}
          <div v-if="activity.location" class="activity-location">
            位置：{{ activity.location }}
          </div>
        </el-timeline-item>
      </el-timeline>
      <el-empty v-else description="暂无物流信息" />
    </el-dialog>
  </div>
</template>

<script>
import { ref, reactive, onMounted } from 'vue'
import { Search, Refresh } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'
import request from '@/utils/request'
import { API_ENDPOINTS } from '@/config/api'

export default {
  name: 'MyPackages',
  components: {
    Search,
    Refresh
  },
  setup() {
    const router = useRouter()
    const loading = ref(false)
    const currentPage = ref(1)
    const pageSize = ref(10)
    const total = ref(0)
    const packageList = ref([])
    const detailDialogVisible = ref(false)
    const currentPackage = ref(null)

    // 搜索表单
    const searchForm = ref({
      tracking_number: '',
      status: '',
      date_range: []
    })

    // 获取包裹列表
    const fetchPackages = async () => {
      try {
        loading.value = true
        const params = {
          page: currentPage.value,
          limit: pageSize.value,
          status: searchForm.value.status
        }

        if (searchForm.value.tracking_number) {
          params.tracking_number = searchForm.value.tracking_number
        }

        if (searchForm.value.date_range?.length === 2) {
          params.start_date = searchForm.value.date_range[0]
          params.end_date = searchForm.value.date_range[1]
        }

        const response = await request({
          url: API_ENDPOINTS.USER.PACKAGES.LIST,
          method: 'get',
          params
        })
        packageList.value = response.items
        total.value = response.total
      } catch (error) {
        console.error('获取包裹列表失败:', error)
        ElMessage.error('获取包裹列表失败')
      } finally {
        loading.value = false
      }
    }

    // 获取包裹详情
    const fetchPackageDetail = async (id) => {
      try {
        const response = await request({
          url: API_ENDPOINTS.USER.PACKAGES.DETAIL(id),
          method: 'get'
        })
        currentPackage.value = response
      } catch (error) {
        console.error('获取包裹详情失败:', error)
        ElMessage.error('获取包裹详情失败')
      }
    }

    // 搜索处理
    const handleSearch = () => {
      currentPage.value = 1
      fetchPackages()
    }

    // 重置搜索
    const resetSearch = () => {
      searchForm.value = {
        tracking_number: '',
        status: '',
        date_range: []
      }
      handleSearch()
    }

    // 显示包裹详情
    const showPackageDetail = async (pkg) => {
      await fetchPackageDetail(pkg.tracking_number)
      detailDialogVisible.value = true
    }

    // 处理分页大小变化
    const handleSizeChange = (val) => {
      pageSize.value = val
      fetchPackages()
    }

    // 处理页码变化
    const handleCurrentChange = (val) => {
      currentPage.value = val
      fetchPackages()
    }

    // 组件挂载时获取数据
    onMounted(() => {
      fetchPackages()
    })

    // 获取状态类型
    const getStatusType = (status) => {
      const types = {
        pending: 'info',
        in_transit: 'warning',
        delivered: 'success',
        completed: 'success',
        cancelled: 'danger'
      }
      return types[status] || 'info'
    }

    // 获取状态文本
    const getStatusText = (status) => {
      const texts = {
        pending: '待发货',
        in_transit: '运输中',
        delivered: '已送达',
        completed: '已完成',
        cancelled: '已取消'
      }
      return texts[status] || '未知'
    }

    // 格式化日期
    const formatDate = (date) => {
      return new Date(date).toLocaleString()
    }

    return {
      searchForm,
      loading,
      packageList,
      currentPage,
      pageSize,
      total,
      detailDialogVisible,
      currentPackage,
      getStatusType,
      getStatusText,
      handleSearch,
      resetSearch,
      showPackageDetail,
      handleSizeChange,
      handleCurrentChange,
      formatDate
    }
  }
}
</script>

<style scoped>
.my-packages {
  padding: 20px;
}

.search-card {
  margin-bottom: 20px;
}

.package-list {
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

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.activity-location {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
}
</style> 