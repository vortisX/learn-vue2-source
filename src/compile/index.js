import { parseHtml } from "./parseAst.js";
export function compileToFunction(template) {
  let ast = parseHtml(template);
  console.log(ast, "ast");
}
