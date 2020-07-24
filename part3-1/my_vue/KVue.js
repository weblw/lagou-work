class KVue{
  constructor(options){
    this.$options=options
    this.$data=options.data
    // 给data数据实现响应化
    this.observe(this.$data)
    // 创建编译器
    new Compile(options.el,this)
    // 执行created钩子函数
    if(options.created){
      options.created.call(this)
    }
  }
  observe(value){
    // 判断value值存在，并且是一个对象
    if(!value||typeof value!=='object'){
      return 
    }
    Object.keys(value).forEach(key=>{
      // 调用响应化函数
      this.defineReactive(value,key,value[key])
      // 属性代理
      this.proxyData(key)
    })
  }
  // 在vue上定义属性代理data中的属性，后面就可以通过this.msg来访问data中的msg
  proxyData(key){
    Object.defineProperty(this,key,{
      get(){
        return this.$data[key]
      },
      set(newVal){
        this.$data[key]=newVal
      }
    })
  }
  defineReactive(obj,key,val){
    // 递归——解决嵌套属性foo.bar='...'
    this.observe(val)
    // 创建Dep实例，它和key一一对应
    const dep=new Dep()
    // 给obj定义属性，实现响应化
    Object.defineProperty(obj,key,{
      get(){
        // 判断观察者是否存在——存在就加入依赖
        Dep.target&&dep.addDep(Dep.target)
        return val
      },
      set(newVal){
        if(newVal!==val){
          val=newVal
          // 通知更新
          dep.notify()
        }
      }
    })
  }
}
// Dep管理若干Watcher
class Dep{
  constructor(){
    this.deps=[]
  }
  addDep(watcher){
    this.deps.push(watcher)
  }
  notify(){
    this.deps.forEach(watcher=>watcher.update())
  }
}
// 保存ui中的依赖，实现update函数更新
class Watcher{
  constructor(vm,key,cb){
    this.vm=vm
    this.key=key
    this.cb=cb
    // 将当前实例指向Dep.target
    Dep.target=this
    // 读一次key，触发getter
    this.vm[this.key]
    Dep.target=null
  }
  update(){
    // 指定回调函数执行上下文对象，传递当前key的值为参数
    this.cb.call(this.vm,this.vm[this.key])
  }
}