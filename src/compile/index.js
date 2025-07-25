export function compileToFunction(template) {
  let ast = parseHtml(template);
}
// 匹配标签名 含义是 匹配一个字母或下划线开头，后面可以跟任意数量的字母、数字、下划线、点或连字符
// \\-\\.0-9_a-zA-Z]* 匹配连字符、点、数字、字母或下划线
const ncname = "[a-zA-Z_][\\-\\.0-9_a-zA-Z]*";
// 匹配标签名，可能带有命名空间
// 例如 <svg:circle> 或 <xlink:href>
const qnameCapture = "((?:" + ncname + "\\:)?(" + ncname + "))"; // 匹配带命名空间的标签名
// 匹配开始标签
const startTagOpen = new RegExp("^<" + qnameCapture); // 匹配开始标签的开头部分
// 匹配结束标签
const endTag = new RegExp("^</" + qnameCapture + "[^>]*>"); // 匹配结束标签
// 匹配属性名和属性值
const attribute =
  /^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/;
// 匹配开始标签的闭合部分
const startTagClose = /^\s*(\/?)>/; // 匹配开始标签的闭合部分
// 匹配文本内容  匹配双大括号中的内容
const defaultTagRE = /\{\{((?:.|\r?\n)+?)\}\}/g;

function parseHtml(template) {
  //解析HTML模板为AST 使用正则表达式方法
  // while循环解析模板 传入值为空时停止
  while (template) {
    let textEnd = template.indexOf("<");
    // 如果没有找到<，说明剩余的都是文本内容
    if (textEnd === 0) {
      let startTagMatch = parseStartTag(); // 解析开始标签
      console.log("开始标签解析结果:", startTagMatch);
      continue; // 继续解析下一个部分
    }
    if (textEnd > 0) {
      // 如果找到了<，说明前面有文本内容
      let text = template.substring(0, textEnd); // 获取文本内容
      advance(text.length); // 前进到下一个位置
      console.log("文本内容:", text); // 输出文本内容
    }
  }
  function parseStartTag() {
    // 解析到返回结果 未解析到返回false
    const start = template.match(startTagOpen);
    let match = {
      tagName: start[1], // 标签名
      attrs: [], // 属性列表
    };
    advance(start[0].length); // 前进到下一个位置

    // 属性
    // 属性可能有多个，使用while循环解析
    let attr;
    let end;
    while (
      !(end = template.match(startTagClose)) &&
      (attr = template.match(attribute))
    ) {
      // 将属性名和值保存到match.attrs中
      match.attrs.push({
        name: attr[1], // 属性名
        value: attr[3] || attr[4] || attr[5] || "", // 属性值
      });
      advance(attr[0].length); // 前进到下一个位置
      if (end) {
        // 如果找到了开始标签的闭合部分，结束循环并删除>
        advance(end[0].length); // 前进到下一个位置
        return match; // 返回解析结果
      }
    }
  }
  /**
   * 删除已解析的部分
   * @param {number} n - 要删除的字符数
   * 例如：如果n为3，则删除template的前3个字符
   */
  function advance(n) {
    template = template.substring(n);
    console.log("已解析的部分:", template);
  }
}
