import { startTagOpen, attribute, startTagClose, endTag } from "./rule.js";

/**
 * 创建AST元素
 * @param {string} tagName - 标签名
 * @param {object} attrs - 属性对象
 * @returns {object} - AST元素
 */
function createAstElement(tag, attrs) {
  return {
    type: "element",
    tag,
    attrs,
    children: [],
    parent: null,
  };
}
let root; // 根节点
let currentParent; // 当前父节点
let stack = new Array(); // 栈，用于存储父节点
/**
 * 获取开始标签
 * @param {string} tagName - 标签名
 * @param {object} attrs - 属性对象
 */
function start(tagName, attrs) {
  // 创建AST元素
  let element = createAstElement(tagName, attrs);
  if (!root) {
    root = element; // 如果根节点不存在，则设置为当前元素
  }
  currentParent = element; // 设置当前父节点为当前元素
  stack.push(element); // 将当前元素压入栈中
}
/**
 * 获取文本标签
 * @param {string} text
 */
function charts(text) {
  text = text.replace(/\s/g, ""); // 去除多余空格
  if (text) {
    // 如果文本不为空，则创建文本节点
    let element = {
      type: "text",
      text: text,
    };
    if (currentParent) {
      currentParent.children.push(element); // 将文本节点添加到当前父节点的子节点中
    }
  }
}
/**
 * 获取结束标签
 */
function end() {
  // 找到当前元素在栈中的索引
  let element = stack.pop();
  currentParent = stack[stack.length - 1]; // 更新当前父节点
  if (currentParent) {
    element.parent = currentParent;
    currentParent.children.push(element); // 将当前元素添加到父节点的子节点中
  }
}

/**
 * 解析HTML模板为AST
 * @param {string} template - 要解析的HTML模板
 */
export function parseHtml(template) {
  //解析HTML模板为AST 使用正则表达式方法
  // while循环解析模板 传入值为空时停止
  while (template) {
    let textEnd = template.indexOf("<");
    // 找到<的话 证明template前边是标签 可能是开始标签或结束标签 未找到 证明是文本
    if (textEnd === 0) {
      let startTagMatch = parseStartTag(); // 解析开始标签
      if (startTagMatch) {
        start(startTagMatch.tagName, startTagMatch.attrs);
        continue; // 继续解析下一个部分
      }
      let endTagMatch = template.match(endTag); // 匹配结束标签
      if (endTagMatch) {
        advance(endTagMatch[0].length); // 删除结束标签
        end(endTagMatch[1]); // 结束标签
        continue; // 继续解析下一个部分
      }
    }
    let text;
    if (textEnd > 0) {
      // 如果找到了<，说明前面有文本内容
      text = template.substring(0, textEnd); // 获取文本内容
    }
    if (text) {
      advance(text.length); // 前进到下一个位置
      charts(text); // 处理文本内容
    }
  }
  return root; // 返回根节点
  /**
   * 解析开始标签
   * @returns {Object|null} - 返回解析结果或null
   */
  function parseStartTag() {
    // 解析到返回结果 未解析到返回false
    const start = template.match(startTagOpen);
    if (!start) {
      return false; // 如果没有匹配到开始标签，返回false
    }
    let match = {
      tagName: start[1], // 标签名
      attrs: [], // 属性列表
    };
    advance(start[0].length); // 前进到下一个位置

    // 属性
    // 属性可能有多个，使用while循环解析
    let attr;
    let end;
    console.log(template.match(startTagClose), " endTagClose");
    while (
      !(end = template.match(startTagClose)) &&
      (attr = template.match(attribute))
    ) {
      // 将属性名和值保存到match.attrs中
      match.attrs.push({
        name: attr[1], // 属性名
        value: attr[3] || attr[4] || attr[5], // 属性值
      });
      advance(attr[0].length); // 前进到下一个位置
    }
    if (end) {
      // 如果找到了开始标签的闭合部分，结束循环并删除>
      advance(end[0].length); // 前进到下一个位置
      return match; // 返回解析结果
    }
  }

  /**
   * 删除已解析的部分
   * @param {number} n - 要删除的字符数
   * 例如：如果n为3，则删除template的前3个字符
   */
  function advance(n) {
    template = template.substring(n);
  }
}
