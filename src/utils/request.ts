import axios from 'axios'
import { BASE_API_URL } from '../constants/api'

// 创建axios实例
const service = axios.create({
  baseURL: BASE_API_URL,
  timeout: 10000 // 请求超时时间
})

// 请求拦截器
service.interceptors.request.use(
  config => {
    // 从localStorage获取token
    const token = localStorage.getItem('token')
    if (token) {
      // 添加token到请求头
      config.headers['api-access-token'] = token
      config.headers['Authorization'] = `Bearer ${token}`
    }
    return config
  },
  error => {
    console.error('请求错误:', error)
    return Promise.reject(error)
  }
)

// 响应拦截器
service.interceptors.response.use(
  response => {
    return response
  },
  error => {
    console.error('响应错误:', error)
    return Promise.reject(error)
  }
)

export default service
