import { patch } from "./vnode/patch";

export function mountComponent(vm, el) {
  // 调用beforeMount钩子
  callHook(vm, "beforeMount");
  vm._update(vm._render());
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
