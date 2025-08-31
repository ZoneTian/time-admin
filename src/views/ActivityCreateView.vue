<template>
  <div class="create-container">
    <el-card>
      <div class="page-header">
        <h2>创建活动</h2>
      </div>

      <el-form
        :model="activityForm"
        :rules="rules"
        ref="activityFormRef"
        label-width="100px"
        class="activity-form"
        v-loading="loading"
      >
        <el-form-item label="活动标题" prop="activityTitle">
          <el-input v-model="activityForm.activityTitle" placeholder="请输入活动标题" />
        </el-form-item>

        <el-form-item label="活动内容" prop="activityContent">
          <el-input
            v-model="activityForm.activityContent"
            type="textarea"
            :rows="4"
            placeholder="请输入活动内容"
          />
        </el-form-item>

        <el-form-item label="开始时间" prop="activityStartTime">
          <el-date-picker
            v-model="activityForm.activityStartTime"
            type="datetime"
            placeholder="选择开始时间"
            format="YYYY-MM-DD HH:mm:ss"
            value-format="YYYY-MM-DD HH:mm:ss"
          />
        </el-form-item>

        <el-form-item label="结束时间" prop="activityEndTime">
          <el-date-picker
            v-model="activityForm.activityEndTime"
            type="datetime"
            placeholder="选择结束时间"
            format="YYYY-MM-DD HH:mm:ss"
            value-format="YYYY-MM-DD HH:mm:ss"
          />
        </el-form-item>

        <el-form-item label="活动费用" prop="activityPrice">
          <el-input-number
            v-model="activityForm.activityPrice"
            :precision="2"
            :step="10"
            :min="0"
            controls-position="right"
          />
        </el-form-item>

        <el-form-item label="是否公开" prop="publicFlag">
          <el-radio-group v-model="activityForm.publicFlag">
            <el-radio :label="1">公开</el-radio>
            <el-radio :label="0">非公开</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="submitForm">创建活动</el-button>
          <el-button @click="resetForm">重置</el-button>
          <el-button @click="goBack">返回</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import axios from 'axios'
import { BASE_API_URL, API_PATHS } from '../constants/api'

const router = useRouter()
const loading = ref(false)
const activityFormRef = ref()

// 活动表单数据
const activityForm = reactive({
  activityTitle: '',
  activityContent: '',
  activityStartTime: '',
  activityEndTime: '',
  activityPrice: 0,
  publicFlag: 1
})

// 表单验证规则
const rules = {
  activityTitle: [
    { required: true, message: '请输入活动标题', trigger: 'blur' },
    { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
  ],
  activityContent: [
    { required: true, message: '请输入活动内容', trigger: 'blur' }
  ],
  activityStartTime: [
    { required: true, message: '请选择开始时间', trigger: 'change' }
  ],
  activityEndTime: [
    { required: true, message: '请选择结束时间', trigger: 'change' },
    {
      validator: (rule: any, value: string, callback: any) => {
        if (!value || !activityForm.activityStartTime) {
          callback();
          return;
        }

        const startTime = new Date(activityForm.activityStartTime);
        const endTime = new Date(value);

        // 检查开始时间和结束时间是否在同一天
        const startDate = new Date(startTime.getFullYear(), startTime.getMonth(), startTime.getDate());
        const endDate = new Date(endTime.getFullYear(), endTime.getMonth(), endTime.getDate());

        if (startDate.getTime() !== endDate.getTime()) {
          callback(new Error('活动开始时间和结束时间必须在同一天内'));
        } else if (endTime <= startTime) {
          callback(new Error('结束时间必须晚于开始时间'));
        } else {
          callback();
        }
      },
      trigger: 'change'
    }
  ],
  activityPrice: [
    { required: true, message: '请输入活动费用', trigger: 'blur' },
    { type: 'number', min: 0, message: '费用不能小于0', trigger: 'blur' }
  ],
  publicFlag: [
    { required: true, message: '请选择是否公开', trigger: 'change' }
  ]
}

// 提交表单
const submitForm = () => {
  activityFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      loading.value = true
      try {
        // 获取token
        const token = localStorage.getItem('token')
        if (!token) {
          ElMessage.warning('请先登录')
          router.push('/login')
          return
        }

        // 发送创建活动请求
        const response = await axios.post(
          `${BASE_API_URL}${API_PATHS.ACTIVITY.ADD}`,
          activityForm,
          {
            headers: {
              'api-access-token': token,
              'Content-Type': 'application/json'
            }
          }
        )

        console.log('创建活动响应:', response)

        if (response.data && response.data.code === 0) {
          ElMessage.success('活动创建成功！')
          // 跳转到活动列表页
          router.push('/activity')
        } else {
          ElMessage.error(response.data?.message || '创建活动失败')
        }
      } catch (error: any) {
        console.error('创建活动失败:', error)
        if (error.response) {
          ElMessage.error(`创建失败: ${error.response.data?.message || error.response.status}`)
        } else {
          ElMessage.error('创建活动失败，请稍后重试')
        }
      } finally {
        loading.value = false
      }
    }
  })
}

// 重置表单
const resetForm = () => {
  activityFormRef.value?.resetFields()
}

// 返回上一页
const goBack = () => {
  router.push('/activity')
}

// 监听活动开始时间变化，重新验证活动结束时间
watch(() => activityForm.activityStartTime, (newVal) => {
  if (newVal && activityForm.activityEndTime) {
    // 如果活动开始时间变化，重新验证活动结束时间
    activityFormRef.value?.validateField('activityEndTime');
  }
});
</script>

<style scoped>
.create-container {
  width: 100%;
  height: 100%;
  padding: 0;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: stretch;
}

.el-card {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: #fff;
  color: #222;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.page-header h2 {
  margin: 0;
  color: #333;
}

.activity-form {
  max-width: 600px;
  margin: 0 auto;
}
</style>
