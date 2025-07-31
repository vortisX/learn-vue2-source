import { observer } from "../observer/index";
import { callHook } from "../lifecycle";
export function initData(vm) {
  let data = vm.$options.data; // 获取用户传入的data
  // data 属性既可以是对象，也可以是函数 所以先要判断类型
  data = vm._data = typeof data === "function" ? data.call(vm) : data;
  // 将data上的所有属性代理到vm实例上
  Object.keys(data).forEach((key) => {
    proxy(vm, "_data", key);
  });
  observer(data); // 对data进行劫持
}
/**
 * proxy 方法用于将data上的属性代理到vm实例上
 * 这样在模板中可以直接使用 vm.key 来访问 data.key 的值 也就是平时的this.key
 * @param {Object} target
 * @param {String} sourceKey
 * @param {String} key
 */
function proxy(target, sourceKey, key) {
  Object.defineProperty(target, key, {
    enumerable: true,
    configurable: true,
    get() {
      return target[sourceKey][key]; // 返回data上的属性值
    },
    set(newVal) {
      callHook(vm, "beforeUpdate"); // 调用更新钩子
      target[sourceKey][key] = newVal; // 设置data上的属性值
      callHook(vm, "updated"); // 调用更新钩子
    },
  });
}
