import { generate } from "./generate.js";
import { parseHtml } from "./parseAst.js";

/**
 * 模板编译主函数
 * 
 * 这是Vue模板编译系统的入口函数，负责将HTML模板转换为可执行的render函数
 * Vue的模板编译是一个三步过程：
 * 1. 解析(Parse)：将HTML模板解析为AST（抽象语法树）
 * 2. 优化(Optimize)：标记静态节点，优化渲染性能（本实现中省略）
 * 3. 生成(Generate)：将AST转换为render函数代码字符串
 * 
 * 编译时机：
 * - 完整版Vue：运行时编译，在浏览器中进行
 * - 运行时版Vue：构建时编译，通过webpack等工具预编译
 * 
 * @param {string} template - HTML模板字符串
 * @returns {Function} - 编译生成的render函数
 */
export function compileToFunction(template) {
  // 第一步：解析HTML模板为AST语法树
  // parseHtml函数会递归解析HTML结构，生成树形的AST节点
  // AST保存了模板的完整结构信息，包括元素、属性、子节点等
  let ast = parseHtml(template);

  // 第二步：将AST语法树转换为render函数代码
  // generate函数遍历AST，生成对应的JavaScript代码字符串
  // 生成的代码使用Vue的内部渲染函数（_c, _v, _s等）
  let code = generate(ast);

  // 第三步：将代码字符串转换为可执行的函数
  // 使用 Function 构造器动态创建函数
  // with(this) 语句允许在函数内部直接访问Vue实例的属性和方法
  // 这样render函数内可以直接使用 data、methods 等，而不需要 this.data
  let render = new Function("with(this){return " + code + "}");
  
  return render;
}

// ============== Vue模板编译详解 ==============
//
// 1. 编译的必要性：
//    - 浏览器不能直接理解Vue模板语法
//    - 需要转换为标准的JavaScript代码
//    - 通过编译可以进行静态分析和优化
//
// 2. AST的作用：
//    - 结构化表示模板内容
//    - 便于进行静态分析
//    - 支持各种优化处理
//    - 作为代码生成的基础
//
// 3. with语句的作用：
//    - 简化render函数内的变量访问
//    - name 等价于 this.name
//    - 但会影响性能和调试，现代框架趋向于避免使用
//
// 4. 编译结果示例：
//    模板: <div id="app">{{message}}</div>
//    AST: {tag: 'div', attrs: [{name: 'id', value: 'app'}], children: [...]}
//    代码: _c('div',{id:"app"},[_v(_s(message))])
//    函数: function(){with(this){return _c('div',{id:"app"},[_v(_s(message))])}}
//
// 5. 性能考虑：
//    - 编译是耗时操作，生产环境建议预编译
//    - 可以通过缓存避免重复编译
//    - 静态部分可以进行优化处理
