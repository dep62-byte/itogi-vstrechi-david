import {readFileSync,readdirSync,lstatSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {join,relative} from 'node:path';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
const root=fileURLToPath(new URL('../',import.meta.url));
const skill=join(root,'skill/itogi-vstrechi-david');
const body=readFileSync(join(skill,'SKILL.md'),'utf8');
assert.match(body,/^---\nname: itogi-vstrechi-david\ndescription: ".*"\n---/);
assert.ok(!body.includes('4 квартала'));
for(const token of ['3 спринта по 4 месяца','format:david','FINAL_CLOUD','EVIDENCE_GAP'])assert.ok(body.includes(token),token);
for(const match of body.matchAll(/`(references\/[^`]+\.(?:json|md))`/g))assert.ok(lstatSync(join(skill,match[1])).isFile(),match[1]);
const claims=JSON.parse(readFileSync(join(skill,'references/claims.json'),'utf8'));
assert.equal(new Set(claims.map(x=>x.id)).size,claims.length);
assert.match(claims.find(x=>x.id==='PRICE-1').text,/27 000/);
assert.match(claims.find(x=>x.id==='PRICE-2').text,/13 500/);
assert.equal(claims.find(x=>x.id==='PROD-9').status,'CONFLICT');
const cases=JSON.parse(readFileSync(join(skill,'references/cases.json'),'utf8'));
for(const c of cases){assert.ok(['idea','prototype','in_use','measured'].includes(c.readiness));if(c.image){const h=createHash('sha256').update(readFileSync(join(skill,c.image))).digest('hex');assert.equal(h,c.sha256,c.id);}}
function walk(dir){return readdirSync(dir).flatMap(n=>{const p=join(dir,n);assert.ok(!lstatSync(p).isSymbolicLink(),p);return lstatSync(p).isDirectory()?walk(p):[p];});}
for(const p of walk(skill)){
 const name=relative(skill,p);assert.ok(/\.(md|json|png|jpg)$/.test(name),name);
 if(/\.(md|json)$/.test(p)){const s=readFileSync(p,'utf8');assert.ok(!/\/Users\/|\/private\//.test(s),name);assert.ok(!/gh[pousr]_[A-Za-z0-9]{20,}|AIza[A-Za-z0-9_-]{25,}|-----BEGIN .*PRIVATE KEY-----/.test(s),name);}
}
console.log(JSON.stringify({status:'passed',claims:claims.length,cases:cases.length,images:cases.filter(x=>x.image).length,skillFiles:walk(skill).length}));
