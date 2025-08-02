// ============== 数组响应式处理的背景 ==============
// Object.defineProperty只能劫持对象属性，无法直接劫持数组的索引操作
// 因此需要单独处理数组的响应式逻辑
// 
// 数组响应式需要处理的场景：
// 1. 数组变更方法：push、pop、shift、unshift、splice、sort、reverse
// 2. 数组索引赋值：arr[0] = newValue（Vue2中无法检测，需要使用Vue.set）
// 3. 数组长度变化：arr.length = 0（Vue2中无法检测）
// 4. 新增元素的响应式处理：确保新添加的元素也是响应式的

let inserted; // 临时变量，存储通过数组方法新增的元素

// 1. 获取数组的原型方法 - 保存原始的Array.prototype
let oldArrayProtoMethods = Array.prototype;

// 2. 创建新的数组原型对象 - 继承自原始数组原型
// Object.create可以创建一个新的对象，并将其原型指向旧的数组原型
// 这样既保留了原有的数组方法，又可以重写部分方法
export let newArrayProtoMethods = Object.create(oldArrayProtoMethods);

// 3. 定义需要重写的数组方法 - 这7个方法会改变原数组
// 这些方法会修改原数组，因此需要在修改后通知依赖更新
let methods = ["push", "pop", "shift", "unshift", "splice", "sort", "reverse"];

// 4. 重写数组的变更方法
methods.forEach((method) => {
  /**
   * 重写的数组方法
   * 在保持原有功能的基础上，增加响应式处理：
   * 1. 执行原始的数组操作
   * 2. 处理新增元素的响应式转换
   * 3. 通知依赖更新
   * 
   * @param {...any} args - 传递给原始方法的参数
   * @returns {any} - 原始方法的返回值
   */
  newArrayProtoMethods[method] = function (...args) {
    // 调用原始的数组方法，保持原有功能
    // apply确保this指向正确（当前数组实例）
    const result = oldArrayProtoMethods[method].apply(this, args);
    
    // 处理新增元素：某些方法会向数组中添加新元素，这些元素也需要变成响应式
    switch (method) {
      case "push":    // arr.push(item1, item2, ...)
      case "unshift": // arr.unshift(item1, item2, ...)
        // push和unshift的所有参数都是新增元素
        inserted = args;
        break;
        
      case "splice":  // arr.splice(start, deleteCount, item1, item2, ...)
        // splice方法从第3个参数开始是新增元素
        // args.slice(2) 获取从索引2开始的所有参数
        inserted = args.slice(2);
        break;
        
      // pop、shift、sort、reverse 不会添加新元素，不需要特殊处理
      default:
        inserted = null;
        break;
    }
    
    // 获取当前数组的Observer实例
    // __ob__ 属性在Observer构造函数中被添加，指向Observer实例
    let ob = this.__ob__;
    
    // 如果有新增元素，需要将它们也转换为响应式
    if (inserted && ob) {
      // 调用Observer的observerArray方法，递归处理新增元素
      // 确保新增的对象/数组也是响应式的
      ob.observerArray(inserted);
    }

    console.log(ob, 'ob'); // 调试日志，显示Observer实例
    
    // 通知依赖更新
    // 数组的变更需要通知所有依赖这个数组的Watcher进行更新
    // ob.dep 是在Observer构造函数中创建的Dep实例
    ob.dep.notify();
    
    // 返回原始方法的执行结果，保持API兼容性
    return result;
  };
});

// ============== 数组响应式处理的完整流程 ==============
//
// 1. 数组初始化：
//    new Observer(array) -> array.__proto__ = newArrayProtoMethods
//
// 2. 数组方法调用：
//    arr.push(item) -> 重写的push方法 -> 原始push + 响应式处理 + 通知更新
//
// 3. 新增元素处理：
//    识别新增元素 -> observerArray(inserted) -> 递归转换为响应式
//
// 4. 依赖通知：
//    ob.dep.notify() -> 所有依赖数组的Watcher收到更新通知
//
// 5. 视图更新：
//    Watcher执行 -> 重新渲染 -> 显示最新的数组内容
//
// 注意：Vue2无法检测数组索引赋值（arr[0] = value）和长度变化（arr.length = 0）
// 这些操作需要使用Vue.set()或数组变更方法来触发响应式更新
