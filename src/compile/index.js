import { generate } from "./generate.js";
import { parseHtml } from "./parseAst.js";
export function compileToFunction(template) {
  // 将html 变为 ast语法树
  let ast = parseHtml(template);

  // ast语法树变为render函数（1） ast语法树变为字符串 （2）字符串变为函数
   let code = generate(ast);
}
