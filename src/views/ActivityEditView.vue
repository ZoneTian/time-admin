<template>
  <div class="edit-container">
    <el-card v-loading="loading">
      <div class="page-header">
        <h2>{{ id ? '编辑活动' : '创建活动' }}</h2>
      </div>

      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="120px"
        class="activity-form"
      >
        <el-form-item label="活动名称" prop="activityTitle">
          <el-input v-model="form.activityTitle" placeholder="请输入活动名称" />
        </el-form-item>

        <el-form-item label="活动描述" prop="activityContent">
          <div class="rich-text-editor">
            <div class="editor-toolbar">
              <el-button-group>
                <el-button type="primary" plain size="small" @click="formatText('bold', 'content')">
                  <strong>B</strong>
                </el-button>
                <el-button type="primary" plain size="small" @click="formatText('italic', 'content')">
                  <i>I</i>
                </el-button>
                <el-button type="primary" plain size="small" @click="formatText('underline', 'content')">
                  <u>U</u>
                </el-button>
              </el-button-group>
              <el-button-group style="margin-left: 10px;">
                <el-button type="primary" plain size="small" @click="formatText('h1', 'content')">H1</el-button>
                <el-button type="primary" plain size="small" @click="formatText('h2', 'content')">H2</el-button>
                <el-button type="primary" plain size="small" @click="formatText('h3', 'content')">H3</el-button>
              </el-button-group>
              <el-button-group style="margin-left: 10px;">
                <el-button type="primary" plain size="small" @click="formatText('ul', 'content')">
                  列表
                </el-button>
                <el-button type="primary" plain size="small" @click="formatText('ol', 'content')">
                  编号
                </el-button>
              </el-button-group>
            </div>
            <div
              class="editor-content"
              contenteditable="true"
              @input="updateContent"
              ref="contentEditorRef"
            ></div>
          </div>
        </el-form-item>

        <el-form-item label="活动时间">
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item prop="activityStartTime">
                <el-date-picker
                  v-model="form.activityStartTime"
                  type="datetime"
                  placeholder="选择活动开始时间"
                  format="YYYY-MM-DD HH:mm:ss"
                  value-format="YYYY-MM-DD HH:mm:ss"
                  style="width: 100%"
                />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item prop="activityEndTime">
                <el-date-picker
                  v-model="form.activityEndTime"
                  type="datetime"
                  placeholder="选择活动结束时间"
                  format="YYYY-MM-DD HH:mm:ss"
                  value-format="YYYY-MM-DD HH:mm:ss"
                  style="width: 100%"
                />
              </el-form-item>
            </el-col>
          </el-row>
        </el-form-item>

        <el-form-item label="报名时间">
          <el-row :gutter="20">
            <el-col :span="12">
              <el-date-picker
                v-model="form.applyStartTime"
                type="datetime"
                placeholder="选择报名开始时间"
                format="YYYY-MM-DD HH:mm:ss"
                value-format="YYYY-MM-DD HH:mm:ss"
                style="width: 100%"
              />
            </el-col>
            <el-col :span="12">
              <el-date-picker
                v-model="form.applyEndTime"
                type="datetime"
                placeholder="选择报名截止时间"
                format="YYYY-MM-DD HH:mm:ss"
                value-format="YYYY-MM-DD HH:mm:ss"
                style="width: 100%"
              />
            </el-col>
          </el-row>
        </el-form-item>

        <el-form-item label="所在地区" required>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item prop="province">
                <el-select
                  v-model="selectedProvinceCode"
                  placeholder="请选择省份"
                  @change="handleProvinceChange"
                  style="width: 150px;"
                >
                  <el-option
                    v-for="item in provinceList"
                    :key="item.shortCode"
                    :label="item.province"
                    :value="item.shortCode"
                  />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item prop="city">
                <el-select
                  v-model="form.city"
                  placeholder="请选择城市"
                  :disabled="!form.province"
                  style="width: 150px;"
                >
                  <el-option
                    v-for="item in cityList"
                    :key="item.shortCode"
                    :label="item.city"
                    :value="item.city"
                  />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form-item>

        <el-form-item label="活动具体地点" prop="address">
          <el-input v-model="form.address" placeholder="请输入活动具体地点" />
        </el-form-item>

        <el-form-item label="活动封面图片" prop="mainCoverImage">
          <div class="upload-container">
            <div>
              <el-upload
                action="#"
                list-type="picture-card"
                :auto-upload="false"
                :limit="1"
                :file-list="fileList"
                :on-change="handleFileChange"
                :on-remove="handleFileRemove"
                :on-exceed="handleExceed"
                :multiple="false"
              >
                <el-icon><Plus /></el-icon>
              </el-upload>

              <div class="el-upload__tip">
                请上传活动封面图片（正方形），建议尺寸800x800像素
              </div>

              <!-- 隐藏的文件输入框 -->
              <!-- <input
                type="file"
                ref="coverImageInputRef"
                style="display: none;"
                accept="image/*"
                @change="handleCoverImageSelect"
              /> -->
            </div>
          </div>
        </el-form-item>

        <el-form-item label="活动内容图片" prop="activityContentImgList">
          <div class="upload-container">
            <div>
              <el-upload
                action="#"
                list-type="picture-card"
                :auto-upload="false"
                :limit="9"
                :file-list="contentFileList"
                :on-change="handleContentFileChange"
                :on-remove="handleContentFileRemove"
                :on-exceed="handleContentExceed"
                :multiple="true"
              >
                <el-icon><Plus /></el-icon>
              </el-upload>

              <div class="el-upload__tip">
                请上传活动内容图片，最多9张，建议尺寸800x800像素
              </div>
            </div>
          </div>
        </el-form-item>

        <el-form-item label="注意事项" prop="notes">
            <div class="rich-text-editor">
            <div class="editor-toolbar">
              <el-button-group>
                <el-button type="primary" plain size="small" @click="formatText('bold', 'notes')">
                  <strong>B</strong>
                </el-button>
                <el-button type="primary" plain size="small" @click="formatText('italic', 'notes')">
                  <i>I</i>
                </el-button>
                <el-button type="primary" plain size="small" @click="formatText('underline', 'notes')">
                  <u>U</u>
                </el-button>
              </el-button-group>
              <el-button-group style="margin-left: 10px;">
                <el-button type="primary" plain size="small" @click="formatText('h1', 'notes')">H1</el-button>
                <el-button type="primary" plain size="small" @click="formatText('h2', 'notes')">H2</el-button>
                <el-button type="primary" plain size="small" @click="formatText('h3', 'notes')">H3</el-button>
              </el-button-group>
              <el-button-group style="margin-left: 10px;">
                <el-button type="primary" plain size="small" @click="formatText('ul', 'notes')">
                  列表
                </el-button>
                <el-button type="primary" plain size="small" @click="formatText('ol', 'notes')">
                  编号
                </el-button>
              </el-button-group>
            </div>
            <div
              class="editor-content"
              contenteditable="true"
              @input="updateNotesContent"
              ref="notesEditorRef"
            ></div>
          </div>
        </el-form-item>

        <el-form-item label="价格设置" prop="activityPrice">
          <el-input-number
            v-model="form.activityPrice"
            :precision="2"
            :step="10"
            :min="0"
          />
          <span class="price-unit">元</span>
        </el-form-item>

        <!-- 隐藏活动详情图 -->

        <el-form-item label="是否公开" prop="publicFlag">
          <el-radio-group v-model="form.publicFlag">
            <el-radio :label="1">公开</el-radio>
            <el-radio :label="0">不公开</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="submitForm">{{ id ? '保存' : '发布活动' }}</el-button>
          <el-button @click="goBack">取消</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, nextTick, watch } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import axios from 'axios'
import { BASE_API_URL, API_PATHS } from '../constants/api'
import { Plus } from '@element-plus/icons-vue'
import { getRegionByCode } from '../api/region'
import eventBus from '../eventBus'

const props = defineProps<{ id?: string | number }>()
const router = useRouter()
const formRef = ref()
const loading = ref(false)

// 获取路由参数中的活动ID
const id = props.id ? Number(props.id) : null

console.log('ActivityEditView 组件接收到的 props:', props)
console.log('处理后的活动ID:', id)

// 文件列表
const fileList = ref<any[]>([])
const contentFileList = ref<any[]>([])

// 处理内容图片上传
const handleContentFileChange = async (file: any, fileList: any[]) => {
  contentFileList.value = fileList

  if (file.status === 'ready') {
    try {
      const formData = new FormData()
      formData.append('file', file.raw)

      const token = localStorage.getItem('token')
      if (!token) {
        ElMessage.warning('请先登录')
        return
      }

      const response = await axios.post(
        `${BASE_API_URL}/qiniu/uploadIMG`,
        formData,
        {
          headers: {
            'api-access-token': token,
            'Content-Type': 'multipart/form-data',
            'Accept': '*/*'
          }
        }
      )

      console.log('内容图片上传响应:', response)

      if (response.data && response.data.code === 0) {
        // 更新表单中的活动内容图片列表
        const url = response.data.data
        // 确保activityContentImgList已初始化
        if (!form.value.activityContentImgList) {
          form.value.activityContentImgList = []
        }
        // 检查是否已存在该图片URL
        if (!form.value.activityContentImgList.includes(url)) {
          form.value.activityContentImgList.push(url)
        }
        ElMessage.success('内容图片上传成功')
      } else {
        ElMessage.error(response.data?.message || '内容图片上传失败')
      }
    } catch (error) {
      console.error('内容图片上传失败:', error)
      ElMessage.error('内容图片上传失败，请稍后重试')
    }
  }
}

// 移除内容图片
const handleContentFileRemove = (file: any, fileList: any[]) => {
  contentFileList.value = fileList
  // 更新表单中的活动内容图片列表
  form.value.activityContentImgList = fileList.map(item => item.url || '')
}

// 处理内容图片超出限制的情况
const handleContentExceed = (files: File[], fileList: any[]) => {
  ElMessage.warning('最多只能上传9张内容图片')
}

// 省份和城市列表
const provinceList = ref<RegionItem[]>([])
const cityList = ref<RegionItem[]>([])
// 选中的省份代码（用于下拉框绑定）
const selectedProvinceCode = ref<string | number>('')

// 定义地区数据类型
interface RegionItem {
  id: number;
  shortCode: number;
  parentShortCode: number;
  province: string;
  city: string;
  district: string;
  grade: number;
}

// 定义表单数据类型
interface ActivityForm {
  activityTitle: string;
  activityContent: string;
  activityStartTime: string;
  activityEndTime: string;
  applyStartTime: string;
  applyEndTime: string;
  province: string;
  city: string;
  address: string;
  activityPrice: number;
  publicFlag: number;
  mainCoverImage: string;
  activityContentImgList: string[]; // 新增活动内容图片列表字段
  notes: string; // 新增注意事项字段
  id?: number;
}

// 判断是否为编辑模式
const isEdit = !!id

// 跟踪时间字段是否被修改
const timeFieldsModified = ref(false);

// 表单数据
const form = ref<ActivityForm>({
  activityTitle: '',
  activityContent: '',
  activityStartTime: '',
  activityEndTime: '',
  applyStartTime: '',
  applyEndTime: '',
  province: '',
  city: '',
  address: '',
  activityPrice: 0,
  publicFlag: 1,
  mainCoverImage: '',
  activityContentImgList: [], // 初始化活动内容图片列表为空数组
  notes: '', // 初始化注意事项为空字符串
  id: isEdit ? Number(id) : undefined // 编辑模式下需要传递ID
})

// 监听时间字段的变化
watch(() => form.value.activityStartTime, () => {
  timeFieldsModified.value = true;
});

watch(() => form.value.activityEndTime, () => {
  timeFieldsModified.value = true;
});

// 自定义验证函数：确保报名时间早于活动时间
const validateApplyStartTime = (rule: any, value: string, callback: any) => {
  if (!value || !form.value.activityStartTime) {
    callback();
    return;
  }

  const applyStartTime = new Date(value);
  const activityStartTime = new Date(form.value.activityStartTime);

  if (applyStartTime >= activityStartTime) {
    callback(new Error('报名开始时间必须早于活动开始时间'));
  } else {
    callback();
  }
};

const validateApplyEndTime = (rule: any, value: string, callback: any) => {
  if (!value || !form.value.applyStartTime) {
    callback();
    return;
  }

  const applyEndTime = new Date(value);
  const applyStartTime = new Date(form.value.applyStartTime);

  if (applyEndTime <= applyStartTime) {
    callback(new Error('报名结束时间必须晚于报名开始时间'));
  } else if (form.value.activityStartTime && applyEndTime > new Date(form.value.activityStartTime)) {
    callback(new Error('报名结束时间必须早于或等于活动开始时间'));
  } else {
    callback();
  }
};

// 自定义验证函数：确保活动时间不能跨天
const validateActivityEndTime = (rule: any, value: string, callback: any) => {
  if (!value || !form.value.activityStartTime) {
    callback();
    return;
  }

  const startTime = new Date(form.value.activityStartTime);
  const endTime = new Date(value);

  // 检查开始时间和结束时间是否在同一天
  const startDate = new Date(startTime.getFullYear(), startTime.getMonth(), startTime.getDate());
  const endDate = new Date(endTime.getFullYear(), endTime.getMonth(), endTime.getDate());

  // 如果是编辑模式且用户尚未修改任何时间，则不进行验证
  if (isEdit && !timeFieldsModified.value) {
    callback();
    return;
  }

  if (startDate.getTime() !== endDate.getTime()) {
    callback(new Error('活动开始时间和结束时间必须在同一天内'));
  } else if (endTime <= startTime) {
    callback(new Error('活动结束时间必须晚于开始时间'));
  } else {
    callback();
  }
};

// 表单验证规则
const rules = reactive({
  activityTitle: [
    { required: true, message: '请输入活动名称', trigger: 'blur' },
    { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
  ],
  activityContent: [
    { required: true, message: '请输入活动描述', trigger: 'blur' }
  ],
  activityStartTime: [
    { required: true, message: '请选择活动开始时间', trigger: 'change' }
  ],
  activityEndTime: [
    { required: true, message: '请选择活动结束时间', trigger: 'change' },
    { validator: validateActivityEndTime, trigger: 'change' }
  ],
  applyStartTime: [
    { required: true, message: '请选择报名开始时间', trigger: 'change' },
    { validator: validateApplyStartTime, trigger: 'change' }
  ],
  applyEndTime: [
    { required: true, message: '请选择报名截止时间', trigger: 'change' },
    { validator: validateApplyEndTime, trigger: 'change' }
  ],
  province: [
    { required: true, message: '请选择省份', trigger: 'change' }
  ],
  city: [
    { required: true, message: '请选择城市', trigger: 'change' }
  ],
  address: [
    { required: true, message: '请输入活动具体地点', trigger: 'blur' }
  ],
  activityPrice: [
    { required: true, message: '请输入活动费用', trigger: 'blur' }
  ],
  mainCoverImage: [
    { required: true, message: '请上传活动封面图片', trigger: 'change' }
  ],
  activityContentImgList: [
    { required: false, message: '请上传活动内容图片', trigger: 'change' },
    { type: 'array', max: 9, message: '最多只能上传9张图片', trigger: 'change' }
  ],
  notes: [
    { required: false, message: '请输入活动注意事项', trigger: 'blur' },
    { max: 200, message: '注意事项长度不能超过200个字符', trigger: 'blur' }
  ],
  publicFlag: [
    { required: true, message: '请选择是否公开', trigger: 'change' }
  ]
})

// 处理封面图片上传
const handleFileChange = async (file: any, fileList: any[]) => {
  // 确保只有一张图片
  if (fileList.length > 1) {
    fileList.splice(0, fileList.length - 1)
    ElMessage.warning('只能上传一张封面图片')
  }

  if (file.status === 'ready') {
    try {
      const formData = new FormData()
      formData.append('file', file.raw)

      const token = localStorage.getItem('token')
      if (!token) {
        ElMessage.warning('请先登录')
        return
      }

      const response = await axios.post(
        `${BASE_API_URL}/qiniu/uploadIMG`,
        formData,
        {
          headers: {
            'api-access-token': token,
            'Content-Type': 'multipart/form-data',
            'Accept': '*/*'
          }
        }
      )

      console.log('图片上传响应:', response)

      if (response.data && response.data.code === 0) {
        // 设置封面图片URL
        form.value.mainCoverImage = response.data.data
        ElMessage.success('封面图片上传成功')
      } else {
        ElMessage.error(response.data?.message || '封面图片上传失败')
      }
    } catch (error) {
      console.error('封面图片上传失败:', error)
      ElMessage.error('封面图片上传失败，请稍后重试')
    }
  }
}

// 移除封面图片
const handleFileRemove = () => {
  form.value.mainCoverImage = ''
}

// 处理超出限制的情况
const handleExceed = (files: File[], fileList: any[]) => {
  ElMessage.warning('只能上传一张封面图片，请先删除已有图片')
}

// 封面图片输入框引用
const coverImageInputRef = ref<HTMLInputElement | null>(null)

// 触发文件输入框点击
const triggerFileInput = () => {
  if (coverImageInputRef.value) {
    coverImageInputRef.value.click()
  }
}

// 处理封面图片选择
const handleCoverImageSelect = async (e: Event) => {
  const target = e.target as HTMLInputElement
  if (target.files && target.files.length > 0) {
    const file = target.files[0]

    // 检查文件类型
    if (!file.type.startsWith('image/')) {
      ElMessage.error('请选择图片文件')
      return
    }

    // 检查文件大小（限制为2MB）
    if (file.size > 2 * 1024 * 1024) {
      ElMessage.error('图片大小不能超过2MB')
      return
    }

    try {
      const formData = new FormData()
      formData.append('file', file)

      const token = localStorage.getItem('token')
      if (!token) {
        ElMessage.warning('请先登录')
        return
      }

      const response = await axios.post(
        `${BASE_API_URL}/qiniu/uploadIMG`,
        formData,
        {
          headers: {
            'api-access-token': token,
            'Content-Type': 'multipart/form-data',
            'Accept': '*/*'
          }
        }
      )

      console.log('图片上传响应:', response)

      if (response.data && response.data.code === 0) {
        // 设置封面图片URL
        form.value.mainCoverImage = response.data.data

        // 更新文件列表
        fileList.value = [{
          name: '封面图片',
          url: response.data.data
        }]

        ElMessage.success('封面图片上传成功')
      } else {
        ElMessage.error(response.data?.message || '封面图片上传失败')
      }
    } catch (error) {
      console.error('封面图片上传失败:', error)
      ElMessage.error('封面图片上传失败，请稍后重试')
    }

    // 清空input，以便可以重复选择同一文件
    target.value = ''
  }
}




// 获取活动详情
const fetchActivityDetail = async () => {
  loading.value = true
  try {
    // 检查是否有token
    const token = localStorage.getItem('token')
    if (!token) {
      ElMessage.warning('请先登录')
      router.push('/login')
      return
    }

    // 获取活动ID，优先使用props中的id，如果没有则尝试从路由参数中获取
    const activityId = id || (router.currentRoute.value.params.id ? Number(router.currentRoute.value.params.id) : null)

    if (!activityId) {
      ElMessage.error('活动ID不能为空')
      router.push('/activity')
      return
    }

    console.log('开始获取活动详情，ID:', activityId)

    // 发送请求获取活动详情
    const response = await axios.get(`${BASE_API_URL}${API_PATHS.ACTIVITY.DETAIL}`, {
      params: { activityId: activityId },
      headers: {
        'api-access-token': token,
        'Content-Type': 'application/json',
        'Accept': '*/*'
      }
    })

    console.log('活动详情响应:', response)

    if (response.data && response.data.code === 0) {
      // 获取活动详情成功
      const activityData = response.data.data
      // 将活动详情数据填充到表单中
      form.value = {
        activityTitle: activityData.activityTitle || '',
        activityContent: activityData.activityContent || '',
        activityStartTime: activityData.activityStartTime || '',
        activityEndTime: activityData.activityEndTime || '',
        applyStartTime: activityData.applyStartTime || '',
        applyEndTime: activityData.applyEndTime || '',
        province: activityData.province || '',
        city: activityData.city || '',
        address: activityData.address || activityData.location || '', // 兼容旧数据
        activityPrice: activityData.activityPrice || 0,
        publicFlag: activityData.publicFlag !== undefined ? activityData.publicFlag : 1,
        mainCoverImage: activityData.mainCoverImage || '',
        activityContentImgList: activityData.activityContentImgList || [], // 添加活动内容图片列表
        notes: activityData.notes || '', // 添加注意事项字段
        id: activityData.id // 确保id也被设置
      }

      // 如果有省份数据，加载对应的城市列表
      if (activityData.province) {
        // 查找省份对应的shortCode
        const provinceItem = provinceList.value.find(item => item.province === activityData.province)
        if (provinceItem) {
          // 设置下拉框选中值为省份的shortCode
          selectedProvinceCode.value = provinceItem.shortCode
          // 在form.province中保存省份的中文名称
          form.value.province = activityData.province
          // 加载城市列表
          loadCities(provinceItem.shortCode)
          console.log('编辑模式，设置省份:', activityData.province, '对应的shortCode:', provinceItem.shortCode)
        }
      }

      // 如果有封面图片，设置封面图片
      if (activityData.mainCoverImage) {
        form.value.mainCoverImage = activityData.mainCoverImage
        fileList.value = [{
          name: '封面图片',
          url: activityData.mainCoverImage
        }]
      }


      // 如果有活动内容图片，添加到文件列表
      if (activityData.activityContentImgList && activityData.activityContentImgList.length > 0) {
        form.value.activityContentImgList = activityData.activityContentImgList
        contentFileList.value = activityData.activityContentImgList.map((url: any, index: number) => ({
          name: `内容图片${index + 1}`,
          url
        }))
      }
    } else {
      ElMessage.error(response.data?.message || '获取活动详情失败')
    }
  } catch (error) {
    console.error('获取活动详情失败:', error)
    ElMessage.error('获取活动详情失败，请稍后重试')
  } finally {
    loading.value = false
  }
}

// 提交表单
// 提交表单
const submitForm = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid: boolean, errors: any) => {
    console.log(errors,'zone');
    
    if (valid) {
      loading.value = true
      try {
        // 检查是否有token
        const token = localStorage.getItem('token')
        if (!token) {
          ElMessage.warning('请先登录')
          router.push('/login')
          return
        }

        // 检查是否填写了所有必要信息
        if (!form.value.activityTitle || !form.value.mainCoverImage) {
          ElMessage.warning('请填写所有必要信息并上传封面图片后才能发布活动')
          loading.value = false
          return
        }

        // 发送请求更新或创建活动
        const url = id
          ? `${BASE_API_URL}${API_PATHS.ACTIVITY.UPDATE}`
          : `${BASE_API_URL}${API_PATHS.ACTIVITY.ADD}`

        // 打印表单数据，用于调试
        console.log('提交的表单数据:', JSON.stringify(form.value))

        // 创建一个新的对象，确保包含所有必要的字段
        const submitData = {
          ...form.value,
          // 确保报名时间字段同时使用新旧名称，以兼容后端API
          signupStartTime: form.value.applyStartTime,
          signupEndTime: form.value.applyEndTime,
          // 包含活动内容图片列表
          activityContentImgList: form.value.activityContentImgList || []
        }

        console.log('最终提交的数据:', JSON.stringify(submitData))

        const response = await axios.post(url, submitData, {
          headers: {
            'api-access-token': token,
            'Content-Type': 'application/json',
            'Accept': '*/*',
            'User-Agent': 'vue-admin-client'
          }
        })

        console.log(id ? '更新活动响应:' : '创建活动响应:', response)

        if (response.data && response.data.code === 0) {
          ElMessage.success(id ? '更新活动成功' : '创建活动成功')

          // 获取当前标签页名称
          const currentTabName = router.currentRoute.value.fullPath

          // 先导航到活动列表页
          router.push('/activity')

          // 然后通过eventBus发送关闭当前标签页的事件
          setTimeout(() => {
            eventBus.emit('close-current-tab', currentTabName)
          }, 100)
        } else {
          ElMessage.error(response.data?.message || (id ? '更新活动失败' : '创建活动失败'))
        }
      } catch (error) {
        console.error(id ? '更新活动失败:' : '创建活动失败:', error)
        ElMessage.error(id ? '更新活动失败，请稍后重试' : '创建活动失败，请稍后重试')
      } finally {
        loading.value = false
      }
    } else {
      console.log('表单验证失败')
      return false
    }
  })
}

// 返回上一页
const goBack = () => {
  ElMessageBox.confirm('确定要取消编辑吗？未保存的内容将丢失', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    router.push('/activity')
  }).catch(() => {
    // 取消操作，不做任何处理
  })
}

// 富文本编辑器相关
const contentEditorRef = ref<HTMLElement | null>(null)
const notesEditorRef = ref<HTMLElement | null>(null)
const contentEditorInitialized = ref(false)
const notesEditorInitialized = ref(false)

// 更新活动描述内容
const updateContent = () => {
  if (contentEditorRef.value && contentEditorInitialized.value) {
    form.value.activityContent = contentEditorRef.value.innerHTML
  }
}

// 更新注意事项内容
const updateNotesContent = () => {
  if (notesEditorRef.value && notesEditorInitialized.value) {
    form.value.notes = notesEditorRef.value.innerHTML
  }
}

// 格式化文本，增加参数区分哪个编辑器
const formatText = (command: string, editorType: 'content' | 'notes') => {
  // 先获取当前活动的编辑器
  const editor = editorType === 'content' ? contentEditorRef.value : notesEditorRef.value
  if (!editor) return

  // 聚焦到对应的编辑器
  editor.focus()

  document.execCommand('styleWithCSS', false, 'true')

  switch (command) {
    case 'bold':
      document.execCommand('bold', false, '')
      break
    case 'italic':
      document.execCommand('italic', false, '')
      break
    case 'underline':
      document.execCommand('underline', false, '')
      break
    case 'h1':
      document.execCommand('formatBlock', false, 'H1')
      break
    case 'h2':
      document.execCommand('formatBlock', false, 'H2')
      break
    case 'h3':
      document.execCommand('formatBlock', false, 'H3')
      break
    case 'ul':
      document.execCommand('insertUnorderedList', false, '')
      break
    case 'ol':
      document.execCommand('insertOrderedList', false, '')
      break
  }
}

// 加载省份列表
const loadProvinces = async () => {
  try {
    const response = await getRegionByCode(0) // 0 表示获取所有省份
    provinceList.value = response.data.data // 假设实际数据在 response.data.data
    console.log('加载省份列表:', provinceList.value)
  } catch (error) {
    console.error('加载省份列表失败:', error)
    ElMessage.error('加载省份列表失败')
  }
}

// 加载城市列表
const loadCities = async (provinceCode: number) => {
  try {
    const response = await getRegionByCode(provinceCode)
    cityList.value = response.data.data // 假设实际数据在 response.data.data
    console.log('加载城市列表:', cityList.value)
  } catch (error) {
    console.error('加载城市列表失败:', error)
    ElMessage.error('加载城市列表失败')
  }
}

// 处理省份选择变化
const handleProvinceChange = (shortCode: number) => {
  const selectedProvince = provinceList.value.find(p => p.shortCode === shortCode)
  if (selectedProvince) {
    form.value.province = selectedProvince.province
    form.value.city = '' // 清空城市
    cityList.value = [] // 清空城市列表
    loadCities(shortCode)
  }
}

// 初始化时加载省份列表
onMounted(async () => {
  await loadProvinces()
  if (isEdit) {
    await fetchActivityDetail()
  }
  // 初始化富文本编辑器
  if (contentEditorRef.value) {
    contentEditorRef.value.innerHTML = form.value.activityContent
    contentEditorInitialized.value = true
  }
  if (notesEditorRef.value) {
    notesEditorRef.value.innerHTML = form.value.notes || ''
    notesEditorInitialized.value = true
  }
})
</script>

<style scoped>
.edit-container {
  padding: 20px;
}

.page-header {
  margin-bottom: 20px;
  text-align: center;
}

.activity-form {
  max-width: 800px;
  margin: 0 auto;
}

.rich-text-editor {
  border: 1px solid #dcdfe6;
  border-radius: 4px;
}

.editor-toolbar {
  padding: 8px;
  border-bottom: 1px solid #dcdfe6;
  background-color: #f5f7fa;
}

.editor-content {
  min-height: 200px;
  padding: 10px;
  outline: none;
}

.upload-container {
  display: flex;
  align-items: center;
}

.price-unit {
  margin-left: 10px;
  color: #606266;
}

/* 解决 el-date-picker 鼠标悬停时宽度变化的问题 */
.el-date-editor.el-input {
  width: 100% !important; /* 强制宽度为100% */
}

/* 确保内部的输入框在聚焦时不改变宽度 */
.el-date-editor.el-input__wrapper {
  box-sizing: border-box; /* 确保padding和border包含在宽度内 */
}
</style>
