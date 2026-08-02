#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const root = process.cwd();
const backupDir = path.join(root, '.backups_remove_comments_' + Date.now());
const excludeDirs = new Set(['.git','node_modules','.next','.backups','.vscode','scripts']);

// Optional extension filter: pass comma-separated extensions as first arg, e.g. "js,ts,css"
const extArg = process.argv[2] || '';
const allowedExts = extArg ? new Set(extArg.split(',').map(s => s.trim().toLowerCase())) : null;

function isBinary(buf){
  for(let i=0;i<24 && i<buf.length;i++) if(buf[i]===0) return true;
  return false;
}

const maxSize = 2 * 1024 * 1024; // 2MB

function processFile(filePath){
  const rel = path.relative(root, filePath);
  try{
    const stat = fs.statSync(filePath);
    if(!stat.isFile()) return;
    if(stat.size > maxSize) return;
    if(allowedExts){
      const ext = path.extname(filePath).replace(/\./, '').toLowerCase();
      if(!allowedExts.has(ext)) return;
    }
    const data = fs.readFileSync(filePath);
    if(isBinary(data)) return;
    let content = data.toString('utf8');

    // preserve shebang
    let shebang = '';
    if(content.startsWith('#!')){
      const idx = content.indexOf('\n');
      if(idx !== -1){
        shebang = content.slice(0, idx+1);
        content = content.slice(idx+1);
      }
    }

    // remove block comments /* ... */
    content = content.replace(/\/\*[\s\S]*?\*\//g, '');

    // remove HTML comments <!-- ... -->
    content = content.replace(/<!--([\s\S]*?)-->/g, '');

    // remove // comments but avoid protocol like http:// or https://
    content = content.replace(/(^|[^:\\])\/\/.*$/gm, '$1');

    // remove lines starting with # (but not shebang which is already preserved)
    content = content.replace(/(^|\n)[ \t]*#(?!\!).*$/g, '$1');

    // collapse multiple blank lines to single (optional)
    content = content.replace(/\n{3,}/g, '\n\n');

    // trim trailing whitespace on lines
    content = content.replace(/[ \t]+$/gm, '');

    const newContent = shebang + content;
    if(newContent === data.toString('utf8')) return;

    const backupPath = path.join(backupDir, rel);
    fs.mkdirSync(path.dirname(backupPath), {recursive:true});
    fs.writeFileSync(backupPath, data);

    fs.writeFileSync(filePath, newContent, 'utf8');
    console.log('Modified', rel);
  }catch(err){
    console.error('Error processing', rel, err.message);
  }
}

function walk(dir){
  for(const name of fs.readdirSync(dir)){
    const p = path.join(dir, name);
    let stat;
    try{ stat = fs.statSync(p); }catch(e){ continue; }
    if(stat.isDirectory()){
      if(excludeDirs.has(name)) continue;
      walk(p);
    } else {
      processFile(p);
    }
  }
}

fs.mkdirSync(backupDir, {recursive:true});
console.log('Backup dir:', backupDir);
walk(root);
console.log('Done');
