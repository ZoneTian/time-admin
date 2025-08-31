import request from '../utils/request'

/**
 * 根据地区代码获取子地区列表
 * @param shortCode 地区代码，0表示获取所有省份
 * @returns 地区列表
 */
export function getRegionByCode(shortCode: string | number) {
  return request({
    url: '/region/getRegionByCode',
    method: 'get',
    params: { shortCode }
  })
}
