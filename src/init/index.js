import { compileToFunction } from "../compile/index";
import { initState } from "./initState";
import { callHook, mountComponent } from "../lifecycle";
import { mergeOptions } from "../utils/index";
export function initMixin(Vue) {
  // 在Vue构造函数上添加_init方法
  Vue.prototype._init = function (option) {
    let vm = this;
    // 将配置数据保存到实例上
    vm.$options = mergeOptions(Vue.options || {}, option || {});
    // 调用beforeCreate钩子
    callHook(vm, "beforeCreate");
    // 初始化状态
    initState(vm);
    // 调用created钩子
    callHook(vm, "created");
    // 渲染模板 el
    if (vm.$options.el) {
      vm.$mount(vm.$options.el);
    }
  };

  Vue.prototype.$mount = function (el) {
    let vm = this;
    vm.$el = document.querySelector(el);
    if (!vm.$options.render) {
      // 如果用户没有传入render函数，则使用模板编译
      const template = vm.$options.template;
      if (!template && el) {
        // 如果没有模板且有el，则获取el的outerHTML作为模板
        vm.$options.template = document.querySelector(el).outerHTML;

        let render = compileToFunction(vm.$options.template);

        vm.$options.render = render;
      }
    }
    // 检查render函数是否存在
    if (!vm.$options.render) {
      throw new Error("无法生成render函数");
    }
    mountComponent(vm, el);
  };
}
