const cookieparser = process.server ? require('cookieparser') : undefined

// 在服务端渲染期间运行的都是一个实例
// 为了防止数据冲突，必须把 state 定义成一个函数，返回数据对象
export const state = () => {
  return {
    user: null
  }
}

export const mutations = {
  setUser(state, data) {
    state.user = data
  }
}

export const actions = {
  // 服务端渲染期间自动调用
  nuxtServerInit ({ commit }, { req }) {
    let user = null
    // 如果请求头中有 cookie
    if(req.headers.cookie) {
      const parsed = cookieparser.parse(req.headers.cookie)
      try {
        user = JSON.parse(parsed.user)
      } catch(err) {}
    }
    // 提交 mutation 初始化状态
    commit('setUser', user)
  }
}
