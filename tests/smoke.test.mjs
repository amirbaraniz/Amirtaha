import assert from 'node:assert/strict';
import {readFileSync, existsSync, readdirSync} from 'node:fs';
import {join,dirname,resolve,relative} from 'node:path';
import {fileURLToPath} from 'node:url';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const pages=[];
function walk(dir){for(const x of readdirSync(dir,{withFileTypes:true})){const p=join(dir,x.name);if(x.isDirectory()&&!['.github','scripts','tests'].includes(x.name))walk(p);else if(x.name.endsWith('.html'))pages.push(p);}}
walk(root);
assert(pages.length>=13,`Expected 13+ pages, found ${pages.length}`);
for(const f of ['index.html','assets/css/site.css','assets/js/site.js','assets/images/prfile.jpg','sw.js','favicon.ico','.github/workflows/deploy-pages.yml'])assert(existsSync(join(root,f)),f);
for(const page of pages){
 const html=readFileSync(page,'utf8');
 assert.match(html,/<html[^>]*lang="fa"/,`Missing lang ${page}`);
 assert.match(html,/<html[^>]*dir="rtl"/,`Missing dir ${page}`);
 assert.match(html,/<main[^>]*id="main"/,`Missing main ${page}`);
 assert(!html.includes('rss.xml'),`RSS remains in ${page}`);
 assert(!html.includes('contact@example.com'),`Dummy email ${page}`);
 assert(!html.includes('خوراک RSS'),`RSS link ${page}`);
 for(const m of html.matchAll(/(?:href|src|poster)="((?:\.\.?\/)+[^"?#]+)(?:[?#][^"]*)?"/g)){
   const url=m[1];if(url.startsWith('./#')||url.startsWith('../#'))continue;
   let target=resolve(dirname(page),url);
   if(!target.startsWith(root))throw Error(`Escaped root ${url} in ${page}`);
   if(!existsSync(target)){target=join(target,'index.html');assert(existsSync(target),`Missing ${url} in ${relative(root,page)}`);}
 }
}
const search=JSON.parse(readFileSync(join(root,'assets/js/search-index.json'),'utf8'));
for(const entry of search){assert(entry.url.startsWith('/'));assert(existsSync(join(root,entry.url,'index.html')),`Missing search result ${entry.url}`);}
const js=readFileSync(join(root,'assets/js/site.js'),'utf8');
assert(js.includes('tahabarani.ir@gmail.com'));
assert(!js.includes('contact@example.com'));
assert(!existsSync(join(root,'rss.xml')));
assert(!existsSync(join(root,'projects/nava-shop/index.html')));
assert(readFileSync(join(root,'index.html'),'utf8').includes('سلام امیرطاها هستم!'));
console.log(`PASS: ${pages.length} static pages, ${search.length} search results, links/branding validated.`);
