import { pushTarget, popTarget } from "./dep";
import { nextTick } from "../utils/nextTick";
let id = 100; // 用于生成唯一的 watcher ID，避免重复和冲突

/**
 * Watcher类 - Vue响应式系统的核心观察者
 *
 * Watcher是Vue响应式系统中的观察者，负责：
 * 1. 监听数据变化
 * 2. 执行更新回调
 * 3. 收集依赖关系
 * 4. 触发重新渲染
 *
 * Vue中的Watcher类型：
 * 1. 渲染Watcher：监听模板中使用的数据，数据变化时重新渲染
 * 2. 计算属性Watcher：监听计算属性依赖的数据
 * 3. 用户Watcher：监听用户通过watch选项定义的数据
 */
class watcher {
  /**
   * Watcher构造函数
   *
   * @param {Object} vm - Vue实例对象
   * @param {Function} updateComponent - 更新组件的方法，通常是重新渲染的函数
   * @param {Function} cb - 回调函数，数据变化时执行
   * @param {Object} options - 配置选项
   */
  constructor(vm, updateComponent, cb, options) {
    this.vm = vm; // Vue 实例引用，用于访问组件数据和方法
    this.exprOrfn = updateComponent; // 保存更新函数或表达式
    this.cb = cb; // 数据变化时的回调函数
    this.user = options.user; // 是否是用户定义的watcher
    this.options = options; // 配置选项
    this.id = id++; // watcher 的唯一标识符，用于去重和调试
    this.deps = []; // 依赖的Dep对象列表，记录这个watcher订阅了哪些响应式属性
    this.depsId = new Set(); // 用于去重的 Set 集合，避免重复收集同一个dep
    // 如果传入的是函数，直接作为getter使用
    if (typeof updateComponent === "function") {
      this.getter = updateComponent; // 用于更新视图的函数
    } else if (typeof updateComponent === "string") {
      this.getter = () => {
        let path = updateComponent.split(".");
        let obj = this.vm;
        for (let i = 0; i < path.length; i++) {
          obj = obj[path[i]];
        }
        return obj;
      };
    }

    // 立即执行一次，进行初始化和依赖收集
    this.value = this.get(); // 触发getter，收集依赖 保存watcher的初始值
  }

  /**
   * 执行watcher的更新操作
   * 当响应式数据发生变化时，dep会调用watcher的update方法，
   * update方法将watcher添加到更新队列中，然后在下一个tick中执行run方法
   */
  run() {
    let value = this.get(); // 重新执行getter，触发重新渲染或重新计算
    let oldValue = this.value;
    if (this.user) {
      this.cb && this.cb.call(this.vm, oldValue, value); // 如果有回调函数则执行
      this.value = value;
    }
  }

  /**
   * 执行getter函数并收集依赖
   * 这是Watcher的核心方法，负责：
   * 1. 设置全局的Dep.target为当前watcher
   * 2. 执行getter函数（如渲染函数）
   * 3. 在执行过程中，访问的响应式属性会自动收集当前watcher作为依赖
   * 4. 清理Dep.target
   */
  get() {
    pushTarget(this); // 将当前 watcher 设置为全局的Dep.target
    const VALUE = this.getter(); // 执行更新组件的方法，期间会触发响应式属性的getter，从而收集依赖
    popTarget(); // 执行完毕后清除 Dep.target，避免影响其他操作
    return VALUE;
  }

  /**
   * 数据变化时的更新方法
   * 当响应式属性发生变化时，对应的dep会调用所有订阅watcher的update方法
   * 为了性能优化，不直接执行更新，而是将watcher加入更新队列，批量处理
   */
  update() {
    queueWatcher(this); // 将当前 watcher 添加到更新队列，实现批量更新和去重
  }

  /**
   * 添加依赖关系
   * 在响应式属性的getter中被调用，建立属性和watcher之间的双向依赖关系：
   * 1. watcher记录它依赖哪些属性（deps数组）
   * 2. 属性记录哪些watcher依赖它（dep的subs数组）
   *
   * @param {Dep} dep - 要添加的依赖对象
   */
  addDep(dep) {
    let id = dep.id; // 获取 dep 的唯一标识符

    // 去重处理：同一个属性在一次更新中可能被多次访问，但只需要收集一次依赖
    if (!this.depsId.has(id)) {
      this.depsId.add(id); // 将 id 添加到 Set 集合中，用于快速查重
      this.deps.push(dep); // 将 dep 添加到 deps 数组中，记录依赖关系
      dep.addSub(this); // 将当前 watcher 添加到 dep 的订阅者列表中
    }
  }
}

export default watcher;

// ============== 响应式系统工作原理说明 ==============
//
// 依赖收集过程：
// 1. 组件渲染时创建渲染watcher
// 2. 渲染过程中访问响应式数据
// 3. 响应式数据的getter被触发
// 4. getter中调用dep.depend()收集当前watcher
// 5. watcher通过addDep方法建立双向依赖关系
//
// 数据更新过程：
// 1. 响应式数据被修改
// 2. setter被触发，调用dep.notify()
// 3. dep通知所有订阅的watcher执行update()
// 4. watcher被加入更新队列，避免重复更新
// 5. 在下一个事件循环中批量执行所有watcher的run方法
// 6. 重新执行渲染函数，更新视图

// ============== 更新队列系统 ==============
//
// Vue的异步更新机制：
// Vue不会在每次数据变化时立即更新DOM，而是将所有变化收集起来，
// 在下一个事件循环中批量处理，这样可以：
// 1. 避免重复渲染：如果同一个组件的多个数据同时变化，只渲染一次
// 2. 提高性能：减少DOM操作次数
// 3. 保证更新顺序：父组件总是在子组件之前更新

let queue = []; // 更新队列，存储待更新的watcher
let has = {}; // 用于去重的对象，记录哪些watcher已经在队列中
let flushing = false; // 标记是否正在刷新队列，防止重复执行
let value; // 用于存储当前正在处理的watcher
/**
 * 在下一个事件循环中执行更新队列
 *
 * 执行流程：
 * 1. 遍历队列中的所有watcher
 * 2. 调用每个watcher的run方法，触发重新渲染或重新计算
 * 3. 如果watcher有回调函数，则执行回调
 * 4. 清理队列，为下一轮更新做准备
 */
let flushWatcher = () => {
  // 批量执行所有watcher的更新
  queue.forEach((item) => {
    item.run(); // 执行watcher的更新逻辑（重新渲染/重新计算）
    if (!item.user) {
      item.cb && item.cb.call(item.vm); // 如果有回调函数则执行
    }
  });

  // 清理队列和标记，为下一次更新做准备
  queue = []; // 清空更新队列
  has = {}; // 清空去重对象
  flushing = false; // 重置刷新标记，允许下一轮更新
};

/**
 * 将 watcher 添加到更新队列中
 *
 * 这是Vue异步更新的核心函数，实现了以下机制：
 * 1. 去重机制：同一个watcher在一个更新周期中只会被执行一次
 * 2. 批量处理：将多个watcher的更新合并到一个事件循环中执行
 * 3. 防抖机制：避免频繁触发队列刷新
 *
 * 更新时机：
 * - 同步代码执行完毕后
 * - DOM事件处理完毕后
 * - Promise回调执行前
 *
 * @param {watcher} watcher - 要添加到队列的watcher实例
 */
function queueWatcher(watcher) {
  let id = watcher.id; // 获取 watcher 的唯一标识符

  // 去重处理：如果watcher不在队列中，才添加
  // 这确保了同一个watcher在一个更新周期中只执行一次
  if (has[id] === null || has[id] === undefined) {
    has[id] = true; // 标记该watcher已在队列中，防止重复添加
    queue.push(watcher); // 将 watcher 添加到更新队列

    // 防抖处理：如果当前没有正在刷新队列，则开始新的刷新周期
    // 这确保了在一个事件循环中，无论有多少数据变化，都只会触发一次队列刷新
    if (!flushing) {
      nextTick(flushWatcher); // 在下一个事件循环中执行刷新队列
      flushing = true; // 标记正在刷新，防止重复开启刷新周期
    }
  }
}

// ============== 异步更新的优势 ==============
//
// 1. 性能优化：
//    - 减少DOM操作次数，避免频繁的重排和重绘
//    - 同一组件的多次数据变化只触发一次重新渲染
//
// 2. 用户体验：
//    - 确保所有同步操作完成后再更新视图
//    - 避免用户看到中间状态的闪烁
//
// 3. 开发友好：
//    - 自动处理更新时序，开发者无需手动控制
//    - 支持在数据变化后立即访问更新后的DOM（通过$nextTick）
//
// 例子：
// this.count = 1;
// this.count = 2;
// this.count = 3;
// // 以上三行代码只会触发一次重新渲染，最终显示count=3
