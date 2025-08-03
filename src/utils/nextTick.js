// ============== Vue的nextTick实现 ==============
//
// nextTick是Vue异步更新机制的核心工具，它确保回调函数在下一个DOM更新周期之后执行。
// 这样可以让开发者在数据变化后立即访问更新后的DOM。
//
let callbacks = []; // 存储待执行的回调函数队列
let panding = false; // 防止重复触发异步任务的标志位
let timerFunc; // 定时器函数，用于在下一个事件循环中执行回调

/**
 * 刷新回调队列，执行所有待处理的回调函数
 * 这个函数会在下一个事件循环中被调用
 */
function flush() {
  callbacks.forEach((fn) => fn()); // 依次执行队列中的所有回调函数
  callbacks = []; // 清空回调队列，为下一轮做准备
  panding = false; // 重置状态，允许下一次nextTick调用
}

// ============== 浏览器兼容性处理 ==============
//
// Vue按照优先级选择最佳的异步执行方式：
// 1. Promise.resolve() - 微任务，优先级最高，现代浏览器支持
// 2. MutationObserver - 微任务，用于监听DOM变化，IE11+支持
// 3. setImmediate - 宏任务，IE10+特有的异步方法
// 4. setTimeout - 宏任务，所有浏览器都支持，作为最后的兜底方案

if (Promise) {
  // 优先使用Promise.resolve()创建微任务
  // 微任务会在当前宏任务执行完毕后、下一个宏任务开始前执行
  // 这保证了DOM更新的及时性
  timerFunc = () => {
    Promise.resolve().then(flush); // 将flush函数放入微任务队列
  };
} else if (MutationObserver) {
  // 如果不支持Promise，使用MutationObserver
  // MutationObserver也是微任务，用于监听DOM节点的变化
  // 通过创建一个文本节点并修改其内容来触发回调
  let observe = new MutationObserver(flush); // 创建DOM变化观察器
  let textNode = document.createTextNode(""); // 创建一个空的文本节点作为触发器

  // 监听文本节点的字符数据变化
  observe.observe(textNode, {
    characterData: true, // 监听字符数据变化
    subtree: true, // 监听子树变化
  });

  timerFunc = () => {
    textNode.textContent = "update"; // 修改文本内容，触发MutationObserver回调
  };
} else if (setImmediate) {
  // IE10+支持的setImmediate，比setTimeout优先级更高的宏任务
  // setImmediate会在当前事件循环结束后立即执行，比setTimeout(fn, 0)更快
  timerFunc = () => {
    setImmediate(flush); // 将flush函数放入setImmediate队列
  };
} else {
  // 最后的兜底方案：使用setTimeout
  timerFunc = () => {
    setTimeout(flush, 0);
  };
  // 这是最慢的异步执行方式，但兼容性最好
}

/**
 * 在下一个事件循环中执行回调函数
 *
 * 工作原理：
 * 1. 将回调函数添加到队列中
 * 2. 如果当前没有pending的异步任务，则启动一个新的异步任务
 * 3. 在下一个事件循环中批量执行所有回调函数
 *
 * 这种设计的优势：
 * - 批量处理：多次调用nextTick只会触发一次异步任务
 * - 性能优化：避免频繁的异步调用
 * - 顺序保证：回调函数按照添加顺序执行
 *
 * @param {Function} fn - 要在下一个tick中执行的回调函数
 */
export function nextTick(fn) {
  callbacks.push(fn); // 将回调函数添加到队列末尾

  // 防抖机制：如果当前没有pending的异步任务，才创建新的异步任务
  if (!panding) {
    panding = true; // 标记为正在处理，防止重复创建异步任务
    timerFunc(); // 调用对应的异步执行函数
  }
}

// ============== 微任务 vs 宏任务 ==============
//
// 微任务（Microtask）：
// - Promise.resolve().then()
// - MutationObserver
// - 优先级高，在当前宏任务结束后立即执行
// - 更适合DOM更新后的回调
//
// 宏任务（Macrotask）：
// - setTimeout、setInterval、setImmediate
// - 优先级低，在下一个事件循环中执行
// - 执行时间相对较晚
//
// Vue优先选择微任务的原因：
// 1. 更快的执行时机，能够更及时地响应DOM更新
// 2. 更好的用户体验，减少闪烁和延迟
// 3. 更精确的执行顺序控制
