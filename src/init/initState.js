import { initComputed } from "./InitComputed";
import { initData } from "./initData";
import { initMethods } from "./initMethods";
import { initWatch } from "./initWatch";
import { initProps } from "./initProps";

export function initState(vm) {
    let option = vm.$options;
    // 判断option中是否有data属性
    if (option.data) {
        initData(vm);
    }
    if(option.methods) {
        initMethods(vm);
    }
    if(option.computed) {
        initComputed(vm);
    }
    if(option.watch) {
        initWatch(vm);
    }
    if(option.props) {
        initProps(vm);
    }
}