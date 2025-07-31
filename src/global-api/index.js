import {mergeOptions} from "../utils/index";

export function initGlobalApi(Vue) {
    Vue.options = {};
    Vue.Mixin = function (mixin) {
        this.options = mergeOptions(this.options, mixin);
    };
    return this;
}
