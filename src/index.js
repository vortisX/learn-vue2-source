import { initGlobalApi } from "./global-api/index";
import { initMixin } from "./init/index";
import { lifecycleMixin } from "./lifecycle";
import { renderMixin } from "./vnode/index";

function Vue(option) {
  this._init(option);
}

// Vue原型上的初始化方法
initMixin(Vue);
console.log("initMixin 完成");

// 生命周期初始化方法
lifecycleMixin(Vue);
console.log("lifecycleMixin 完成");

// 渲染方法初始化
renderMixin(Vue);
console.log("renderMixin 完成");

initGlobalApi(Vue);
console.log("initGlobalApi 完成");
export default Vue;
