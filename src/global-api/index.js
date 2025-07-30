export function initGlobalApi(Vue) {
  Vue.Mixin = function (mixin) {
    console.log("全局混入:", mixin);
    // 这里可以实现全局混入的逻辑
  };
}
