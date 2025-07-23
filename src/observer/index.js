export function observer(data) {
  // 这里可以添加观察者逻辑
  console.log("Observing data changes", data);
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
    this.walk(data);
  }
  walk(data) {
    Object.keys(data).forEach((key) => {
      this.defineReactive(data, key, data[key]);
    });
  }
  defineReactive(data, key, val) {
    // 这里可以添加劫持逻辑
    // object.defineProperty只能劫持一层 需要递归进行劫持
    observer(val); // 劫持子属性
    Object.defineProperty(data, key, {
      get() {
        console.log(`Getting ${key}: ${val}`);
        return val;
      },
      set(newVal) {
        console.log(`Setting ${key}: ${newVal}`);
        if (newVal === val) return; // 如果新值和旧值相同则不进行更新
        observer(newVal); // 劫持新值
        val = newVal;
      },
    });
  }
}
