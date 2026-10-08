import {mkdir,copyFile} from 'node:fs/promises';
const root=new URL('../',import.meta.url);
await mkdir(new URL('assets/vendor/',root),{recursive:true});
for(const name of ['three.module.js','three.core.js'])await copyFile(new URL('node_modules/three/build/'+name,root),new URL('assets/vendor/'+name,root));
await copyFile(new URL('node_modules/three/LICENSE',root),new URL('assets/vendor/THREE-LICENSE.txt',root));
