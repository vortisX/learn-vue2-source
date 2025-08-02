import { observer } from "../observer/index";
import { callHook } from "../lifecycle";

/**
 * 初始化Vue实例的data选项
 * 这是Vue响应式系统初始化的关键步骤，负责：
 * 1. 处理data选项（函数或对象）
 * 2. 将data属性代理到Vue实例上
 * 3. 将data转换为响应式对象
 *
 * @param {Object} vm - Vue实例对象
 */
export function initData(vm) {
  let data = vm.$options.data; // 获取用户传入的data选项

  // data选项的标准化处理
  // data既可以是对象，也可以是返回对象的函数
  // 组件中的data必须是函数，以确保每个组件实例都有独立的数据副本
  data = vm._data = typeof data === "function" ? data.call(vm) : data;

  // 数据代理：将data上的所有属性代理到vm实例上
  // 这样用户就可以通过 this.property 访问 this._data.property
  // 例如：this.name 实际访问的是 this._data.name
  Object.keys(data).forEach((key) => {
    proxy(vm, "_data", key);
  });

  // 响应式处理：将data对象转换为响应式对象
  // 这是Vue响应式系统的核心，会递归处理所有嵌套属性
  observer(data);
}

/**
 * 属性代理函数
 * 将目标对象的属性代理到源对象上，实现便捷的属性访问
 *
 * 代理的作用：
 * 1. 用户可以直接通过 vm.key 访问 vm._data.key
 * 2. 隐藏内部实现细节，提供更友好的API
 * 3. 在属性访问时可以添加额外的逻辑（如生命周期钩子）
 *
 * @param {Object} target - 目标对象（Vue实例）
 * @param {String} sourceKey - 源属性名（如'_data'）
 * @param {String} key - 要代理的属性名
 */
function proxy(target, sourceKey, key) {
  Object.defineProperty(target, key, {
    enumerable: true, // 可枚举，允许在for...in中遍历
    configurable: true, // 可配置，允许删除和重新定义

    /**
     * getter函数 - 属性读取代理
     * 当访问 vm.key 时，实际返回 vm._data.key 的值
     */
    get() {
      return target[sourceKey][key]; // 返回源对象上对应属性的值
    },

    /**
     * setter函数 - 属性设置代理
     * 当设置 vm.key 时，实际设置 vm._data.key 的值
     * 同时触发相应的生命周期钩子
     */
    set(newVal) {
      // 在数据更新前触发beforeUpdate钩子
      // 注意：这里直接调用callHook，实际Vue的实现更复杂
      callHook(vm, "beforeUpdate");

      // 设置源对象上对应属性的值
      target[sourceKey][key] = newVal;

      // 在数据更新后触发updated钩子
      callHook(vm, "updated");
    },
  });
}

// ============== Data初始化流程详解 ==============
//
// 1. Data选项的两种形式：
//    - 对象形式：适用于根实例，data: { name: 'Vue' }
//    - 函数形式：适用于组件，data() { return { name: 'Vue' } }
//
// 2. 数据代理的好处：
//    - 简化访问路径：this.name 而不是 this._data.name
//    - 统一访问接口：props、data、computed都可以直接访问
//    - 便于添加拦截逻辑：如验证、日志等
//
// 3. 响应式转换：
//    - 使用Object.defineProperty劫持属性访问
//    - 在getter中收集依赖
//    - 在setter中触发更新
//    - 递归处理嵌套对象和数组
//
// 4. 注意事项：
//    - 组件的data必须是函数，避免实例间共享数据
//    - 不要在data中返回Vue实例本身，避免循环引用
//    - data中的属性会被递归观察，深层对象变化也会触发更新
