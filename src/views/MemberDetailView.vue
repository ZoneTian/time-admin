<template>
  <div class="detail-container">
    <el-breadcrumb separator="/" style="margin-bottom: 20px;">
      <el-breadcrumb-item @click="goList" style="cursor:pointer; color:#3a5bdb;">用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>{{ member?.nickname || '成员详情' }}</el-breadcrumb-item>
    </el-breadcrumb>

    <template v-if="member">
      <div class="member-info-container">
        <div class="member-avatar">
          <img v-if="member.avatarUrl" :src="member.avatarUrl" alt="用户头像" class="avatar-image" />
          <div v-else class="avatar-placeholder">
            <el-icon><User /></el-icon>
          </div>
          <h2 class="member-name">{{ member.nickname }}</h2>
        </div>

        <div class="member-info">
          <el-row :gutter="20">
            <el-col :span="8">
              <el-form :model="member" label-width="100px" class="info-form">
                <el-form-item label="昵称">
                  <el-input v-model="member.nickname" disabled />
                </el-form-item>
                <el-form-item label="性别">
                  <el-input v-model="member.gender" disabled />
                </el-form-item>
                <el-form-item label="生日">
                  <el-input v-model="member.userBirthday" disabled />
                </el-form-item>
                <el-form-item label="MBTI">
                  <el-input v-model="member.userMbti" disabled />
                </el-form-item>
              </el-form>
            </el-col>
            <el-col :span="8">
              <el-form :model="member" label-width="100px" class="info-form">
                <el-form-item label="身高">
                  <el-input v-model="member.userHeight" disabled />
                </el-form-item>
                <el-form-item label="学校">
                  <el-input v-model="member.school" disabled />
                </el-form-item>
                <el-form-item label="学历">
                  <el-input v-model="member.education" disabled />
                </el-form-item>
                <el-form-item label="家乡">
                  <el-input v-model="member.hometown" disabled />
                </el-form-item>
              </el-form>
            </el-col>
            <el-col :span="8">
              <el-form :model="member" label-width="100px" class="info-form">
                <el-form-item label="微信号">
                  <el-input v-model="member.wechatAccount" disabled />
                </el-form-item>
                <el-form-item label="手机号">
                  <el-input v-model="member.telephone" disabled />
                </el-form-item>
                <el-form-item label="注册时间">
                  <el-input v-model="member.registerTime" disabled />
                </el-form-item>
                <el-form-item label="现居地">
                  <el-input v-model="member.presentLocation" disabled />
                </el-form-item>
              </el-form>
            </el-col>
          </el-row>
        </div>

        <div class="audit-section">
          <h3>审核状态</h3>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="学历认证">
                <el-tag :type="getEducationVerifyType(member.educationVerify)">
                  {{ member.educationVerify }}
                </el-tag>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="照片审核">
                <el-tag :type="getPhotoReviewStatusType(member.photoReviewStatus)">
                  {{ member.photoReviewStatusText }}
                </el-tag>
              </el-form-item>
            </el-col>
          </el-row>
        </div>

        <!-- <div class="photos-section">
          <h3>用户照片</h3>
          <p class="photo-tip">用户需要有3张符合要求的照片才能被系统推荐到首页，且封面照片必须符合推荐要求</p>

          <div class="photo-container">
            <div v-for="(photo, index) in member.photos" :key="index" class="photo-item">
              <div class="photo-wrapper">
                <img :src="photo.url" :alt="`照片${index + 1}`" class="member-photo" />
                <div class="photo-tag" v-if="index === 0">封面照片</div>
              </div>
              <div class="photo-actions">
                <el-radio-group v-model="photo.quality" class="quality-radio" disabled>
                  <el-radio label="low">低质量照片</el-radio>
                  <el-radio label="normal">一般照片</el-radio>
                  <el-radio label="high">高质量照片</el-radio>
                </el-radio-group>
              </div>
            </div>
          </div>
        </div> -->

        <div class="face-verification-section" v-if="member?.userSelfie">
          <h3>用户人脸认证</h3>
          <p class="photo-tip">请审核用户的人脸认证照片</p>

          <div class="face-photo-container">
            <div class="face-photo-item">
              <div class="photo-wrapper">
                <img :src="member.userSelfie" alt="用户人脸照片" class="member-photo" />
                <div :class="['photo-status-tag', getFaceVerificationStatusClass(member.photoReviewStatus)]">
                  {{ getFaceVerificationStatusText(member.photoReviewStatus) }}
                </div>
              </div>
              <div class="photo-actions" v-if="member.photoReviewStatus === 0">
                <el-button type="success" size="small" @click="auditFaceVerification(1)">人脸认证通过</el-button>
                <el-button type="danger" size="small" @click="auditFaceVerification(2)">人脸认证驳回</el-button>
              </div>
            </div>
          </div>
        </div>

        <div class="social-photos-section" v-if="socialImgList && socialImgList.length > 0" >
          <h3>用户照片审核</h3>
          <p class="photo-tip">请审核用户上传的用户照片</p>

          <div class="photo-container">
            <div v-for="(photo, index) in socialImgList" :key="photo.id" class="photo-item">
              <div class="photo-wrapper">
                <img :src="photo.socializingImgUrl" :alt="`用户照片${index + 1}`" class="member-photo" />
                <div class="photo-tag" v-if="photo.imgType === 0">封面照片</div>
                <div :class="['photo-status-tag', getSocialPhotoStatusClass(photo.imgReviewStatus)]">
                  {{ photo.imgType === 0? '封面照片':''}} {{getSocialPhotoStatusText(photo.imgReviewStatus) }}
                </div>
              </div>
              <div class="photo-actions" v-if="photo.imgReviewStatus === 0">
                <el-button type="success" size="small" @click="auditSingleImage(photo.id, 1)">审核通过</el-button>
                <el-button type="danger" size="small" @click="auditSingleImage(photo.id, 2)">审核不通过</el-button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
    <template v-else>
      <el-alert title="未找到该会员" type="error" show-icon></el-alert>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { User } from '@element-plus/icons-vue'
import axios from 'axios'
import { BASE_API_URL } from '../constants/api'

const props = defineProps<{ id?: string | number }>()
const router = useRouter()
const route = useRoute()
const id = Number(props.id || route.params.id)

// 定义社交图片数据类型
interface SocialImageItem {
  id: number;
  socializingImgUrl: string;
  imgReviewStatus: number; // 0: 待审核, 1: 已通过, 2: 未通过 3 未审核
  imgType: number // 0: 封面照片, 1: 普通照片
}

// 定义用户详情数据类型
interface MemberDetail {
  id: number;
  nickname: string;
  gender: string;
  userBirthday: string;
  userHeight: string;
  school: string;
  education: string;
  wechatAccount: string;
  telephone: string;
  registerTime: string;
  educationVerify: string;
  photoReviewStatus: number;
  avatarUrl: string;
  photos: { url: string; quality: string }[];
  socialImg: SocialImageItem[]; // 新增字段
  userMbti: string; // 新增MBTI字段
  hometown: string; // 新增家乡字段
  presentLocation: string; // 新增现居地字段
  userSelfie: string; // 用户人脸照片
  faceVerificationStatus: number; // 人脸认证状态：0-待审核, 1-已通过, 2-未通过 3 未审核
  photoReviewStatusText:string;
}

// 用户详情数据
const member = ref<MemberDetail | null>(null)
const loading = ref(false)
const socialImgList = ref<SocialImageItem[]>([])

// 获取用户详情
const fetchUserDetail = async (userId: number) => {
  loading.value = true
  try {
    const token = localStorage.getItem('token')
    if (!token) {
      ElMessage.warning('请先登录')
      return
    }

    const response = await axios.get(`${BASE_API_URL}/customer/get`, {
      params: { customerId: userId },
      headers: {
        'api-access-token': token,
        'Content-Type': 'application/json',
        'Accept': '*/*',
        'User-Agent': 'vue-admin-client'
      }
    })

    console.log('用户详情响应:', response)

    if (response.data && response.data.code === 0) {
      const userData = response.data.data

      // 转换API返回的数据为组件需要的格式
      member.value = {
        ...userData,
        id: userData.customerId,
        nickname: userData.nickName || '未设置',
        gender: getGenderText(userData.gender),
        userBirthday: formatBirthday(userData.userBirthday),
        userHeight: userData.userHeight ? `${userData.userHeight}cm` : '未设置',
        school: userData.school || '未设置',
        education: userData.academics || '未设置',
        wechatAccount: userData.wechatAccount || '未设置',
        telephone: userData.telephone || '未设置',
        registerTime: formatDate(userData.registrationTime),
        educationVerify: getAcademicReviewStatusText(userData.academicReviewStatus),
        photoReviewStatusText: getPhotoReviewStatusText(userData.photoReviewStatus),
        avatarUrl: userData.avatarUrl || '',
        photos: userData.photos ? userData.photos.map((url: string) => ({
          url: url,
          quality: 'normal' // 默认设置为normal，实际应该从API获取
        })) : [],

        userMbti: userData.userMbti || '未设置',
        hometown: formatLocation(userData.province, userData.city),
        presentLocation: formatLocation(userData.presentProvince, userData.presentCity),
        userSelfie: userData.userSelfie || '',
        faceVerificationStatus: userData.faceVerificationStatus || 0
      }
          } else {
        ElMessage.error(response.data?.message || '获取用户详情失败')
      }

      // 获取社交图片列表
      await fetchSocialImgList(userId)
    } catch (error) {
      console.error('获取用户详情失败:', error)
      ElMessage.error('获取用户详情失败，请稍后重试')
    } finally {
      loading.value = false
    }
  }

// 获取社交图片列表
const fetchSocialImgList = async (userId: number) => {
  try {
    const token = localStorage.getItem('token')
    if (!token) {
      ElMessage.warning('请先登录')
      return
    }

    const response = await axios.get(`${BASE_API_URL}/customer/socialImgList`, {
      params: { customerId: userId },
      headers: {
        'api-access-token': token,
        'Content-Type': 'application/json',
        'Accept': '*/*',
        'User-Agent': 'vue-admin-client'
      }
    })
    if (response.data && response.data.code === 0) {
       socialImgList.value = response.data.data?response.data.data : []

    } else {
      console.error('获取社交图片列表失败:', response.data?.message)
      socialImgList.value = []
    }
  } catch (error) {
    console.error('获取社交图片列表失败:', error)
    socialImgList.value = []
  }
}

// 审核单张图片
const auditSingleImage = async (imageId: number, status: number) => { // status: 1: 通过, 2: 不通过
  try {
    const token = localStorage.getItem('token')
    if (!token) {
      ElMessage.warning('请先登录')
      return
    }

    const apiUrl = `${BASE_API_URL}/customer/auditSocialImg`;

    const response = await axios.post(apiUrl, {
      customerId: id,
      id: imageId,
      imgReviewStatus: status // 1: 通过, 2: 不通过
    }, {
      headers: {
        'api-access-token': token,
        'Content-Type': 'application/json',
        'Accept': '*/*',
        'User-Agent': 'vue-admin-client'
      }
    });

    if (response.data && response.data.code === 0) {
      ElMessage.success('图片审核状态更新成功！');
      // 更新本地数据
      const imageIndex = socialImgList.value.findIndex(img => img.id === imageId);
      if (imageIndex !== -1) {
        socialImgList.value[imageIndex].imgReviewStatus = status;
      }
      // 重新获取社交图片列表
      await fetchSocialImgList(id);
    } else {
      ElMessage.error(response.data?.message || '图片审核失败');
    }
  } catch (error) {
    console.error('图片审核请求失败:', error);
    ElMessage.error('图片审核失败，请稍后重试');
  }
};

// 审核人脸认证
const auditFaceVerification = async (status: number) => { // status: 1: 通过, 2: 不通过
  try {
    const token = localStorage.getItem('token')
    if (!token) {
      ElMessage.warning('请先登录')
      return
    }

    const apiUrl = `${BASE_API_URL}/customer/auditUserSelfie`;

    const response = await axios.post(apiUrl, {
      customerId: id,
      photoReviewStatus: status // 1: 通过, 2: 不通过
    }, {
      headers: {
        'api-access-token': token,
        'Content-Type': 'application/json',
        'Accept': '*/*',
        'User-Agent': 'vue-admin-client'
      }
    });

    if (response.data && response.data.code === 0) {
      ElMessage.success('人脸认证审核状态更新成功！');
      // 更新本地数据
      if (member.value) {
        member.value.photoReviewStatus = status;
      }
    } else {
      ElMessage.error(response.data?.message || '人脸认证审核失败');
    }
  } catch (error) {
    console.error('人脸认证审核请求失败:', error);
    ElMessage.error('人脸认证审核失败，请稍后重试');
  }
};

// 如果tab切换时id变化，自动更新member
watch(() => props.id, (newId) => {
  if (newId) {
    fetchUserDetail(Number(newId))
  }
})

// 组件挂载时获取用户详情
onMounted(() => {
  if (id) {
    fetchUserDetail(id)
  }
})

// 获取性别文本
const getGenderText = (gender: number) => {
  switch (gender) {
    case 1: return '男';
    case 2: return '女';
    default: return '未知';
  }
}

// 获取学历认证状态文本
const getAcademicReviewStatusText = (status: number) => {
  switch (status) {
    case 0: return '待审核';
    case 1: return '已认证';
    case 2: return '认证失败';
    case 3: return '未审核'
    default: return '未知';
  }
}

// 获取照片审核状态文本
const getPhotoReviewStatusText = (status: number) => {
  switch (status) {
    case 0: return '待审核';
    case 1: return '已通过';
    case 2: return '未通过';
    case 3: return '未审核'
    default: return '未知';

  }
}

// 获取用户照片审核状态文本
const getSocialPhotoStatusText = (status: number) => {
  console.log(status,'zne22');

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
    case 0: return 'warning';
    case 1: return 'success';
    case 2: return 'danger';
    default: return 'info';
  }
}

// 获取学历认证状态标签类型
const getEducationVerifyType = (status: string) => {
  switch (status) {
    case '待审核': return 'warning';
    case '已认证': return 'success';
    case '认证失败': return 'danger';
    case '未审核' : return 'warning'
    default: return 'info';
  }
}

// 获取用户照片审核状态标签类型
const getSocialPhotoStatusClass = (status: number) => {
  switch (status) {
    case 0: return 'status-pending'; // 待审核
    case 1: return 'status-approved'; // 已通过
    case 2: return 'status-rejected'; // 未通过
    case 3: return 'status-pending'; // 未审核
    default: return 'status-unknown';
  }
}

// 获取人脸认证状态文本
const getFaceVerificationStatusText = (status: number) => {
  console.log(status,'status');

  switch (status) {
    case 0: return '待审核';
    case 1: return '已通过';
    case 2: return '未通过';
    case 3: return '未审核';
    default: return '未知';
  }
}

// 获取人脸认证状态标签类型
const getFaceVerificationStatusClass = (status: number) => {
  console.log(status, 'zone phote');

  switch (status) {
    case 0: return 'status-pending'; // 待审核
    case 1: return 'status-approved'; // 已通过
    case 2: return 'status-rejected'; // 未通过
    case 3: return 'status-pending'; // 未审核
    default: return 'status-unknown';
  }
}

// 格式化地址函数
const formatLocation = (province: string, city: string) => {
  if (!province && !city) return '未设置';
  if (!province) return city;
  if (!city) return province;
  return `${province} ${city}`;
}

// 格式化生日函数
const formatBirthday = (birthday: string) => {
  if (!birthday) return '未设置';


    const date = new Date(birthday);
    if (isNaN(date.getTime())) return '未设置';

    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });

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
  } catch  {
    return dateString;
  }
}

const goList = () => {
  router.push('/member')
}
</script>

<style scoped>
.detail-container {
  width: 100%;
  height: 100%;
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  background: #fff;
  overflow-y: auto;
}

.member-info-container {
  width: 100%;
}

.member-avatar {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 30px;
  width: 100%;
}

.avatar-image {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #3a5bdb;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.avatar-placeholder {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background-color: #f0f2f5;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 60px;
  color: #909399;
  border: 2px solid #dcdfe6;
}

.member-name {
  margin-top: 15px;
  font-size: 20px;
  color: #333;
  font-weight: bold;
}

.member-info {
  margin-bottom: 30px;
}

.info-form {
  margin-bottom: 20px;
}

.audit-section {
  margin-bottom: 30px;
  width: 100%;
}

.audit-section h3 {
  margin-bottom: 15px;
  font-size: 18px;
  color: #333;
}

.photos-section,
.social-photos-section,
.face-verification-section { /* 添加 face-verification-section 样式 */
  margin-bottom: 30px;
  width: 100%;
}

.photos-section h3,
.social-photos-section h3,
.face-verification-section h3 { /* 添加 face-verification-section 样式 */
  margin-bottom: 10px;
  font-size: 18px;
  color: #333;
}

.photo-tip {
  color: #666;
  font-size: 14px;
  margin-bottom: 15px;
}

.photo-container {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
}

.face-photo-container {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

.face-photo-item {
  width: 300px;
  border: 1px solid #ebeef5;
  border-radius: 4px;
  overflow: hidden;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.photo-item {
  width: 300px;
  margin-bottom: 20px;
  border: 1px solid #ebeef5; /* 添加边框 */
  border-radius: 4px;
  overflow: hidden;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.photo-wrapper {
  position: relative;
  margin-bottom: 10px;
}

.member-photo {
  width: 100%;
  height: auto;
  display: block; /* 移除图片底部空白 */
  border-radius: 4px 4px 0 0; /* 调整圆角 */
}

.photo-tag {
  position: absolute;
  top: 10px;
  left: 10px;
  background-color: rgba(0, 0, 0, 0.6);
  color: white;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
}

.photo-status-tag { /* 新增社交图片状态标签样式 */
  position: absolute;
  top: 10px;
  right: 10px;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  color: white;
}

.status-pending {
  background-color: #e6a23c; /* warning */
}

.status-approved {
  background-color: #67c23a; /* success */
}

.status-rejected {
  background-color: #f56c6c; /* danger */
}

.photo-actions {
  padding: 10px;
  display: flex;
  justify-content: center;
  gap: 10px;
  background-color: #f8f9fa;
  border-top: 1px solid #ebeef5;
}

.photo-actions .el-button {
  min-width: 80px;
}

.quality-radio {
  display: flex;
  flex-direction: column;
}
</style>
