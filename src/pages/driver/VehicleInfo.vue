<template>
  <div class="vehicle-info">
    <el-card class="info-card" shadow="hover">
      <template #header>
        <div class="card-header">
          <span>车辆信息</span>
          <el-tag :type="vehicleStatus.type">{{ vehicleStatus.text }}</el-tag>
        </div>
      </template>

      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-position="top"
        @submit.prevent="handleSubmit"
      >
        <!-- 基本信息 -->
        <el-divider>基本信息</el-divider>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="车牌号" prop="plateNumber">
              <el-input
                v-model="form.plateNumber"
                placeholder="请输入车牌号"
                :disabled="form.status !== 'pending'"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="车辆类型" prop="vehicleType">
              <el-select
                v-model="form.vehicleType"
                placeholder="请选择车辆类型"
                :disabled="form.status !== 'pending'"
              >
                <el-option label="小型轿车" value="sedan" />
                <el-option label="SUV" value="suv" />
                <el-option label="面包车" value="van" />
                <el-option label="小型货车" value="truck" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="车辆品牌" prop="brand">
              <el-input
                v-model="form.brand"
                placeholder="请输入车辆品牌"
                :disabled="form.status !== 'pending'"
              />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="车辆型号" prop="model">
              <el-input
                v-model="form.model"
                placeholder="请输入车辆型号"
                :disabled="form.status !== 'pending'"
              />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="车辆颜色" prop="color">
              <el-input
                v-model="form.color"
                placeholder="请输入车辆颜色"
                :disabled="form.status !== 'pending'"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <!-- 后备箱信息 -->
        <el-divider>后备箱信息</el-divider>
        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="长度 (cm)" prop="trunkLength">
              <el-input-number
                v-model="form.trunkLength"
                :min="0"
                :precision="1"
                :step="10"
                placeholder="请输入长度"
                :disabled="form.status !== 'pending'"
              />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="宽度 (cm)" prop="trunkWidth">
              <el-input-number
                v-model="form.trunkWidth"
                :min="0"
                :precision="1"
                :step="10"
                placeholder="请输入宽度"
                :disabled="form.status !== 'pending'"
              />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="高度 (cm)" prop="trunkHeight">
              <el-input-number
                v-model="form.trunkHeight"
                :min="0"
                :precision="1"
                :step="10"
                placeholder="请输入高度"
                :disabled="form.status !== 'pending'"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <!-- 后备箱照片上传 -->
        <el-form-item label="后备箱照片" prop="trunkPhotos">
          <el-upload
            v-model:file-list="fileList"
            action="/api/upload"
            list-type="picture-card"
            :limit="4"
            :disabled="form.status !== 'pending'"
            :before-upload="beforeUpload"
            :on-success="handleUploadSuccess"
            :on-error="handleUploadError"
          >
            <el-icon><Plus /></el-icon>
            <template #tip>
              <div class="upload-tip">
                请上传4张后备箱照片（前、后、左、右视角），每张不超过5MB
              </div>
            </template>
          </el-upload>
        </el-form-item>

        <!-- 空间计算结果 -->
        <template v-if="form.status === 'approved'">
          <el-divider>空间计算结果</el-divider>
          <el-descriptions :column="3" border>
            <el-descriptions-item label="后备箱体积">
              {{ trunkVolume }} m³
            </el-descriptions-item>
            <el-descriptions-item label="可用空间">
              {{ availableSpace }} m³
            </el-descriptions-item>
            <el-descriptions-item label="空间利用率">
              {{ spaceUtilization }}%
            </el-descriptions-item>
          </el-descriptions>

          <div class="space-visualization">
            <!-- 这里将使用Three.js来可视化后备箱空间 -->
          </div>
        </template>

        <div class="form-actions">
          <el-button 
            v-if="form.status === 'pending'"
            type="primary"
            native-type="submit"
            :loading="loading"
          >
            提交审核
          </el-button>
          <el-button 
            v-if="form.status === 'rejected'"
            type="primary"
            @click="resubmit"
          >
            重新提交
          </el-button>
        </div>
      </el-form>
    </el-card>
  </div>
</template>

<script>
import { ref, reactive, computed } from 'vue'
import { Plus } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

export default {
  name: 'VehicleInfo',
  components: {
    Plus
  },
  setup() {
    const formRef = ref(null)
    const loading = ref(false)
    const fileList = ref([])

    // 表单数据
    const form = reactive({
      plateNumber: '',
      vehicleType: '',
      brand: '',
      model: '',
      color: '',
      trunkLength: 0,
      trunkWidth: 0,
      trunkHeight: 0,
      trunkPhotos: [],
      status: 'pending', // pending, reviewing, approved, rejected
      rejectionReason: ''
    })

    // 表单验证规则
    const rules = {
      plateNumber: [
        { required: true, message: '请输入车牌号', trigger: 'blur' },
        { pattern: /^[京津沪渝冀豫云辽黑湘皖鲁新苏浙赣鄂桂甘晋蒙陕吉闽贵粤青藏川宁琼使领][A-Z][A-Z0-9]{5}$/, message: '请输入正确的车牌号', trigger: 'blur' }
      ],
      vehicleType: [
        { required: true, message: '请选择车辆类型', trigger: 'change' }
      ],
      brand: [
        { required: true, message: '请输入车辆品牌', trigger: 'blur' }
      ],
      model: [
        { required: true, message: '请输入车辆型号', trigger: 'blur' }
      ],
      color: [
        { required: true, message: '请输入车辆颜色', trigger: 'blur' }
      ],
      trunkLength: [
        { required: true, message: '请输入后备箱长度', trigger: 'blur' },
        { type: 'number', min: 0, message: '长度必须大于0', trigger: 'blur' }
      ],
      trunkWidth: [
        { required: true, message: '请输入后备箱宽度', trigger: 'blur' },
        { type: 'number', min: 0, message: '宽度必须大于0', trigger: 'blur' }
      ],
      trunkHeight: [
        { required: true, message: '请输入后备箱高度', trigger: 'blur' },
        { type: 'number', min: 0, message: '高度必须大于0', trigger: 'blur' }
      ],
      trunkPhotos: [
        { required: true, message: '请上传后备箱照片', trigger: 'change' },
        { type: 'array', min: 4, message: '请上传4张后备箱照片', trigger: 'change' }
      ]
    }

    // 车辆状态
    const vehicleStatus = computed(() => {
      const statusMap = {
        pending: { type: 'info', text: '待提交' },
        reviewing: { type: 'warning', text: '审核中' },
        approved: { type: 'success', text: '已通过' },
        rejected: { type: 'danger', text: '已驳回' }
      }
      return statusMap[form.status] || statusMap.pending
    })

    // 后备箱体积（立方米）
    const trunkVolume = computed(() => {
      return ((form.trunkLength * form.trunkWidth * form.trunkHeight) / 1000000).toFixed(2)
    })

    // 可用空间（考虑到车辆结构等因素，实际可用空间约为80%）
    const availableSpace = computed(() => {
      return (trunkVolume.value * 0.8).toFixed(2)
    })

    // 空间利用率（模拟数据）
    const spaceUtilization = computed(() => {
      return 85
    })

    // 上传前验证
    const beforeUpload = (file) => {
      const isImage = file.type.startsWith('image/')
      const isLt5M = file.size / 1024 / 1024 < 5

      if (!isImage) {
        ElMessage.error('只能上传图片文件！')
        return false
      }
      if (!isLt5M) {
        ElMessage.error('图片大小不能超过 5MB！')
        return false
      }
      return true
    }

    // 上传成功
    const handleUploadSuccess = (response, file) => {
      form.trunkPhotos.push(response.url)
      ElMessage.success('上传成功')
    }

    // 上传失败
    const handleUploadError = () => {
      ElMessage.error('上传失败，请重试')
    }

    // 提交表单
    const handleSubmit = async () => {
      if (!formRef.value) return

      try {
        await formRef.value.validate()
        loading.value = true

        // TODO: 调用提交API
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        form.status = 'reviewing'
        ElMessage.success('提交成功，请等待审核')
      } catch (error) {
        console.error('表单验证失败:', error)
      } finally {
        loading.value = false
      }
    }

    // 重新提交
    const resubmit = () => {
      form.status = 'pending'
      form.rejectionReason = ''
    }

    return {
      formRef,
      form,
      rules,
      loading,
      fileList,
      vehicleStatus,
      trunkVolume,
      availableSpace,
      spaceUtilization,
      beforeUpload,
      handleUploadSuccess,
      handleUploadError,
      handleSubmit,
      resubmit
    }
  }
}
</script>

<style scoped>
.vehicle-info {
  padding: 20px;
}

.info-card {
  max-width: 1000px;
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

.upload-tip {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  margin-top: 8px;
}

.space-visualization {
  height: 300px;
  margin-top: 20px;
  background-color: var(--el-bg-color-page);
  border-radius: 4px;
  display: flex;
  justify-content: center;
  align-items: center;
  color: var(--el-text-color-secondary);
}

.form-actions {
  margin-top: 24px;
  display: flex;
  justify-content: center;
  gap: 16px;
}
</style> 