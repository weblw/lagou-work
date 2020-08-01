# Vue.js源码剖析-响应式、虚拟DOM、模板编译和组件化

## 简答题
### 1.简述Vue首次渲染过程。
- Vue本质是一个用function实现的类，它定义在`src/core/instance/index.js`中
- 当使用new关键字初始化的时候，会调用`this._init`方法，该方法定义在`src/core/instance/init.js`中
- 在`init`方法中，主要执行了合并配置、初始化生命周期、初始化事件中心、初始化渲染、初始化data、props、computed、watcher等
- 在初始化的最后，检测到如果有el属性，在调用`vm.$mount`方法挂载`vm`实例，挂载的目的就是把模板渲染成最终的DOM
---
- `Vue`中我们是通过`$mount`实例方法去挂载`vm`实例的，`$mount`方法在多个文件中都有定义，因为`$mount`方法的实现是和平台、构建方式都相关的。

- 在`src/platfrom/web/entry-runtime-with-compiler.js`中定义了带compiler版本的`$mount`。

- 在这个定义中，首先缓存了`Vue`原型上的`$mount`，再重新定义该方法。

- 在重新定义中，首先对el做了限制，不能挂载在`body、html`这样的根节点上。

- 接下来，如果没有render方法，会把el或者template字符串转换成render方法。

  在`Vue 2.0`中所有的`Vue`组件的渲染最终都需要render方法，无论是单文件`.vue`方式的组件，还是写了el或者template属性，最终都会转换成render方法。这个过程是调用`compileToFunctions`实现的。

- 最后，调用缓存的原型上的`$mount`方法挂载。
---
- 原型上的`$mount`方法定义在`src/platform/web/runtime/index.js`中，这样的设计是为了被`runtime only`版本直接复用。

- `$mount`方法支持传入两个参数，第一个是el，表示挂载的元素，可以是字符串，也可以是DOM对象，如果是字符串在浏览器环境下会调用query方法转换成DOM对象。第二个参数是和服务端渲染相关，在浏览器环境下不需要传第二个参数。
- `$mount`方法实际上会调用`mountComponent`方法，它定义在`src/core/instance/lifecyle.js`中。
- `mountComponent`核心就是先实例化一个渲染watcher，在它的回调中调用`updateComponent`方法，在`updateComponent`方法中，先调用`vm._render`方法生成虚拟Node，最后调用`vm._update`更新DOM。

### 2.简述Vue响应式原理
---
#### 响应式对象

**`Object.defineProperty`**

`Object.defineProperty`方法会直接在一个对象上定义一个新属性，或者修改一个对象的现有属性，并返回这个对象。

```javascript
Object.definProperty(obj,prop,descriptor)
// obj是要在其上定义属性的对象
// prop是要定义或者修改的属性的名称
// descriptor是将被定义或者修改的属性描述符
```
---
#### `initState`

在`Vue`初始化阶段，`_init`方法执行的时候，会执行`initState(vm)`方法，它的定义在`src/instance/state.js`中。

`initState`方法主要是对`props、methods、data、computer和watcher`等属性做了初始化。

- `initProps`

props的初始化主要过程，就是遍历定义的props配置。遍历的过程主要做两件事情：一个是调用`defineReactive`方法把每个prop对应的值变成响应式，可以通过`vm._props.xxx`访问到定义prop中对应的属性。另一个是通过proxy把`vm._props.xxx`代理到`vm.xxx`上。

- `initData`

data初始化的主要过程也是做两件事，一个是对定义data函数返回对象的遍历，通过proxy把每一个值`vm._data.xxx`都代理带`vm.xxx`上；另一个是调用observe方法观测整个data的变化，把data变成响应式，可以通过`vm._data.xxx`访问到定义data返回函数中对应的属性。

- proxy

代理的作用是把props和data上的属性代理到`vm`实例上。

proxy方法的实现很简单，通过`Object.defineProperty`把`target[sourceKey][key]`的读写变成了对`target[key]`的读写。所以对于props而言，对`vm._props.xxx`的读写就变成了`vm.xxx`的读写。同理`vm._data.xxx`的读写变成了`vm.xxx`的读写。

---
#### observe

`observe`的功能就是用来监测数据的变化，它的定义在`src/core/observe/index.js`中。

`observe`方法的作用就是给非`VNode`的对象类型数据添加一个`Observer`，如果已经添加过则直接返回，否则再满足一定条件下去实例化一个`Observer`对象实例。

---
#### Observer

Observer是一个类，它的作用是给对象的属性添加getter和setter，用于依赖收集和派发更新。

Observer的构造函数很假单，首先实例化`Dep`对象，接着通过执行def函数把自身实例添加到数据对象value的`__ob__`属性上，def的定义在`src/core/util/lang.js`中。

def函数是一个非常简单的`Object.definProperty`的封装，这就是为什么我们在开发中输出data上对象类型数据，会发现该对象多了一个`__ob__`属性。

回到Observer的构造函数，接下来会对value做判断，对于数组会调用`observeArray`方法，否则对于纯对象，会调用`walk`方法。可以看到`observeArray`是遍历数组再次调用`observe`方法，而`walk`方法是遍历对象的key调用`defineReactive`方法。

---
#### `defineReactive`

`defineReactive`的功能就是定义一个响应式对象，给对象动态添加getter和setter，它的定义在`src/core/observer/index.js`中。

`defineReactive`函数最开始初始化`Dep`对象的实例，接着拿到obj的属性描述符，然后对子对象递归调用`observe`方法，这样就保证了无论`obj`的结构多复杂，它的所有子属性也能变成响应式对象，这样我们访问或者修改obj中一个嵌套比较深的属性，也能触发`getter`和`setter`。最后利用`Object.defineProperty`去给obj的属性key添加`getter`和`setter`。

---
#### 总结

响应式对象，核心就是利用`Object.defineProperty`给数据添加了`getter`和`setter`，目的就是为了在我们访问数据以及写入数据的时候自动执行一些逻辑：`getter`做的事情是收集依赖，`setter`做的事情是派发更新。

### 3.简述虚拟 DOM 中 Key 的作用和好处

- 虚拟DOM中，在进行diff算法对比虚拟子节点的时候，如果在新旧虚拟节点的开头和结尾的四种比对场景下都没有找到相同节点
- 如果虚拟DOM中有key存在，就可以通过查找新旧节点中key值相同的节点来找到相同节点
- 如果虚拟DOM中没有key存在，那么久只能通过循环遍历的方式来查找相同节点
- 所以，虚拟DOM中key值得作用是在进行diff算法比对的时候，能够更方便的找到相同节点，提高diff效率

### 4.Vue中模板编译的过程
- 解析-parse：解析器将模板解析为抽象语法树，因为只有将模板解析成抽象语法树，才能基于它做代码优化或者生成代码字符串
- 优化-optimize：优化抽象语法树，检测子节点中是否是纯静态节点；一旦检测到纯静态节点，进行标记，在patch的时候会直接跳过静态节点
- 生成-generate：将优化过后的AST转化成JS代码字符串，也就是render函数