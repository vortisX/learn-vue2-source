import { newArrayProtoMethods } from "./array";
import Dep from "./dep";

export function observer(data) {
  // 如果data是空的 将不进行观察
  if (!data || typeof data !== "object") {
    return data;
  }
  return new Observer(data);
}

// Vue2 使用 Object.defineProperty 来实现数据劫持，存在以下限制：
// 1. 只能劫持对象的属性，无法劫持整个对象
// 2. 只能劫持已经存在的属性，无法检测新增属性
// 3. 每次只能劫持一个属性，需要遍历所有属性
// 4. 默认只能劫持第一层，深层对象需要递归处理

class Observer {
  constructor(data) {
    Object.defineProperty(data, "__ob__", {
      enumerable: false, // 不可枚举
      value: this,
    });
    // 只有第二轮或者更深层次的属性上，val才可以能数组 第一次进入时只可能是一个对象
    if (Array.isArray(data)) {
      data.__proto__ = newArrayProtoMethods; // 替换数组的原型方法
      this.observerArray(data); // 劫持数组
    } else {
      this.walk(data); // 遍历对象的属性进行劫持
    }
  }
  // 遍历对象的属性进行劫持
  walk(data) {
    Object.keys(data).forEach((key) => {
      this.defineReactive(data, key, data[key]);
    });
  }
  // 定义响应式属性
  defineReactive(data, key, val) {
    // 这里可以添加劫持逻辑
    // object.defineProperty只能劫持一层 需要递归进行劫持
    // 在第二轮或者更深层次的属性上，val可能是一个对象或数组
    // 在第一层时 val 可能是一个基本类型
    observer(val); // 劫持子属性
    let dep = new Dep(); // 创建一个新的 dep 实例
    // 添加依赖收集
    Object.defineProperty(data, key, {
      get() {
        if (Dep.target) {
          dep.addSub(Dep.target); // 依赖收集
        }
        return val;
      },
      set(newVal) {
        if (newVal === val) return; // 如果新值和旧值相同则不进行更新
        observer(newVal); // 劫持新值
        val = newVal;
        dep.notify(); // 通知所有订阅者
      },
    });
  }
  // 劫持数组的每个元素
  observerArray(data) {
    data.forEach((item) => {
      // 劫持数组的每个元素
      observer(item);
    });
  }
}
