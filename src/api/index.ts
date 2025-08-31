import axios from 'axios'
import { API_PATHS } from '../constants/api'

// 解决刷新页面时config.js加载顺序问题
// 当检测到当前运行在浏览器环境且配置已加载时，使用完整的API URL
let BASE_URL = '/admin-api/v1'

if (typeof window !== 'undefined' && (window as any).appConfig?.apiBaseUrl) {
  BASE_URL = (window as any).appConfig.apiBaseUrl
}

console.log('当前API基础URL:', BASE_URL)

// 创建axios实例
const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器
api.interceptors.request.use(
  config => {
    // 从localStorage获取token
    const token = localStorage.getItem('token')
    if (token) {
      // 确保headers对象存在并正确设置类型
      config.headers = config.headers || {}

      // 添加token到请求头 - 使用api-access-token作为头名称
      config.headers['api-access-token'] = token

      // 打印请求信息，用于调试
      console.log('发送请求:', config.url, '请求头:', JSON.stringify(config.headers))
    } else {
      console.warn('请求未携带token:', config.url)
    }
    return config
  },
  error => {
    return Promise.reject(error)
  }
)

// 响应拦截器
api.interceptors.response.use(
  response => {
    // 打印响应信息，用于调试
    console.log('收到响应:', response.config.url)
    console.log('响应状态:', response.status)
    console.log('响应头:', response.headers)
    console.log('响应数据:', response.data)

    // 检查响应状态
    if (response.status >= 200 && response.status < 300) {
      // 检查响应数据中的code字段
      if (response.data && response.data.code === 403) {
        console.error('权限验证失败，需要重新登录')
        // 清除登录状态
        localStorage.removeItem('isLoggedIn')
        localStorage.removeItem('username')
        localStorage.removeItem('token')
        // 跳转到登录页
        window.location.href = '/login'
        return Promise.reject(new Error('权限验证失败，需要重新登录'))
      }
      return response
    }
    return Promise.reject(new Error(`请求失败，状态码: ${response.status}`))
  },
  error => {
    console.error('API请求错误:', error)

    if (error.response) {
      // 打印详细的错误响应信息
      console.error('错误响应状态码:', error.response.status)
      console.error('错误响应头:', error.response.headers)
      console.error('错误响应数据:', error.response.data)
      console.error('请求URL:', error.config.url)
      console.error('请求方法:', error.config.method)
      console.error('请求头:', error.config.headers)
      console.error('请求数据:', error.config.data)

      switch (error.response.status) {
        case 401:
          // token过期或无效
          localStorage.removeItem('isLoggedIn')
          localStorage.removeItem('username')
          localStorage.removeItem('token')
          // 注意：这里不能直接使用router，因为它需要在组件中使用
          window.location.href = '/login'
          break
        case 403:
          console.error('没有权限访问该资源')
          // 清除登录状态
          localStorage.removeItem('isLoggedIn')
          localStorage.removeItem('username')
          localStorage.removeItem('token')
          // 跳转到登录页
          window.location.href = '/login'
          break
        case 404:
          console.error('请求的资源不存在')
          break
        case 500:
          console.error('服务器内部错误')
          break
        default:
          console.error(`未知错误: ${error.response.status}`)
      }
    } else if (error.request) {
      // 请求已发送但没有收到响应
      console.error('服务器无响应，请检查网络连接')
      console.error('请求配置:', error.config)
    } else {
      // 请求配置出错
      console.error('请求配置错误:', error.message)
      console.error('错误堆栈:', error.stack)
    }
    return Promise.reject(error)
  }
)

// 用户相关API
export const userApi = {
  // 登录
  login: (userName: string, password: string) => {
    console.log('登录请求:', { userName })
    return api.post(API_PATHS.USER.LOGIN, { userName, password })
  },

  // 注册
  register: (userName: string, password: string) => {
    console.log('注册请求:', { userName })
    return api.post(API_PATHS.USER.REGISTER, { userName, password })
  }
}

// 成员相关API
export const memberApi = {
  // 获取成员列表
  getList: (params?: any) => {
    console.log('获取成员列表参数:', params)
    return api.get(API_PATHS.MEMBER.LIST, { params })
  },

  // 获取成员详情
  getDetail: (id: number) => {
    console.log('获取成员详情ID:', id)
    return api.get(`${API_PATHS.MEMBER.DETAIL}/${id}`)
  },

  // 添加成员
  add: (data: any) => {
    console.log('添加成员数据:', data)
    return api.post(API_PATHS.MEMBER.LIST, data)
  },

  // 更新成员
  update: (id: number, data: any) => {
    console.log('更新成员ID:', id, '数据:', data)
    return api.put(`${API_PATHS.MEMBER.DETAIL}/${id}`, data)
  },

  // 删除成员
  delete: (id: number) => {
    console.log('删除成员ID:', id)
    return api.delete(`${API_PATHS.MEMBER.DETAIL}/${id}`)
  }
}

// 活动相关API
export const activityApi = {
  // 获取活动列表
  getList: (params?: any) => {
    // 打印请求参数，用于调试
    console.log('活动列表请求参数:', params)
    return api.get(API_PATHS.ACTIVITY.LIST, { params })
  },

  // 获取活动详情
  getDetail: (id: number) => {
    console.log('获取活动详情ID:', id)
    return api.get(API_PATHS.ACTIVITY.DETAIL, { params: { activityId: id } })
  },

  // 添加活动
  add: (data: any) => {
    console.log('添加活动数据:', data)
    return api.post(API_PATHS.ACTIVITY.ADD, data)
  },

  // 更新活动
  update: (id: number, data: any) => {
    console.log('更新活动ID:', id, '数据:', data)
    return api.put(API_PATHS.ACTIVITY.UPDATE, { activityId: id, ...data })
  },

  // 删除活动
  delete: (id: number) => {
    console.log('删除活动ID:', id)
    return api.delete(`${API_PATHS.ACTIVITY.UPDATE}?activityId=${id}`)
  }
}

export default api
