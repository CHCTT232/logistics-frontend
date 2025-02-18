<template>
  <div class="delivery-tasks">
    <el-card class="route-selection" shadow="never">
      <template #header>
        <div class="card-header">
          <span>路线选择</span>
        </div>
      </template>

      <el-form :model="routeForm" label-width="120px">
        <el-form-item label="起始站点">
          <el-select v-model="routeForm.startStation" placeholder="请选择起始站点">
            <el-option
              v-for="station in stations"
              :key="station.id"
              :label="station.name"
              :value="station.id"
            />
          </el-select>
        </el-form-item>
        
        <el-form-item label="目标站点">
          <el-select v-model="routeForm.endStation" placeholder="请选择目标站点">
            <el-option
              v-for="station in stations"
              :key="station.id"
              :label="station.name"
              :value="station.id"
            />
          </el-select>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="calculateRoute" :loading="calculating">
            计算最优路径
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 推荐路径显示 -->
    <el-card v-if="recommendedRoute" class="route-info" shadow="never">
      <template #header>
        <div class="card-header">
          <span>推荐路径</span>
        </div>
      </template>

      <el-descriptions :column="1" border>
        <el-descriptions-item label="预计距离">{{ recommendedRoute.distance }} 公里</el-descriptions-item>
        <el-descriptions-item label="预计时间">{{ recommendedRoute.duration }} 分钟</el-descriptions-item>
        <el-descriptions-item label="预计收入">¥{{ recommendedRoute.estimatedEarnings }}</el-descriptions-item>
      </el-descriptions>

      <div class="route-stations">
        <div class="route-title">途经站点：</div>
        <el-steps :active="recommendedRoute.path.length" direction="vertical">
          <el-step 
            v-for="(station, index) in recommendedRoute.path" 
            :key="index"
            :title="station.name"
            :description="station.packages ? '待取件数：' + station.packages : ''"
          />
        </el-steps>
      </div>

      <div class="route-actions">
        <el-button type="primary" @click="acceptRoute" :loading="accepting">
          接受路线
        </el-button>
        <el-button @click="rejectRoute">
          重新选择
        </el-button>
      </div>
    </el-card>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'
import request from '@/utils/request'
import { API_ENDPOINTS } from '@/config/api'

export default {
  name: 'DeliveryTasks',
  setup() {
    const router = useRouter()
    const stations = ref([])
    const calculating = ref(false)
    const accepting = ref(false)
    const routeForm = ref({
      startStation: '',
      endStation: ''
    })
    const recommendedRoute = ref(null)

    // 获取所有站点
    const fetchStations = async () => {
      try {
        const response = await request({
          url: API_ENDPOINTS.STATION.LIST,
          method: 'get'
        })
        stations.value = response
      } catch (error) {
        console.error('获取站点列表失败:', error)
        ElMessage.error('获取站点列表失败')
      }
    }

    // 计算最优路径
    const calculateRoute = async () => {
      if (!routeForm.value.startStation || !routeForm.value.endStation) {
        ElMessage.warning('请选择起始站点和目标站点')
        return
      }

      try {
        calculating.value = true
        const response = await request({
          url: API_ENDPOINTS.DRIVER.CALCULATE_ROUTE,
          method: 'post',
          data: {
            start_station_id: routeForm.value.startStation,
            end_station_id: routeForm.value.endStation
          }
        })
        recommendedRoute.value = response
      } catch (error) {
        console.error('计算路径失败:', error)
        ElMessage.error('计算路径失败')
      } finally {
        calculating.value = false
      }
    }

    // 接受路线
    const acceptRoute = async () => {
      try {
        accepting.value = true
        await request({
          url: API_ENDPOINTS.DRIVER.ROUTES + '/accept',
          method: 'post',
          data: {
            start_station_id: routeForm.value.startStation,
            end_station_id: routeForm.value.endStation,
            packages: recommendedRoute.value.packages.map(pkg => pkg.id)
          }
        })
        ElMessage.success('已接受路线')
        // 跳转到当前任务页面
        router.push('/driver/current-tasks')
      } catch (error) {
        console.error('接受路线失败:', error)
        ElMessage.error(error.response?.data?.error || '接受路线失败')
      } finally {
        accepting.value = false
      }
    }

    // 重新选择
    const rejectRoute = () => {
      recommendedRoute.value = null
      routeForm.value = {
        startStation: '',
        endStation: ''
      }
    }

    onMounted(() => {
      fetchStations()
    })

    return {
      stations,
      routeForm,
      calculating,
      accepting,
      recommendedRoute,
      calculateRoute,
      acceptRoute,
      rejectRoute
    }
  }
}
</script>

<style scoped>
.delivery-tasks {
  padding: 20px;
  min-height: calc(100vh - 84px);
  background-image: url('@/assets/loging-bg.jpg');
  background-position: center;
  background-repeat: no-repeat;
  background-size: cover;
  position: relative;
}

.delivery-tasks::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.10);
  backdrop-filter: blur(10px);
  z-index: 0;
}

.route-selection, .route-info {
  position: relative;
  z-index: 1;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 8px;
  margin-bottom: 20px;
}

.card-header {
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  padding-bottom: 15px;
}

.card-header span {
  color: rgba(255, 255, 255, 0.95);
  font-size: 18px;
  font-weight: 500;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

:deep(.el-form-item__label) {
  color: rgba(255, 255, 255, 0.9);
  font-weight: 500;
}

:deep(.el-input__wrapper),
:deep(.el-select .el-input__wrapper) {
  background: rgba(255, 255, 255, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: none;
}

:deep(.el-input__inner) {
  color: rgba(255, 255, 255, 0.9);
}

:deep(.el-input__inner::placeholder) {
  color: rgba(255, 255, 255, 0.6);
}

:deep(.el-button) {
  background: linear-gradient(135deg, 
    rgba(64, 158, 255, 0.8) 0%,
    rgba(83, 82, 237, 0.8) 100%
  );
  border: none;
  color: white;
  font-weight: 500;
  padding: 12px 24px;
  height: auto;
  transition: all 0.3s ease;
}

:deep(.el-button:hover) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.3);
}

:deep(.el-descriptions) {
  margin: 20px 0;
}

:deep(.el-descriptions__label) {
  color: rgba(255, 255, 255, 0.8);
}

:deep(.el-descriptions__content) {
  color: rgba(255, 255, 255, 0.95);
}

.route-stations {
  margin-top: 30px;
}

.route-title {
  color: rgba(255, 255, 255, 0.9);
  font-size: 16px;
  font-weight: 500;
  margin-bottom: 15px;
}

:deep(.el-step__title) {
  color: rgba(255, 255, 255, 0.8) !important;
}

:deep(.el-step__description) {
  color: rgba(255, 255, 255, 0.7) !important;
}

.route-actions {
  margin-top: 30px;
  display: flex;
  justify-content: center;
  gap: 20px;
}

:deep(.el-select-dropdown) {
  background: rgba(48, 65, 86, 0.95);
  border: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(16px);
}

:deep(.el-select-dropdown__item) {
  color: rgba(255, 255, 255, 0.9);
}

:deep(.el-select-dropdown__item.hover),
:deep(.el-select-dropdown__item:hover) {
  background: rgba(255, 255, 255, 0.1);
}

:deep(.el-select-dropdown__item.selected) {
  background: rgba(64, 158, 255, 0.2);
  color: #409EFF;
}

:deep(.el-button--default) {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: rgba(255, 255, 255, 0.9);
}

:deep(.el-button--default:hover) {
  background: rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.3);
  color: rgba(255, 255, 255, 1);
}
</style> 