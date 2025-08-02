import { initGlobalApi } from "./global-api/index";
import { initMixin } from "./init/index";
import { lifecycleMixin } from "./lifecycle";
import { renderMixin } from "./vnode/index";

/**
 * Vue构造函数
 * 这是Vue框架的入口点，所有Vue实例都通过这个构造函数创建
 * 
 * 构造函数的设计：
 * 1. 只能通过new关键字调用，确保正确的实例化过程
 * 2. 接收options参数，包含组件的所有配置
 * 3. 立即调用_init方法开始初始化流程
 * 
 * @param {Object} option - Vue实例的配置选项
 */
function Vue(option) {
  // 调用初始化方法，开始Vue实例的创建过程
  // _init方法会在initMixin中被添加到Vue原型上
  this._init(option);
}

// ============== Vue原型方法的模块化初始化 ==============
// Vue的功能通过多个mixin函数添加到原型上，实现了功能的模块化

// 1. 初始化核心方法
// 添加_init方法和$mount方法，负责Vue实例的创建和挂载
initMixin(Vue);
console.log("initMixin 完成");

// 2. 生命周期相关方法
// 添加_update方法，负责虚拟DOM到真实DOM的转换
lifecycleMixin(Vue);
console.log("lifecycleMixin 完成");

// 3. 渲染相关方法
// 添加_render、_c、_v、_s等方法，负责虚拟DOM的创建
renderMixin(Vue);
console.log("renderMixin 完成");

// 4. 全局API初始化
// 添加Vue.mixin、Vue.extend、Vue.component等全局方法
initGlobalApi(Vue);
console.log("initGlobalApi 完成");

export default Vue;

// ============== Vue架构设计说明 ==============
//
// 1. 模块化设计的优势：
//    - 功能分离：每个mixin负责特定的功能领域
//    - 易于维护：修改某个功能不影响其他模块
//    - 易于测试：可以单独测试每个模块
//    - 易于扩展：可以轻松添加新的功能模块
//
// 2. Mixin模式的应用：
//    - 避免单一文件过大
//    - 实现功能的组合和复用
//    - 保持Vue构造函数的简洁
//
// 3. Vue实例的创建流程：
//    new Vue(options) -> _init(options) -> 各种初始化 -> 挂载到DOM
//
// 4. 为什么不使用class：
//    - 更好的兼容性（ES5环境）
//    - 更灵活的原型扩展
//    - 符合Vue2的设计理念
//
// 5. 控制台日志的作用：
//    - 帮助开发者了解Vue的加载过程
//    - 便于调试和问题排查
//    - 显示各个模块的加载状态
