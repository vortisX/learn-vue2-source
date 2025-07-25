import { compileToFunction } from "./compile/index";
import { initState } from "./initState";

export function initMixin(Vue) {
  // 在Vue构造函数上添加_init方法
  Vue.prototype._init = function (option) {
    console.log("初始化方法被调用,入参:", option);
    // 将传入的配置数据保存到实例上
    // 这里可以添加更多的初始化逻辑
    let vm = this;
    console.log("Vue 实例:", vm);
    // 将配置数据保存到实例上
    vm.$options = option;
    // 初始化状态
    initState(vm);
    // 渲染模板 el
    if (vm.$options.el) {
      vm.$mount(vm.$options.el);
    }
  };
  Vue.prototype.$mount = function (el) {
    let vm = this;
    if (!vm.$options.render) {
      // 如果用户没有传入render函数，则使用模板编译
      const template = vm.$options.template;
      if (!template && el) {
        // 如果没有模板且有el，则获取el的outerHTML作为模板
        vm.$options.template = document.querySelector(el).outerHTML;
        let ast = compileToFunction(vm.$options.template);
      }
    }
  };
  // ast语法树
  /**
   * {
   *   type: 'Element',
   *   tag: 'div',
   *   style: {
   *     color: 'red',
   *     fontSize: '14px'
   *   },
   *   attrs: [
   *     { name: 'id', value: 'app' },
   *     { name: 'class', value: 'container' }
   *   ],
   *   children: [
   *     {
   *       type: 'Text',
   *       content: 'Hello, Vue!'
   *     }
   *   ]
   * }
   */
}
