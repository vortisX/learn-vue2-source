import { mergeOptions } from "../utils/index";

export function initGlobalApi(Vue) {
  console.log(Vue.options, "options");

  Vue.options = {};
  Vue.Mixin = function (mixin) {
    this.options = mergeOptions(this.options, mixin);
    console.log(this.options);
  };
}
