const data = require("./cfi_table_hierarchy.json");

function analyzeDepth(node, depth = 0, path = "") {
  const results = [];

  if (node.categories) {
    for (const cat of node.categories) {
      results.push(...analyzeDepth(cat, depth + 1, cat.code));
    }
  } else if (node.groups) {
    for (const grp of node.groups) {
      results.push(...analyzeDepth(grp, depth + 1, path + "/" + grp.code));
    }
  } else {
    const attrs = node.attributes || [];
    let maxDepth = depth;

    if (attrs.length > 0) {
      maxDepth = depth + (attrs.length * 2);
    }

    results.push({
      path: path,
      name: node.name,
      numAttrs: attrs.length,
      maxDepth: maxDepth
    });
  }

  return results;
}

const analysis = analyzeDepth(data);

const depthGroups = {};
analysis.forEach(item => {
  if (!depthGroups[item.maxDepth]) {
    depthGroups[item.maxDepth] = [];
  }
  depthGroups[item.maxDepth].push(item);
});

console.log("Groups by maximum depth:");
Object.keys(depthGroups).sort((a,b) => a-b).forEach(depth => {
  console.log("\nDepth " + depth + ": " + depthGroups[depth].length + " groups");
  depthGroups[depth].slice(0, 5).forEach(g => {
    console.log("  " + g.path + " — " + g.numAttrs + " attributes");
  });
  if (depthGroups[depth].length > 5) {
    console.log("  ... and " + (depthGroups[depth].length - 5) + " more");
  }
});

console.log("\nSummary:");
console.log("Min depth: " + Math.min(...Object.keys(depthGroups)));
console.log("Max depth: " + Math.max(...Object.keys(depthGroups)));
