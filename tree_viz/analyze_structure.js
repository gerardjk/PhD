const data = require('./cfi_table_hierarchy.json');

console.log('Analyzing all groups for structural differences:\n');

for (const cat of data.categories) {
  for (const grp of cat.groups) {
    const attrs = grp.attributes || [];

    // Check structure
    let structure = 'empty';
    let details = '';

    if (attrs.length === 0) {
      structure = 'empty (no attributes)';
    } else if (attrs[0].attributes) {
      // Nested subgroups
      structure = 'nested subgroups';
      details = '\n    Subgroups:';
      attrs.forEach(sub => {
        const subAttrs = sub.attributes || [];
        details += '\n      - ' + sub.code + ' (' + sub.name + '): ' + subAttrs.length + ' attrs';
        if (subAttrs.length > 0 && !subAttrs[0].position) {
          details += ' [MISSING POSITION]';
        }
      });
    } else {
      // Normal attributes
      structure = 'normal (' + attrs.length + ' attributes)';
      details = '\n    Positions: ' + attrs.map(a => a.position || '?').join(', ');

      // Check for missing values
      const emptyAttrs = attrs.filter(a => !a.values || Object.keys(a.values).length === 0);
      if (emptyAttrs.length > 0) {
        details += '\n    WARNING: ' + emptyAttrs.length + ' attributes with no values';
      }
    }

    console.log(cat.code + '/' + grp.code + ' — ' + structure + details);
  }
}
