<template>
  <div class="list-container">
    <el-card>
      <div class="page-header">
        <h2>活动管理页</h2>
        <el-button type="primary" @click="createActivity">创建活动</el-button>
      </div>

      <!-- 筛选区域 -->
      <div class="filter-container">
        <el-form :inline="true" :model="filterForm" class="filter-form">
          <el-form-item label="活动名称">
            <el-input v-model="filterForm.activityTitle" placeholder="请输入活动名称" clearable />
          </el-form-item>
          <el-form-item label="公开状态">
            <el-select v-model="filterForm.publicFlag" placeholder="请选择状态" clearable style="width: 100px;">
              <el-option label="全部" value="" />
              <el-option label="公开" value="1" />
              <el-option label="非公开" value="0" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="onSearch">查询</el-button>
            <el-button @click="resetFilter">重置</el-button>
          </el-form-item>
        </el-form>
      </div>

      <!-- 表格区域 -->
      <el-table
        :data="tableData"
        style="width: 100%"
        border
        stripe
        v-loading="loading"
        element-loading-text="加载中..."
      >
        <el-table-column prop="activityTitle" label="活动标题" min-width="180" />
        <el-table-column label="活动时间" width="200">
          <template #default="{ row }">
            <div>开始: {{ formatDate(row.activityStartTime) }}</div>
            <div>结束: {{ formatDate(row.activityEndTime) }}</div>
          </template>
        </el-table-column>
        <el-table-column prop="activityPrice" label="活动费用" width="100">
          <template #default="{ row }">
            <span class="price">¥{{ row.activityPrice.toFixed(2) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="publicFlag" label="公开状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.publicFlag === 1 ? 'success' : 'info'">
              {{ row.publicFlag === 1 ? '公开' : '非公开' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusTagType(row.status)">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="160" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="viewActivity(row)">查看</el-button>
            <el-button type="warning" size="small" @click="editActivity(row)">编辑</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          background
          layout="total, sizes, prev, pager, next, jumper"
          :total="totalCount"
          :page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :current-page="currentPage"
          @current-change="handlePageChange"
          @size-change="handleSizeChange"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import eventBus from '../eventBus'
import { ElMessage } from 'element-plus'
import axios from 'axios'
import { BASE_API_URL, API_PATHS } from '../constants/api'

const router = useRouter()

// 格式化日期函数
const formatDate = (dateString: string) => {
  if (!dateString) return '未设置';

  try {
    const date = new Date(dateString);
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (e) {
    return dateString;
  }
}

// 获取状态标签类型
const getStatusTagType = (status: number | string | undefined) => {
  if (status === undefined || status === null) return 'info';

  // 根据状态值返回不同的标签类型
  switch (Number(status)) {
    case 0: return 'info';      // 草稿
    case 1: return 'success';   // 已发布
    case 2: return 'warning';   // 进行中
    case 3: return 'danger';    // 已结束
    case 4: return 'info';      // 已取消
    default: return 'info';
  }
}

// 获取状态文本
const getStatusText = (status: number | string | undefined) => {
  if (status === undefined || status === null) return '未知';

  // 根据状态值返回对应的文本
  switch (Number(status)) {
    case 0: return '草稿';
    case 1: return '已发布';
    case 2: return '进行中';
    case 3: return '已结束';
    case 4: return '已取消';
    default: return '未知';
  }
}

// 筛选表单
const filterForm = reactive({
  activityTitle: '', // 活动名称，与API参数对应
  publicFlag: '', // 活动状态，0为非公开，1为公开
})

// 分页相关
const currentPage = ref(1)
const pageSize = ref(10)
const totalCount = ref(0)
const loading = ref(false)

// 表格数据
interface ActivityItem {
  id: number;
  activityTitle: string;
  activityStartTime: string;
  activityEndTime: string;
  activityPrice: number;
  publicFlag: number;
  status?: number;
  [key: string]: any;
}

const tableData = ref<ActivityItem[]>([])

// 获取活动列表数据
const fetchActivityList = async () => {
  loading.value = true
  try {
    // 检查是否有token
    const token = localStorage.getItem('token')
    if (!token) {
      console.warn('未找到token，可能需要重新登录')
      ElMessage.warning('请先登录')
      router.push('/login')
      return
    }

    const params = {
      pageNum: currentPage.value,
      pageSize: pageSize.value,
      activityTitle: filterForm.activityTitle || undefined,
      publicFlag: filterForm.publicFlag === '' ? undefined : filterForm.publicFlag
    }

    console.log('请求活动列表参数:', params)

    // 直接使用axios发送请求，确保使用正确的URL和token
    const response = await axios.get(`${BASE_API_URL}${API_PATHS.ACTIVITY.LIST}`, {
      params,
      headers: {
        'api-access-token': token,
        'Content-Type': 'application/json'
      }
    })

    console.log('活动列表响应:', response)

    if (response.data && response.data.code === 0) {
      // 打印完整的响应数据，用于调试
      console.log('活动列表数据:', JSON.stringify(response.data))

      // 根据实际返回的数据结构进行处理
      if (response.data.list && Array.isArray(response.data.list)) {
        // 如果list字段直接在response.data中
        tableData.value = response.data.list
        totalCount.value = response.data.total || response.data.list.length
      } else if (response.data.data && Array.isArray(response.data.data.list)) {
        // 如果list字段在response.data.data中
        tableData.value = response.data.data.list
        totalCount.value = response.data.data.total || response.data.data.list.length
      } else if (Array.isArray(response.data.data)) {
        // 如果response.data.data直接是数组
        tableData.value = response.data.data
        totalCount.value = response.data.data.length
      } else {
        // 其他情况，尝试适配
        console.warn('未找到预期的数据结构，尝试适配:', response.data)
        const possibleData = response.data.data || response.data.list || response.data || []
        if (Array.isArray(possibleData)) {
          tableData.value = possibleData as ActivityItem[]
        } else if (possibleData) {
          tableData.value = [possibleData as ActivityItem]
        } else {
          tableData.value = []
        }
        totalCount.value = tableData.value.length
      }
    } else {
      ElMessage.error(response.data?.message || '获取活动列表失败')
      tableData.value = []
      totalCount.value = 0
    }
  } catch (error) {
    console.error('获取活动列表失败:', error)
    ElMessage.error('获取活动列表失败，请稍后重试')
    tableData.value = []
    totalCount.value = 0
  } finally {
    loading.value = false
  }
}

// 初始化加载数据
onMounted(() => {
  fetchActivityList()
})

// 搜索
const onSearch = () => {
  currentPage.value = 1
  fetchActivityList()
}

// 重置筛选
const resetFilter = () => {
  filterForm.activityTitle = ''
  filterForm.publicFlag = ''
  onSearch()
}

// 页码变化
const handlePageChange = (page: number) => {
  currentPage.value = page
  fetchActivityList()
}

// 每页显示数量变化
const handleSizeChange = (size: number) => {
  pageSize.value = size
  currentPage.value = 1
  fetchActivityList()
}

// 查看活动详情
const viewActivity = (row: any) => {
  eventBus.emit('open-activity-detail', row)
}

// 编辑活动
const editActivity = (row: any) => {
  console.log('编辑活动行数据:', row)
  // 确保row对象包含id字段
  if (!row.id) {
    ElMessage.error('活动ID不能为空')
    return
  }
  eventBus.emit('open-activity-edit', row)
}

// 创建活动
const createActivity = () => {
  // 直接导航到活动编辑页面，不传递ID表示创建新活动
  router.push('/activity-edit')
}
</script>

<style scoped>
.list-container {
  width: 100%;
  height: 100%;
  padding: 0;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: stretch;
  background: #181818;
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

.filter-container {
  margin-bottom: 20px;
  padding: 15px;
  background: #f5f7fa;
  border-radius: 4px;
}

.filter-form {
  display: flex;
  flex-wrap: wrap;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.small-text {
  font-size: 12px;
  color: #909399;
}

.price {
  color: #f56c6c;
  font-weight: bold;
}
</style>
