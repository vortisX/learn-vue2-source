import { compileToFunction } from "../compile/index";
import { initState } from "./initState";
import { callHook, mountComponent } from "../lifecycle";
import { mergeOptions } from "../utils/index";

/**
 * 初始化方法混入
 * 在Vue构造函数的原型上添加初始化相关的方法
 * 这是Vue实例化过程的入口点
 * 
 * @param {Function} Vue - Vue构造函数
 */
export function initMixin(Vue) {
  /**
   * Vue实例初始化方法
   * 这是Vue实例创建时第一个被调用的方法，负责整个初始化流程
   * 
   * Vue初始化流程：
   * 1. 合并配置选项
   * 2. 触发beforeCreate钩子
   * 3. 初始化状态（props、data、computed等）
   * 4. 触发created钩子
   * 5. 挂载组件（如果提供了el选项）
   * 
   * @param {Object} option - 用户传入的配置选项
   */
  Vue.prototype._init = function (option) {
    let vm = this; // 保存Vue实例引用
    
    // 选项合并：将Vue的全局选项和用户选项合并
    // Vue.options包含全局注册的组件、指令、过滤器等
    // option包含用户传入的data、methods、computed等
    vm.$options = mergeOptions(Vue.options || {}, option || {});
    
    // 触发beforeCreate生命周期钩子
    // 此时实例已创建，但data、computed、methods等还未初始化
    // 无法访问组件的数据和方法
    callHook(vm, "beforeCreate");
    
    // 初始化状态：props、methods、data、computed、watch
    // 这是Vue响应式系统初始化的核心步骤
    initState(vm);
    
    // 触发created生命周期钩子
    // 此时实例的数据观测、属性和方法的运算、事件回调已完成
    // 可以访问组件的数据和方法，但DOM还未生成
    callHook(vm, "created");
    
    // 如果提供了el选项，自动挂载组件
    // 用户也可以手动调用$mount方法进行挂载
    if (vm.$options.el) {
      vm.$mount(vm.$options.el);
    }
  };

  /**
   * Vue实例挂载方法
   * 负责将Vue实例挂载到指定的DOM元素上
   * 
   * 挂载流程：
   * 1. 获取挂载目标元素
   * 2. 编译模板为render函数（如果没有render函数）
   * 3. 执行挂载组件逻辑
   * 
   * @param {string|Element} el - 挂载目标，可以是选择器字符串或DOM元素
   */
  Vue.prototype.$mount = function (el) {
    let vm = this;
    
    // 获取挂载的目标DOM元素
    vm.$el = document.querySelector(el);
    
    // 如果用户没有提供render函数，需要编译模板
    if (!vm.$options.render) {
      const template = vm.$options.template;
      
      // 获取模板内容
      if (!template && el) {
        // 如果没有提供template选项，使用挂载元素的outerHTML作为模板
        // outerHTML包含元素本身和所有子元素
        vm.$options.template = document.querySelector(el).outerHTML;
        
        // 编译模板为render函数
        // 这个过程将HTML模板转换为可执行的JavaScript函数
        let render = compileToFunction(vm.$options.template);
        
        // 将编译生成的render函数保存到选项中
        vm.$options.render = render;
      }
    }
    
    // 确保有render函数才能进行后续的挂载
    if (!vm.$options.render) {
      throw new Error("无法生成render函数");
    }
    
    // 执行组件挂载逻辑
    // 这会创建渲染Watcher，执行初始渲染，建立响应式连接
    mountComponent(vm, el);
  };
}

// ============== Vue初始化流程详解 ==============
//
// 1. new Vue(options) 调用过程：
//    - 执行Vue构造函数
//    - 调用this._init(options)开始初始化
//    - 按照生命周期顺序执行各个初始化步骤
//
// 2. 选项合并的重要性：
//    - 处理全局组件、指令、过滤器
//    - 合并mixin的选项
//    - 规范化各种选项格式
//
// 3. 生命周期钩子的时机：
//    - beforeCreate: 实例初始化后，状态初始化前
//    - created: 状态初始化完成，DOM挂载前
//    - beforeMount: DOM挂载前
//    - mounted: DOM挂载完成
//
// 4. 编译过程：
//    - 解析HTML模板为AST
//    - 优化AST（标记静态节点）
//    - 生成render函数代码
//    - 创建可执行的render函数
//
// 5. 渲染过程：
//    - 创建渲染Watcher
//    - 执行render函数生成VNode
//    - 通过patch算法更新DOM
//    - 建立数据和视图的响应式连接
