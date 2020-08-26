/**
 * 解决兼容的问题
 * 安装了npm install babel-polyfill --save-dev 依赖
 * 在入口文件main.js文件中引入插件
 * 需要在babel.config.js配置文件中修改
 * 
 * 安装npm i -D postcss-loader 依赖
 * 安装npm i autoprefixer  依赖
 * 安装npm install --save element-dataset 依赖 IE10以下，iview的日期组件无法选择
 * 安装 npm i es6-promise 依赖 IE不支持promise
 * 安装npm i ie-placeholder  依赖 ie9不支持placeholder属性
 */
import { Cascader, MessageBox,Dialog  } from 'element-ui'

import 'element-ui/lib/theme-chalk/index.css';
 import 'babel-polyfill'
import promise from 'es6-promise'  // IE不支持promise 引入es6-promise
promise.polyfill()
// 解决 兼容Number 对象的 parseInt 和 parseFloat 方法
if (Number.parseInt === undefined) Number.parseInt = window.parseInt;
if (Number.parseFloat === undefined) Number.parseFloat = window.parseFloat;

import Vue from 'vue'
import App from './App'
import store from './store'
import router from './router'   //引入路由
import ViewUI from 'view-design'  //引入ui
import axios from 'axios'  // 引入axios
import './api/axiosTools'
import myStorage from 'utils/localstore'   //引入二次封装的localStorage
import 'view-design/dist/styles/iview.css'
import './permission'
import VueCookies from 'vue-cookies'

    
import ElementDataset from 'element-dataset'  //引入 element-dataset
ElementDataset()

import 'ie-placeholder'  // ie9不支持placeholder属性

Vue.config.productionTip = false
Vue.use(ViewUI)
Vue.use(Cascader);
Vue.use(Dialog);
Vue.use(VueCookies)
// tips:其他按需引入的组件在使用的时候，都需要Vue.use('组件名称')进行使用，而根据MessageBox组件文档说明，我们不必对MessageBox组件进行Vue.use();
// 为了能够在全局调用到MessageBox组件，我们可以将其挂到Vue的prototype原型上
Vue.prototype.$msgbox = MessageBox

// 设置请求超时时间
axios.defaults.timeout = 5000

Vue.prototype.$axios = axios
Vue.prototype.$myStorage = myStorage


// 兼容classList（ie9）
if (!('classList' in document.documentElement)) {
    Object.defineProperty(HTMLElement.prototype, 'classList', {
        get: function () {
            var self = this;
            function update(fn) {
                return function (value) {
                    var classes = self.className.split(/\s+/g);
                    var index = classes.indexOf(value);
 
                    fn(classes, index, value);
                    self.className = classes.join(' ');
                };
            }
 
            return {
                add: update(function (classes, index, value) {
                    if (!~index) classes.push(value);
                }),
 
                remove: update(function (classes, index) {
                    if (~index) classes.splice(index, 1);
                }),
 
                toggle: update(function (classes, index, value) {
                    if (~index) { classes.splice(index, 1); } else { classes.push(value); }
                }),
 
                contains: function (value) {
                    return !!~self.className.split(/\s+/g).indexOf(value);
                },
 
                item: function (i) {
                    return self.className.split(/\s+/g)[i] || null;
                },
            };
        },
    });
}


// 兼容requestAnimationFrame（ie9）
(function () {
    var lastTime = 0;
    var vendors = ['ms', 'moz', 'webkit', 'o'];
    for (var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
        window.requestAnimationFrame = window[vendors[x] + 'RequestAnimationFrame'];
        window.cancelAnimationFrame = window[vendors[x] + 'CancelAnimationFrame'] ||
            window[vendors[x] + 'CancelRequestAnimationFrame'];
    }
  
    if (!window.requestAnimationFrame) {
        window.requestAnimationFrame = function (callback, element) {
            var currTime = new Date().getTime();
            var timeToCall = Math.max(0, 16 - (currTime - lastTime));
            var id = window.setTimeout(function () { callback(currTime + timeToCall); },
                timeToCall);
            lastTime = currTime + timeToCall;
            return id;
        };
    }
  
    if (!window.cancelAnimationFrame) {
        window.cancelAnimationFrame = function (id) {
            clearTimeout(id);
        };
    }
  }());

new Vue({
    el: '#app',
    router,
    store,
    render: h => h(App)
})