// object.defineProperty只能对象不能劫持数组
// 需要单独处理数组的劫持逻辑
// 数组的劫持逻辑需要处理以下几个方面：
// 1. 劫持数组的push、pop、shift、unshift、splice
// 2. 劫持数组的索引访问
// 3. 劫持数组的length属性
let inserted;
// 1. 获取数组的原型方法
let oldArrayProtoMethods = Array.prototype;
// 2. 继承
// Object.create可以创建一个新的对象，并将其原型指向旧的数组原型
export let newArrayProtoMethods = Object.create(oldArrayProtoMethods);
// 3. 重写数组的七种方法
let methods = ["push", "pop", "shift", "unshift", "splice", "sort", "reverse"];
methods.forEach((method) => {
  newArrayProtoMethods[method] = function (...args) {
    const result = oldArrayProtoMethods[method].apply(this, args);
    switch (method) {
      case "push":
      case "unshift":
        inserted = args;
        break;
      case "splice":
        inserted = args.slice(2);
        break;
    }
    let ob = this.__ob__;
    if (inserted) {
      if (ob) {
        ob.observerArray(inserted); // 劫持新添加的数组元素
      }
    }

    console.log(ob,'ob');
    ob.dep.notify(); // 通知所有订阅者
    return result;
  };
});
