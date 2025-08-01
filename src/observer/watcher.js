import { pushTarget, popTarget } from "./dep";

let id = 100; // 用于生成唯一的 watcher ID
class watcher {
  constructor(vm, updateComponent, cb, options) {
    this.vm = vm; // Vue 实例
    this.exprOrfn = updateComponent; // 更新组件的方法
    this.cb = cb; // 回调函数
    this.options = options;
    this.id = id++; // watcher 的唯一标识符
    this.deps = []; // 依赖列表
    this.depsId = new Set(); // 用于去重的 Set 集合

    if (typeof updateComponent === "function") {
      this.getter = updateComponent; // 如果是函数则直接使用 用于更新视图
    }
    this.get();
  }
  get() {
    pushTarget(this); // 将当前 watcher 推入 dep.target
    this.getter(); // 执行更新组件的方法
    popTarget(); // 执行完毕后清除 dep.target
  }
  update() {
    // 这里可以添加一些逻辑，比如判断是否需要更新
    this.get(); // 重新获取数据并更新视图
    if (this.cb) {
      this.cb(); // 调用回调函数
    }
  }
  addDep(dep) {
    // 1.去重
    let id = dep.id; // 获取 dep 的唯一标识符
    if (!this.depsId.has(id)) {
      this.depsId.add(id); // 将 id 添加到 Set 集合中
      this.deps.push(dep); // 将 dep 添加到 deps 数组中
      dep.addSub(this); // 将当前 watcher 添加到 dep 的订阅者列表中
    }
  }
}
export default watcher;

// 收集依赖 dep
// 在 Vue 中，每个响应式属性都有一个对应的 dep 对象 用于收集依赖
// 当属性被访问时，dep 会将当前的 watcher 添加到依赖列表中

// watcher 是一个观察者对象 用于监听数据变化 在视图上用了几个 就有几个watcher
// 当数据变化时，dep 会通知所有的 watcher 执行更新操作
// 当数据变化时，watcher 会被通知并执行相应的更新逻辑
