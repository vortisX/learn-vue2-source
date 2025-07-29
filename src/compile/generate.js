/**
 * Vue2模板编译器 - 代码生成阶段
 *
 * 示例：
 * <div id="app">
 *   <span>hello</span>
 *   <span>world</span>
 * </div>
 *
 * 编译后生成：
 * render() {
 *   return _c('div', {id: 'app'}, [
 *     _c('span', null, [_v('hello')]),
 *     _c('span', null, [_v('world')])
 *   ])
 * }
 */

import { defaultTagRE } from "./rule";

/**
 * 生成属性对象的字符串表示
 * @param {Array} attrs - 属性数组，每个元素包含 name 和 value
 * @returns {string} - 返回属性对象的字符串，格式如：{id: "app", style: {...}}
 *
 * 处理逻辑：
 * 1. 遍历所有属性
 * 2. 对 style 属性进行特殊处理，将字符串转换为对象
 * 3. 其他属性直接添加到结果字符串中
 * 4. 返回完整的属性对象字符串
 */
function genProps(attrs) {
  let str = "";
  for (let i = 0; i < attrs.length; i++) {
    let attr = attrs[i];
    // 特殊处理 style 属性：将 "color: red; font-size: 14px" 转换为 {color: "red", fontSize: "14px"}
    if (attr.name === "style") {
      let obj = {};
      attr.value.split(";").forEach((element) => {
        let [key, value] = element.split(":");
        if (key && value) {
          obj[key.trim()] = value.trim();
        }
      });
      attr.value = obj;
    }
    // 将属性添加到字符串中，格式：name:value,
    str += `${attr.name}:${JSON.stringify(attr.value)},`;
  }
  // 移除最后一个逗号并包装成对象格式
  return `{${str.slice(0, -1)}}`;
}

/**
 * 生成子节点的代码字符串
 * @param {Object} ast - AST节点对象
 * @returns {string|undefined} - 返回子节点代码字符串，如：_v('hello'),_c('span',null,null)
 *
 * 处理逻辑：
 * 1. 获取当前节点的所有子节点
 * 2. 遍历每个子节点，调用 gen 函数生成对应代码
 * 3. 将所有子节点代码用逗号连接
 * 4. 如果没有子节点，返回 undefined
 */
function genChildren(ast) {
  let children = ast.children;
  if (children && children.length > 0) {
    return children.map((item) => gen(item)).join(",");
  }
}

/**
 * 根据节点类型生成对应的代码字符串
 * @param {Object} node - AST节点对象
 * @param {string} node.type - 节点类型，可能是 "text" 或 "element"
 * @param {string} node.text - 文本内容（当 type 为 "text" 时）
 * @returns {string} - 返回生成的代码字符串
 *
 * 支持的节点类型：
 * 1. text: 文本节点，包括普通文本和插值表达式 {{}}
 * 2. element: 元素节点，递归调用 generate 函数
 */
function gen(node) {
  if (node.type === "text") {
    /**
     * 处理文本节点
     * 分两种情况：
     * 1. 普通文本：直接包装为 _v("text")
     * 2. 包含插值的文本：解析 {{}} 表达式，生成 _v("text" + _s(expression) + "text")
     */
    let text = node.text;

    // 如果文本中不包含插值表达式 {{}}，直接返回文本节点
    if (!defaultTagRE.test(text)) {
      return `_v(${JSON.stringify(text)})`;
    }

    /**
     * 处理包含插值表达式的文本
     * 例如：'hello {{name}} world'
     * 解析为：_v("hello " + _s(name) + " world")
     */
    let tokens = [];
    let lastIndex = (defaultTagRE.lastIndex = 0); // 重置正则表达式的 lastIndex
    let match;

    // 循环匹配所有的插值表达式
    while ((match = defaultTagRE.exec(text))) {
      let index = match.index;

      // 添加插值表达式前的普通文本
      if (index > lastIndex) {
        tokens.push(JSON.stringify(text.slice(lastIndex, index)));
      }

      // 添加插值表达式，使用 _s() 包装变量
      tokens.push(`_s(${match[1].trim()})`);

      // 更新 lastIndex 到当前匹配结束位置
      lastIndex = index + match[0].length;
    }

    // 添加最后一段普通文本（如果存在）
    if (lastIndex < text.length) {
      tokens.push(JSON.stringify(text.slice(lastIndex)));
    }

    // 将所有部分用 + 连接，并包装为 _v()
    return `_v(${tokens.join("+")})`;
  } else if (node.type === "element") {
    // 处理元素节点，递归调用 generate 函数
    return generate(node);
  }
}

/**
 * 生成完整的渲染函数代码
 * @param {Object} ast - 根AST节点对象
 * @param {string} ast.tag - 标签名
 * @param {Array} ast.attrs - 属性数组
 * @param {Array} ast.children - 子节点数组
 * @returns {string} - 返回完整的渲染函数代码字符串
 *
 * 生成格式：_c(tag, props, children)
 * - _c: createElement 函数的简写
 * - tag: 标签名字符串
 * - props: 属性对象或 null
 * - children: 子节点数组或 null
 *
 * 示例输出：
 * _c('div', {id: "app"}, [_c('span', null, [_v('hello')])])
 */
export function  generate(ast) {
  // 生成子节点代码
  let children = genChildren(ast);

  // 拼接完整的代码字符串
  let code = `_c('${ast.tag}',${
    ast.attrs.length ? `${genProps(ast.attrs)}` : "null"
  },${children ? `[${children}]` : "null"})`;

  console.log("Generated code:", code);
  return code;
}
