<template>
  <div class="dashboard-container">
    <h1 class="dashboard-title">首页</h1>

    <div class="dashboard-cards">
      <el-card class="dashboard-card">
        <template #header>
          <div class="card-header">
            <span>成员总数</span>
            <el-icon><User /></el-icon>
          </div>
        </template>
        <div class="card-content">
          <div class="card-value">{{ memberCount }}</div>
          <div class="card-desc">系统中的成员总数</div>
        </div>
      </el-card>

      <el-card class="dashboard-card">
        <template #header>
          <div class="card-header">
            <span>活动总数</span>
            <el-icon><Calendar /></el-icon>
          </div>
        </template>
        <div class="card-content">
          <div class="card-value">{{ activityCount }}</div>
          <div class="card-desc">系统中的活动总数</div>
        </div>
      </el-card>
    </div>

    <div class="dashboard-stats">
      <el-card class="stats-card">
        <template #header>
          <div class="card-header">
            <span>最近活动</span>
          </div>
        </template>
        <el-table :data="recentActivities" style="width: 100%">
          <el-table-column prop="title" label="活动名称" />
          <el-table-column prop="date" label="活动时间" width="180" />
          <el-table-column prop="status" label="状态" width="100">
            <template #default="{ row }">
              <el-tag :type="getStatusType(row.status)">{{ row.status }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="120">
            <template #default="{ row }">
              <el-button type="primary" size="small" @click="viewActivity(row)">查看</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-card>

      <el-card class="stats-card">
        <template #header>
          <div class="card-header">
            <span>最近注册成员</span>
          </div>
        </template>
        <el-table :data="recentMembers" style="width: 100%">
          <el-table-column prop="nickname" label="昵称" />
          <el-table-column prop="registerTime" label="注册时间" width="180" />
          <el-table-column prop="verifyStatus" label="认证状态" width="100">
            <template #default="{ row }">
              <el-tag :type="row.verifyStatus === '已认证' ? 'success' : 'warning'">
                {{ row.verifyStatus }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="120">
            <template #default="{ row }">
              <el-button type="primary" size="small" @click="viewMember(row)">查看</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { User, Calendar } from '@element-plus/icons-vue';
import eventBus from '../eventBus';

const router = useRouter();

// 统计数据
const memberCount = ref(128);
const activityCount = ref(45);

// 最近活动数据
const recentActivities = ref([
  { id: 1, title: '周末爬山活动', date: '2023-10-15 09:00', status: '已结束' },
  { id: 2, title: '读书分享会', date: '2023-10-20 19:00', status: '进行中' },
  { id: 3, title: '摄影技巧交流', date: '2023-10-25 14:00', status: '正在报名' },
  { id: 4, title: '户外露营', date: '2023-11-01 10:00', status: '正在报名' },
  { id: 5, title: '编程马拉松', date: '2023-11-05 09:00', status: '正在报名' }
]);

// 最近注册成员数据
const recentMembers = ref([
  { id: 1, nickname: '小明', registerTime: '2023-10-10 15:30', verifyStatus: '已认证' },
  { id: 2, nickname: '小红', registerTime: '2023-10-11 10:20', verifyStatus: '已认证' },
  { id: 3, nickname: '小李', registerTime: '2023-10-12 09:15', verifyStatus: '未认证' },
  { id: 4, nickname: '小张', registerTime: '2023-10-13 14:45', verifyStatus: '已认证' },
  { id: 5, nickname: '小王', registerTime: '2023-10-14 16:30', verifyStatus: '未认证' }
]);

// 根据状态获取标签类型
const getStatusType = (status: string) => {
  switch (status) {
    case '正在报名':
      return 'success';
    case '报名已截止':
      return 'warning';
    case '进行中':
      return 'primary';
    case '已结束':
      return 'info';
    default:
      return 'info';
  }
};

// 查看活动详情
const viewActivity = (row: any) => {
  eventBus.emit('open-activity-detail', { id: row.id, title: row.title, nickname: '' });
};

// 查看成员详情
const viewMember = (row: any) => {
  eventBus.emit('open-member-detail', { id: row.id, name: row.nickname, nickname: row.nickname });
};

// 获取统计数据
const fetchDashboardData = () => {
  // 这里可以添加API调用，获取真实的统计数据
  // 目前使用模拟数据
};

onMounted(() => {
  fetchDashboardData();
});
</script>

<style scoped>
.dashboard-container {
  padding: 40px;
  width: 100%;
  box-sizing: border-box;
}

.dashboard-title {
  margin-bottom: 20px;
  color: #333;
  font-size: 24px;
}

.dashboard-cards {
  display: flex;
  gap: 30px;
  margin-bottom: 40px;
}

.dashboard-card {
  flex: 1;
  min-width: 200px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 16px;
  font-weight: bold;
}

.card-content {
  text-align: center;
  padding: 30px 0;
}

.card-value {
  font-size: 36px;
  font-weight: bold;
  color: #3a5bdb;
  margin-bottom: 10px;
}

.card-desc {
  color: #666;
  font-size: 14px;
}

.dashboard-stats {
  display: flex;
  gap: 30px;
  flex-direction: column;
}

.stats-card {
  margin-bottom: 20px;
}

@media (min-width: 1200px) {
  .dashboard-stats {
    flex-direction: row;
  }

  .stats-card {
    flex: 1;
    margin-bottom: 0;
  }
}
</style>
