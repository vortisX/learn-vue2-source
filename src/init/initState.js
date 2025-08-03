import { initComputed } from "./InitComputed";
import { initData } from "./initData";
import { initMethods } from "./initMethods";
import { initWatch } from "./initWatch";
import { initProps } from "./initProps";

/**
 * 初始化Vue实例的状态
 * 这是Vue初始化过程中的核心步骤，负责初始化各种响应式状态
 *
 * 初始化顺序很重要：
 * 1. props - 组件接收的外部数据，优先级最高
 * 2. methods - 组件方法，需要在data之前初始化
 * 3. data - 组件内部状态数据
 * 4. computed - 计算属性，依赖于data
 * 5. watch - 监听器，监听data和computed的变化
 *
 * 这个顺序确保了依赖关系的正确建立
 *
 * @param {Object} vm - Vue实例对象
 */
export function initState(vm) {
  let option = vm.$options; // 获取Vue实例的配置选项

  // 1. 初始化props - 组件属性，来自父组件传递的数据
  // props需要最先初始化，因为其他选项可能依赖props
  if (option.props) {
    initProps(vm);
  }

  // 2. 初始化methods - 组件方法
  // methods需要在data之前初始化，因为data中可能引用methods中的方法
  if (option.methods) {
    initMethods(vm);
  }

  // 3. 初始化data - 组件的响应式数据
  // data是组件状态的核心，需要进行响应式处理
  if (option.data) {
    initData(vm);
  }

  // 4. 初始化computed - 计算属性
  // computed依赖于data，所以需要在data之后初始化
  if (option.computed) {
    initComputed(vm);
  }

  // 5. 初始化watch - 监听器
  // watch用于监听data和computed的变化，所以需要最后初始化
  if (option.watch) {
    initWatch(vm);
  }
}
export function stateMixin(vm) {
  // 添加$nextTick、$set、$delete等方法到Vue原型上
  vm.prototype.$nextTick = function (cb) {
    return nextTick(cb);
  };
  //   vm.prototype.$set = set;
  //   vm.prototype.$delete = del;
}

// ============== Vue状态初始化详解 ==============
//
// 1. 为什么要按顺序初始化：
//    - props可能被data、computed、watch使用
//    - methods可能被data中的函数引用
//    - computed依赖data中的属性
//    - watch监听data和computed的变化
//
// 2. 各个状态的作用：
//    - props: 父子组件通信的桥梁
//    - methods: 组件的行为方法
//    - data: 组件的内部状态
//    - computed: 基于data计算的衍生状态
//    - watch: 状态变化的副作用处理
//
// 3. 响应式处理：
//    - props和data会被转换为响应式对象
//    - computed会创建计算属性watcher
//    - watch会创建用户watcher
//    - methods只是简单绑定到实例上
