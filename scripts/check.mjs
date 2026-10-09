import {readFile,access,stat} from 'node:fs/promises';
import vm from 'node:vm';
import {execFileSync} from 'node:child_process';
const html=await readFile('index.html','utf8');
const errors=[];
const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);
for(const id of ids)if(ids.indexOf(id)!==ids.lastIndexOf(id))errors.push(`Duplicate id: ${id}`);
for(const [,ref]of html.matchAll(/(?:src|href)="([^"]+)"/g)){
 if(ref.startsWith('#')){if(!ids.includes(ref.slice(1)))errors.push(`Missing anchor: ${ref}`)}
 else if(!/^(?:data:|https?:|mailto:)/.test(ref)){try{await access(ref)}catch{errors.push(`Missing asset: ${ref}`)}}
}
for(const file of ['app.js','content.js','scenes.js','experience.js','education.js']){try{new vm.Script(await readFile(file,'utf8'))}catch(e){errors.push(`${file}: ${e.message}`)}}
for(const file of ['private-room.js','room-3d.js']){try{execFileSync(process.execPath,['--check',file],{stdio:'pipe'});}catch{errors.push(`Invalid module syntax: ${file}`)}}
const context={window:{}};vm.runInNewContext(await readFile('content.js','utf8'),context);const content=context.window.SITE_CONTENT;
for(const asset of [content.portrait?.src,...content.photos.flatMap(p=>[p.src,p.thumb].filter(Boolean)),content.contact.resume].filter(Boolean)){
 if(/^(https?:|\/)/.test(asset)){errors.push(`Expected bundled relative asset: ${asset}`);continue}try{await access(asset)}catch{errors.push(`Missing supplied asset: ${asset}`)}
}
const sceneIds=[...html.matchAll(/<section id="([^"]+)"[^>]+data-title=/g)].map(m=>m[1]);
const expected=['home','experience','project','education','private','ending'];
if(JSON.stringify(sceneIds)!==JSON.stringify(expected))errors.push('Scene structure does not match current page order');
if([...html.matchAll(/data-object=/g)].length!==5)errors.push('Expected five private objects');
for(const fact of ['2025.09–2025.12','2026.02–2026.08','2026.09–至今','3.94/4','3.70/4','Her Rhythm','LangGraph.js','PostgreSQL / Redis'])if(!html.includes(fact))errors.push(`Missing required fact: ${fact}`);
for(const name of ['three.module.js','three.core.js']){try{await access('assets/vendor/'+name)}catch{errors.push('Run npm run vendor to bundle '+name)}}
if(!Array.isArray(content.books)||content.books.filter(b=>b.featured).length<6)errors.push('Six featured reading entries are required');
for(const b of content.books||[])if(!b.id||!b.title||!b.author||!('notes' in b))errors.push('Incomplete book data');
const publicText=html+(await Promise.all(['app.js','content.js','private-room.js','experience.js'].map(file=>readFile(file,'utf8')))).join('');
if(/Her Rhyme|野心|Building systems/.test(publicText))errors.push('Removed content remains in public sources');
const experience=html.slice(html.indexOf('<section id="experience"'),html.indexOf('<section id="project"'));
if((experience.match(/class="company-stop /g)||[]).length!==3||(experience.match(/class="experience-rail"/g)||[]).length!==1)errors.push('Experience requires one shared path and three company cards');
if((experience.match(/class="node-orbit"/g)||[]).length!==2)errors.push('Only DeepWisdom and Baidu have keyword expansions');
if(experience.includes('独立项目'))errors.push('Repeated project link in experience');
if((experience.match(/class="work-visual"/g)||[]).length!==9||experience.includes('mini-flow'))errors.push('Experience needs nine concrete SVG illustrations');
if(!html.includes('<article id="understanding"')||!html.includes('id="question-shift"')||!html.includes('class="education-map"'))errors.push('Education needs one horizontal map with three internal articles');
if(!(await readFile('styles.css','utf8')).includes('--ivory:#F6F3EA'))errors.push('Ivory token must be #F6F3EA');
if(errors.length){console.error(errors.join('\n'));process.exit(1)}
console.log(`PASS: ${ids.length} unique anchors, local asset references, JavaScript syntax, configured images and current six-scene content requirements.`);
if(!content.portrait)console.log('PENDING: personal portrait; original abstract artwork used instead.');
if(content.photos.length<6)console.log('PENDING: 6–10 personal travel photos; album shows an honest empty state.');
if(!Object.values(content.contact).some(Boolean))console.log('PENDING: public contact and resume; absent links are not shown.');
