<template>
  <div class="login-container">
    <el-card class="login-card">
      <h2 style="text-align:center;">登录</h2>
      <el-form :model="loginForm" :rules="rules" ref="loginFormRef" label-width="60px">
        <el-form-item label="账号" prop="username">
          <el-input v-model="loginForm.username" placeholder="请输入账号" />
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="loginForm.password" type="password" placeholder="请输入密码" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="onLogin">登录</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElLoading } from 'element-plus'
import { userApi } from '../api'

const router = useRouter()
const loginForm = ref({
  username: '',
  password: ''
})
const rules = {
  username: [ { required: true, message: '请输入账号', trigger: 'blur' } ],
  password: [ { required: true, message: '请输入密码', trigger: 'blur' } ]
}
const loginFormRef = ref()

const onLogin = () => {
  loginFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      // 显示加载状态
      const loadingInstance = ElLoading.service({
        fullscreen: true,
        text: '登录中...',
        background: 'rgba(0, 0, 0, 0.7)'
      });

      try {
        // 使用api/index.ts中定义的userApi调用登录接口
        const response = await userApi.login(
          loginForm.value.username,
          loginForm.value.password
        );

        // 关闭加载提示
        loadingInstance.close();

        console.log('登录响应:', response);
        console.log('登录响应数据:', response.data);
        console.log('登录响应头:', response.headers);

        // 检查响应数据中的code字段
        if (response.data && response.data.code === 0) {
          // 登录成功，存储登录状态和token
          localStorage.setItem('isLoggedIn', 'true');
          localStorage.setItem('username', loginForm.value.username);

          // 从响应数据中获取 api-access-token
          const apiAccessToken = response.data.data && response.data.data['api-access-token'];

          if (apiAccessToken) {
            console.log('获取到 api-access-token:', apiAccessToken);
            localStorage.setItem('token', apiAccessToken);
          } else {
            console.warn('未在响应数据中找到 api-access-token');
            console.log('响应数据结构:', JSON.stringify(response.data));
          }

          // 显示成功消息，优先使用接口返回的message
          ElMessage.success(response.data.message || '登录成功！');

          // 跳转到首页
          router.push('/');
        } else {
          // 服务器响应但登录失败
          const errorMsg = response.data && response.data.message
            ? response.data.message
            : '登录失败，用户名或密码错误！';
          ElMessage.error(errorMsg);
        }
      } catch (error: any) {
        // 关闭加载提示
        loadingInstance.close();

        console.error('登录失败:', error);

        // 根据错误类型显示不同的错误信息
        if (error.response) {
          // 服务器返回了错误状态码
          if (error.response.status === 401) {
            ElMessage.error('用户名或密码错误！');
          } else if (error.response.status === 429) {
            ElMessage.error('登录尝试次数过多，请稍后再试！');
          } else {
            ElMessage.error(`登录失败: ${error.response.status}`);
          }
        } else if (error.request) {
          // 请求已发送但没有收到响应
          ElMessage.error('服务器无响应，请检查网络连接！');
        } else {
          // 请求配置出错
          ElMessage.error('登录请求错误，请稍后再试！');
        }
      }
    }
  })
}
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background: #f5f5f5;
}
.login-card {
  width: 350px;
  padding: 30px 20px 10px 20px;
}
</style>
