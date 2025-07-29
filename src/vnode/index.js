/**
 * 渲染相关方法混入
 * @param {Function} Vue - Vue构造函数
 */
export function renderMixin(Vue) {
  console.log("renderMixin 被调用"); // 添加调试信息
  /**
   * 创建元素节点
   */
  Vue.prototype._c = function () {
    // 创建标签
    return createElement(...arguments);
  };

  /**
   * 创建文本节点
   */
  Vue.prototype._v = function (text) {
    return createText(text);
  };

  /**
   * 将变量转换为字符串
   */
  Vue.prototype._s = function (val) {
    return val == null
      ? ""
      : typeof val === "object"
      ? JSON.stringify(val)
      : val;
  };
  /**
   * 渲染函数
   */
  Vue.prototype._render = function () {
    let vm = this;
    let render = vm.$options.render;
    let vnode = render.call(this);
    console.log("Generated vnode:", vnode);
    return vnode;
  };
  /**
   * 创建元素虚拟节点
   * @param {string} tag - 标签名
   * @param {Object} data - 属性数据
   * @param {Array} children - 子节点数组
   * @param {string} text - 文本内容（文本节点使用）
   * @returns {Object} - 虚拟节点对象
   */
  function createElement(tag, data = {}, ...children) {
    return vnode(tag, data, children);
  }
  /**
   * 创建文本虚拟节点
   */
  function createText(text) {
    return vnode(undefined, undefined, undefined, text);
  }
  /**
   * 创建元素虚拟节点
   * @param {*} tag 
   * @param {*} data 
   * @param {*} children 
   * @param {*} text 
   * @returns 
   */
  function vnode(tag, data = {}, children = [], text) {
    return {
      tag,
      data,
      children,
      text,
      elm: null, // DOM 元素引用，初始为 null
    };
  }
}
