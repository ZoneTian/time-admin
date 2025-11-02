<template>
  <div class="list-container">
    <el-card>
      <div class="page-header">
        <h2>用户管理</h2>
      </div>

      <!-- 筛选区域 - 可折叠 -->
      <div class="filter-container">
        <div class="filter-header" @click="toggleFilter">
          <span>筛选条件</span>
          <el-icon :class="{ 'is-rotate': showFilter }"><ArrowDown /></el-icon>
        </div>

        <el-collapse-transition>
          <div v-show="showFilter">
            <el-form :inline="true" :model="filterForm" class="filter-form">
              <el-form-item label="用户编号">
                <el-input v-model="filterForm.customerSerial" placeholder="请输入用户编号" clearable />
              </el-form-item>
              <el-form-item label="用户昵称">
                <el-input v-model="filterForm.nickName" placeholder="请输入用户昵称" clearable />
              </el-form-item>
              <el-form-item label="学校">
                <el-input v-model="filterForm.school" placeholder="请输入学校" clearable />
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="onSearch">查询</el-button>
                <el-button @click="resetFilter">重置</el-button>
              </el-form-item>
            </el-form>
          </div>
        </el-collapse-transition>
      </div>

      <!-- 表格区域 -->
      <el-table
        :data="filteredData"
        style="width: 100%"
        border
        stripe
        v-loading="loading"
        element-loading-text="加载中..."
      >
        <el-table-column prop="customerId" label="用户ID" width="80" />
        <el-table-column prop="customerSerial" label="用户编号" width="120" />
        <el-table-column prop="nickName" label="用户昵称" width="120" />
        <el-table-column prop="academicReviewStatus" label="学历认证状态" width="120">
          <template #default="{ row }">
            <el-tag :type="getAcademicReviewStatusType(row.academicReviewStatus)">
              {{ getAcademicReviewStatusText(row.academicReviewStatus) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="photoReviewStatus" label="照片审核状态" width="120">
          <template #default="{ row }">
            <el-tag :type="getPhotoReviewStatusType(row.photoReviewStatus)">
              {{ getPhotoReviewStatusText(row.photoReviewStatus) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="gender" label="性别" width="80">
          <template #default="{ row }">
            {{ getGenderText(row.gender) }}
          </template>
        </el-table-column>
        <el-table-column prop="school" label="学校" width="150" />
        <el-table-column prop="registrationTime" label="注册时间" width="180">
          <template #default="{ row }">
            {{ formatDate(row.registrationTime) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="100" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="emitOpenDetail(row)">查看</el-button>
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
import { ref, computed, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowDown } from '@element-plus/icons-vue'
import eventBus from '../eventBus'
import type { DetailRow } from '../eventBus'
import axios from 'axios'
import { BASE_API_URL } from '../constants/api'
import { ElMessage } from 'element-plus'

// 控制筛选区域的显示/隐藏
const showFilter = ref(false)
const toggleFilter = () => {
  showFilter.value = !showFilter.value
}

// 定义用户数据接口
interface UserItem {
  customerId: number;
  customerSerial: string;
  nickName: string;
  gender: number;
  school: string;
  academics: string;
  registrationTime: string;
  academicReviewStatus: number;
  photoReviewStatus: number;
  [key: string]: any;
}

// 筛选表单
const filterForm = reactive({
  customerSerial: '', // 用户编号
  nickName: '',       // 用户昵称
  school: '',         // 学校
})

// 分页相关
const currentPage = ref(1)
const pageSize = ref(10)
const totalCount = ref(0)
const loading = ref(false)

// 表格数据
const tableData = ref<UserItem[]>([])

// 获取用户列表数据
const fetchUserList = async () => {
  loading.value = true
  try {
    const token = localStorage.getItem('token')
    if (!token) {
      ElMessage.warning('请先登录')
      return
    }

    const params = {
      pageNum: currentPage.value,
      pageSize: pageSize.value,
      customerSerial: filterForm.customerSerial || undefined,
      nickName: filterForm.nickName || undefined,
      school: filterForm.school || undefined
    }

    const response = await axios.get(`${BASE_API_URL}/customer/list`, {
      params,
      headers: {
        'api-access-token': token,
        'Content-Type': 'application/json',
        'Accept': '*/*'
      }
    })

    console.log('用户列表响应:', response)

    if (response.data && response.data.code === 0) {
      tableData.value = response.data.data.list || []
      totalCount.value = response.data.data.total || 0
    } else {
      ElMessage.error(response.data?.message || '获取用户列表失败')
    }
  } catch (error) {
    console.error('获取用户列表失败:', error)
    ElMessage.error('获取用户列表失败，请稍后重试')
  } finally {
    loading.value = false
  }
}

// 组件挂载时获取数据
onMounted(() => {
  fetchUserList()
})

// 筛选后的数据
const filteredData = computed(() => {
  return tableData.value
})

// 搜索
const onSearch = () => {
  currentPage.value = 1
  fetchUserList()
}

// 重置筛选
const resetFilter = () => {
  filterForm.customerSerial = ''
  filterForm.nickName = ''
  filterForm.school = ''
  onSearch()
}

// 页码变化
const handlePageChange = (page: number) => {
  currentPage.value = page
  fetchUserList()
}

// 每页显示数量变化
const handleSizeChange = (size: number) => {
  pageSize.value = size
  currentPage.value = 1
  fetchUserList()
}

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
      minute: '2-digit',
      second: '2-digit'
    });
  } catch (e) {
    return dateString;
  }
}

// 获取学历认证状态标签类型
const getAcademicReviewStatusType = (status: number) => {
  switch (status) {
    case 0: return 'info';    // 待审核
    case 1: return 'success'; // 已通过
    case 2: return 'danger';  // 未通过
    case 3: return 'info'
    default: return 'info';
  }
}

// 获取学历认证状态文本
const getAcademicReviewStatusText = (status: number) => {
  switch (status) {
    case 0: return '待审核';
    case 1: return '已通过';
    case 2: return '未通过';
    case 3: return '未审核'
    default: return '未知';
  }
}

// 获取照片审核状态标签类型
const getPhotoReviewStatusType = (status: number) => {
  switch (status) {
    case 0: return 'info';    // 待审核
    case 1: return 'success'; // 已通过
    case 2: return 'danger';  // 未通过
    case 3: return 'info';  // 未审核

    default: return 'info';
  }
}

// 获取照片审核状态文本
const getPhotoReviewStatusText = (status: number) => {
  switch (status) {
    case 0: return '待审核';
    case 1: return '已通过';
    case 2: return '未通过';
    case 3: return '未审核';
    default: return '未知';
  }
}

// 获取性别文本
const getGenderText = (gender: number) => {
  switch (gender) {
    case 1: return '男';
    case 2: return '女';
    default: return '未知';
  }
}


// 获取路由实例
const router = useRouter()

const emitOpenDetail = (row: UserItem) => {
  // 直接使用路由导航到用户详情页面
  router.push(`/member/${row.customerId}`)
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
  border: 1px solid #ebeef5;
  border-radius: 4px;
  overflow: hidden;
}

.filter-header {
  padding: 12px 20px;
  background-color: #f5f7fa;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: bold;
}

.filter-header .el-icon {
  transition: transform 0.3s;
}

.filter-header .is-rotate {
  transform: rotate(180deg);
}

.filter-form {
  display: flex;
  flex-wrap: wrap;
  padding: 15px;
  background: #f5f7fa;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style>
