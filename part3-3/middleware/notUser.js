// 验证是否登陆的中间件
export default function({ store, redirect }) {
  if(store.state.user) {
    return redirect('/')
  }
}