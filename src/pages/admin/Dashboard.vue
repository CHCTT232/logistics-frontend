<template>
  <div class="dashboard">
    <h2>管理员控制台</h2>
    
    <!-- 统计卡片 -->
    <el-row :gutter="20" class="statistics">
      <el-col :span="6">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>总包裹数</span>
            </div>
          </template>
          <div class="card-value">{{ statistics.packageCount || 0 }}</div>
        </el-card>
      </el-col>
      
      <el-col :span="6">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>活跃司机</span>
            </div>
          </template>
          <div class="card-value">{{ statistics.driverCount || 0 }}</div>
        </el-card>
      </el-col>
      
      <el-col :span="6">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>总用户数</span>
            </div>
          </template>
          <div class="card-value">{{ statistics.userCount || 0 }}</div>
        </el-card>
      </el-col>
      
      <el-col :span="6">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>站点数量</span>
            </div>
          </template>
          <div class="card-value">{{ statistics.stationCount || 0 }}</div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 订单趋势图 -->
    <el-row :gutter="20" class="charts">
      <el-col :span="12">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>订单趋势</span>
            </div>
          </template>
          <div class="chart-container" ref="orderTrendChart"></div>
        </el-card>
      </el-col>
      
      <el-col :span="12">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>收入统计</span>
            </div>
          </template>
          <div class="chart-container" ref="incomeChart"></div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import * as echarts from 'echarts'
import request from '@/utils/request'
import { API_ENDPOINTS } from '@/config/api'

const statistics = ref({
  packageCount: 0,
  driverCount: 0,
  userCount: 0,
  stationCount: 0,
  activePackages: 0,
  completedPackages: 0
})

const orderTrendChart = ref(null)
const incomeChart = ref(null)

// 获取统计数据
const fetchStatistics = async () => {
  try {
    console.log('开始获取统计数据')
    const response = await request({
      url: API_ENDPOINTS.ADMIN.STATISTICS,
      method: 'get'
    })
    
    console.log('统计数据响应:', response)
    if (response) {
      statistics.value = response
    }
  } catch (error) {
    console.error('获取统计数据失败:', error)
    ElMessage.error(error.response?.data?.error || '获取统计数据失败')
  }
}

// 获取订单趋势数据
const fetchOrderTrend = async () => {
  try {
    console.log('开始获取订单趋势数据')
    const response = await request({
      url: API_ENDPOINTS.ADMIN.ORDER_TREND,
      method: 'get'
    })
    
    console.log('订单趋势数据响应:', response)
    if (response) {
      initOrderTrendChart(response)
    }
  } catch (error) {
    console.error('获取订单趋势数据失败:', error)
    ElMessage.error(error.response?.data?.error || '获取订单趋势数据失败')
  }
}

// 初始化订单趋势图表
const initOrderTrendChart = (data) => {
  if (!orderTrendChart.value) return

  const chart = echarts.init(orderTrendChart.value)
  const option = {
    tooltip: {
      trigger: 'axis'
    },
    xAxis: {
      type: 'category',
      data: data.map(item => item.date)
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        name: '订单数量',
        type: 'line',
        data: data.map(item => item.count),
        smooth: true,
        areaStyle: {}
      }
    ]
  }
  chart.setOption(option)
}

// 组件挂载时获取数据
onMounted(async () => {
  console.log('Dashboard组件已挂载')
  await Promise.all([
    fetchStatistics(),
    fetchOrderTrend()
  ])
})
</script>

<style scoped>
.dashboard {
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

.card-value {
  font-size: 24px;
  font-weight: bold;
  color: #409EFF;
  text-align: center;
  margin-top: 10px;
}

.charts {
  margin-top: 20px;
}

.chart-container {
  height: 300px;
}
</style> 