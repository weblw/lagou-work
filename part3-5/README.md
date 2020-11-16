# 3-5 作业

### vue 3.0 性能提升主要是通过那几个方面？

- diff 方法优化
  - vue 2.0中的虚拟 DOM 是进行全量的对比
  - vue 3.0新增了静态标记，在与旧 DOM 节点进行对比的时候，只对比带有 patch flag 的节点，并且可以通过 flag 的信息得知当前节点要对比的具体内容
- hoistStatic 静态提升
  - vue 2.0中无论元素是否参与更新，每次都会重新创建，然后在渲染
  - vue 3.0中对于不参与更新的元素，会做静态提升，只会被创建一次，再渲染的时候直接复用
- cacheHandlers 事件侦听器缓存
  - 例如 onClick 事件会被视为动态绑定，所以每次都会追踪他的变化，但是因为是同一个函数，所以不用追踪变化，直接缓存复用即可
- 重写虚拟 DOM
  - Vue 3.0 将 vdom 更新性能由与模版整体大小相关提升为与动态内容的数量相关
- 优化插槽生成
  - vue 2.0 中，当父子组件重新渲染时，其子组件也必须重新渲染
  - vue 3.0 中，可以单独重新渲染父组件和子组件
- 基于 Proxy 的观察机制
  - Object.defineProperty 是一个相对昂贵的操作，因为他直接操作对象的属性，粒度比较小
  - Proxy 在目标对象之上加了一层拦截器，代理的是对象而不是属性，这样可以将原本对对象属性的操作变为对整个对象的操作，粒度变大
- Tree Sharking 是 Vue 更小
  - 通过 Tree Sharking 使 Vue 运行时代码压缩后体积更小，提升性能

### Vue3.0 Composition Api

- Vue 2.0 中，随着组件的增大，组件内代码变得越来越难以维护，其中一些可以复用的代码比较难抽离出来，因为一个功能代码中可能需要依赖多个 Options（components/props/data/computed/methods/声明周期方法等）
- Vue 3.0 中，在 Composition Api 中提供一个 setup 方法，同一个功能的逻辑代码可以维护在同一个函数中，方便代码维护和复用
- Vue 3.0 中，不再要求模版的根结点必须只能有一个节点
- Vue 3.0 中每个 Api 都是一个独立的模块，可以单独引用

### Proxy 相对于 Object.defineProperty 有哪些优点？

- Proxy 可以直接监听数组的变化
- Proxy 可以直接监听对象而非属性
- Proxy 有 13 种拦截方法，比 Object.defineProperty 丰富的多

### Vue3.0 在编译方面有哪些优化？

- 重写虚拟 DOM

- 实现基于 Proxy 的观察机制
- Tree Sharking 优化

### Vue 3.0 响应式系统实现原理

```js
const isObject = val => val !== null && typeof val === 'object'
const convert = target => isObject(target) ? reactive(target) : target
const hasOwnProperty = Object.prototype.hasOwnProperty
const hasOwn = (target, key) => hasOwnProperty.call(target, key)

export function reactive (target) {
  if(!isObject(target)) return target

  const handler = {
    get (target, key, receiver) {
      // 收集依赖
      console.log('get', key)
      track(target, key)
      const result = Reflect.get(target, key, receiver)
      return convert(result)
    },
    set (target, key, value, receiver) {
      const oldValue = Reflect.get(target, key, receiver)
      let result = true
      if (oldValue !== value) {
        result = Reflect.set(target, key ,value, receiver)
        // 触发更新
        console.log('set', key, value)
        trigger(target, key)
      }
      return result
    },
    deleteProperty (target, key) {
      const hasKey = hasOwn(target, key)
      const result = Reflect.deleteProperty(target, key)
      if (hasKey && result) {
        // 触发更新
        console.log('delete', key)
        trigger(target, key)
      }
      return result
    }
  }

  return new Proxy(target, handler)
}

let activeEffect = null
export function effect (callback) {
  activeEffect = callback
  callback() // 访问响应式对象属性，收集依赖
  activeEffect = null
}

let targetMap = new WeakMap()

export function track (target, key) {
  if (activeEffect) return
  let depsMap = targetMap.get(target)
  if (!depsMap) {
    targetMap.set(target, (depsMap = new Map()))
  }
  let dep = depsMap.get(key)
  if (!dep) {
    depsMap.set(key, (dep = new Set()))
  }
  dep.add(activeEffect)
}

export function trigger (target, key) {
  const depsMap = targetMap.get(target)
  if (!depsMap) return
  console.log(depsMap)
  const dep = depsMap(key)
  if (dep) {
    dep.forEach(effect => {
      effect()
    })
  }
}

export function ref (raw) {
  // 判断 raw 是否是 ref 创建的对象，如果是直接返回
  if (isObject(raw) && raw.__v__isRef) return
  // 如果是对象，转换为响应式对象返回，否则直接返回
  let value = convert(raw)
  const r = {
    __v__isRef: true,
    get value() {
      // 收集依赖
      console.log('get')
      track(r, 'value')
      return value
    },
    set value (newValue) {
      if (newValue !== value) {
        // 重新赋值
        console.log('set')
        raw = newValue
        // 转换为响应式对象
        value = convert(raw)
        // 触发更新
        trigger(r, 'value')
      }
    }
  }
  return r
}

export function toRefs (proxy) {
  const ret = proxy instanceof Array ? new Array(proxy.length) : {}
  for (const key in proxy) {
    ret[key] = toProxyRef(proxy, key)
  }
  return ret
}

function toProxyRef (proxy, key) {
  const r = {
    __v__isRef: true,
    // 不需要收集依赖和触发更新
    // 因为 proxy 本身就是一个响应式对象，取值和设置值的时候就会收集依赖和触发更新
    get value () {
      return proxy[key]
    },
    set value (newValue) {
      proxy[key] = newValue
    }
  }
  return r
}

export function computed (getter) {
  const result = ref()
  // 依赖值发生变化就会触发函数执行，重新获取 vaule
  effect(() => result.value = getter())
  return result
}
```