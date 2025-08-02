/**
 * Vue2渲染系统 - 虚拟DOM相关方法混入
 * 这个模块负责在Vue原型上添加渲染相关的方法，包括：
 * 1. 创建虚拟DOM节点的方法（_c, _v）
 * 2. 数据转换方法（_s）
 * 3. 渲染函数（_render）
 * 
 * 这些方法会在模板编译后的render函数中被调用
 * 
 * @param {Function} Vue - Vue构造函数，用于在其原型上添加方法
 */
export function renderMixin(Vue) {
  /**
   * 创建元素虚拟节点的方法
   * 在编译后的render函数中，所有的HTML标签都会转换为_c()调用
   * 例如：<div id="app">content</div> -> _c('div', {id: 'app'}, [_v('content')])
   */
  Vue.prototype._c = function () {
    // 使用arguments对象获取所有传入的参数，并传递给createElement函数
    return createElement(...arguments);
  };

  /**
   * 创建文本虚拟节点的方法
   * 在编译后的render函数中，所有的文本内容都会转换为_v()调用
   * 例如：模板中的 "hello" -> _v("hello")
   * 
   * @param {string|any} text - 要创建的文本内容
   * @returns {Object} - 文本虚拟节点对象
   */
  Vue.prototype._v = function (text) {
    return createText(text);
  };

  /**
   * 将任意值转换为字符串的方法
   * 主要用于插值表达式{{}}中的变量显示
   * 例如：{{name}} -> _s(name)
   * 
   * 转换规则：
   * 1. null/undefined -> 空字符串
   * 2. 对象 -> JSON字符串
   * 3. 其他类型 -> 直接转换为字符串
   * 
   * @param {any} val - 要转换的值
   * @returns {string} - 转换后的字符串
   */
  Vue.prototype._s = function (val) {
    return val == null
      ? ""
      : typeof val === "object"
      ? JSON.stringify(val)
      : val;
  };

  /**
   * Vue实例的渲染函数
   * 这是Vue渲染系统的核心方法，负责：
   * 1. 获取组件的render函数
   * 2. 执行render函数生成虚拟DOM
   * 3. 返回虚拟DOM树供patch函数使用
   * 
   * 调用时机：
   * - 组件首次挂载时
   * - 响应式数据变化触发重新渲染时
   * 
   * @returns {Object} - 虚拟DOM节点树
   */
  Vue.prototype._render = function () {
    let vm = this; // 保存Vue实例的引用
    let render = vm.$options.render; // 获取render函数（模板编译生成或用户手写）
    
    // 执行render函数，生成虚拟DOM
    // 使用call绑定this为当前Vue实例，这样render函数内部可以访问组件数据
    let vnode = render.call(this);
    return vnode;
  };

  /**
   * 创建元素虚拟节点的内部函数
   * 这是_c方法的具体实现，负责创建表示HTML元素的虚拟节点
   * 
   * @param {string} tag - HTML标签名（如'div', 'span', 'p'等）
   * @param {Object} data - 元素的属性数据，包括id、class、style等
   * @param {Array} children - 子节点数组，使用剩余参数语法收集所有子节点
   * @returns {Object} - 元素虚拟节点对象
   */
  function createElement(tag, data = {}, ...children) {
    return vnode(tag, data, children);
  }

  /**
   * 创建文本虚拟节点的内部函数
   * 这是_v方法的具体实现，负责创建表示文本内容的虚拟节点
   * 
   * @param {string} text - 文本内容
   * @returns {Object} - 文本虚拟节点对象
   */
  function createText(text) {
    // 文本节点不需要tag、data、children，只需要text
    return vnode(undefined, undefined, undefined, text);
  }

  /**
   * 虚拟节点构造函数
   * 这是Vue虚拟DOM的核心数据结构，用于描述DOM节点的所有信息
   * 
   * 虚拟DOM的优势：
   * 1. 轻量级：纯JavaScript对象，比真实DOM操作更快
   * 2. 可diff：通过比较虚拟DOM树来最小化真实DOM操作
   * 3. 跨平台：可以渲染到不同的环境（浏览器、移动端、服务器等）
   * 
   * @param {string} tag - 标签名，元素节点必需，文本节点为undefined
   * @param {Object} data - 属性数据对象，包含元素的所有属性
   * @param {Array} children - 子节点数组，包含所有子虚拟节点
   * @param {string} text - 文本内容，仅文本节点使用
   * @returns {Object} - 标准化的虚拟节点对象
   */
  function vnode(tag, data = {}, children = [], text) {
    return {
      tag,        // 标签名
      data,       // 属性数据
      children,   // 子节点数组
      text,       // 文本内容
      elm: null,  // DOM 元素引用，初始为null，创建真实DOM后会指向对应的DOM元素
    };
  }
}
