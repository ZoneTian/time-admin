<template>
  <div class="detail-container">
    <el-breadcrumb separator="/" style="margin-bottom: 20px;">
      <el-breadcrumb-item @click="goList" style="cursor:pointer; color:#3a5bdb;">活动管理</el-breadcrumb-item>
      <el-breadcrumb-item>{{ activity?.title || '活动详情' }}</el-breadcrumb-item>
    </el-breadcrumb>

    <div class="action-buttons">
      <el-button type="primary" @click="editActivity" v-if="activity">编辑活动</el-button>
    </div>

    <el-tabs v-model="activeTab" class="detail-tabs">
      <el-tab-pane label="基本信息" name="basic">
        <template v-if="activity">
          <el-descriptions :column="2" border>
            <el-descriptions-item label="活动名称" :span="2">{{ activity.title }}</el-descriptions-item>
            <el-descriptions-item label="活动封面" :span="2" v-if="activity.mainCoverImage">
              <div class="cover-in-table">
                <el-image :src="activity.mainCoverImage" fit="cover" :preview-src-list="[activity.mainCoverImage]"></el-image>
              </div>
            </el-descriptions-item>
            <el-descriptions-item label="活动描述" :span="2">
              <div class="content-text">{{ activity.content }}</div>
            </el-descriptions-item>
            <el-descriptions-item label="活动时间">
              {{ activity.startTime }} 至 {{ activity.endTime }}
            </el-descriptions-item>
            <el-descriptions-item label="报名时间">
              {{ activity.applyStartTime || '未设置' }} 至 {{ activity.applyEndTime || '未设置' }}
            </el-descriptions-item>
            <el-descriptions-item label="城市">{{ activity.city || '未设置' }}</el-descriptions-item>
            <el-descriptions-item label="活动地点">{{ activity.address || '未设置' }}</el-descriptions-item>
            <el-descriptions-item label="活动费用">¥{{ activity.price?.toFixed(2) || '0.00' }}</el-descriptions-item>
            <el-descriptions-item label="公开状态">
              <el-tag :type="activity.publicFlag === 1 ? 'success' : 'info'">
                {{ activity.publicFlag === 1 ? '公开' : '非公开' }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="活动状态">
              <el-tag :type="getStatusType(activity.status)">{{ activity.status }}</el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="创建时间">{{ activity.createTime || '未知' }}</el-descriptions-item>
          </el-descriptions>

          <div class="cover-images" v-if="activity.coverImages && activity.coverImages.length > 0">
            <h3>活动封面图片</h3>
            <div class="image-grid">
              <div v-for="(image, index) in activity.coverImages" :key="index" class="image-item">
                <el-image :src="image" fit="cover" :preview-src-list="activity.coverImages"></el-image>
              </div>
            </div>
          </div>

          <div class="detail-images" v-if="activity.detailImages && activity.detailImages.length > 0">
            <h3>活动详情图</h3>
            <div class="image-grid">
              <div v-for="(image, index) in activity.detailImages" :key="index" class="image-item">
                <el-image :src="image" fit="cover" :preview-src-list="activity.detailImages"></el-image>
              </div>
            </div>
          </div>
        </template>
        <template v-else>
          <el-alert title="未找到该活动" type="error" show-icon></el-alert>
        </template>
      </el-tab-pane>

      <el-tab-pane label="报名成员" name="members">
        <el-table :data="activityMembers" style="width: 100%" v-loading="membersLoading">
          <el-table-column prop="name" label="姓名" width="120" />
          <el-table-column prop="customerSerial" label="用户编号" width="150" />
          <el-table-column prop="signupTime" label="报名时间" width="180" />
          <el-table-column prop="telephone" label="手机号" width="150" />
          <el-table-column prop="price" label="活动价格" width="100">
            <template #default="{ row }">
              ¥{{ row.price }}
            </template>
          </el-table-column>
          <el-table-column prop="actualPrice" label="实付金额" width="100">
            <template #default="{ row }">
              ¥{{ row.actualPrice }}
            </template>
          </el-table-column>
        </el-table>

        <div class="pagination-container" v-if="membersTotal > 0">
          <el-pagination
            background
            layout="total, sizes, prev, pager, next, jumper"
            :total="membersTotal"
            :page-size="pageSize"
            :current-page="currentPage"
            :page-sizes="[10, 20, 50, 100]"
            @current-change="handleCurrentChange"
            @size-change="handleSizeChange"
          />
        </div>
      </el-tab-pane>

      <!-- 暂时隐藏活动照片tab
      <el-tab-pane label="活动照片" name="photos">
        <div class="photo-wall">
          <el-empty v-if="!activityPhotos.length" description="暂无照片"></el-empty>
          <div v-else class="photo-grid">
            <div v-for="(photo, index) in activityPhotos" :key="index" class="photo-item">
              <el-image :src="photo.url" fit="cover" :preview-src-list="activityPhotos.map(p => p.url)"></el-image>
              <div class="photo-info">{{ photo.description }}</div>
            </div>
          </div>
        </div>
      </el-tab-pane>
      -->
    </el-tabs>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import { ElMessage, ElLoading } from 'element-plus'
import { BASE_API_URL, API_PATHS } from '../constants/api'

const props = defineProps<{ id: string | number }>()
const router = useRouter()
const id = Number(props.id)
const activeTab = ref('basic')
const loading = ref(false)

// 定义组件可以触发的事件
const emit = defineEmits(['open-member-detail', 'open-activity-edit'])

// 活动详情数据
interface ActivityDetail {
  id: number;
  title: string;
  content: string;
  startTime: string;
  endTime: string;
  applyStartTime: string;
  applyEndTime: string;
  city: string;
  address: string;
  date: string;
  status: string;
  price: number;
  publicFlag: number;
  createTime: string;
  coverImages: string[];
  detailImages: string[];
  mainCoverImage: string;
}

const activity = ref<ActivityDetail | null>(null)

// 获取活动详情
const fetchActivityDetail = async () => {
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

    // 显示加载状态
    const loadingInstance = ElLoading.service({
      target: '.detail-container',
      text: '加载中...',
      background: 'rgba(0, 0, 0, 0.7)'
    })

    // 发送请求获取活动详情
    const response = await axios.get(`${BASE_API_URL}${API_PATHS.ACTIVITY.DETAIL}`, {
      params: { activityId: id },
      headers: {
        'api-access-token': token,
        'Content-Type': 'application/json'
      }
    })

    console.log('活动详情响应:', response)

    if (response.data && response.data.code === 0) {
      // 处理响应数据
      const activityData = response.data.data

      // 格式化活动数据
      activity.value = {
        id: activityData.id,
        title: activityData.activityTitle,
        content: activityData.activityContent,
        startTime: formatDate(activityData.activityStartTime),
        endTime: formatDate(activityData.activityEndTime),
        applyStartTime: formatDate(activityData.applyStartTime),
        applyEndTime: formatDate(activityData.applyEndTime),
        city: activityData.city,
        address: activityData.address,
        date: `${formatDate(activityData.activityStartTime)} - ${formatDate(activityData.activityEndTime)}`,
        status: getActivityStatus(activityData),
        price: activityData.activityPrice,
        publicFlag: activityData.publicFlag,
        createTime: formatDate(activityData.createTime),
        coverImages: activityData.coverImages || [],
        detailImages: activityData.detailImages || [],
        mainCoverImage: activityData.mainCoverImage || ''
      }
    } else {
      ElMessage.error(response.data?.message || '获取活动详情失败')
      activity.value = null
    }

    // 关闭加载状态
    loadingInstance.close()
  } catch (error) {
    console.error('获取活动详情失败:', error)
    ElMessage.error('获取活动详情失败，请稍后重试')
    activity.value = null
  } finally {
    loading.value = false
  }
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
      minute: '2-digit'
    });
  } catch (e) {
    return dateString;
  }
}

// 获取活动状态
const getActivityStatus = (activityData: any) => {
  const now = new Date().getTime()
  const startTime = activityData.activityStartTime ? new Date(activityData.activityStartTime).getTime() : 0
  const endTime = activityData.activityEndTime ? new Date(activityData.activityEndTime).getTime() : 0
  const signupDeadline = activityData.signupEndTime ? new Date(activityData.signupEndTime).getTime() : 0

  if (now < startTime) {
    return signupDeadline && now > signupDeadline ? '报名已截止' : '正在报名'
  } else if (now >= startTime && now <= endTime) {
    return '进行中'
  } else {
    return '已结束'
  }
}

// 根据状态获取标签类型
const getStatusType = (status: string) => {
  switch (status) {
    case '正在报名':
      return 'success'
    case '报名已截止':
      return 'warning'
    case '进行中':
      return 'primary'
    case '已结束':
      return 'info'
    default:
      return 'info'
  }
}

// 编辑活动
const editActivity = () => {
  if (activity.value) {
    emit('open-activity-edit', {
      id: activity.value.id,
      activityTitle: activity.value.title,
      nickname: ''
    })
  }
}

// 初始化时获取活动详情
onMounted(() => {
  fetchActivityDetail()
  // 如果当前标签是报名成员，则获取报名记录
  if (activeTab.value === 'members') {
    fetchActivityMembers()
  }
})

// 监听标签页变化
watch(() => activeTab.value, (newTab) => {
  if (newTab === 'members' && activityMembers.value.length === 0) {
    fetchActivityMembers()
  }
})

// 活动报名成员数据
const activityMembers = ref<any[]>([])
const membersLoading = ref(false)
const membersTotal = ref(0)
const currentPage = ref(1)
const pageSize = ref(10)

// 获取活动报名记录列表
const fetchActivityMembers = async () => {
  membersLoading.value = true
  try {
    const token = localStorage.getItem('token')
    if (!token) {
      console.warn('未找到token，可能需要重新登录')
      return
    }

    const response = await axios.get(`${BASE_API_URL}${API_PATHS.ACTIVITY.REGISTRATION_LIST}`, {
      params: {
        activityId: id,
        pageNum: currentPage.value,
        pageSize: pageSize.value
      },
      headers: {
        'api-access-token': token,
        'Content-Type': 'application/json'
      }
    })

    console.log('活动报名记录列表响应:', response)

    if (response.data && response.data.code === 0) {
      const registrationData = response.data.data
      membersTotal.value = registrationData.total || 0

      // 转换API返回的数据为表格需要的格式
      activityMembers.value = registrationData.list.map((item: any) => ({
        name: item.nickName || '未知',
        customerSerial: item.customerSerial || '',
        activityTitle: item.activityTitle || '',
        price: item.activityPrice || '0.00',
        actualPrice: item.actualPrice || '0.00',
        signupTime: formatDate(item.registrationTime),
        telephone: item.telephone || '',
      }))
    } else {
      ElMessage.error(response.data?.message || '获取活动报名记录失败')
    }
  } catch (error) {
    console.error('获取活动报名记录失败:', error)
    ElMessage.error('获取活动报名记录失败，请稍后重试')
  } finally {
    membersLoading.value = false
  }
}

// 页码变化处理
const handleCurrentChange = (val: number) => {
  currentPage.value = val
  fetchActivityMembers()
}

// 每页条数变化处理
const handleSizeChange = (val: number) => {
  pageSize.value = val
  currentPage.value = 1
  fetchActivityMembers()
}

// 活动照片数据
const activityPhotos = ref([
  { url: 'https://placeholder.pics/svg/300x200/DEDEDE/555555/活动照片1', description: '活动开场' },
  { url: 'https://placeholder.pics/svg/300x200/DEDEDE/555555/活动照片2', description: '小组讨论' },
  { url: 'https://placeholder.pics/svg/300x200/DEDEDE/555555/活动照片3', description: '合影留念' },
])

// 如果id变化，自动更新activity
watch(() => props.id, (newId) => {
  const newIdNum = Number(newId)
  fetchActivityDetail()
})

const goList = () => {
  router.push('/activity')
}

// 由于我们已经移除了操作列，不再需要这个函数
// 但为了保持代码完整性，我们保留它但不再使用
const viewMember = (row: any) => {
  // 查看成员详情，只使用组件事件方式触发
  // 使用customerSerial作为ID
  if (row && row.customerSerial) {
    // 使用emit而不是eventBus
    emit('open-member-detail', {
      id: row.customerSerial,
      name: row.name,
      nickname: row.name
    })
  } else {
    console.error('用户数据不完整，无法查看详情', row)
    ElMessage.warning('用户数据不完整，无法查看详情')
  }
}
</script>

<style scoped>
.detail-container {
  width: 100%;
  height: 100%;
  padding: 40px 20px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  background: #fff;
  box-sizing: border-box;
}

.action-buttons {
  margin-bottom: 20px;
  display: flex;
  justify-content: flex-end;
  width: 100%;
}

.detail-tabs {
  width: 100%;
}

.content-text {
  white-space: pre-line;
  line-height: 1.5;
}

.cover-in-table {
  max-width: 100%;
  margin: 10px 0;
}

.cover-in-table .el-image {
  max-height: 300px;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.image-container {
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.cover-images,
.detail-images {
  margin-top: 30px;
}

.cover-images h3,
.detail-images h3 {
  margin-bottom: 15px;
  font-size: 18px;
  color: #333;
}

.image-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 20px;
}

.image-item {
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.photo-wall {
  padding: 20px 0;
}

.photo-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.photo-item {
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.photo-info {
  padding: 10px;
  background: #f5f7fa;
  text-align: center;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}
</style>
