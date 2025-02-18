<template>
  <div class="settings-container">
    <el-card class="settings-card">
      <template #header>
        <div class="card-header">
          <h3>运费设置</h3>
        </div>
      </template>

      <el-form
        ref="settingsForm"
        :model="formData"
        :rules="rules"
        label-position="top"
      >
        <el-form-item 
          label="基础运费（元）" 
          prop="basePrice"
          :tooltip="'40*40*40/6000的载物箱运输50KM的基础运费'"
        >
          <el-input-number
            v-model="formData.basePrice"
            :min="0"
            :precision="2"
            :step="0.1"
            class="w-full"
          />
        </el-form-item>

        <el-form-item 
          label="基础距离（公里）" 
          prop="baseDistance"
          :tooltip="'基础运费对应的运输距离'"
        >
          <el-input-number
            v-model="formData.baseDistance"
            :min="0"
            :precision="1"
            :step="1"
            class="w-full"
          />
        </el-form-item>

        <el-form-item 
          label="抛比系数" 
          prop="volumeRatio"
          :tooltip="'体积重量换算系数'"
        >
          <el-input-number
            v-model="formData.volumeRatio"
            :min="0"
            :precision="0"
            :step="100"
            class="w-full"
          />
        </el-form-item>

        <el-form-item 
          label="司机分成比例" 
          prop="driverRatio"
          :tooltip="'司机获得运费的比例（0-1之间）'"
        >
          <el-input-number
            v-model="formData.driverRatio"
            :min="0"
            :max="1"
            :precision="2"
            :step="0.01"
            class="w-full"
          />
        </el-form-item>

        <el-form-item>
          <el-button
            type="primary"
            :loading="loading"
            @click="handleSubmit"
          >
            保存设置
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card class="settings-card mt-4">
      <template #header>
        <div class="card-header">
          <h3>系统信息</h3>
        </div>
      </template>

      <el-descriptions :column="1" border>
        <el-descriptions-item label="系统版本">1.0.0</el-descriptions-item>
        <el-descriptions-item label="最后更新时间">
          {{ new Date().toLocaleString() }}
        </el-descriptions-item>
        <el-descriptions-item label="数据库状态">
          <el-tag type="success">正常</el-tag>
        </el-descriptions-item>
      </el-descriptions>
    </el-card>
  </div>
</template>

<script>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'

export default {
  name: 'SystemSettings',
  setup() {
    const settingsForm = ref(null)
    const loading = ref(false)

    const formData = reactive({
      basePrice: 6,
      baseDistance: 50,
      volumeRatio: 6000,
      driverRatio: 0.83
    })

    const rules = {
      basePrice: [
        { required: true, message: '请输入基础运费', trigger: 'blur' }
      ],
      baseDistance: [
        { required: true, message: '请输入基础距离', trigger: 'blur' }
      ],
      volumeRatio: [
        { required: true, message: '请输入抛比系数', trigger: 'blur' }
      ],
      driverRatio: [
        { required: true, message: '请输入司机分成比例', trigger: 'blur' }
      ]
    }

    const handleSubmit = async () => {
      if (!settingsForm.value) return

      try {
        await settingsForm.value.validate()
        loading.value = true

        // TODO: 调用API保存设置
        // const response = await saveSettings(formData)
        
        // 模拟保存成功
        setTimeout(() => {
          ElMessage.success('设置保存成功')
          loading.value = false
        }, 1000)
      } catch (error) {
        console.error('保存设置失败:', error)
        ElMessage.error('保存设置失败，请检查输入')
        loading.value = false
      }
    }

    onMounted(() => {
      // TODO: 获取当前设置
    })

    return {
      settingsForm,
      formData,
      rules,
      loading,
      handleSubmit
    }
  }
}
</script>

<style scoped>
.settings-container {
  padding: 20px;
}

.settings-card {
  max-width: 800px;
  margin: 0 auto;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header h3 {
  margin: 0;
  font-size: 18px;
  color: #303133;
}

.w-full {
  width: 100%;
}

.mt-4 {
  margin-top: 16px;
}

:deep(.el-input-number) {
  width: 100%;
}
</style> 