export function patch(oldVnode, vnode) {
  // 这里可以实现虚拟DOM的diff算法和真实DOM的更新
  // 1. 创建新的DOM节点
  let el = createEl(vnode);
  // 2. 替换旧的DOM节点
  oldVnode.parentNode.insertBefore(el, oldVnode.nextSibling);
  oldVnode.parentNode.removeChild(oldVnode);

  return el; // 返回新的DOM元素
}
/**
 * 创建DOM元素
 * @param {Object} vnode - 虚拟节点对象
 * @returns {Element} - 创建的DOM元素
 */
function createEl(vnode) {
  let { tag, data, children, text } = vnode;

  // 如果有标签名，创建元素节点
  if (typeof tag === "string") {
    vnode.el = document.createElement(tag); // 创建元素

    // 处理属性
    if (data) {
      updateProperties(vnode.el, data);
    }

    // 创建子节点
    if (children && children.length > 0) {
      children.forEach((child) => {
        vnode.el.appendChild(createEl(child));
      });
    }
  } else {
    // 创建文本节点
    vnode.el = document.createTextNode(text);
  }

  return vnode.el; // 返回创建的DOM元素
}

/**
 * 更新元素属性
 * @param {Element} el - DOM元素
 * @param {Object} props - 属性对象
 */
function updateProperties(el, props) {
  for (let key in props) {
    if (props.hasOwnProperty(key)) {
      let value = props[key];

      switch (key) {
        case "id":
          el.id = value;
          break;

        case "class":
          el.className = value;
          break;

        case "style":
          if (typeof value === "object") {
            // 处理样式对象：{color: 'red', fontSize: '14px'}
            for (let styleProp in value) {
              el.style[styleProp] = value[styleProp];
            }
          } else if (typeof value === "string") {
            // 处理样式字符串：'color: red; font-size: 14px'
            el.style.cssText = value;
          }
          break;

        default:
          // 其他属性直接设置
          //   el.setAttribute(key, value);
          break;
      }
    }
  }
}
