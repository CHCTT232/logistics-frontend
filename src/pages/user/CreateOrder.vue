<template>
  <div class="create-order">
    <el-card class="order-form" shadow="never">
      <template #header>
        <div class="card-header">
          <span>创建订单</span>
        </div>
      </template>

      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-position="top"
        @submit.prevent="handleSubmit"
      >
        <!-- 发货信息 -->
        <el-divider>发货信息</el-divider>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="发货站点" prop="fromStation">
              <el-select
                v-model="form.fromStation"
                placeholder="请选择发货站点"
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
          </el-col>
          <el-col :span="12">
            <el-form-item label="目的站点" prop="toStation">
              <el-select
                v-model="form.toStation"
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
          </el-col>
        </el-row>

        <!-- 包裹信息 -->
        <el-divider>包裹信息</el-divider>
        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="长度 (cm)" prop="length">
              <el-input-number
                v-model="form.length"
                :min="20"
                :step="20"
                :step-strictly="true"
                placeholder="请输入长度"
              />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="宽度 (cm)" prop="width">
              <el-input-number
                v-model="form.width"
                :min="20"
                :step="20"
                :step-strictly="true"
                placeholder="请输入宽度"
              />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="高度 (cm)" prop="height">
              <el-input-number
                v-model="form.height"
                :min="3"
                :step="3"
                :step-strictly="true"
                placeholder="请输入高度"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="重量 (kg)" prop="weight">
              <el-input-number
                v-model="form.weight"
                :min="0.1"
                :precision="1"
                :step="0.1"
                placeholder="请输入重量"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="物品类型" prop="type">
              <el-select v-model="form.type" placeholder="请选择物品类型">
                <el-option label="普通物品" value="normal" />
                <el-option label="易碎品" value="fragile" />
                <el-option label="贵重物品" value="valuable" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="备注" prop="notes">
          <el-input
            v-model="form.notes"
            type="textarea"
            rows="3"
            placeholder="请输入备注信息（选填）"
            maxlength="200"
            show-word-limit
          />
        </el-form-item>

        <!-- 运费预估 -->
        <el-divider>运费预估</el-divider>
        <div class="freight-estimate" v-if="showFreightEstimate">
          <el-descriptions :column="2" border>
            <el-descriptions-item label="体积重量">
              {{ volumeWeight }} kg
            </el-descriptions-item>
            <el-descriptions-item label="计费重量">
              {{ chargeableWeight }} kg
            </el-descriptions-item>
            <el-descriptions-item label="预估运费">
              <span class="freight">¥{{ estimatedFreight }}</span>
            </el-descriptions-item>
            <el-descriptions-item label="预计时效">
              {{ estimatedTime }}
            </el-descriptions-item>
          </el-descriptions>
        </div>

        <div class="form-actions">
          <el-button @click="$router.back()">取消</el-button>
          <el-button
            type="primary"
            native-type="submit"
            :loading="loading"
          >
            提交订单
          </el-button>
        </div>
      </el-form>
    </el-card>
  </div>
</template>

<script>
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'

export default {
  name: 'CreateOrder',
  setup() {
    const router = useRouter()
    const formRef = ref(null)
    const loading = ref(false)

    // 模拟站点数据
    const stations = ref([
      { id: 1, name: '北京站' },
      { id: 2, name: '上海站' },
      { id: 3, name: '广州站' },
      { id: 4, name: '深圳站' },
      { id: 5, name: '成都站' },
      { id: 6, name: '重庆站' }
    ])

    const form = reactive({
      fromStation: '',
      toStation: '',
      length: 20,
      width: 20,
      height: 3,
      weight: 0.1,
      type: 'normal',
      notes: ''
    })

    const rules = {
      fromStation: [
        { required: true, message: '请选择发货站点', trigger: 'change' }
      ],
      toStation: [
        { required: true, message: '请选择目的站点', trigger: 'change' }
      ],
      length: [
        { required: true, message: '请输入长度', trigger: 'blur' },
        { type: 'number', min: 20, message: '长度不能小于20cm', trigger: 'blur' }
      ],
      width: [
        { required: true, message: '请输入宽度', trigger: 'blur' },
        { type: 'number', min: 20, message: '宽度不能小于20cm', trigger: 'blur' }
      ],
      height: [
        { required: true, message: '请输入高度', trigger: 'blur' },
        { type: 'number', min: 3, message: '高度不能小于3cm', trigger: 'blur' }
      ],
      weight: [
        { required: true, message: '请输入重量', trigger: 'blur' },
        { type: 'number', min: 0.1, message: '重量不能小于0.1kg', trigger: 'blur' }
      ],
      type: [
        { required: true, message: '请选择物品类型', trigger: 'change' }
      ]
    }

    // 是否显示运费预估
    const showFreightEstimate = computed(() => {
      return form.fromStation && form.toStation && form.length && form.width && form.height && form.weight
    })

    // 计算体积重量
    const volumeWeight = computed(() => {
      if (!showFreightEstimate.value) return 0
      return Number(((form.length * form.width * form.height) / 6000).toFixed(1))
    })

    // 计算计费重量
    const chargeableWeight = computed(() => {
      if (!showFreightEstimate.value) return 0
      return Math.max(volumeWeight.value, form.weight)
    })

    // 计算预估运费
    const estimatedFreight = computed(() => {
      if (!showFreightEstimate.value) return 0
      // 基准价格：40×40×40cm 的包裹，运输 50KM 收费 6 元
      const baseVolume = 40 * 40 * 40
      const baseDistance = 50
      const basePrice = 6

      const currentVolume = form.length * form.width * form.height
      const volumeRatio = currentVolume / baseVolume

      // 模拟距离计算
      const distance = Math.abs(form.fromStation - form.toStation) * 50

      let price = (volumeRatio * (distance / baseDistance) * basePrice).toFixed(2)

      // 物品类型附加费
      if (form.type === 'fragile') price *= 1.5
      if (form.type === 'valuable') price *= 2

      return Number(price).toFixed(2)
    })

    // 预计时效
    const estimatedTime = computed(() => {
      if (!showFreightEstimate.value) return ''
      // 模拟时效计算
      const distance = Math.abs(form.fromStation - form.toStation) * 50
      if (distance <= 100) return '24小时内'
      if (distance <= 300) return '48小时内'
      return '72小时内'
    })

    const handleSubmit = async () => {
      if (!formRef.value) return

      try {
        await formRef.value.validate()
        loading.value = true

        // TODO: 调用创建订单API
        // 模拟创建订单
        setTimeout(() => {
          ElMessage.success('订单创建成功')
          router.push('/user/packages')
        }, 1000)
      } catch (error) {
        console.error('表单验证失败:', error)
      } finally {
        loading.value = false
      }
    }

    return {
      formRef,
      form,
      rules,
      loading,
      stations,
      showFreightEstimate,
      volumeWeight,
      chargeableWeight,
      estimatedFreight,
      estimatedTime,
      handleSubmit
    }
  }
}
</script>

<style scoped>
.create-order {
  padding: 20px;
}

.order-form {
  max-width: 800px;
  margin: 0 auto;
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

.el-divider {
  margin: 24px 0 16px;
}

.el-divider__text {
  font-size: 14px;
  font-weight: bold;
  color: var(--el-text-color-secondary);
}

.freight-estimate {
  margin: 16px 0;
}

.freight {
  font-size: 16px;
  font-weight: bold;
  color: var(--el-color-danger);
}

.form-actions {
  margin-top: 24px;
  display: flex;
  justify-content: center;
  gap: 16px;
}
</style> 