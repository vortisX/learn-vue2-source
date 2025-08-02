/**
 * Vue生命周期钩子函数名称常量
 * 定义了Vue实例从创建到销毁过程中的8个生命周期阶段
 * 这些钩子按照执行顺序排列，开发者可以在这些阶段执行自定义逻辑
 */
export const HOOKS = [
  "beforeCreate",  // 实例初始化之后，数据观测和事件配置之前被调用
  "created",       // 实例创建完成后被立即调用，此时数据观测、属性和方法的运算已完成
  "beforeMount",   // 在挂载开始之前被调用，render函数首次被调用
  "mounted",       // 挂载完成后被调用，此时el被新创建的vm.$el替换
  "beforeUpdate",  // 数据更新时调用，发生在虚拟DOM打补丁之前
  "updated",       // 数据更新导致的虚拟DOM重新渲染和打补丁完成后被调用
  "beforeDestroy", // 实例销毁之前调用，此时实例仍然完全可用
  "destroyed",     // 实例销毁后调用，所有指令被解绑，事件监听器被移除
];

/**
 * 选项合并策略对象
 * 定义了Vue选项合并时的各种策略函数
 * 当父组件和子组件有相同选项时，使用对应的策略函数进行合并
 */
let strats = {};

/**
 * data选项合并策略
 * data选项的合并规则：子组件的data优先级高于父组件
 * 
 * @param {Function|Object} parent - 父组件的data选项
 * @param {Function|Object} child - 子组件的data选项
 * @returns {Function|Object} - 合并后的data选项
 */
strats.data = function (parent, child) {
  return child || parent; // 子组件优先，如果子组件没有则使用父组件的
};

/**
 * props选项合并策略
 * props定义了组件接收的外部数据
 * 
 * @param {Object} parent - 父组件的props选项
 * @param {Object} child - 子组件的props选项
 * @returns {Object} - 合并后的props选项
 */
strats.props = function (parent, child) {
  return child || parent;
};

/**
 * methods选项合并策略
 * methods定义了组件的方法
 * 子组件的方法会覆盖父组件的同名方法
 * 
 * @param {Object} parent - 父组件的methods选项
 * @param {Object} child - 子组件的methods选项
 * @returns {Object} - 合并后的methods选项
 */
strats.methods = function (parent, child) {
  return child || parent;
};

/**
 * computed选项合并策略
 * computed定义了组件的计算属性
 * 
 * @param {Object} parent - 父组件的computed选项
 * @param {Object} child - 子组件的computed选项
 * @returns {Object} - 合并后的computed选项
 */
strats.computed = function (parent, child) {
  return child || parent;
};

/**
 * watch选项合并策略
 * watch定义了数据变化的监听器
 * 
 * @param {Object} parent - 父组件的watch选项
 * @param {Object} child - 子组件的watch选项
 * @returns {Object} - 合并后的watch选项
 */
strats.watch = function (parent, child) {
  return child || parent;
};

// 为所有生命周期钩子设置合并策略
// 生命周期钩子的合并策略比较特殊：需要将父子组件的钩子函数都保留
HOOKS.forEach((hook) => {
  strats[hook] = mergeHook; // 每个生命周期钩子都使用mergeHook策略
});

/**
 * 生命周期钩子合并策略函数
 * 生命周期钩子需要特殊处理，因为父子组件的钩子都需要执行
 * 
 * 合并规则：
 * 1. 如果只有父组件有钩子，返回父组件的钩子数组
 * 2. 如果只有子组件有钩子，将子组件钩子包装成数组返回
 * 3. 如果父子组件都有钩子，将它们合并成一个数组，父组件钩子先执行
 * 
 * @param {Array|Function} parent - 父组件的钩子函数（可能是数组或单个函数）
 * @param {Function} child - 子组件的钩子函数
 * @returns {Array} - 合并后的钩子函数数组
 */
function mergeHook(parent, child) {
  if (child) {
    // 子组件有钩子函数
    if (parent) {
      // 父子组件都有钩子函数，将子组件钩子追加到父组件钩子数组后面
      // parent已经是数组（因为之前的合并操作），直接concat
      return parent.concat(child);
    } else {
      // 只有子组件有钩子函数，将其包装成数组
      return [child];
    }
  } else {
    // 子组件没有钩子函数，返回父组件的钩子
    return parent;
  }
}

/**
 * Vue选项合并主函数
 * 
 * 这个函数是Vue选项合并系统的核心，负责将父组件和子组件的选项合并成最终的配置
 * 使用场景：
 * 1. Vue.extend() 创建子组件时
 * 2. Vue.mixin() 混入选项时  
 * 3. new Vue() 创建实例时
 * 
 * 合并原则：
 * 1. 优先遍历父组件的所有选项
 * 2. 再遍历子组件特有的选项
 * 3. 使用对应的策略函数进行合并
 * 4. 没有策略函数的选项，子组件优先
 * 
 * @param {Object} parent - 父组件选项对象
 * @param {Object} child - 子组件选项对象
 * @returns {Object} - 合并后的选项对象
 */
export function mergeOptions(parent, child) {
  const options = {}; // 存储合并结果的对象
  
  // 第一步：遍历父组件的所有选项
  // 确保父组件的所有选项都会被处理
  for (const key in parent) {
    mergeField(key);
  }
  
  // 第二步：遍历子组件的选项
  // 只处理父组件中不存在的选项，避免重复处理
  for (const key in child) {
    // hasOwnProperty检查确保只处理对象自身的属性，不包括继承的属性
    if (!parent.hasOwnProperty(key)) {
      mergeField(key);
    }
  }

  /**
   * 合并单个字段的内部函数
   * 根据字段名选择合适的合并策略
   * 
   * @param {string} key - 要合并的选项名称
   */
  function mergeField(key) {
    // 检查是否有专门的合并策略
    if (strats[key]) {
      // 使用专门的策略函数进行合并
      options[key] = strats[key](parent[key], child[key]);
    } else {
      // 没有专门策略的选项，使用默认策略：子组件优先
      options[key] = child[key] || parent[key];
    }
  }

  return options; // 返回合并后的完整选项对象
}

// ============== Vue选项合并系统说明 ==============
//
// 1. 为什么需要选项合并：
//    - Vue支持继承和混入，需要将多个来源的选项整合
//    - 不同类型的选项有不同的合并逻辑
//    - 保证开发者的配置能正确生效
//
// 2. 合并策略的设计原则：
//    - 生命周期钩子：都需要执行，合并成数组
//    - 对象选项（data, methods等）：子组件覆盖父组件
//    - 基本类型选项：子组件优先
//
// 3. 执行顺序的重要性：
//    - 生命周期钩子：父组件先执行，子组件后执行
//    - 其他选项：子组件优先级更高
//
// 4. 使用场景：
//    - Vue.extend()：创建组件构造器时
//    - Vue.mixin()：全局混入时
//    - 组件继承：子组件继承父组件选项时
