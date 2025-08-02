import { patch } from "./vnode/patch";
import watcher from "./observer/watcher";

/**
 * 组件挂载函数 - Vue生命周期的核心方法
 *
 * 这个函数是Vue组件从创建到渲染到页面的关键步骤，包含：
 * 1. 触发beforeMount生命周期钩子
 * 2. 创建渲染Watcher，建立数据和视图的响应式连接
 * 3. 执行初始渲染
 * 4. 触发mounted生命周期钩子
 *
 * @param {Object} vm - Vue实例
 * @param {string|Element} el - 挂载的DOM元素选择器或元素本身
 */
export function mountComponent(vm, el) {
  // 调用beforeMount钩子 - 在挂载开始之前被调用
  // 此时模板已经编译完成，但还没有渲染到页面上
  callHook(vm, "beforeMount");

  /**
   * 定义组件更新函数
   * 这个函数是Vue响应式系统的核心，它：
   * 1. 调用_render()生成虚拟DOM树
   * 2. 调用_update()将虚拟DOM转换为真实DOM并更新页面
   *
   * 这个函数会被包装在Watcher中，当数据变化时自动重新执行
   */
  let updateComponent = () => {
    // vm._render()：执行render函数，生成虚拟DOM
    // vm._update()：执行patch算法，更新真实DOM
    vm._update(vm._render());
  };

  // 创建渲染Watcher - Vue响应式系统的关键
  // 这个Watcher会：
  // 1. 立即执行一次updateComponent（初始渲染）
  // 2. 在执行过程中收集依赖（哪些数据被使用了）
  // 3. 当依赖的数据变化时，自动重新执行updateComponent（重新渲染）
  new watcher(
    vm, // Vue实例
    updateComponent, // 更新函数
    () => {}, // 回调函数（暂时为空）
    true // 选项参数
  );

  // 调用mounted钩子 - 挂载完成后被调用
  // 此时组件已经渲染到页面上，可以访问DOM元素
  callHook(vm, "mounted");
}

/**
 * 生命周期方法混入
 * 在Vue原型上添加生命周期相关的方法
 *
 * @param {Function} Vue - Vue构造函数
 */
export function lifecycleMixin(Vue) {
  /**
   * _update方法 - 负责将虚拟DOM更新为真实DOM
   *
   * 这是Vue渲染流程的最后一步：
   * 1. 接收_render方法生成的虚拟DOM
   * 2. 使用patch算法比较新旧虚拟DOM（这里是简化版本）
   * 3. 更新真实DOM
   * 4. 将新的DOM元素保存到vm.$el
   *
   * @param {Object} vnode - 虚拟DOM节点树
   */
  Vue.prototype._update = function (vnode) {
    let vm = this;
    // 使用patch函数将虚拟DOM转换为真实DOM
    // vm.$el：当前的真实DOM元素
    // vnode：新的虚拟DOM树
    // 返回值是新创建的真实DOM元素
    vm.$el = patch(vm.$el, vnode);
  };
}

// ============== Vue渲染流程详解 ==============
//
// Vue的完整渲染流程：
// 1. 创建Vue实例 - new Vue(options)
// 2. 初始化数据 - initData(), 使数据变成响应式
// 3. 编译模板 - compileToFunction(), 将模板转换为render函数
// 4. 创建渲染Watcher - new Watcher(vm, updateComponent)
// 5. 执行render函数 - vm._render(), 生成虚拟DOM
// 6. 执行patch函数 - vm._update(), 将虚拟DOM转换为真实DOM
// 7. 挂载到页面 - 将DOM元素插入到页面中
//
// 数据变化时的重新渲染流程：
// 1. 数据变化 - this.data = newValue
// 2. 触发setter - 响应式系统检测到变化
// 3. 通知Watcher - dep.notify()
// 4. 重新执行updateComponent - watcher.run()
// 5. 重新生成虚拟DOM - vm._render()
// 6. 对比并更新DOM - vm._update() + diff算法
// 7. 页面更新完成
//
// diff算法的作用：
// 通过比较新旧虚拟DOM树，找出最小的变化集合，只更新需要变化的部分
// 这大大提高了渲染性能，避免了不必要的DOM操作

/**
 * 调用Vue生命周期钩子函数
 *
 * Vue的生命周期钩子允许开发者在组件的不同阶段执行自定义逻辑：
 * - beforeCreate: 实例初始化之后，数据观测和事件配置之前
 * - created: 实例创建完成后，数据观测、属性和方法的运算、事件回调已完成
 * - beforeMount: 挂载开始之前，render函数首次被调用
 * - mounted: 挂载完成后，el被新创建的vm.$el替换
 * - beforeUpdate: 数据更新时，虚拟DOM打补丁之前
 * - updated: 数据更新后，虚拟DOM重新渲染和打补丁之后
 * - beforeDestroy: 实例销毁之前
 * - destroyed: 实例销毁后
 *
 * @param {Object} vm - Vue实例
 * @param {string} hook - 钩子函数名称
 */
export function callHook(vm, hook) {
  // 从Vue实例的选项中获取指定的钩子函数
  const handlers = vm.$options[hook];

  // 如果没有定义钩子函数，直接返回
  if (!handlers) return;

  // 钩子函数可能是数组（通过mixin混入多个钩子）
  if (Array.isArray(handlers)) {
    // 遍历执行所有钩子函数
    handlers.forEach((handler) => {
      // 使用call确保钩子函数内部的this指向Vue实例
      handler.call(vm);
    });
  }
}
