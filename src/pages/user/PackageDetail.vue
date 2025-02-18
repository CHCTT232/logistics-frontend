<template>
  <div class="package-detail">
    <el-page-header @back="goBack" :title="'包裹详情 - ' + packageInfo.tracking_number">
      <template #extra>
        <el-button type="primary" @click="refreshData">刷新</el-button>
      </template>
    </el-page-header>

    <el-card class="detail-card" v-loading="loading">
      <template #header>
        <div class="card-header">
          <span>基本信息</span>
          <el-tag :type="getStatusType(packageInfo.status)">
            {{ getStatusText(packageInfo.status) }}
          </el-tag>
        </div>
      </template>

      <el-descriptions :column="2" border>
        <el-descriptions-item label="运单号">{{ packageInfo.tracking_number }}</el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ formatDate(packageInfo.created_at) }}</el-descriptions-item>
        <el-descriptions-item label="发货站点">{{ packageInfo.origin_station_name }}</el-descriptions-item>
        <el-descriptions-item label="收货站点">{{ packageInfo.destination_station_name }}</el-descriptions-item>
        <el-descriptions-item label="收件人">{{ packageInfo.receiver_name }}</el-descriptions-item>
        <el-descriptions-item label="收件人电话">{{ packageInfo.receiver_phone }}</el-descriptions-item>
        <el-descriptions-item label="收货地址">{{ packageInfo.receiver_address }}</el-descriptions-item>
        <el-descriptions-item label="重量">{{ packageInfo.weight }}kg</el-descriptions-item>
        <el-descriptions-item label="体积">{{ packageInfo.volume }}cm³</el-descriptions-item>
        <el-descriptions-item label="运费">¥{{ packageInfo.price }}</el-descriptions-item>
      </el-descriptions>

      <div class="driver-info" v-if="packageInfo.driver_name">
        <h3>配送信息</h3>
        <el-descriptions :column="2" border>
          <el-descriptions-item label="配送司机">{{ packageInfo.driver_name }}</el-descriptions-item>
          <el-descriptions-item label="司机电话">{{ packageInfo.driver_phone }}</el-descriptions-item>
          <el-descriptions-item label="预计送达时间">{{ formatDate(packageInfo.estimated_delivery_time) }}</el-descriptions-item>
          <el-descriptions-item label="实际送达时间">{{ packageInfo.actual_delivery_time ? formatDate(packageInfo.actual_delivery_time) : '未送达' }}</el-descriptions-item>
        </el-descriptions>
      </div>

      <div class="package-dimensions">
        <h3>包裹尺寸</h3>
        <el-descriptions :column="3" border>
          <el-descriptions-item label="长">{{ packageInfo.dimensions?.length }}cm</el-descriptions-item>
          <el-descriptions-item label="宽">{{ packageInfo.dimensions?.width }}cm</el-descriptions-item>
          <el-descriptions-item label="高">{{ packageInfo.dimensions?.height }}cm</el-descriptions-item>
        </el-descriptions>
      </div>

      <div class="package-notes" v-if="packageInfo.notes">
        <h3>备注</h3>
        <p>{{ packageInfo.notes }}</p>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import request from '@/utils/request'
import { API_ENDPOINTS } from '@/config/api'

const route = useRoute()
const router = useRouter()
const loading = ref(false)
const packageInfo = ref({})

const fetchPackageDetail = async () => {
  loading.value = true
  try {
    const response = await request({
      url: API_ENDPOINTS.USER.PACKAGES.DETAIL(route.params.id),
      method: 'get'
    })
    packageInfo.value = response
  } catch (error) {
    console.error('获取包裹详情失败:', error)
    ElMessage.error('获取包裹详情失败')
  } finally {
    loading.value = false
  }
}

const refreshData = () => {
  fetchPackageDetail()
}

const goBack = () => {
  router.back()
}

const formatDate = (date) => {
  if (!date) return '未知'
  return new Date(date).toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const getStatusType = (status) => {
  const types = {
    'pending': 'warning',
    'in_transit': 'primary',
    'delivered': 'success',
    'completed': 'info',
    'cancelled': 'danger'
  }
  return types[status] || 'info'
}

const getStatusText = (status) => {
  const texts = {
    'pending': '待发货',
    'in_transit': '运输中',
    'delivered': '已送达',
    'completed': '已完成',
    'cancelled': '已取消'
  }
  return texts[status] || '未知'
}

onMounted(() => {
  fetchPackageDetail()
})
</script>

<style scoped>
.package-detail {
  padding: 20px;
}

.detail-card {
  margin-top: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.driver-info,
.package-dimensions,
.package-notes {
  margin-top: 30px;
}

h3 {
  margin-bottom: 15px;
  color: #303133;
  font-size: 16px;
  font-weight: 500;
}

.package-notes p {
  color: #606266;
  line-height: 1.6;
  margin: 0;
  padding: 10px;
  background-color: #f5f7fa;
  border-radius: 4px;
}
</style> 