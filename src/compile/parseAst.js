import { startTagOpen, attribute, startTagClose, endTag } from "./rule.js";

/**
 * 创建AST元素节点
 * AST（抽象语法树）是模板编译过程中的中间表示形式
 * 将HTML结构转换为JavaScript对象，便于后续处理和代码生成
 * 
 * @param {string} tag - HTML标签名
 * @param {Array} attrs - 属性数组，每个元素包含name和value
 * @returns {Object} - AST元素节点对象
 */
function createAstElement(tag, attrs) {
  return {
    type: "element",     // 节点类型：元素节点
    tag,                 // 标签名
    attrs,              // 属性列表
    children: [],       // 子节点数组
    parent: null,       // 父节点引用
  };
}

// ============== 解析器状态管理 ==============
let root;           // AST根节点，整个模板的顶级节点
let currentParent;  // 当前父节点，用于构建父子关系
let stack = new Array(); // 解析栈，用于跟踪嵌套的标签层级

/**
 * 处理开始标签的回调函数
 * 当解析器遇到开始标签时调用，负责创建AST节点并建立层级关系
 * 
 * 处理流程：
 * 1. 创建新的AST元素节点
 * 2. 设置根节点（如果是第一个元素）
 * 3. 更新当前父节点
 * 4. 将节点压入解析栈
 * 
 * @param {string} tagName - 标签名
 * @param {Array} attrs - 属性数组
 */
function start(tagName, attrs) {
  // 创建新的AST元素节点
  let element = createAstElement(tagName, attrs);
  
  // 如果还没有根节点，将当前元素设为根节点
  // 根节点通常是模板的最外层元素
  if (!root) {
    root = element;
  }
  
  // 更新当前父节点为新创建的元素
  // 后续的子元素都会添加到这个节点下
  currentParent = element;
  
  // 将元素压入栈中，用于跟踪嵌套层级
  // 栈顶元素始终是当前正在处理的父元素
  stack.push(element);
}

/**
 * 处理文本内容的回调函数
 * 当解析器遇到文本内容时调用，创建文本节点并添加到当前父元素
 * 
 * 文本处理：
 * 1. 去除多余的空白字符
 * 2. 创建文本节点
 * 3. 添加到当前父元素的子节点列表
 * 
 * @param {string} text - 文本内容
 */
function charts(text) {
  // 去除文本中的多余空格，避免不必要的空白节点
  text = text.replace(/\s/g, "");
  
  if (text) {
    // 创建文本节点对象
    let element = {
      type: "text",  // 节点类型：文本节点
      text: text,    // 文本内容
    };
    
    // 将文本节点添加到当前父元素的子节点列表中
    if (currentParent) {
      currentParent.children.push(element);
    }
  }
}

/**
 * 处理结束标签的回调函数
 * 当解析器遇到结束标签时调用，完成当前元素的解析并建立父子关系
 * 
 * 处理流程：
 * 1. 从栈中弹出当前元素
 * 2. 更新currentParent为栈顶元素
 * 3. 建立父子关系
 * 
 */
function end() {
  // 从栈中弹出当前完成解析的元素
  let element = stack.pop();
  
  // 更新当前父节点为栈顶元素（上一层的父元素）
  currentParent = stack[stack.length - 1];
  
  // 建立父子关系
  if (currentParent) {
    element.parent = currentParent;              // 设置子元素的父引用
    currentParent.children.push(element);       // 将子元素添加到父元素的children中
  }
}

/**
 * HTML模板解析器主函数
 * 使用状态机的思想，逐字符解析HTML模板，构建AST树
 * 
 * 解析策略：
 * 1. 循环处理模板字符串，直到处理完毕
 * 2. 根据当前字符判断内容类型（标签/文本）
 * 3. 调用相应的处理函数
 * 4. 移除已处理的内容，继续下一轮解析
 * 
 * @param {string} template - 要解析的HTML模板字符串
 * @returns {Object} - 解析生成的AST根节点
 */
export function parseHtml(template) {
  // 使用while循环逐步解析模板，直到模板字符串为空
  while (template) {
    // 查找下一个 '<' 字符的位置
    let textEnd = template.indexOf("<");
    
    // 如果 '<' 在字符串开头，说明当前位置是标签
    if (textEnd === 0) {
      // 尝试解析开始标签
      let startTagMatch = parseStartTag();
      if (startTagMatch) {
        // 如果成功解析到开始标签，调用start处理函数
        start(startTagMatch.tagName, startTagMatch.attrs);
        continue; // 继续下一轮解析
      }
      
      // 尝试解析结束标签
      let endTagMatch = template.match(endTag);
      if (endTagMatch) {
        advance(endTagMatch[0].length); // 移除已解析的结束标签
        end(endTagMatch[1]);           // 调用end处理函数
        continue; // 继续下一轮解析
      }
    }
    
    // 处理文本内容
    let text;
    if (textEnd > 0) {
      // 如果找到了 '<'，说明前面有文本内容
      text = template.substring(0, textEnd);
    }
    
    if (text) {
      advance(text.length); // 移除已处理的文本
      charts(text);        // 调用文本处理函数
    }
  }
  
  return root; // 返回构建完成的AST根节点

  /**
   * 解析开始标签的内部函数
   * 解析形如 <tagName attr1="value1" attr2="value2"> 的开始标签
   * 
   * 解析步骤：
   * 1. 匹配标签名
   * 2. 循环解析所有属性
   * 3. 匹配标签结束符
   * 
   * @returns {Object|false} - 解析结果对象或false
   */
  function parseStartTag() {
    // 尝试匹配开始标签的开头部分 (<tagName)
    const start = template.match(startTagOpen);
    if (!start) {
      return false; // 没有匹配到开始标签
    }
    
    // 创建匹配结果对象
    let match = {
      tagName: start[1], // 从正则捕获组中获取标签名
      attrs: [],         // 属性列表，初始为空数组
    };
    
    // 移除已匹配的标签开头部分
    advance(start[0].length);

    // 循环解析属性，直到遇到标签结束符
    let attr;  // 当前属性匹配结果
    let end;   // 标签结束符匹配结果
    
    // 继续匹配，直到找到标签结束符或没有更多属性
    while (
      !(end = template.match(startTagClose)) &&  // 没有匹配到结束符
      (attr = template.match(attribute))         // 且能匹配到属性
    ) {
      // 将解析到的属性添加到属性列表
      match.attrs.push({
        name: attr[1],                           // 属性名
        value: attr[3] || attr[4] || attr[5],   // 属性值（三种引号格式）
      });
      
      // 移除已解析的属性
      advance(attr[0].length);
    }
    
    // 如果找到了标签结束符，完成开始标签的解析
    if (end) {
      advance(end[0].length); // 移除结束符
      return match;           // 返回解析结果
    }
  }

  /**
   * 前进函数 - 移除已处理的模板内容
   * 这是解析器前进的核心机制，确保不会重复处理同一段内容
   * 
   * @param {number} n - 要移除的字符数量
   */
  function advance(n) {
    template = template.substring(n);
  }
}

// ============== HTML解析器设计原理 ==============
//
// 1. 状态机解析：
//    - 每次循环处理一个语法单元（标签/文本）
//    - 根据当前状态选择相应的处理逻辑
//    - 保证解析的完整性和正确性
//
// 2. 栈式管理：
//    - 使用栈跟踪嵌套的标签层级
//    - 栈顶元素是当前的父节点
//    - 标签闭合时弹栈，恢复上一层父节点
//
// 3. AST构建：
//    - 边解析边构建AST树结构
//    - 建立正确的父子关系
//    - 保存所有必要的节点信息
//
// 4. 容错处理：
//    - 处理不规范的HTML结构
//    - 忽略多余的空白字符
//    - 支持自闭合标签
//
// 5. 性能考虑：
//    - 使用substring而不是正则替换
//    - 避免不必要的字符串操作
//    - 及时释放已处理的内容
