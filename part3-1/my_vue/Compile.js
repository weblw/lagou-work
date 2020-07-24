// 遍历模板，将里面的插值表达式处理
// 如果发现k-xxx，@xxx做特殊处理
class Compile{
  constructor(el,vm){
    this.$vm=vm
    this.$el=document.querySelector(el)
    if(this.$el){
      // 1.$el中的内容搬家到一个fragment，提高效率
      this.$fragment=this.node2Fragment(this.$el)
      // 2.编译fragment
      this.compile(this.$fragment)
      // 3.将编译结果追加至宿主中
      this.$el.appendChild(this.$fragment)
    }
  }
  // 遍历el，把里面的内容搬家到心创建的fragment
  node2Fragment(el){
    const fragment=document.createDocumentFragment()
    let child
    while ((child=el.firstChild)) {
      fragment.appendChild(child)
    }
    return fragment
  }
  // 把动态值替换，把指令做处理
  compile(el){
    // 遍历el
    const childNodes=el.childNodes
    Array.from(childNodes).forEach(node=>{
      if(this.isElement(node)){
        // 如果是元素节点，要处理k-xxx指令，和事件@xxx
        this.compileElement(node)
      }else if(this.isInterpolation(node)){
        // 编译插值文本
        this.compileText(node)
      }
      // 递归子元素
      if(node.childNodes&&node.childNodes.length>0){
        this.compile(node)
      }
    })
  }
  isElement(node){
    return node.nodeType===1
  }
  isInterpolation(node){
    // 判断插值文本
    return node.nodeType===3&&/\{\{(.*)\}\}/.test(node.textContent)
  }
  compileElement(node){
    // 查看node的特性中是否有k-xxx、@xxx
    const nodeAttrs=node.attributes
    Array.from(nodeAttrs).forEach(attr=>{
      // 获取属性名称和值
      const attrName=attr.name 
      const exp=attr.value 
      // 指令k-xxx
      if(attrName.indexOf('k-')===0){
        const dir=attrName.substring(2)
        // 执行指令
        this[dir]&&this[dir](node,this.$vm,exp)
      }else if(attrName.indexOf('@')===0){
        const eventName=attrName.substring(1)
        // 处理事件
        this.eventHandler(node,this.$vm,exp,eventName)
      }
    })
  }
  text(node,vm,exp){
    this.update(node,vm,exp,'text')
  }
  textUpdator(node,value){
    node.textContent=value
  }
  model(node,vm,exp){
    // update是数据改变界面
    this.update(node,vm,exp,'model')
    node.addEventListener('input',e=>{
      vm[exp]=e.target.value
    })
  }
  modelUpdator(node,value){
    node.value=value
  }
  html(node,vm,exp){
    this.update(node,vm,exp,'html')
  }
  htmlUpdator(node,value){
    node.innerHTML=value
  }
  eventHandler(node,vm,exp,eventName){
    // 获取回调函数
    const fn=vm.$options.methods&&vm.$options.methods[exp]
    if(eventName&&fn){
      node.addEventListener(eventName,fn.bind(vm))
    }
  }
  // 把插值表达式替换为实际内容
  compileText(node){
    const exp=RegExp.$1
    this.update(node,this.$vm,exp,'text')
  }
  // update函数，可复用
  update(node,vm,exp,dir){
    const fn=this[dir+'Updator']
    fn&&fn(node,vm[exp])
    // 创建watcher
    new Watcher(vm,exp,function(){
      fn&&fn(node,vm[exp])
    })
  }
}