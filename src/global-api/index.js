import {mergeOptions} from "../utils/index";

/**
 * 初始化Vue的全局API
 * 这些API可以通过Vue构造函数直接访问，不需要创建Vue实例
 * 
 * 全局API的特点：
 * 1. 挂载在Vue构造函数上，而不是实例上
 * 2. 用于全局配置和功能扩展
 * 3. 影响所有Vue实例的行为
 * 
 * @param {Function} Vue - Vue构造函数
 */
export function initGlobalApi(Vue) {
    // 初始化Vue的全局选项对象
    // 这个对象会作为所有Vue实例选项合并的基础
    Vue.options = {};
    
    /**
     * Vue.Mixin全局混入方法
     * 
     * 混入(mixin)是一种分发Vue组件中可复用功能的灵活方式
     * 全局混入会影响每一个之后创建的Vue实例，包括第三方组件
     * 
     * 使用场景：
     * 1. 添加全局的生命周期钩子
     * 2. 添加全局的方法或属性
     * 3. 插件开发中的功能注入
     * 
     * 注意事项：
     * - 谨慎使用全局混入，因为它会影响每个组件
     * - 可能造成命名冲突和难以追踪的bug
     * - 建议优先使用局部混入或插件系统
     * 
     * @param {Object} mixin - 要混入的选项对象
     * @returns {Function} - 返回Vue构造函数，支持链式调用
     */
    Vue.Mixin = function (mixin) {
        // 将传入的混入选项与Vue的全局选项合并
        // mergeOptions函数会根据不同选项类型使用相应的合并策略
        this.options = mergeOptions(this.options, mixin);
    };
    
    // 返回Vue构造函数，支持链式调用
    // 例如：Vue.Mixin(mixin1).Mixin(mixin2)
    return this;
}

// ============== Vue全局API设计说明 ==============
//
// 1. 全局API vs 实例API：
//    - 全局API：Vue.mixin, Vue.extend, Vue.component等
//    - 实例API：vm.$mount, vm.$watch, vm.$emit等
//    - 全局API用于配置和扩展，实例API用于操作具体实例
//
// 2. 混入的合并策略：
//    - 生命周期钩子：合并成数组，都会执行
//    - data、methods：子组件覆盖父组件
//    - 其他选项：根据具体类型使用相应策略
//
// 3. 全局混入的执行顺序：
//    - 全局混入的钩子先执行
//    - 组件自身的钩子后执行
//    - 多个全局混入按注册顺序执行
//
// 4. 最佳实践：
//    - 避免在全局混入中修改组件状态
//    - 使用命名空间避免属性冲突
//    - 考虑使用插件系统代替全局混入
//    - 在混入中添加前缀标识来源
//
// 示例用法：
// Vue.Mixin({
//   created() {
//     console.log('全局混入：组件创建完成');
//   },
//   methods: {
//     $log(msg) {
//       console.log(`[${this.$options.name}]: ${msg}`);
//     }
//   }
// });
