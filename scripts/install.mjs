import { cpSync, existsSync, lstatSync, mkdirSync, readFileSync, renameSync, rmSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { dirname, join, resolve, sep } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { randomUUID } from 'node:crypto';
const source=fileURLToPath(new URL('../skill/itogi-vstrechi-david',import.meta.url));
const marker='.david-managed';
const identity='itogi-vstrechi-david';
function targetExists(p){try{lstatSync(p);return true;}catch(e){if(e.code==='ENOENT')return false;throw e;}}
export function install(target, backupRoot=join(homedir(),'.local','share','itogi-vstrechi-david','backups')){
 target=resolve(target);
 if(target===source || source.startsWith(target+sep) || target.startsWith(source+sep)) throw Error('Нельзя устанавливать внутрь исходного пакета или поверх него.');
 let backup=null;
 if(targetExists(target)){
  if(lstatSync(target).isSymbolicLink() || !existsSync(join(target,marker)) || readFileSync(join(target,marker),'utf8').trim()!==identity) throw Error('Цель содержит чужой или ручной скилл. Он не изменён.');
 }
 const stage=target+'.install-'+randomUUID();
 mkdirSync(dirname(target),{recursive:true});
 try{
  cpSync(source,stage,{recursive:true,errorOnExist:true,force:false});
  writeFileSync(join(stage,marker),identity+'\n');
  if(targetExists(target)){backup=join(resolve(backupRoot),randomUUID());mkdirSync(dirname(backup),{recursive:true});renameSync(target,backup);}
  try{renameSync(stage,target);}catch(e){if(backup)renameSync(backup,target);throw e;}
 }catch(e){rmSync(stage,{recursive:true,force:true});throw e;}
 return {target,backup};
}
function main(){
 if(Number(process.versions.node.split('.')[0])<20)throw Error('Нужен Node.js 20+.');
 const [engine='codex',custom]=process.argv.slice(2);
 if(!['codex','claude','directory'].includes(engine)||(engine==='directory'&&!custom))throw Error('node scripts/install.mjs codex|claude|directory [path]');
 const target=engine==='directory'?resolve(custom):join(homedir(),'.'+engine,'skills',identity);
 console.log(JSON.stringify(install(target),null,2));
 console.log('Откройте новый чат. Команда: Примени «Итоги встречи Давид».');
}
if(process.argv[1]&&import.meta.url===pathToFileURL(resolve(process.argv[1])).href){try{main();}catch(e){console.error(e.message);process.exitCode=1;}}
