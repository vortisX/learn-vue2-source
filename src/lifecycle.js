export function mountComponent(vm, el) {
  console.log(vm);
  
  vm._update(vm._render());
}
export function lifecycleMixin(Vue){
    Vue.prototype._update = function (vnode) {
        
    }
}