import { init } from 'snabbdom/build/package/init'
import { h } from 'snabbdom/build/package/h'

const path=init([])

const vnode=h('div#container','hello')

const app=document.querySelector('#app')

path(app,vnode)