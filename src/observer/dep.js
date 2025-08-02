let uid = 0; // 用于生成唯一的 dep ID，确保每个Dep实例都有唯一标识

/**
 * Dep类 - Vue2响应式系统的依赖管理器
 * 
 * Dep（Dependency）是Vue响应式系统的核心组件，负责：
 * 1. 收集依赖（哪些Watcher依赖当前数据）
 * 2. 通知更新（数据变化时通知所有依赖的Watcher）
 * 3. 管理订阅关系（维护Watcher列表）
 * 
 * 每个响应式属性都有一个对应的Dep实例
 * 建立了数据和视图之间的桥梁
 */
class Dep {
  /**
   * 静态属性 - 当前正在收集依赖的Watcher
   * 全局唯一，同一时间只能有一个Watcher在收集依赖
   * 在Watcher执行时被设置，执行完成后被清空
   */
  static target = null;
  
  /**
   * Dep实例的唯一标识符
   * 用于在Watcher中去重，避免重复收集同一个依赖
   */
  id = 0;
  
  /**
   * Dep构造函数
   * 创建一个新的依赖管理器实例
   */
  constructor() {
    this.id = uid++; // 生成唯一的 dep ID，用于标识和去重
    this.subs = []; // 订阅者列表，存储所有依赖当前数据的Watcher实例
  }

  /**
   * 依赖收集方法
   * 当响应式属性被访问时调用此方法收集依赖
   * 
   * 工作流程：
   * 1. 检查是否有当前活动的Watcher（Dep.target）
   * 2. 如果有，则建立双向依赖关系
   * 3. Watcher记录它依赖哪些Dep
   * 4. Dep记录哪些Watcher依赖它
   * 
   * 双向依赖的好处：
   * - 数据变化时可以快速找到需要更新的Watcher
   * - Watcher销毁时可以从相关Dep中移除自己
   */
  depend() {
    if (Dep.target) {
      // 调用当前Watcher的addDep方法，建立双向依赖关系
      // 这里使用Watcher来管理依赖关系，而不是直接在Dep中处理
      // 因为Watcher需要进行去重和其他逻辑处理
      Dep.target.addDep(this);
    }
  }

  /**
   * 添加订阅者
   * 将Watcher添加到当前Dep的订阅者列表中
   * 通常由Watcher的addDep方法调用
   * 
   * @param {Watcher} sub - 要添加的Watcher实例
   */
  addSub(sub) {
    this.subs.push(sub); // 将Watcher添加到订阅者数组中
  }

  /**
   * 通知所有订阅者进行更新
   * 当响应式数据发生变化时调用此方法
   * 
   * 工作流程：
   * 1. 遍历所有订阅的Watcher
   * 2. 调用每个Watcher的update方法
   * 3. Watcher会将自己加入更新队列，批量执行更新
   * 
   * 这里只是触发更新的开始，真正的更新逻辑在Watcher中
   */
  notify() {
    // 通知所有订阅者执行更新
    this.subs.forEach((sub) => sub.update());
  }
}

export default Dep;

/**
 * 设置当前活动的Watcher
 * 在Watcher开始收集依赖时调用
 * 
 * 为什么需要全局的Dep.target：
 * 1. 在getter中需要知道是哪个Watcher在访问数据
 * 2. 同一时间只能有一个Watcher在收集依赖
 * 3. 避免在非依赖收集场景下误收集依赖
 * 
 * @param {Watcher} watcher - 要设置为当前活动的Watcher实例
 */
export function pushTarget(watcher) {
  Dep.target = watcher; // 设置当前的 watcher为全局活动Watcher
}

/**
 * 清除当前活动的Watcher
 * 在Watcher完成依赖收集后调用
 * 
 * 清除的重要性：
 * 1. 避免在非收集阶段误触发依赖收集
 * 2. 防止内存泄漏
 * 3. 确保依赖收集的准确性
 */
export function popTarget() {
  Dep.target = null; // 清除当前的 watcher，表示依赖收集结束
}

// ============== Vue响应式系统依赖收集原理 ==============
// 
// 1. 依赖收集时机：
//    - 组件渲染时
//    - 计算属性计算时  
//    - 用户自定义watcher执行时
//
// 2. 收集过程：
//    pushTarget(watcher) -> 访问响应式数据 -> getter触发 -> dep.depend() -> watcher.addDep(dep)
//
// 3. 更新过程：
//    数据变化 -> setter触发 -> dep.notify() -> watcher.update() -> 重新渲染
//
// 4. 依赖关系：
//    - 一个响应式属性对应一个Dep
//    - 一个Dep可以有多个Watcher订阅
//    - 一个Watcher可以依赖多个Dep
//    - 这形成了多对多的依赖关系网
