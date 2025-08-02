/**
 * Vue2虚拟DOM的patch函数 - 核心渲染算法
 * 这是Vue2中最重要的函数之一，负责将虚拟DOM转换为真实DOM
 * 
 * 工作流程：
 * 1. 接收旧的DOM节点和新的虚拟节点
 * 2. 创建新的DOM元素
 * 3. 替换旧的DOM节点
 * 4. 返回新创建的DOM元素
 * 
 * 注意：这是简化版本，完整版本需要实现diff算法进行性能优化
 * 
 * @param {Element} oldVnode - 旧的DOM元素（真实DOM节点）
 * @param {Object} vnode - 新的虚拟节点对象
 * @returns {Element} - 返回新创建的DOM元素
 */
export function patch(oldVnode, vnode) {
  // 这里可以实现虚拟DOM的diff算法和真实DOM的更新
  // 1. 创建新的DOM节点 - 根据虚拟节点创建对应的真实DOM
  let el = createEl(vnode);
  
  // 2. 替换旧的DOM节点 - 将新创建的DOM插入到旧节点的位置
  // insertBefore：在指定节点之前插入新节点
  oldVnode.parentNode.insertBefore(el, oldVnode.nextSibling);
  // removeChild：移除旧的DOM节点
  oldVnode.parentNode.removeChild(oldVnode);

  return el; // 返回新的DOM元素，供后续使用
}

/**
 * 根据虚拟节点创建真实DOM元素的核心函数
 * 这个函数负责将Vue的虚拟DOM对象转换为浏览器可以理解的真实DOM
 * 
 * 处理两种类型的节点：
 * 1. 元素节点：有tag属性，需要创建HTML元素并处理属性和子节点
 * 2. 文本节点：没有tag属性，只有text内容，创建文本节点
 * 
 * @param {Object} vnode - 虚拟节点对象
 * @param {string} vnode.tag - 标签名（如'div', 'span'等）
 * @param {Object} vnode.data - 节点的属性数据（如id, class, style等）
 * @param {Array} vnode.children - 子节点数组
 * @param {string} vnode.text - 文本内容（仅文本节点使用）
 * @returns {Element|Text} - 创建的DOM元素或文本节点
 */
function createEl(vnode) {
  let { tag, data, children, text } = vnode;

  // 判断节点类型：如果有标签名，说明是元素节点
  if (typeof tag === "string") {
    // 创建HTML元素节点（如<div>, <span>等）
    vnode.el = document.createElement(tag); // 创建元素

    // 处理元素的属性（如id, class, style等）
    if (data) {
      updateProperties(vnode.el, data);
    }

    // 递归创建子节点 - 深度优先遍历创建整个DOM树
    if (children && children.length > 0) {
      children.forEach((child) => {
        // 递归调用createEl为每个子节点创建DOM，并添加到当前元素中
        vnode.el.appendChild(createEl(child));
      });
    }
  } else {
    // 创建文本节点 - 当没有tag时，说明是纯文本内容
    vnode.el = document.createTextNode(text);
  }

  return vnode.el; // 返回创建的DOM元素，供父节点使用
}

/**
 * 更新DOM元素的属性
 * 这个函数负责将虚拟节点的属性数据应用到真实DOM元素上
 * 
 * 支持的属性类型：
 * 1. id属性：直接设置元素的id
 * 2. class属性：设置元素的className
 * 3. style属性：支持对象和字符串两种格式的样式
 * 4. 其他属性：通过setAttribute设置（当前被注释掉）
 * 
 * @param {Element} el - 要更新属性的DOM元素
 * @param {Object} props - 属性对象，包含要设置的所有属性
 */
function updateProperties(el, props) {
  // 遍历属性对象的所有键值对
  for (let key in props) {
    // 确保属性是对象自身的属性，而不是继承的属性
    if (props.hasOwnProperty(key)) {
      let value = props[key];

      // 根据属性名进行不同的处理
      switch (key) {
        case "id":
          // 设置元素的id属性
          el.id = value;
          break;

        case "class":
          // 设置元素的CSS类名
          el.className = value;
          break;

        case "style":
          // 处理样式属性，支持两种格式
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
          // 其他属性直接设置 - 当前被注释掉，可以根据需要启用
          // el.setAttribute(key, value);
          break;
      }
    }
  }
}
