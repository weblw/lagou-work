import { request } from '@/plugins/request.js'

// 获取文章标签列表
export const getTags = params => {
  return request({
    method: 'GET',
    url: '/api/tags',
    params
  })
}