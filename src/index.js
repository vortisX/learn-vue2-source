import { initGlobalApi } from "./global-api/index";
import { initMixin } from "./init/index";
import { lifecycleMixin } from "./lifecycle";
import { renderMixin } from "./vnode/index";
import { stateMixin } from "./init/initState";
import { compileToFunction } from "./compile/index";
import { createEl, patch } from "./vnode/patch";
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

// 5. 状态管理相关方法
// 添加$nextTick、$set、$delete等方法，处理数据响应式和更新
stateMixin(Vue);
console.log("stateMixin 完成");

// ============== Vue功能测试和演示代码 ==============
//
// 以下代码演示了Vue的核心功能：
// 1. 模板编译：将模板字符串转换为渲染函数
// 2. 虚拟DOM创建：通过渲染函数生成虚拟节点
// 3. DOM渲染：将虚拟节点转换为真实DOM
// 4. 差异对比：通过patch算法更新DOM

// 创建第一个Vue实例用于测试
// 这个实例包含基础的响应式数据
let vm1 = new Vue({
  data: {
    name: "张三", // 姓名数据
    age: 99,     // 年龄数据
  },
});

// 编译第一个模板字符串
// compileToFunction将模板转换为可执行的渲染函数
// 模板中的{{name}}和{{age}}会被替换为对应的数据值
let render1 = compileToFunction(
  `<div id="a">我的名字叫{{name}},我的年龄是{{age}}岁。</div>`
);

// 执行渲染函数生成虚拟DOM节点
// render1.call(vm1)在vm1的上下文中执行渲染函数
// 这样模板中的变量可以正确访问到vm1的data
let vnode1 = render1.call(vm1);

// 将虚拟DOM转换为真实DOM并添加到页面
// createEl函数递归处理虚拟节点，创建对应的DOM元素
document.body.appendChild(createEl(vnode1));

// 创建第二个Vue实例用于对比测试
// 这个实例有相同的数据结构但不同的值和样式
let vm2 = new Vue({
  data: {
    name: "李四", // 不同的姓名
    age: 99,     // 相同的年龄
  },
});

// 编译第二个模板字符串
// 这个模板添加了style属性，用于测试属性的差异更新
let render2 = compileToFunction(
  `<div style="color:red">我的名字叫{{name}},我的年龄是{{age}}岁。</div>`
);

// 执行第二个渲染函数生成新的虚拟DOM
let vnode2 = render2.call(vm2);

// 将第二个虚拟DOM也渲染到页面
// 此时页面上会有两个div元素
document.body.appendChild(createEl(vnode2));

// ============== Virtual DOM Patch 算法演示 ==============
//
// patch函数是Vue虚拟DOM的核心，负责：
// 1. 比较新旧虚拟节点的差异
// 2. 最小化DOM操作，只更新有变化的部分
// 3. 保持DOM结构的稳定性
//
// patch算法的优势：
// - 性能优化：避免不必要的DOM操作
// - 差异检测：精确识别需要更新的部分
// - 批量更新：将多个变化合并处理
//
// 这里演示的是将vnode1更新为vnode2的过程
patch(vnode1, vnode2);

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
//
// 6. 虚拟DOM的工作流程：
//    模板字符串 -> 编译 -> 渲染函数 -> 虚拟DOM -> 真实DOM
//    数据变化 -> 重新渲染 -> 新虚拟DOM -> patch对比 -> 更新真实DOM
//
// 7. 响应式系统的集成：
//    - 数据劫持：通过Object.defineProperty监听数据变化
//    - 依赖收集：在渲染过程中收集数据依赖
//    - 变化通知：数据变化时通知相关的watcher
//    - 批量更新：使用nextTick机制批量处理DOM更新
