import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,readFileSync,existsSync,writeFileSync,mkdirSync,rmSync,symlinkSync,readlinkSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {install} from '../scripts/install.mjs';
function temp(t){const p=mkdtempSync(join(tmpdir(),'david-install-'));t.after(()=>rmSync(p,{recursive:true,force:true}));return p;}
test('installs complete portable package without external dependencies',t=>{const p=join(temp(t),'target');install(p);assert.match(readFileSync(join(p,'SKILL.md'),'utf8'),/name: itogi-vstrechi-david/);assert.ok(existsSync(join(p,'references/claims.json')));assert.ok(existsSync(join(p,'assets/hr.png')));});
test('backs up previous managed version',t=>{const p=join(temp(t),'target');install(p);writeFileSync(join(p,'my-change.txt'),'keep');const r=install(p,join(p,'..','backups'));assert.equal(readFileSync(join(r.backup,'my-change.txt'),'utf8'),'keep');assert.ok(!existsSync(join(p,'my-change.txt')));});
test('does not overwrite unmanaged directory',t=>{const p=join(temp(t),'target');mkdirSync(p);writeFileSync(join(p,'custom'),'keep');assert.throws(()=>install(p),/ручной/);assert.equal(readFileSync(join(p,'custom'),'utf8'),'keep');});
test('does not follow target symlink',t=>{const root=temp(t),real=join(root,'real'),p=join(root,'target');install(real);symlinkSync(real,p,'dir');assert.throws(()=>install(p),/ручной/);assert.ok(existsSync(join(real,'SKILL.md')));});

test('preserves dangling unmanaged symlink',t=>{const root=temp(t),p=join(root,'target'),missing=join(root,'missing');symlinkSync(missing,p,'dir');assert.throws(()=>install(p),/ручной/);assert.equal(readlinkSync(p),missing);});
