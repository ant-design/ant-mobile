/* eslint-disable */
const path = require('path');
const fs = require('fs');

const rootPath = '/Users/jiangkai/github/ant-design-mobile/site/kitchen';

function rewrite(value) {
  return value.replace(/(\d+)px/ig, (match, p1) => {
    const oldValue = parseInt(p1, 10);
    if (oldValue === 1) {
      return '1PX';
    }
    const newValue = oldValue / 2;
    return `${newValue}px`;
  });
}

function halvePx(filepath) {
  fs.stat(filepath, (error, stats) => {
    if (error) {
      console.error(error);
      return;
    }
    if (stats.isFile()) {
      if (path.extname(filepath) === '.less') {
        console.log('start to handle', filepath);
        const content = fs.readFileSync(filepath, {
          encoding: 'utf8',
        });
        const newContent = rewrite(content);
        fs.writeFileSync(filepath, newContent, {
          encoding: 'utf8',
        });
      }
    } else if (stats.isDirectory()) {
      reWritePxInDir(filepath);
    }
  });
}

function reWritePxInDir(dir) {
  fs.readdir(dir, (error, files) => {
    if (error) {
      console.error(error);
      return;
    }
    const len = files.length;
    let file = null;
    for (let i = 0; i < len; i++) {
      file = files[i];
      if (!/^(\.|_)/.test(file)) {
        halvePx(path.join(dir, file));
      }
    }
  });
}


reWritePxInDir(rootPath);
