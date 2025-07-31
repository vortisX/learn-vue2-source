import { patch } from "./vnode/patch";
import watcher from "./observer/watcher";
export function mountComponent(vm, el) {
  // 调用beforeMount钩子
  callHook(vm, "beforeMount");
  let updateComponent = () => {
    vm._update(vm._render()); // 调用_render函数生成虚拟DOM并更新
  };
  // 创建一个watcher实例 用于更新组件
  new watcher(vm, updateComponent, () => {}, true);
  // 挂载到页面上
  callHook(vm, "mounted");
}
export function lifecycleMixin(Vue) {
  Vue.prototype._update = function (vnode) {
    let vm = this;
    vm.$el = patch(vm.$el, vnode);
  };
}
// vue的渲染流程
// 1. 创建Vue实例
// 2. 调用render函数生成虚拟DOM
// 3. 调用patch函数将虚拟DOM渲染成真实DOM
// 4. 挂载到页面上
// 5. 如果数据变化，重新调用_render和_patch函数更新DOM
// 6. 通过diff算法优化更新过程
// 7. 最终实现数据驱动视图的更新
export function callHook(vm, hook) {
  const handlers = vm.$options[hook];
  if (!handlers) return;
  if (Array.isArray(handlers)) {
    handlers.forEach((handler) => {
      handler.call(vm);
    });
  }
}
