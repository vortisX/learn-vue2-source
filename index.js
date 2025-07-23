import { initMixin } from "./src/init";

function Vue(option){
    console.log("Vue 运行了");
    console.log("入参:", option);
    this._init(option);
}

// Vue原型上的初始化方法
initMixin(Vue);

export default Vue;