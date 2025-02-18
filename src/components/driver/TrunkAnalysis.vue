<template>
  <div class="trunk-analysis">
    <el-card class="upload-card">
      <div class="upload-area" @click="triggerUpload" v-loading="loading">
        <input
          type="file"
          ref="fileInput"
          accept="image/*"
          style="display: none"
          @change="handleFileChange"
        >
        <div v-if="!previewUrl" class="upload-placeholder">
          <i class="el-icon-upload"></i>
          <div class="upload-text">点击上传后备箱照片</div>
          <div class="upload-hint">请确保照片中包含A4纸作为参考物</div>
        </div>
        <img v-else :src="previewUrl" class="preview-image">
      </div>

      <div v-if="analysisResult" class="analysis-result">
        <h3>分析结果</h3>
        <el-descriptions :column="2" border>
          <el-descriptions-item label="可用宽度">
            {{ formatDimension(analysisResult.usableSpace.width) }}
          </el-descriptions-item>
          <el-descriptions-item label="可用高度">
            {{ formatDimension(analysisResult.usableSpace.height) }}
          </el-descriptions-item>
          <el-descriptions-item label="可用深度">
            {{ formatDimension(analysisResult.usableSpace.depth) }}
          </el-descriptions-item>
          <el-descriptions-item label="可用体积">
            {{ formatVolume(analysisResult.usableSpace.volume) }}
          </el-descriptions-item>
          <el-descriptions-item label="置信度">
            {{ formatConfidence(analysisResult.confidence) }}
          </el-descriptions-item>
        </el-descriptions>
      </div>
    </el-card>

    <el-card class="history-card">
      <div slot="header">
        <span>历史记录</span>
        <el-button
          style="float: right; padding: 3px 0"
          type="text"
          @click="loadHistory"
        >
          刷新
        </el-button>
      </div>

      <el-table
        :data="historyList"
        style="width: 100%"
        v-loading="historyLoading"
      >
        <el-table-column prop="createdAt" label="分析时间" width="180">
          <template slot-scope="scope">
            {{ formatDate(scope.row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column label="分析结果" min-width="300">
          <template slot-scope="scope">
            <div>宽度: {{ formatDimension(scope.row.dimensions.width) }}</div>
            <div>高度: {{ formatDimension(scope.row.dimensions.height) }}</div>
            <div>深度: {{ formatDimension(scope.row.dimensions.depth) }}</div>
            <div>体积: {{ formatVolume(scope.row.dimensions.volume) }}</div>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120">
          <template slot-scope="scope">
            <el-button
              type="text"
              size="small"
              @click="deleteRecord(scope.row.id)"
            >
              删除
            </el-button>
            <el-button
              type="text"
              size="small"
              @click="viewImage(scope.row.photoPath)"
            >
              查看
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination">
        <el-pagination
          @current-change="handlePageChange"
          :current-page.sync="currentPage"
          :page-size="pageSize"
          layout="total, prev, pager, next"
          :total="total"
        >
        </el-pagination>
      </div>
    </el-card>

    <!-- 图片预览对话框 -->
    <el-dialog :visible.sync="previewDialogVisible" width="80%">
      <img :src="previewImageUrl" style="width: 100%">
    </el-dialog>
  </div>
</template>

<script>
import { mapActions } from 'vuex'
import { formatDate } from '@/utils/date'

export default {
  name: 'TrunkAnalysis',

  data() {
    return {
      loading: false,
      historyLoading: false,
      previewUrl: '',
      analysisResult: null,
      historyList: [],
      currentPage: 1,
      pageSize: 10,
      total: 0,
      previewDialogVisible: false,
      previewImageUrl: ''
    }
  },

  methods: {
    ...mapActions('driver', ['analyzeTrunkSpace', 'getAnalysisHistory', 'deleteAnalysis']),

    // 触发文件选择
    triggerUpload() {
      this.$refs.fileInput.click()
    },

    // 处理文件选择
    async handleFileChange(event) {
      const file = event.target.files[0]
      if (!file) return

      // 验证文件类型
      if (!file.type.startsWith('image/')) {
        this.$message.error('请选择图片文件')
        return
      }

      // 验证文件大小
      if (file.size > 5 * 1024 * 1024) {
        this.$message.error('图片大小不能超过5MB')
        return
      }

      // 显示预览
      this.previewUrl = URL.createObjectURL(file)

      try {
        this.loading = true
        // 分析后备箱空间
        const result = await this.analyzeTrunkSpace(file)
        this.analysisResult = result
        this.$message.success('分析成功')
        // 刷新历史记录
        this.loadHistory()
      } catch (error) {
        this.$message.error(error.message || '分析失败')
      } finally {
        this.loading = false
      }
    },

    // 加载历史记录
    async loadHistory() {
      try {
        this.historyLoading = true
        const { list, total } = await this.getAnalysisHistory({
          page: this.currentPage,
          pageSize: this.pageSize
        })
        this.historyList = list
        this.total = total
      } catch (error) {
        this.$message.error('获取历史记录失败')
      } finally {
        this.historyLoading = false
      }
    },

    // 删除记录
    async deleteRecord(id) {
      try {
        await this.$confirm('确定要删除这条记录吗？')
        await this.deleteAnalysis(id)
        this.$message.success('删除成功')
        this.loadHistory()
      } catch (error) {
        if (error !== 'cancel') {
          this.$message.error('删除失败')
        }
      }
    },

    // 查看图片
    viewImage(path) {
      this.previewImageUrl = path
      this.previewDialogVisible = true
    },

    // 处理页码变化
    handlePageChange(page) {
      this.currentPage = page
      this.loadHistory()
    },

    // 格式化尺寸
    formatDimension(value) {
      return value ? `${Math.round(value)}mm` : '-'
    },

    // 格式化体积
    formatVolume(value) {
      if (!value) return '-'
      return value > 1000000
        ? `${(value / 1000000).toFixed(2)}m³`
        : `${Math.round(value)}cm³`
    },

    // 格式化置信度
    formatConfidence(value) {
      return value ? `${(value * 100).toFixed(1)}%` : '-'
    },

    // 格式化日期
    formatDate
  },

  created() {
    this.loadHistory()
  }
}
</script>

<style lang="scss" scoped>
.trunk-analysis {
  padding: 20px;

  .upload-card {
    margin-bottom: 20px;
  }

  .upload-area {
    width: 100%;
    height: 300px;
    border: 2px dashed #dcdfe6;
    border-radius: 6px;
    cursor: pointer;
    position: relative;
    overflow: hidden;
    display: flex;
    justify-content: center;
    align-items: center;
    transition: border-color 0.3s;

    &:hover {
      border-color: #409eff;
    }

    .upload-placeholder {
      text-align: center;
      color: #909399;

      i {
        font-size: 48px;
        margin-bottom: 10px;
      }

      .upload-text {
        font-size: 16px;
        margin-bottom: 8px;
      }

      .upload-hint {
        font-size: 14px;
        color: #c0c4cc;
      }
    }

    .preview-image {
      max-width: 100%;
      max-height: 100%;
      object-fit: contain;
    }
  }

  .analysis-result {
    margin-top: 20px;
    padding-top: 20px;
    border-top: 1px solid #ebeef5;

    h3 {
      margin: 0 0 15px;
      font-size: 16px;
      font-weight: 500;
    }
  }

  .history-card {
    .pagination {
      margin-top: 20px;
      text-align: right;
    }
  }
}
</style> 