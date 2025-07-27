/**
 * ncname
 * 匹配不带命名空间的标签名
 * 例如 <circle> 或 <rect>
 */
export const ncname = "[a-zA-Z_][\\-\\.0-9_a-zA-Z]*";
/**
 * qnameCapture
 * 匹配带命名空间的标签名
 */
export const qnameCapture = "((?:" + ncname + "\\:)?(" + ncname + "))"; // 匹配带命名空间的标签名
/**
 * startTagOpen
 * 匹配开始标签
 */
export const startTagOpen = new RegExp("^<" + qnameCapture); // 匹配开始标签的开头部分
/**
 * endTag
 * 匹配结束标签
 */
export const endTag = new RegExp(`^<\\/${qnameCapture}[^>]*>`) // 匹配结束标签
/**
 * attribute
 * 匹配属性名和属性值
 */
export const attribute =
  /^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/;

/**
 * startTagClose
 * 匹配开始标签的闭合部分
 */
export const startTagClose = /^\s*(\/?)>/; // 匹配开始标签的闭合部分
/**
 * defaultTagRE
 * 匹配文本内容  匹配双大括号中的内容
 */
export const defaultTagRE = /\{\{((?:.|\r?\n)+?)\}\}/g;
