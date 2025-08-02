import { newArrayProtoMethods } from "./array";
import Dep from "./dep";

/**
 * 响应式数据观察器的入口函数
 * 这是Vue2响应式系统的核心入口，负责将普通JavaScript对象转换为响应式对象
 *
 * 响应式原理：
 * 使用Object.defineProperty劫持对象属性的get和set方法
 * 在get中收集依赖（依赖收集）
 * 在set中通知更新（派发更新）
 *
 * @param {any} data - 要观察的数据，可以是对象、数组或基本类型
 * @returns {Observer|any} - 返回Observer实例或原始数据
 */
export function observer(data) {
  // 基本类型数据不需要观察，直接返回
  if (!data || typeof data !== "object") {
    return data;
  }

  // 如果数据已经被观察过，直接返回现有的Observer实例
  if (data.__ob__) {
    return data.__ob__;
  }

  // 创建新的Observer实例来观察数据
  return new Observer(data);
}

// ============== Vue2响应式系统的限制和解决方案 ==============
// Vue2 使用 Object.defineProperty 来实现数据劫持，存在以下限制：
// 1. 只能劫持对象的属性，无法劫持整个对象
// 2. 只能劫持已经存在的属性，无法检测新增属性
//    解决方案：Vue.set() 或 vm.$set()
// 3. 每次只能劫持一个属性，需要遍历所有属性
//    性能影响：深层对象需要递归遍历
// 4. 默认只能劫持第一层，深层对象需要递归处理
//    解决方案：递归调用observer()
// 5. 数组索引变化无法检测
//    解决方案：重写数组的变更方法

/**
 * Observer类 - 响应式观察器
 *
 * 职责：
 * 1. 为对象添加__ob__标识，标记为已观察的对象
 * 2. 区分处理对象和数组的响应式转换
 * 3. 为数组创建dep实例，用于$set等API的依赖收集
 * 4. 递归处理嵌套的对象和数组
 */
class Observer {
  /**
   * Observer构造函数
   *
   * @param {Object|Array} data - 要观察的数据对象或数组
   */
  constructor(data) {
    // 为数据对象添加__ob__属性，指向当前Observer实例
    // 作用：1. 标记对象已被观察 2. 提供访问Observer实例的方式
    Object.defineProperty(data, "__ob__", {
      enumerable: false, // 不可枚举，避免在for...in循环中被遍历
      value: this, // 指向当前Observer实例
    });

    // 为Observer实例创建一个dep，用于数组或对象整体的依赖收集
    // 主要用于Vue.set/Vue.delete等API的响应式通知
    this.dep = new Dep();

    // 根据数据类型采用不同的观察策略
    if (Array.isArray(data)) {
      // 数组处理：重写原型方法 + 观察数组元素
      data.__proto__ = newArrayProtoMethods; // 替换数组的原型方法，劫持变更操作
      this.observerArray(data); // 递归观察数组中的每个元素
    } else {
      // 对象处理：遍历属性进行响应式转换
      this.walk(data);
    }
  }

  /**
   * 遍历对象的所有属性，进行响应式转换
   * 只处理对象自身的可枚举属性，不处理继承的属性
   *
   * @param {Object} data - 要处理的对象
   */
  walk(data) {
    Object.keys(data).forEach((key) => {
      // 为每个属性定义响应式的getter和setter
      this.defineReactive(data, key, data[key]);
    });
  }

  /**
   * 定义响应式属性 - Vue2响应式系统的核心方法
   * 使用Object.defineProperty为对象属性添加getter和setter
   * 在getter中收集依赖，在setter中触发更新
   *
   * @param {Object} data - 属性所属的对象
   * @param {string} key - 属性名
   * @param {any} val - 属性的初始值
   */
  defineReactive(data, key, val) {
    // 递归处理嵌套对象/数组，确保深层数据也是响应式的
    // childOb是子对象的Observer实例，用于处理嵌套对象的依赖收集
    let childOb = observer(val);

    // 为当前属性创建专属的dep实例，用于收集和通知依赖
    let dep = new Dep();

    // 使用Object.defineProperty劫持属性的访问和修改
    Object.defineProperty(data, key, {
      enumerable: true, // 可枚举，可以被for...in遍历
      configurable: true, // 可配置，允许删除和重新定义

      /**
       * getter函数 - 依赖收集阶段
       * 当属性被访问时触发，主要用于收集依赖
       */
      get() {
        // 如果存在当前活动的watcher（Dep.target），则收集依赖
        if (Dep.target) {
          dep.depend(Dep.target); // 当前属性收集watcher依赖

          // 如果属性值是对象/数组，也需要收集依赖
          // 这样Vue.set/Vue.delete等操作才能正确触发更新
          if (childOb && childOb.dep) {
            childOb.dep.depend(Dep.target);
          }
        }
        return val; // 返回属性值
      },

      /**
       * setter函数 - 派发更新阶段
       * 当属性被修改时触发，用于触发依赖更新
       */
      set(newVal) {
        // 值没有变化时不触发更新，优化性能
        if (newVal === val) return;

        // 新值也需要进行响应式处理
        // 例如：this.obj = {name: 'new'} 新对象也应该是响应式的
        observer(newVal);

        val = newVal; // 更新内部值

        // 通知所有依赖此属性的watcher进行更新
        dep.notify();
      },
    });
  }

  /**
   * 观察数组中的每个元素
   * 确保数组元素（如果是对象）也是响应式的
   *
   * @param {Array} data - 要观察的数组
   */
  observerArray(data) {
    data.forEach((item) => {
      // 递归观察数组的每个元素
      // 如果元素是对象，会被转换为响应式对象
      // 如果元素是基本类型，observer函数会直接返回
      observer(item);
    });
  }
}
