export function initWatch(vm) {
  let watch = vm.$options.watch; // 获取watch选项
  for (let key in watch) {
    let handler = watch[key]; // 获取每个watcher的处理函数
    if (Array.isArray(handler)) {
      handler.forEach((item) => {
        createWatcher(vm, key, item); // 如果是数组，则遍历每个处理函数
      });
    } else {
      createWatcher(vm, key, handler);
    }
  }
}

function createWatcher(vm, key, handler, options) {
  if (typeof handler === "object") {
    options = handler; // 如果handler是对象，则将其作为options
    handler = options.handler; // 获取处理函数
  }
  if (typeof handler === "string") {
    handler = vm[handler]; // 如果handler是字符串，则获取vm实例上的方法
  }
  if (typeof handler !== "function") {
    console.warn(`Watcher handler for key "${key}" is not a function.`);
    return;
  }
  // 创建watcher
  return vm.$watch(key, handler, options); // 创建watcher
}
