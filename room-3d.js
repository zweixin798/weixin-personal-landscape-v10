import * as THREE from './assets/vendor/three.module.js';

// Sunlit Editorial Room: material roles, not a global site recolor.
export const ROOM_PALETTE=Object.freeze({wall:'#F4EFE6',paper:'#FBF8F2',floor:'#D8B98B',woodDark:'#7A5433',wood:'#B67B45',sage:'#9BAA8A',blue:'#AFC7CF',terracotta:'#C96E4A',dock:'#3B362F',text:'#F5F0E8'});

export function createRoom({container,books,photos,onSelect,onHover,onFailure,reduced=false}) {
  const renderer=new THREE.WebGLRenderer({antialias:true,alpha:false,powerPreference:'low-power'});
  renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));
  renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFShadowMap;
  renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.08;renderer.setClearColor(ROOM_PALETTE.wall);renderer.clear();
  container.append(renderer.domElement);renderer.domElement.setAttribute('aria-hidden','true');
  const scene=new THREE.Scene();scene.background=new THREE.Color(ROOM_PALETTE.wall);scene.fog=new THREE.Fog(ROOM_PALETTE.wall,18,36);
  const camera=new THREE.PerspectiveCamera(46,1,.1,60);
  const homeCamera=new THREE.Vector3(.5,2.38,4.4),homeLook=new THREE.Vector3(0,1.50,-1.4);
  camera.position.copy(homeCamera);camera.lookAt(homeLook);
  const lights=new THREE.HemisphereLight(ROOM_PALETTE.paper,ROOM_PALETTE.floor,1.5);scene.add(lights);
  const sun=new THREE.DirectionalLight(ROOM_PALETTE.paper,2.7);sun.position.set(2.5,7,4);sun.castShadow=true;sun.shadow.mapSize.set(1024,1024);sun.shadow.camera.left=-6;sun.shadow.camera.right=6;sun.shadow.camera.top=6;sun.shadow.camera.bottom=-6;sun.shadow.normalBias=.03;sun.shadow.bias=-.0003;scene.add(sun);
  const lampLight=new THREE.PointLight('#FFE0B2',2.2,5,2);lampLight.position.set(-.8,2.7,.5);scene.add(lampLight);
  const materials=new Map();
  function mat(color,roughness=.85){const key=color+roughness;if(!materials.has(key))materials.set(key,new THREE.MeshStandardMaterial({color,roughness}));return materials.get(key);}
  function mesh(geo,material,parent=scene){const m=new THREE.Mesh(geo,material);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;}
  function box(w,h,d,color,parent=scene,x=0,y=0,z=0){const m=mesh(new THREE.BoxGeometry(w,h,d),typeof color==='string'?mat(color):color,parent);m.position.set(x,y,z);return m;}
  function cylinder(r1,r2,h,color,parent=scene,x=0,y=0,z=0){const m=mesh(new THREE.CylinderGeometry(r1,r2,h,32),typeof color==='string'?mat(color):color,parent);m.position.set(x,y,z);return m;}
  function rod(a,b,r,color,parent=scene){const from=new THREE.Vector3(...a),to=new THREE.Vector3(...b),m=cylinder(r,r,from.distanceTo(to),color,parent);m.position.copy(from).add(to).multiplyScalar(.5);m.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),to.sub(from).normalize());return m;}
  const interactive=[];const allModels=[];
  function register(group,action,label){group.userData.action=action;group.userData.label=label;group.userData.base=group.position.clone();group.userData.rotation=group.rotation.clone();group.userData.hover=0;interactive.push(group);allModels.push(group);return group;}
  function addGroup(x,y,z){const g=new THREE.Group();g.position.set(x,y,z);scene.add(g);return g;}
  const textures=[];const loader=new THREE.TextureLoader();
  function loadTexture(url){const t=loader.load(url,()=>invalidate());t.colorSpace=THREE.SRGBColorSpace;textures.push(t);return t;}
  function wrap(ctx,text,max){const words=/\s/.test(text)?text.split(' '):Array.from(text),lines=[];let line='';for(const word of words){const candidate=line+(line&&/\s/.test(text)?' ':'')+word;if(ctx.measureText(candidate).width>max&&line){lines.push(line);line=word;}else line=candidate;}if(line)lines.push(line);return lines;}
  function textTexture(book,spine=false){const canvas=document.createElement('canvas');canvas.width=spine?128:512;canvas.height=spine?768:720;const ctx=canvas.getContext('2d');ctx.fillStyle=book.color;ctx.fillRect(0,0,canvas.width,canvas.height);const hex=book.color.replace('#','');const brightness=parseInt(hex.slice(0,2),16)*.299+parseInt(hex.slice(2,4),16)*.587+parseInt(hex.slice(4,6),16)*.114;const ink=brightness>150?ROOM_PALETTE.dock:ROOM_PALETTE.paper;ctx.fillStyle=ink;ctx.textAlign='center';if(spine){ctx.translate(64,384);ctx.rotate(-Math.PI/2);ctx.font='500 29px Inter, system-ui, sans-serif';const title=book.id==='llm-scratch'?'LLM / From Scratch':book.title;ctx.fillText(title,0,9,660);}else{ctx.strokeStyle=ink+'80';ctx.lineWidth=2;ctx.strokeRect(32,32,448,656);ctx.font='600 21px Inter, system-ui, sans-serif';ctx.fillText(book.category,256,100);ctx.font='500 40px Fraunces, Georgia, serif';wrap(ctx,book.title,390).slice(0,5).forEach((line,i)=>ctx.fillText(line,256,260+i*58));ctx.font='500 19px Inter, system-ui, sans-serif';wrap(ctx,book.author,380).slice(0,3).forEach((line,i)=>ctx.fillText(line,256,585+i*29));}const t=new THREE.CanvasTexture(canvas);t.colorSpace=THREE.SRGBColorSpace;textures.push(t);return t;}
  function linedPage(){const c=document.createElement('canvas');c.width=256;c.height=384;const x=c.getContext('2d');x.fillStyle='#F6F3EA';x.fillRect(0,0,256,384);x.fillStyle='#c9c3b6';for(let y=45;y<340;y+=16)x.fillRect(30,y,190,2);const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;textures.push(t);return t;}
  const pageTexture=linedPage();
  function wallArt(){const c=document.createElement('canvas');c.width=256;c.height=320;const ctx=c.getContext('2d');ctx.fillStyle=ROOM_PALETTE.paper;ctx.fillRect(0,0,256,320);ctx.fillStyle=ROOM_PALETTE.terracotta;ctx.beginPath();ctx.arc(182,80,40,0,Math.PI*2);ctx.fill();ctx.fillStyle=ROOM_PALETTE.sage;ctx.beginPath();ctx.moveTo(0,240);ctx.quadraticCurveTo(75,70,160,230);ctx.lineTo(256,190);ctx.lineTo(256,320);ctx.lineTo(0,320);ctx.fill();ctx.fillStyle=ROOM_PALETTE.woodDark;ctx.beginPath();ctx.moveTo(0,290);ctx.quadraticCurveTo(110,180,256,285);ctx.lineTo(256,320);ctx.lineTo(0,320);ctx.fill();const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;textures.push(t);return t;}

  function bookModel(book,height=1){const g=new THREE.Group();const w=.68,h=height,d=.17;box(w-.025,h-.04,d, '#e3dfd3',g);box(w+.025,h+.02,.024,book.color,g,0,0,-d/2-.012);box(.034,h+.02,d+.04,book.color,g,-w/2,0,0);
    const pivot=new THREE.Group();pivot.position.set(-w/2,0,d/2+.012);g.add(pivot);
    const coverMaterials=Array(6).fill(mat(book.color)).slice();coverMaterials[4]=new THREE.MeshStandardMaterial({map:textTexture(book),roughness:.8});coverMaterials[5]=new THREE.MeshStandardMaterial({map:pageTexture,roughness:.95});box(w+.025,h+.02,.024,coverMaterials,pivot,w/2,0,0);
    const spine=mesh(new THREE.PlaneGeometry(d,h-.08),new THREE.MeshStandardMaterial({map:textTexture(book,true),roughness:.8}),g);spine.rotation.y=-Math.PI/2;spine.position.x=-w/2-.02;
    const rightPage=mesh(new THREE.PlaneGeometry(w-.04,h-.08),new THREE.MeshStandardMaterial({map:pageTexture,roughness:1}),g);rightPage.position.z=d/2+.005;
    g.userData.hinge=pivot;return g;}
  // Room shell and warm, diffuse light. Geometry is local; no model downloads.
  box(8.3,.14,6.1,ROOM_PALETTE.floor,scene,0,-.08,0);
  for(let i=0;i<17;i++)box(.47,.012,5.98,i%3===0?ROOM_PALETTE.floor:i%3===1?'#D1AE7E':'#DFC49F',scene,-4+i*.5,.001,0);
  box(14,7,.15,ROOM_PALETTE.wall,scene,0,3.45,-3.05);box(.15,7,6.1,ROOM_PALETTE.paper,scene,-4.15,3.45,0);
  box(14,.16,.11,ROOM_PALETTE.woodDark,scene,0,.13,-2.92);box(.11,.16,6,ROOM_PALETTE.woodDark,scene,-4.02,.13,0);
  const rug=box(4.6,.017,2.65,'#CBD4C1',scene,.1,.015,.9);for(let i=0;i<9;i++)box(4.42,.003,.045,ROOM_PALETTE.paper,scene,.1,.026,-.22+i*.28);
  // Window and picture.
  box(2.1,2.1,.10,ROOM_PALETTE.blue,scene,2.05,2.8,-2.92);box(1.92,1.91,.11,new THREE.MeshStandardMaterial({color:'#E6EFF1',emissive:ROOM_PALETTE.paper,emissiveIntensity:.35,roughness:1}),scene,2.05,2.8,-2.85);box(.06,1.98,.15,ROOM_PALETTE.blue,scene,2.05,2.8,-2.76);box(2,.06,.15,ROOM_PALETTE.blue,scene,2.05,2.8,-2.76);
  box(1.15,1.48,.09,ROOM_PALETTE.terracotta,scene,.12,2.82,-2.91);const art=mesh(new THREE.PlaneGeometry(1.02,1.34),new THREE.MeshStandardMaterial({map:wallArt()}));art.position.set(.12,2.82,-2.855);
  const shelf=addGroup(-2.48,1.65,-2.42);box(2.75,3.05,.08,ROOM_PALETTE.woodDark,shelf,0,0,-.4);for(const x of [-1.4,1.4])box(.13,3.15,.85,ROOM_PALETTE.wood,shelf,x,0,0);for(const y of [-1.54,-.12,1.5])box(2.9,.14,.92,ROOM_PALETTE.wood,shelf,0,y,0);register(shelf,{type:'books'},'Bookshelf / 书架');
  const bookModels=new Map();books.forEach((book,i)=>{const row=Math.floor(i/6),col=i%6;const h=.94+(i%3)*.08;const g=bookModel(book,h);g.position.set(-3.56+col*.40,row===0?2.14:.69,-2.20);g.rotation.y=Math.PI/2;scene.add(g);register(g,{type:'book',id:book.id},`${book.title} · ${book.author}`);bookModels.set(book.id,g);});
  // Desk, lamp and stationery.
  box(4.4,.14,1.75,ROOM_PALETTE.wood,scene,.2,1.02,.05);for(const x of [-1.78,2.18])for(const z of [-.62,.72])box(.1,1,.1,ROOM_PALETTE.woodDark,scene,x,.5,z);
  cylinder(.15,.19,.055,ROOM_PALETTE.woodDark,scene,-1.25,1.13,-.38);rod([-1.25,1.14,-.38],[-1.25,2.3,-.38],.024,ROOM_PALETTE.woodDark);rod([-1.25,2.3,-.38],[-.75,2.3,-.38],.024,ROOM_PALETTE.woodDark);cylinder(.20,.34,.29,ROOM_PALETTE.paper,scene,-.75,2.18,-.38);
  const notebook=bookModel({title:'Notebook',author:'W.Z.',category:'Notes',color:ROOM_PALETTE.blue},.76);notebook.position.set(-.95,1.15,.62);notebook.rotation.set(-Math.PI/2,0,-.15);notebook.scale.setScalar(.8);scene.add(notebook);register(notebook,{type:'notebook'},'Notebook');
  const album=bookModel({title:'Places & moments',author:'Photographs',category:'Collection',color:ROOM_PALETTE.sage},.86);album.position.set(.35,1.17,.44);album.rotation.set(-Math.PI/2,0,.16);album.scale.setScalar(1.2);scene.add(album);register(album,{type:'album'},'Photo Album / 相册');
  const deskFilm=photos.filter(p=>p.collection==='film'),deskPlaces=photos.filter(p=>(p.collection||'places')==='places');
  const deskPhotos=(deskFilm.length>=4?deskFilm:deskPlaces).slice(0,4);
  const photoModels=[];deskPhotos.forEach((photo,i)=>{const g=new THREE.Group();box(.46,.018,.59,ROOM_PALETTE.paper,g);const plane=mesh(new THREE.PlaneGeometry(.41,.49),new THREE.MeshStandardMaterial({map:loadTexture(photo.thumb||photo.src)}),g);plane.rotation.x=-Math.PI/2;plane.position.set(0,.011,-.025);g.position.set(.34+i*.025,1.29+i*.005,.45+i*.02);scene.add(g);register(g,{type:'photo',collection:photo.collection||'places',id:photo.id},photo.place||photo.alt||'打开照片');photoModels.push(g);});
  const cameraModel=addGroup(-.1,1.30,-.38);box(.65,.36,.22,ROOM_PALETTE.blue,cameraModel);box(.2,.32,.235,ROOM_PALETTE.dock,cameraModel,-.24,0,.025);const lens=cylinder(.15,.17,.17,ROOM_PALETTE.dock,cameraModel,.08,-.02,.18);lens.rotation.x=Math.PI/2;const glass=cylinder(.10,.10,.012,new THREE.MeshStandardMaterial({color:'#263d3d',metalness:.4,roughness:.2}),cameraModel,.08,-.02,.27);glass.rotation.x=Math.PI/2;box(.23,.11,.14,'#728E99',cameraModel,.07,.225,-.005);cylinder(.055,.055,.04,ROOM_PALETTE.terracotta,cameraModel,-.2,.2,0);register(cameraModel,{type:'album'},'35mm Camera / 相机');
  // CRT: screen emissive material brightens when selected.
  const crt=addGroup(1.53,1.65,-.55);box(1.16,.91,.72,ROOM_PALETTE.blue,crt);box(1.06,.8,.12,ROOM_PALETTE.paper,crt,0,0,.39);const screenMaterial=new THREE.MeshStandardMaterial({color:'#234638',emissive:'#BBD6C3',emissiveIntensity:0,roughness:.33});box(.88,.60,.02,screenMaterial,crt,-.04,.04,.461);for(let i=0;i<2;i++){const knob=cylinder(.043,.043,.04,ROOM_PALETTE.dock,crt,.43,-.18+i*.13,.48);knob.rotation.x=Math.PI/2;}box(.78,.07,.45,'#728E99',crt,0,-.5,0);rod([-.1,.5,0],[-.42,1.14,-.1],.009,'#99A5AA',crt);rod([.1,.5,0],[.44,.99,-.1],.009,'#99A5AA',crt);register(crt,{type:'screen'},'Screen / Twin Peaks · Fleabag');
  // Guitar shape, real strings, bridge and stand.
  const guitar=addGroup(2.91,1.10,-1.65);guitar.rotation.z=-.12;const shape=new THREE.Shape();shape.moveTo(0,-.55);shape.bezierCurveTo(-.6,-.53,-.53,-.03,-.31,.12);shape.bezierCurveTo(-.1,.3,-.41,.55,-.18,.69);shape.bezierCurveTo(-.06,.77,.06,.77,.18,.69);shape.bezierCurveTo(.41,.55,.1,.3,.31,.12);shape.bezierCurveTo(.53,-.03,.6,-.53,0,-.55);
  const body=mesh(new THREE.ExtrudeGeometry(shape,{depth:.18,bevelEnabled:true,bevelSegments:2,steps:1,bevelSize:.022,bevelThickness:.018,curveSegments:24}),mat(ROOM_PALETTE.wood),guitar);box(.13,1.2,.10,ROOM_PALETTE.woodDark,guitar,0,1.1,.075);box(.20,.3,.11,ROOM_PALETTE.woodDark,guitar,0,1.8,.075);const hole=mesh(new THREE.CircleGeometry(.15,32),mat('#332a22'),guitar);hole.position.set(0,.13,.203);const ring=mesh(new THREE.TorusGeometry(.17,.013,8,36),mat(ROOM_PALETTE.paper),guitar);ring.position.copy(hole.position);box(.26,.065,.03,ROOM_PALETTE.woodDark,guitar,0,-.26,.21);for(let i=0;i<6;i++)rod([-.043+i*.017,-.27,.235],[-.043+i*.017,1.87,.145],.002,'#D8DFDD',guitar);for(const y of [.60,.72,.85,.98,1.1,1.21,1.32,1.42,1.52])box(.132,.008,.012,'#ABB9B8',guitar,0,y,.13);register(guitar,{type:'music'},'Guitar / Singing');rod([2.65,.04,-1.4],[2.85,.52,-1.6],.025,ROOM_PALETTE.dock);rod([3.1,.04,-1.35],[2.85,.52,-1.6],.025,ROOM_PALETTE.dock);
  const recordPlayer=addGroup(1.68,.37,1.65);box(1.2,.2,.83,ROOM_PALETTE.paper,recordPlayer);const vinyl=cylinder(.39,.39,.035,ROOM_PALETTE.dock,recordPlayer,0,.13,0);box(.035,.003,.10,ROOM_PALETTE.terracotta,vinyl,.26,.02,0);cylinder(.12,.12,.037,ROOM_PALETTE.terracotta,recordPlayer,0,.135,0);for(let i=0;i<7;i++){const r=mesh(new THREE.TorusGeometry(.17+i*.03,.0025,5,48),mat('#606663'),recordPlayer);r.rotation.x=Math.PI/2;r.position.y=.151;}rod([.45,.14,-.29],[.32,.19,.14],.012,ROOM_PALETTE.blue,recordPlayer);register(recordPlayer,{type:'music'},'The Beatles / Vinyl');
  // Small plants soften the room without heavy imported models.
  function plant(x,y,z,scale){const g=addGroup(x,y,z);g.scale.setScalar(scale);cylinder(.21,.15,.35,ROOM_PALETTE.terracotta,g,0,.175,0);for(let i=0;i<6;i++){const leaf=mesh(new THREE.SphereGeometry(.18,12,8),mat(i%2?ROOM_PALETTE.sage:'#859B76'),g);leaf.scale.set(.55,2.3,.45);leaf.position.set(Math.cos(i)*.16,.57+(i%3)*.1,Math.sin(i)*.16);leaf.rotation.z=Math.cos(i)*.45;}return g;}
  plant(-3.52,0,.05,1.3);plant(.62,1.09,-.58,.55);
  const raycaster=new THREE.Raycaster(),pointer=new THREE.Vector2();let active=false,disposed=false,frameId=0,renderCount=0,hovered=null,selection=null,focusAmount=0,tween=null,entry=null,entryAmount=1,reading=false,reducedMotion=reduced;
  let parallax={x:0,y:0,tx:0,ty:0};
  function findHit(event){const rect=renderer.domElement.getBoundingClientRect();pointer.set((event.clientX-rect.left)/rect.width*2-1,-(event.clientY-rect.top)/rect.height*2+1);raycaster.setFromCamera(pointer,camera);for(const hit of raycaster.intersectObjects(interactive,true)){let root=hit.object;while(root&&!root.userData.action)root=root.parent;if(root)return root;}return null;}
  function pointerMove(event){if(selection)return;const r=renderer.domElement.getBoundingClientRect();parallax.tx=(event.clientX-r.left)/r.width-.5;parallax.ty=(event.clientY-r.top)/r.height-.5;hovered=findHit(event);renderer.domElement.style.cursor=hovered?'pointer':'default';onHover(hovered?{text:hovered.userData.label,x:event.clientX-r.left,y:event.clientY-r.top}:null);invalidate();}
  function pointerLeave(){hovered=null;parallax.tx=parallax.ty=0;onHover(null);invalidate();}
  function click(event){if(selection)return;const hit=findHit(event);if(hit)onSelect(hit.userData.action);}
  renderer.domElement.addEventListener('pointermove',pointerMove);renderer.domElement.addEventListener('pointerleave',pointerLeave);renderer.domElement.addEventListener('click',click);
  const clamp=(x,a=0,b=1)=>Math.max(a,Math.min(b,x));const smooth=x=>x*x*(3-2*x);
  const targets={books:new THREE.Vector3(-2.15,1.9,-1.8),book:new THREE.Vector3(0,2.0,.8),album:new THREE.Vector3(.35,1.2,.5),photo:new THREE.Vector3(.35,1.2,.5),music:new THREE.Vector3(1.6,1.35,-.5),screen:new THREE.Vector3(1.53,1.65,-.55),notebook:new THREE.Vector3(-.95,1.2,.62)};
  function pose(time){
    let moving=false;
    if(entry){const fraction=clamp((time-entry.start)/entry.duration);entryAmount=smooth(fraction);moving=fraction<1;if(fraction===1){const resolve=entry.resolve;entry=null;resolve(true);}}
    renderer.toneMappingExposure=.98+.10*entryAmount;
    if(tween){const f=clamp((time-tween.start)/tween.duration);focusAmount=THREE.MathUtils.lerp(tween.from,tween.to,smooth(f));moving=moving||f<1;if(f===1){const done=tween.resolve;tween=null;if(focusAmount===0)selection=null;done?.(true);}}
    for(const model of allModels){model.visible=!(reading&&selection?.type==='book'&&model.userData.action.id===selection.id);model.position.copy(model.userData.base);model.rotation.copy(model.userData.rotation);if(bookModels.has(model.userData.action.id))model.scale.setScalar(1);const next=(!selection&&model===hovered)?1:0;model.userData.hover=reducedMotion?next:THREE.MathUtils.lerp(model.userData.hover,next,.15);if(Math.abs(next-model.userData.hover)>.002)moving=true;model.position.z+=model.userData.hover*(model.userData.action.type==='book'?.19:.04);if(model.userData.action.type!=='book')model.position.y+=model.userData.hover*.035;if(model.userData.hinge)model.userData.hinge.rotation.y=0;}
    const p=focusAmount;if(selection){
      const type=selection.type;
      if(type==='book'){const model=bookModels.get(selection.id);if(model){const extracted=model.userData.base.clone().add(new THREE.Vector3(0,0,.6));const draw=smooth(clamp(p/.25)),center=smooth(clamp((p-.25)/.40)),open=smooth(clamp((p-.66)/.30));model.position.copy(model.userData.base).lerp(extracted,draw).lerp(targets.book,center);model.rotation.y=THREE.MathUtils.lerp(Math.PI/2,0,center);model.rotation.x=-.08*center;model.scale.setScalar(1+center*.42);model.userData.hinge.rotation.y=-Math.PI*.96*open;model.position.x+=.48*open;}}
      if(type==='album'||type==='photo'){album.userData.hinge.rotation.y=-Math.PI*.88*p;photoModels.forEach((m,i)=>{m.position.x+=(i-1.5)*.32*p;m.position.z+=((i%2)*.4+.20)*p;m.position.y+=.035*i*p;m.rotation.y=(i-1.5)*.14*p;});}
      if(type==='notebook')notebook.userData.hinge.rotation.y=-Math.PI*.8*p;
      if(type==='music'){guitar.position.z+=.3*p;guitar.position.y+=.1*p;if(!reducedMotion){vinyl.rotation.y=time*.00016;moving=true;}}
      screenMaterial.emissiveIntensity=type==='screen'?p*.65:0;
    }else screenMaterial.emissiveIntensity=0;
    parallax.x=reducedMotion?0:THREE.MathUtils.lerp(parallax.x,parallax.tx,.065);parallax.y=reducedMotion?0:THREE.MathUtils.lerp(parallax.y,parallax.ty,.065);if(Math.abs(parallax.x-parallax.tx)>.002||Math.abs(parallax.y-parallax.ty)>.002)if(!reducedMotion)moving=true;
    const look=homeLook.clone(),position=homeCamera.clone();if(selection){const target=targets[selection.type]||targets.books;look.lerp(target,p);const zoom=selection.type==='books'?new THREE.Vector3(-1.2,2.28,1.4):selection.type==='book'?new THREE.Vector3(.15,2.38,3.7):new THREE.Vector3(target.x+1.4,target.y+.8,target.z+3.4);position.lerp(zoom,p);}
    position.z+=.42*(1-entryAmount)*(1-p);position.y+=.04*(1-entryAmount)*(1-p);
    position.x+=parallax.x*.20*(1-p);position.y-=parallax.y*.10*(1-p);camera.position.copy(position);camera.lookAt(look);return moving;
  }
  function tick(time){frameId=0;if(!active||disposed)return;const moving=pose(time);renderer.render(scene,camera);renderCount++;if(moving)invalidate();}
  function invalidate(){if(active&&!disposed&&!frameId)frameId=requestAnimationFrame(tick);}
  function resize(){if(disposed)return;const r=container.getBoundingClientRect();if(r.width<1||r.height<1)return;renderer.setSize(r.width,r.height,false);camera.aspect=r.width/r.height;camera.updateProjectionMatrix();invalidate();}
  const resizeObserver=new ResizeObserver(resize);resizeObserver.observe(container);
  function animate(to){if(tween)tween.resolve(false);if(!active){focusAmount=to;tween=null;if(to===0)selection=null;return Promise.resolve(true);}return new Promise(resolve=>{tween={from:focusAmount,to,start:performance.now(),duration:reducedMotion?1:to?1600:850,resolve};invalidate();});}
  function finishEntry(){if(entry){entry.resolve(false);entry=null;}entryAmount=1;invalidate();}
  const onLost=event=>{event.preventDefault();active=false;finishEntry();cancelAnimationFrame(frameId);frameId=0;if(tween){tween.resolve(false);tween=null;}onFailure('3D 暂时不可用，可继续使用下方物件入口。');};
  renderer.domElement.addEventListener('webglcontextlost',onLost);
  return {
    prepareEntry(){finishEntry();entryAmount=reducedMotion?1:0;invalidate();},
    enter(){finishEntry();if(reducedMotion||!active)return Promise.resolve(true);entryAmount=0;return new Promise(resolve=>{entry={start:performance.now(),duration:800,resolve};invalidate();});},
    finishEntry,
    setReading(value){reading=value;invalidate();},
    focus(action){finishEntry();reading=false;selection=action;focusAmount=0;hovered=null;onHover(null);return animate(1);},
    reset(){reading=false;return animate(0);},
    setActive(value){active=value;if(!value){finishEntry();cancelAnimationFrame(frameId);frameId=0;if(tween){const settle=tween.resolve;tween=null;settle(false);}}else{resize();invalidate();}},
    setReduced(value){reducedMotion=value;if(value){finishEntry();parallax.tx=parallax.ty=0;if(tween)tween.duration=1;}invalidate();},
    resize,
    render:invalidate,
    dispose(){disposed=true;active=false;finishEntry();cancelAnimationFrame(frameId);resizeObserver.disconnect();tween?.resolve(false);scene.traverse(o=>{o.geometry?.dispose();if(o.material){for(const m of Array.isArray(o.material)?o.material:[o.material])m.dispose();}});textures.forEach(t=>t.dispose());renderer.dispose();renderer.domElement.remove();},
    getDiagnostics(){return {entering:Boolean(entry),frames:renderCount,drawCalls:renderer.info.render.calls,triangles:renderer.info.render.triangles,geometries:renderer.info.memory.geometries,textures:renderer.info.memory.textures,active};}
  };
}
