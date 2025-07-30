export const HOOKS = [
  "beforeCreate",
  "created",
  "beforeMount",
  "mounted",
  "beforeUpdate",
  "updated",
  "beforeDestroy",
  "destroyed",
];
let starts = {};
starts.data = mergeHook; // 合并data
starts.props = mergeHook; // 合并props
starts.methods = mergeHook; // 合并methods
starts.computed = mergeHook; // 合并computed
starts.watch = mergeHook; // 合并watch
HOOKS.forEach((hook) => {
  starts[hook] = mergeHook;
});

function mergeHook(parent, child) {
  if (child) {
    if (parent) {
      return parent.concat(child);
    } else {
      return [child];
    }
  }
}
export function mergeOptions(parent, child) {
  console.log("Merging options:", parent, child);
  const options = {};
  // 如有父亲没儿子  hasOwnProperty是用来检查对象是否具有指定的属性
  for (const key in parent) {
    mergeField(key);
  }
  for (const key in child) {
    mergeField(key);
  }
  /**
   * 合并单个字段
   */
  function mergeField(key) {
    if (starts[key]) {
      options[key] = starts[key](parent[key], child[key]);
    } else {
      options[key] = child[key];
    }
  }
  console.log(options, "merged options");
  return options;
}
