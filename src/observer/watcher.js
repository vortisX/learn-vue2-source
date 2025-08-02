import { pushTarget, popTarget } from "./dep";

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
    this.options = options; // 配置选项
    this.id = id++; // watcher 的唯一标识符，用于去重和调试
    this.deps = []; // 依赖的Dep对象列表，记录这个watcher订阅了哪些响应式属性
    this.depsId = new Set(); // 用于去重的 Set 集合，避免重复收集同一个dep

    // 如果传入的是函数，直接作为getter使用
    if (typeof updateComponent === "function") {
      this.getter = updateComponent; // 用于更新视图的函数
    }
    
    // 立即执行一次，进行初始化和依赖收集
    this.get();
  }

  /**
   * 执行watcher的更新操作
   * 当响应式数据发生变化时，dep会调用watcher的update方法，
   * update方法将watcher添加到更新队列中，然后在下一个tick中执行run方法
   */
  run() {
    this.get(); // 重新执行getter，触发重新渲染或重新计算
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
    this.getter(); // 执行更新组件的方法，期间会触发响应式属性的getter，从而收集依赖
    popTarget(); // 执行完毕后清除 Dep.target，避免影响其他操作
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

let queue = []; // 更新队列，存储待更新的watcher
let has = {}; // 用于去重的对象，记录哪些watcher已经在队列中
let flushing = false; // 标记是否正在刷新队列，防止重复执行

/**
 * 将 watcher 添加到更新队列中
 * 
 * 更新队列的作用：
 * 1. 去重：同一个watcher在一次更新周期中只执行一次
 * 2. 批量处理：收集所有需要更新的watcher，统一在下一个tick中执行
 * 3. 性能优化：避免频繁的DOM操作，提高渲染性能
 * 
 * @param {watcher} watcher - 要添加到队列的watcher实例
 */
function queueWatcher(watcher) {
  let id = watcher.id; // 获取 watcher 的唯一标识符
  
  // 去重处理：如果watcher不在队列中，才添加
  if (has[id] === null || has[id] === undefined) {
    has[id] = true; // 标记该watcher已在队列中
    queue.push(watcher); // 将 watcher 添加到更新队列
    
    // 防抖处理：如果当前没有正在刷新队列，则开始新的刷新周期
    if (!flushing) {
      // 使用setTimeout实现异步更新，将更新推迟到下一个事件循环
      // 这样可以收集一个事件循环中的所有数据变化，然后批量更新
      setTimeout(() => {
        // 批量执行所有watcher的更新
        queue.forEach((item) => item.run());
        
        // 清理队列和标记，为下一次更新做准备
        queue = [];
        has = {};
        flushing = false;
      }, 0);
    }
    flushing = true; // 标记正在刷新，防止重复开启刷新周期
  }
}
