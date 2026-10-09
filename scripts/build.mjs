import {mkdir,copyFile,cp,rm,readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
const root=path.resolve(fileURLToPath(new URL('..',import.meta.url)));
const dist=path.join(root,'dist');
await rm(dist,{recursive:true,force:true});await mkdir(dist,{recursive:true});
for(const file of ['index.html','styles.css','app.js','content.js','scenes.js','scenes.css','experience.js','experience.css','education.js','education.css','private-room.js','private-room.css','typography.css','room-3d.js','.nojekyll'])await copyFile(path.join(root,file),path.join(dist,file));
await cp(path.join(root,'assets'),path.join(dist,'assets'),{recursive:true});
console.log('Built static website in dist/. Three.js is bundled locally; no external CDN requests.');
