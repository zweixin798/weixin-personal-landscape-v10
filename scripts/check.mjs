import {readFile,access,stat} from 'node:fs/promises';
import vm from 'node:vm';
const html=await readFile('index.html','utf8');
const errors=[];
const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);
for(const id of ids)if(ids.indexOf(id)!==ids.lastIndexOf(id))errors.push(`Duplicate id: ${id}`);
for(const [,ref]of html.matchAll(/(?:src|href)="([^"]+)"/g)){
 if(ref.startsWith('#')){if(!ids.includes(ref.slice(1)))errors.push(`Missing anchor: ${ref}`)}
 else if(!/^(?:data:|https?:|mailto:)/.test(ref)){try{await access(ref)}catch{errors.push(`Missing asset: ${ref}`)}}
}
for(const file of ['app.js','content.js','scenes.js']){try{new vm.Script(await readFile(file,'utf8'))}catch(e){errors.push(`${file}: ${e.message}`)}}
const context={window:{}};vm.runInNewContext(await readFile('content.js','utf8'),context);const content=context.window.SITE_CONTENT;
for(const asset of [content.portrait?.src,...content.photos.flatMap(p=>[p.src,p.thumb].filter(Boolean)),content.contact.resume].filter(Boolean)){
 if(/^(https?:|\/)/.test(asset)){errors.push(`Expected bundled relative asset: ${asset}`);continue}try{await access(asset)}catch{errors.push(`Missing supplied asset: ${asset}`)}
}
const scenes=[...html.matchAll(/<section[^>]+data-title=/g)];
if(scenes.length!==9)errors.push('Expected nine V10 screens');
if([...html.matchAll(/data-object=/g)].length!==5)errors.push('Expected five private objects');
for(const fact of ['2025.09–2025.12','2026.02–2026.08','2026.09–至今','3.94/4','3.70/4','Her Rhythm','LangGraph.js','PostgreSQL / Redis'])if(!html.includes(fact))errors.push(`Missing required fact: ${fact}`);
if(/<details|class="path-extra"|CASE 0|Her Rhyme|Building systems/.test(html))errors.push('Outdated V3 content remains');
if(errors.length){console.error(errors.join('\n'));process.exit(1)}
console.log(`PASS: ${ids.length} unique anchors, local asset references, JavaScript syntax, configured images and V10 content requirements.`);
if(!content.portrait)console.log('PENDING: personal portrait; original abstract artwork used instead.');
if(content.photos.length<6)console.log('PENDING: 6–10 personal travel photos; album shows an honest empty state.');
if(!Object.values(content.contact).some(Boolean))console.log('PENDING: public contact and resume; absent links are not shown.');
