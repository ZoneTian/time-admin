// API基础URL
export const BASE_API_URL = 'https://womenshike.top/admin-api/v1'
// API路径
export const API_PATHS = {
  // 用户相关
  USER: {
    LOGIN: '/user/login',
    REGISTER: '/user/register',
  },

  // 活动相关
  ACTIVITY: {
    LIST: '/activity/list',
    DETAIL: '/activity/get', // 使用查询参数activityId
    ADD: '/activity/add', // 创建活动
    UPDATE: '/activity/update', // 更新活动，使用查询参数activityId
    REGISTRATION_LIST: '/activity/registration/list', // 活动报名记录列表
  },

  // 成员相关
  MEMBER: {
    LIST: '/members',
    DETAIL: '/members', // 后面需要拼接ID
  }
}
