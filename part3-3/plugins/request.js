import axios from 'axios'

export const request = axios.create({
  baseURL: 'https://conduit.productionready.io'
})

// 插件导出函数必须作为默认成员
export default async ({ store }) => { 
  // 请求拦截器
  request.interceptors.request.use(function(config) {
    // 注意取值位置，不然会取不到store中数据
    const { user } = store.state
    if(user && user.token)
      config.headers.Authorization = `Token ${ user.token }`
    return config
  }, function(error) {
    return Promise.reject(error)
  })

  // 响应拦截器
}
