<template>
  <div class="storage-management">
    <!-- 统计卡片 -->
    <el-row :gutter="20">
      <el-col :span="6">
        <el-card class="stat-card" shadow="hover">
          <div class="stat-content">
            <el-icon class="stat-icon primary">
              <Box />
            </el-icon>
            <div class="stat-info">
              <div class="stat-value">{{ stats.totalBoxes }}</div>
              <div class="stat-title">总储位数</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card" shadow="hover">
          <div class="stat-content">
            <el-icon class="stat-icon success">
              <Box />
            </el-icon>
            <div class="stat-info">
              <div class="stat-value">{{ stats.availableBoxes }}</div>
              <div class="stat-title">可用储位</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card" shadow="hover">
          <div class="stat-content">
            <el-icon class="stat-icon warning">
              <Box />
            </el-icon>
            <div class="stat-info">
              <div class="stat-value">{{ stats.usageRate }}%</div>
              <div class="stat-title">使用率</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card" shadow="hover">
          <div class="stat-content">
            <el-icon class="stat-icon danger">
              <Warning />
            </el-icon>
            <div class="stat-info">
              <div class="stat-value">{{ stats.alertCount }}</div>
              <div class="stat-title">异常储位</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" style="margin-top: 20px;">
      <!-- 储位管理 -->
      <el-col :span="16">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>储位管理</span>
              <div class="header-actions">
                <el-radio-group v-model="viewMode" size="small">
                  <el-radio-button value="grid">网格视图</el-radio-button>
                  <el-radio-button value="list">列表视图</el-radio-button>
                </el-radio-group>
                <el-button type="primary" @click="showAddStorageDialog">
                  <el-icon><Plus /></el-icon>
                  添加储位
                </el-button>
              </div>
            </div>
          </template>

          <!-- 网格视图 -->
          <div v-if="viewMode === 'grid'" class="storage-grid">
            <div
              v-for="box in storageBoxes"
              :key="box.id"
              class="storage-box"
              :class="{
                'box-occupied': box.status === 'occupied',
                'box-alert': box.status === 'alert',
                'box-selected': selectedBox?.id === box.id
              }"
              @click="selectBox(box)"
            >
              <div class="box-header">
                <span class="box-id">{{ box.id }}</span>
                <el-tag
                  :type="getStatusType(box.status)"
                  size="small"
                >
                  {{ getStatusText(box.status) }}
                </el-tag>
              </div>
              <div class="box-info">
                <template v-if="box.status === 'occupied'">
                  <div class="info-item">
                    <span class="label">包裹：</span>
                    <span class="value">{{ box.packageId }}</span>
                  </div>
                  <div class="info-item">
                    <span class="label">尺寸：</span>
                    <span class="value">{{ box.size }}</span>
                  </div>
                  <div class="info-item">
                    <span class="label">入库时间：</span>
                    <span class="value">{{ box.storageTime }}</span>
                  </div>
                </template>
                <template v-else-if="box.status === 'alert'">
                  <div class="alert-message">{{ box.alertMessage }}</div>
                </template>
                <template v-else>
                  <div class="box-size">{{ box.size }}</div>
                </template>
              </div>
            </div>
          </div>

          <!-- 列表视图 -->
          <div v-else>
            <el-table :data="storageBoxes" style="width: 100%">
              <el-table-column prop="id" label="储位编号" width="120" />
              <el-table-column prop="size" label="尺寸" width="120" />
              <el-table-column prop="status" label="状态" width="100">
                <template #default="{ row }">
                  <el-tag :type="getStatusType(row.status)">
                    {{ getStatusText(row.status) }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="packageId" label="包裹编号" width="180" />
              <el-table-column prop="storageTime" label="入库时间" width="180" />
              <el-table-column prop="alertMessage" label="异常信息" show-overflow-tooltip />
              <el-table-column label="操作" width="200" fixed="right">
                <template #default="{ row }">
                  <el-button
                    type="primary"
                    link
                    @click="handleMaintenance(row)"
                    v-if="row.status === 'alert'"
                  >
                    维护
                  </el-button>
                  <el-button
                    type="danger"
                    link
                    @click="handleDisable(row)"
                    v-if="row.status !== 'disabled'"
                  >
                    停用
                  </el-button>
                  <el-button
                    type="success"
                    link
                    @click="handleEnable(row)"
                    v-if="row.status === 'disabled'"
                  >
                    启用
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </el-card>
      </el-col>

      <!-- 储位详情 -->
      <el-col :span="8">
        <el-card class="detail-card" shadow="hover" v-if="selectedBox">
          <template #header>
            <div class="card-header">
              <span>储位详情</span>
              <el-button-group>
                <el-button
                  type="primary"
                  link
                  @click="handleMaintenance(selectedBox)"
                  v-if="selectedBox.status === 'alert'"
                >
                  维护
                </el-button>
                <el-button
                  type="danger"
                  link
                  @click="handleDisable(selectedBox)"
                  v-if="selectedBox.status !== 'disabled'"
                >
                  停用
                </el-button>
                <el-button
                  type="success"
                  link
                  @click="handleEnable(selectedBox)"
                  v-if="selectedBox.status === 'disabled'"
                >
                  启用
                </el-button>
              </el-button-group>
            </div>
          </template>

          <el-descriptions :column="1" border>
            <el-descriptions-item label="储位编号">{{ selectedBox.id }}</el-descriptions-item>
            <el-descriptions-item label="储位尺寸">{{ selectedBox.size }}</el-descriptions-item>
            <el-descriptions-item label="当前状态">
              <el-tag :type="getStatusType(selectedBox.status)">
                {{ getStatusText(selectedBox.status) }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="包裹编号" v-if="selectedBox.packageId">
              {{ selectedBox.packageId }}
            </el-descriptions-item>
            <el-descriptions-item label="入库时间" v-if="selectedBox.storageTime">
              {{ selectedBox.storageTime }}
            </el-descriptions-item>
            <el-descriptions-item label="异常信息" v-if="selectedBox.alertMessage">
              {{ selectedBox.alertMessage }}
            </el-descriptions-item>
          </el-descriptions>

          <div class="usage-history" v-if="selectedBox.history?.length">
            <div class="section-title">使用记录</div>
            <el-timeline>
              <el-timeline-item
                v-for="record in selectedBox.history"
                :key="record.id"
                :timestamp="record.time"
                :type="record.type"
              >
                {{ record.content }}
              </el-timeline-item>
            </el-timeline>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 添加储位对话框 -->
    <el-dialog
      v-model="addDialogVisible"
      title="添加储位"
      width="500px"
    >
      <el-form
        ref="addFormRef"
        :model="addForm"
        :rules="addRules"
        label-width="100px"
      >
        <el-form-item label="储位编号" prop="id">
          <el-input
            v-model="addForm.id"
            placeholder="请输入储位编号"
          />
        </el-form-item>
        <el-form-item label="储位尺寸">
          <el-row :gutter="10">
            <el-col :span="8">
              <el-form-item prop="length">
                <el-input-number
                  v-model="addForm.length"
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
                  v-model="addForm.width"
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
                  v-model="addForm.height"
                  :min="3"
                  :step="3"
                  :step-strictly="true"
                  placeholder="高"
                />
              </el-form-item>
            </el-col>
          </el-row>
        </el-form-item>
        <el-form-item label="备注" prop="notes">
          <el-input
            v-model="addForm.notes"
            type="textarea"
            rows="3"
            placeholder="请输入备注信息（选填）"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="addDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitAdd" :loading="submitting">
            确定
          </el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 维护对话框 -->
    <el-dialog
      v-model="maintenanceDialogVisible"
      title="储位维护"
      width="500px"
    >
      <el-form
        ref="maintenanceFormRef"
        :model="maintenanceForm"
        :rules="maintenanceRules"
        label-width="100px"
      >
        <el-form-item label="维护类型" prop="type">
          <el-select v-model="maintenanceForm.type" placeholder="请选择维护类型">
            <el-option label="清理" value="clean" />
            <el-option label="维修" value="repair" />
            <el-option label="检查" value="check" />
            <el-option label="其他" value="other" />
          </el-select>
        </el-form-item>
        <el-form-item label="预计时长" prop="duration">
          <el-input-number
            v-model="maintenanceForm.duration"
            :min="1"
            :max="48"
            :step="1"
          />
          <span class="unit">小时</span>
        </el-form-item>
        <el-form-item label="维护说明" prop="description">
          <el-input
            v-model="maintenanceForm.description"
            type="textarea"
            rows="3"
            placeholder="请输入维护说明"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="maintenanceDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitMaintenance" :loading="submitting">
            确定
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { ref, computed } from 'vue'
import {
  Box,
  Warning,
  Plus
} from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'

export default {
  name: 'StorageManagement',
  components: {
    Box,
    Warning,
    Plus
  },
  setup() {
    const submitting = ref(false)
    const viewMode = ref('grid')
    const selectedBox = ref(null)

    // 对话框显示状态
    const addDialogVisible = ref(false)
    const maintenanceDialogVisible = ref(false)

    // 表单引用
    const addFormRef = ref(null)
    const maintenanceFormRef = ref(null)

    // 添加储位表单
    const addForm = ref({
      id: '',
      length: 20,
      width: 20,
      height: 3,
      notes: ''
    })

    // 维护表单
    const maintenanceForm = ref({
      type: '',
      duration: 1,
      description: ''
    })

    // 表单验证规则
    const addRules = {
      id: [
        { required: true, message: '请输入储位编号', trigger: 'blur' },
        { pattern: /^[A-Z]-\d{2}$/, message: '储位编号格式为：字母-数字，如A-01', trigger: 'blur' }
      ],
      length: [
        { required: true, message: '请输入长度', trigger: 'blur' }
      ],
      width: [
        { required: true, message: '请输入宽度', trigger: 'blur' }
      ],
      height: [
        { required: true, message: '请输入高度', trigger: 'blur' }
      ]
    }

    const maintenanceRules = {
      type: [
        { required: true, message: '请选择维护类型', trigger: 'change' }
      ],
      duration: [
        { required: true, message: '请输入预计时长', trigger: 'blur' }
      ],
      description: [
        { required: true, message: '请输入维护说明', trigger: 'blur' }
      ]
    }

    // 模拟统计数据
    const stats = ref({
      totalBoxes: 24,
      availableBoxes: 15,
      usageRate: 37.5,
      alertCount: 2
    })

    // 模拟储位数据
    const storageBoxes = ref([
      {
        id: 'A-01',
        size: '40×40×40cm',
        status: 'occupied',
        packageId: 'SF1234567890',
        storageTime: '2024-03-10 14:30:00',
        history: [
          {
            id: 1,
            time: '2024-03-10 14:30:00',
            type: 'success',
            content: '包裹入库：SF1234567890'
          }
        ]
      },
      {
        id: 'A-02',
        size: '40×40×40cm',
        status: 'available',
        history: []
      },
      {
        id: 'A-03',
        size: '40×40×40cm',
        status: 'alert',
        alertMessage: '储位门锁异常',
        history: [
          {
            id: 1,
            time: '2024-03-10 15:30:00',
            type: 'warning',
            content: '检测到门锁异常'
          }
        ]
      }
    ])

    // 获取状态类型
    const getStatusType = (status) => {
      const types = {
        available: 'success',
        occupied: 'primary',
        alert: 'danger',
        disabled: 'info'
      }
      return types[status] || 'info'
    }

    // 获取状态文本
    const getStatusText = (status) => {
      const texts = {
        available: '空闲',
        occupied: '已占用',
        alert: '异常',
        disabled: '已停用'
      }
      return texts[status] || '未知'
    }

    // 选择储位
    const selectBox = (box) => {
      selectedBox.value = box
    }

    // 显示添加储位对话框
    const showAddStorageDialog = () => {
      addForm.value = {
        id: '',
        length: 20,
        width: 20,
        height: 3,
        notes: ''
      }
      addDialogVisible.value = true
    }

    // 提交添加储位
    const submitAdd = async () => {
      if (!addFormRef.value) return

      try {
        await addFormRef.value.validate()
        submitting.value = true

        // TODO: 调用添加储位API
        await new Promise(resolve => setTimeout(resolve, 1000))

        addDialogVisible.value = false
        ElMessage.success('添加成功')
      } catch (error) {
        console.error('添加失败:', error)
      } finally {
        submitting.value = false
      }
    }

    // 处理维护
    const handleMaintenance = (box) => {
      selectedBox.value = box
      maintenanceForm.value = {
        type: '',
        duration: 1,
        description: ''
      }
      maintenanceDialogVisible.value = true
    }

    // 提交维护
    const submitMaintenance = async () => {
      if (!maintenanceFormRef.value) return

      try {
        await maintenanceFormRef.value.validate()
        submitting.value = true

        // TODO: 调用维护API
        await new Promise(resolve => setTimeout(resolve, 1000))

        maintenanceDialogVisible.value = false
        ElMessage.success('维护任务已创建')
      } catch (error) {
        console.error('创建维护任务失败:', error)
      } finally {
        submitting.value = false
      }
    }

    // 停用储位
    const handleDisable = async (box) => {
      try {
        await ElMessageBox.confirm(
          '确定要停用该储位吗？停用后将无法分配新的包裹。',
          '提示',
          {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }
        )

        submitting.value = true
        // TODO: 调用停用API
        await new Promise(resolve => setTimeout(resolve, 1000))

        ElMessage.success('储位已停用')
      } catch (error) {
        if (error !== 'cancel') {
          console.error('停用失败:', error)
        }
      } finally {
        submitting.value = false
      }
    }

    // 启用储位
    const handleEnable = async (box) => {
      try {
        submitting.value = true
        // TODO: 调用启用API
        await new Promise(resolve => setTimeout(resolve, 1000))

        ElMessage.success('储位已启用')
      } catch (error) {
        console.error('启用失败:', error)
      } finally {
        submitting.value = false
      }
    }

    return {
      submitting,
      viewMode,
      selectedBox,
      addDialogVisible,
      maintenanceDialogVisible,
      addFormRef,
      maintenanceFormRef,
      addForm,
      maintenanceForm,
      addRules,
      maintenanceRules,
      stats,
      storageBoxes,
      getStatusType,
      getStatusText,
      selectBox,
      showAddStorageDialog,
      submitAdd,
      handleMaintenance,
      submitMaintenance,
      handleDisable,
      handleEnable
    }
  }
}
</script>

<style scoped>
.storage-management {
  padding: 20px;
}

.stat-card {
  margin-bottom: 20px;
}

.stat-content {
  display: flex;
  align-items: center;
}

.stat-icon {
  font-size: 48px;
  margin-right: 16px;
}

.stat-icon.primary {
  color: var(--el-color-primary);
}

.stat-icon.success {
  color: var(--el-color-success);
}

.stat-icon.warning {
  color: var(--el-color-warning);
}

.stat-icon.danger {
  color: var(--el-color-danger);
}

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: 24px;
  font-weight: bold;
  color: var(--el-text-color-primary);
  line-height: 1;
  margin-bottom: 8px;
}

.stat-title {
  font-size: 14px;
  color: var(--el-text-color-secondary);
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

.header-actions {
  display: flex;
  gap: 16px;
  align-items: center;
}

.storage-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 16px;
  padding: 16px;
}

.storage-box {
  border: 1px solid var(--el-border-color);
  border-radius: 4px;
  padding: 16px;
  cursor: pointer;
  transition: all 0.3s;
}

.storage-box:hover {
  border-color: var(--el-color-primary);
}

.box-occupied {
  background-color: var(--el-color-primary-light-9);
  border-color: var(--el-color-primary);
}

.box-alert {
  background-color: var(--el-color-danger-light-9);
  border-color: var(--el-color-danger);
}

.box-selected {
  border-color: var(--el-color-primary);
  background-color: var(--el-color-primary-light-9);
}

.box-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.box-id {
  font-weight: bold;
  color: var(--el-text-color-primary);
}

.box-info {
  font-size: 14px;
}

.info-item {
  margin-bottom: 8px;
}

.info-item .label {
  color: var(--el-text-color-secondary);
}

.info-item .value {
  color: var(--el-text-color-primary);
  margin-left: 4px;
}

.alert-message {
  color: var(--el-color-danger);
}

.box-size {
  color: var(--el-text-color-secondary);
  text-align: center;
}

.detail-card {
  height: calc(100vh - 280px);
}

.usage-history {
  margin-top: 20px;
}

.section-title {
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 16px;
  color: var(--el-text-color-primary);
}

.unit {
  margin-left: 8px;
  color: var(--el-text-color-secondary);
}

:deep(.el-timeline-item__content) {
  color: var(--el-text-color-regular);
}
</style> 