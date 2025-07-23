import { initState } from "./initState";

export function initMixin(Vue) {
    // 在Vue构造函数上添加_init方法
    Vue.prototype._init = function(option) {
        console.log("初始化方法被调用,入参:", option);
        // 将传入的配置数据保存到实例上
        // 这里可以添加更多的初始化逻辑
        let vm = this;
        console.log("Vue 实例:", vm);
        // 将配置数据保存到实例上
        vm.$options = option;
        // 初始化状态
        initState(vm);
        console.log("初始化完成");
    };
}
