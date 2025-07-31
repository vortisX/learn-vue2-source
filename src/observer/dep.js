class Dep {
  constructor() {
    this.subs = []; // 订阅者列表
  }
  /**
   * 依赖收集
   * 当属性被访问时，dep 会将当前的 watcher 添加到依赖列表中
   */
  depend() {
    if (Dep.target) {
      this.addSub(Dep.target);
    }
  }
  // 添加订阅者
  addSub(sub) {
    this.subs.push(sub);
  }
  // 通知所有订阅者
  notify() {
    this.subs.forEach((sub) => sub.update());
  }
}
export default Dep;
Dep.target = null; // 静态属性 用于存储当前的 watcher
export function pushTarget(watcher) {
  Dep.target = watcher; // 设置当前的 watcher
}
export function popTarget() {
  Dep.target = null; // 清除当前的 watcher
}
// 在 Vue 中，每个响应式属性都有一个对应的 dep 对象 用于收集依赖
// 当属性被访问时，dep 会将当前的 watcher 添加到依赖列表中
