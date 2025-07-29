/**I
 *  <div id="app">
 *    <span>hello</span>
 *   <span>world</span>
 * </div>
 *
 * render() { _c('div', {id: 'app'},
 *  [_c('span', {}, ['hello']),
 * _c('span', {}, ['world'])])
 *  }
 */

import { defaultTagRE } from "./rule";

function genProps(attrs) {
  let str = "";
  for (let i = 0; i < attrs.length; i++) {
    let attr = attrs[i];
    if (attr.name === "style") {
      let obj = {};
      attr.value.split(";").forEach((element) => {
        let [key, value] = element.split(":");
        obj[key.trim()] = value.trim();
      });
      attr.value = obj;
      str += `${attr.name}:${JSON.stringify(attr.value)},`;
    }
  }
  return `{${str.slice(0, -1)}}`;
}

function genChildren(ast) {
  let children = ast.children;
  if (children) {
    return children.map((item) => gen(item)).join(",");
  }
}

function gen(node) {
  // 1.文本
  // 2.标签
  if (node.type === "text") {
    // 1. 普通文本 2. 含有{{}}
    let text = node.text;
    if (!defaultTagRE.test(text)) {
      return `_v(${JSON.stringify(text)})`;
    }
    let tokens = [];
    let lastIndex = (defaultTagRE.lastIndex = 0);
    let match;
    while ((match = defaultTagRE.exec(text))) {
      let index = match.index;
      // 添加内容
      if (index > lastIndex) {
        tokens.push(JSON.stringify(text.slice(lastIndex, index)));
      }
      tokens.push(`_s(${match[1].trim()})`);
      lastIndex = index + match[0].length;
    }
    if (lastIndex < text.length) {
      tokens.push(JSON.stringify(text.slice(lastIndex)));
    }
    return `_v(${tokens.join("+")})`;
  } else if (node.type === "element") {
    return generate(node);
  }
}

/**
 * 将AST转换为代码字符串
 * @param {*} ast
 */
export function generate(ast) {
  let children = genChildren(ast);
  let code = `_c(${ast.tag},${
    ast.attrs.length ? `${genProps(ast.attrs)}` : "null"
  },${children ? `${children}` : "null"})`;
  console.log(code);
  return code;
}
