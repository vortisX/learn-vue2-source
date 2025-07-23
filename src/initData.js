import { observer } from "./observer/index";

export function initData(vm) {
    console.log("初始化Data");
    let data = vm.$options.data; // 获取用户传入的data
    // data 属性既可以是对象，也可以是函数 所以先要判断类型
    console.log(data());
    console.log(data.call(vm));
   data = vm._data =  typeof data === 'function' ? data.call(vm) : data;
   console.log("Data after processing:", data);
   observer(data); // 对data进行劫持
}
