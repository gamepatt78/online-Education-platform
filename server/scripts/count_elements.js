const fs = require('fs');
const path = require('path');

function scanDir(dir) {
  let icons = 0, buttons = 0, links = 0, dropdowns = 0, forms = 0, inputs = 0, selects = 0, textareas = 0, modals = 0, navDrawers = 0;
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.html'));

  files.forEach(f => {
    const content = fs.readFileSync(path.join(dir, f), 'utf8');
    icons += (content.match(/<i\s+class=["'][^"']*["']/gi) || []).length;
    buttons += (content.match(/<button[\s>]/gi) || []).length;
    links += (content.match(/<a\s+[^>]*href=/gi) || []).length;
    dropdowns += (content.match(/class=["'][^"']*dropdown[^"']*["']/gi) || []).length;
    forms += (content.match(/<form[\s>]/gi) || []).length;
    inputs += (content.match(/<input[\s>]/gi) || []).length;
    selects += (content.match(/<select[\s>]/gi) || []).length;
    textareas += (content.match(/<textarea[\s>]/gi) || []).length;
    modals += (content.match(/class=["'][^"']*(modal|popup)[^"']*["']/gi) || []).length;
    navDrawers += (content.match(/class=["'][^"']*(side-bar|sidebar)[^"']*["']/gi) || []).length;
  });

  return { files: files.length, icons, buttons, links, dropdowns, forms, controls: inputs + selects + textareas, modals, navDrawers };
}

const rootStats = scanDir('design');
const teacherStats = scanDir('design/teacher/htmlfiles');

console.log('ROOT:', JSON.stringify(rootStats, null, 2));
console.log('TEACHER:', JSON.stringify(teacherStats, null, 2));
console.log('COMBINED:', JSON.stringify({
  totalPages: rootStats.files + teacherStats.files,
  icons: rootStats.icons + teacherStats.icons,
  buttons: rootStats.buttons + teacherStats.buttons,
  links: rootStats.links + teacherStats.links,
  dropdowns: rootStats.dropdowns + teacherStats.dropdowns,
  forms: rootStats.forms + teacherStats.forms,
  formControls: rootStats.controls + teacherStats.controls,
  modals: rootStats.modals + teacherStats.modals,
  navDrawers: rootStats.navDrawers + teacherStats.navDrawers
}, null, 2));
