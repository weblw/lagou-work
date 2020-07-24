class HistoryRouter{
  constructor(){
    this.current=null
  }
}


class VueRouter{
  constructor(options){
    this.history=new HistoryRouter()
    this.mode=options.mode || 'hash'
    this.router=options.routes || []
    this.routerMap=this.createMap(this.routes)
    this.init()
  }

  init(){
    if(this.mode==='hash'){
      // 自动加上# 
      location.hash ? '' : location.hash='/'
      // 监听hash变化
      window.addEventListener('load',()=>{
        // slice去掉# 
        this.history.current=location.hash.slice(1)
      })
      window.addEventListener('hashchange',()=>{
        this.history.current=location.hash.slice(1)
      })
    }else{
      location.pathname ? '' : location.pathname='/'
      window.addEventListener('load',()=>{
        this.history.current=location.pathname
      })
      window.addEventListener('popstate',()=>{
        this.history.current=location.pathname
      })
    }
  }

  createMap(routes){
    return routes.reduce((memo,current)=>{
      memo[current.path]=current.component
      return memo
    })
  }
}

VueRouter.install=function(Vue){
  Vue.mixin({
      beforeCreate(){
          if(this.$options && this.$options.router){
              // 把当前实例挂载在_root上
              // 这里的this指向当前组件实例
              this._root=this
              this._router=this.$options.router
              Vue.util.defineReactive(this,'current',this._router.history)
          }
          // 设置一个只读引用，只提供get方法，不能够修改
          Object.defineProperty(this,'$router',{
              get(){
                  return this._root._router
              }
          })
          Object.defineProperty(this,'$route',{
              get(){
                  return this._root._router.history.current
              }
          })
      }
  })
  Vue.component('router-view',{
      render(h){
          // this指向的是proxy对象 
          // 拿到当前是那个路径
          let current=this._self._root._router.history.current
          // 拿到路由组件映射
          let routeMap=this._self._root._router.routesMap
          return h(routeMap[current])
      }
  })
}

module.exports=VueRouter