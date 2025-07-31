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
let strats = {};
// 其他策略函数
strats.data = function (parent, child) {
  return child || parent;
};

strats.props = function (parent, child) {
  return child || parent;
};

strats.methods = function (parent, child) {
  return child || parent;
};

strats.computed = function (parent, child) {
  return child || parent;
};

strats.watch = function (parent, child) {
  return child || parent;
};

HOOKS.forEach((hook) => {
  strats[hook] = mergeHook;
});

function mergeHook(parent, child) {
  if (child) {
    if (parent) {
      return parent.concat(child);
    } else {
      return [child];
    }
  } else {
    return parent;
  }
}

export function mergeOptions(parent, child) {
  const options = {};
  // 如有父亲没儿子  hasOwnProperty是用来检查对象是否具有指定的属性
  for (const key in parent) {
    mergeField(key);
  }
  for (const key in child) {
    if (!parent.hasOwnProperty(key)) {
      mergeField(key);
    }
  }

  /**
   * 合并单个字段
   */
  function mergeField(key) {
    if (strats[key]) {
      options[key] = strats[key](parent[key], child[key]);
    } else {
      options[key] = child[key] || parent[key];
    }
  }

  return options;
}
