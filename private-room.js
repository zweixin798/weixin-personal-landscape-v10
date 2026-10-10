const data=window.SITE_CONTENT||{};
const books=data.books||[],photos=data.photos||[];
const places=photos.filter(p=>(p.collection||'places')==='places');
const film=photos.filter(p=>p.collection==='film');
const section=document.querySelector('#private');
const stage=document.querySelector('#private-stage');
const container=document.querySelector('#room-canvas');
const status=document.querySelector('#room-status');
const label=document.querySelector('#room-hover-label');
const desktop=matchMedia('(min-width: 760px)');
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
const esc=text=>String(text??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function bookInk(color){const h=color.replace('#','');return parseInt(h.slice(0,2),16)*.299+parseInt(h.slice(2,4),16)*.587+parseInt(h.slice(4,6),16)*.114>150?'#3B362F':'#FBF8F2';}
function photoURL(path){try{const u=new URL(path,location.href);return typeof path==='string'&&u.origin===location.origin&&['http:','https:'].includes(u.protocol)?u.href:'';}catch{return '';}}
const overlay=document.createElement('section');overlay.className='room-overlay';overlay.hidden=true;overlay.setAttribute('role','dialog');overlay.setAttribute('aria-modal','true');overlay.setAttribute('aria-labelledby','room-panel-title');
overlay.innerHTML='<div class="room-panel-top"><span class="eyebrow">Private Collection</span><button class="overlay-close" aria-label="关闭收藏，返回房间">返回房间 ×</button></div><div class="room-panel-content"></div>';
section.append(overlay);
const panel=overlay.querySelector('.room-panel-content');
const returning=document.createElement('button');returning.className='room-return';returning.textContent='返回房间 ×';returning.hidden=true;section.append(returning);
const bgm=document.createElement('div');bgm.className='room-bgm';bgm.id='room-bgm';bgm.hidden=true;
bgm.innerHTML='<button class="bgm-cue" type="button"><span class="bgm-disc" aria-hidden="true"></span><span class="bgm-text"><b>Between the Bars</b><small>Elliott Smith · 点一下，放首歌 ♪</small></span></button><div class="bgm-player" hidden><iframe title="Between the Bars — Elliott Smith" width="300" height="152" frameborder="0" allow="autoplay; clipboard-write; encrypted-media; picture-in-picture"></iframe><button class="bgm-close" type="button" aria-label="关闭背景音乐">×</button></div>';
section.append(bgm);
const bgmCue=bgm.querySelector('.bgm-cue'),bgmPlayer=bgm.querySelector('.bgm-player'),bgmFrame=bgm.querySelector('iframe'),bgmClose=bgm.querySelector('.bgm-close');
const BGM_SRC='https://open.spotify.com/embed/track/52Bg6oaos7twR7IUtEpqcE?utm_source=generator&theme=0';
let bgmOn=false;
function setBgm(on){
  if(on&&!bgmOn){bgm.hidden=false;bgmOn=true;}
  else if(!on&&bgmOn){bgmFrame.src='about:blank';bgmPlayer.hidden=true;bgmCue.hidden=false;bgm.hidden=true;bgmOn=false;}
}
bgmCue.addEventListener('click',()=>{bgmFrame.src=BGM_SRC;bgmCue.hidden=true;bgmPlayer.hidden=false;});
bgmClose.addEventListener('click',()=>setBgm(false));
let engine=null,loading=null,failed=false,sequence=0,lastTrigger=null,locked=[],currentAction=null;
let wasRoomActive=false,entryTicket=0,entryFrameA=0,entryFrameB=0;
function inRoom(){return !document.documentElement.classList.contains('scene-mode')||section.classList.contains('is-current');}
function setLocked(value){
  if(value&&!document.body.classList.contains('room-exploring')){locked=[section.querySelector('.scene-scroll'),document.querySelector('.site-header'),document.querySelector('.scene-controls')].filter(Boolean).map(el=>({el,inert:el.inert}));locked.forEach(({el})=>el.inert=true);document.body.classList.add('room-exploring');}
  if(!value){locked.forEach(({el,inert})=>el.inert=inert);locked=[];document.body.classList.remove('room-exploring');}
}
function showPanel(action){
  currentAction=action;engine?.setReading(action.type==='book');overlay.className='room-overlay panel-'+action.type;
  if(action.type==='books'){
    const mail=(data.contact&&data.contact.email)||'';
    panel.innerHTML='<h2 id="room-panel-title">最近两年读的书</h2><p class="shelf-intro"><span>Books I’ve read in the last two years.</span>'+(mail?' · <a class="shelf-mail" href="mailto:'+esc(mail)+'">Always happy to talk about these books — 欢迎邮件交流 ✉</a>':'')+'</p><div class="shelf-browser">'+books.map(b=>`<button class="shelf-book" data-book-id="${esc(b.id)}" style="--book-color:${esc(b.color)};--book-ink:${bookInk(b.color)}" aria-label="打开 ${esc(b.title)}"><small>${esc(b.category)}</small><strong>${esc(b.title)}</strong><span>${esc(b.author)}</span></button>`).join('')+'</div>';
  }else if(action.type==='book'){
    const b=books.find(b=>b.id===action.id);if(!b)return;
    const index=books.indexOf(b);
    panel.innerHTML=`<div class="reading-spread single-col" style="--book-color:${esc(b.color)}"><article class="reading-page left-page"><span class="eyebrow">${esc(b.category)}${b.year?' / '+esc(b.year):''}</span><h2 id="room-panel-title">${esc(b.title)}</h2><p class="book-author">${esc(b.author)}</p><div class="book-intro">${b.intro?esc(b.intro):'书籍简介待补充。'}</div><span class="page-number">01</span></article></div><div class="reading-navigation"><button data-book-id="${esc(books[(index+books.length-1)%books.length].id)}">← 上一本</button><button data-room-panel="books">回到书架目录</button><button data-book-id="${esc(books[(index+1)%books.length].id)}">下一本 →</button></div>`;
  }else if(action.type==='album'){
    panel.innerHTML='<h2 id="room-panel-title">Places & moments.</h2><p class="album-intro">I shoot on 35mm film and Polaroid — for the grain, the instant light, and moments worth keeping.</p><div class="album-collections"><button class="collection-card places-card" data-room-panel="places"><b>Places</b><span>去过的地方 · 不完全统计</span><em>'+places.length+'</em></button><button class="collection-card film-card" data-room-panel="film"><b>Film &amp; Polaroid</b><span>胶片与宝丽来</span><em>'+film.length+'</em></button></div>';
  }else if(action.type==='places'||action.type==='film'){
    const list=action.type==='places'?places:film;
    const heading=action.type==='places'?'Places · 去过的地方':'Film &amp; Polaroid · 胶片与宝丽来';
    const note=action.type==='places'?'不完全统计——没有认真记录都去过哪些地方，想起来再补 :)':'35mm 胶片与宝丽来，冲洗、扫描之后慢慢放上来。';
    panel.innerHTML='<h2 id="room-panel-title">'+heading+'</h2><p class="sheet-note">'+note+'</p>'+(list.length?'<div class="contact-sheet">'+list.map((p,i)=>`<button data-room-photo="${esc(p.collection||'places')}" data-room-photo-id="${esc(p.id)}" class="contact-photo" style="--tilt:${[-4,3,-2,4][i%4]}deg" aria-label="放大照片：${esc(p.alt||p.place||'照片')}"><img src="${esc(photoURL(p.thumb||p.src))}" alt="${esc(p.alt||'照片')}" width="480" height="600" loading="lazy"><span>${esc(p.place)} ${esc(p.date)}</span><small>${String(i+1).padStart(2,'0')}</small></button>`).join('')+'</div>':'<p class="sheet-empty">胶片还在冲洗，稍后回来。</p>')+'<p><button class="back-to-album" data-room-panel="album">← 回相册</button></p>';
  }else if(action.type==='photo'){
    const p=photos.find(x=>x.id===action.id);if(!p)return;
    const back=p.collection||'places';
    panel.innerHTML=`<h2 id="room-panel-title" class="sr-only">${esc(p.alt||'照片详情')}</h2><button class="back-to-album" data-room-panel="${back}">← 返回${back==='film'?'胶片与宝丽来':'去过的地方'}</button><figure class="room-photo-large"><img src="${esc(photoURL(p.src))}" alt="${esc(p.alt||'照片')}"><figcaption>${esc(p.place)} ${esc(p.date)}</figcaption></figure>`;
  }else if(action.type==='music'){
    panel.innerHTML='<h2 id="room-panel-title">The Beatles</h2><div class="music-reading"><div class="record" aria-hidden="true"></div><p>Guitar / Singing<br>吉他 / 弹唱</p></div>';
  }else if(action.type==='screen'){
    panel.innerHTML='<h2 id="room-panel-title">Screen</h2><div class="screen-posters"><article class="show-poster twin-peaks"><span>Series / 01</span><div class="curtains" aria-hidden="true"></div><h3>Twin<br>Peaks</h3></article><article class="show-poster fleabag"><span>Series / 02</span><div class="poster-ring" aria-hidden="true"></div><h3>Fleabag</h3></article></div><div class="screen-note">Mockumentary / Pseudo-documentary</div>';
  }else if(action.type==='notebook'){
    panel.innerHTML='<h2 id="room-panel-title">Notebook</h2><div class="notebook-page"><span class="eyebrow">Notes</span><div class="notebook-keywords">'+(data.notebook||[]).map(word=>`<span>${esc(word)}</span>`).join('')+'</div></div>';
  }
  overlay.hidden=false;overlay.scrollTop=0;returning.hidden=true;overlay.querySelector('.overlay-close').focus({preventScroll:true});
}
async function explore(action,trigger){
  const ticket=++sequence;
  settleEntry();
  const dockType=action.type==='book'?'books':['photo','places','film'].includes(action.type)?'album':action.type;
  if(!document.body.classList.contains('room-exploring'))lastTrigger=trigger||stage.querySelector(`[data-room-action="${dockType}"]`);
  setLocked(true);overlay.hidden=true;returning.hidden=false;returning.focus({preventScroll:true});stage.classList.add('room-focused');stage.dataset.interaction='focusing';label.hidden=true;
  const cameraType=['photo','places','film'].includes(action.type)?'album':action.type;
  if(engine&&desktop.matches&&inRoom())await engine.focus({...action,type:cameraType});
  if(ticket!==sequence)return;
  stage.dataset.interaction='reading';showPanel(action);
}
async function close(){
  const ticket=++sequence;overlay.hidden=true;returning.hidden=true;stage.classList.remove('room-focused');stage.dataset.interaction='returning';
  if(engine)await engine.reset();
  if(ticket!==sequence)return;
  setLocked(false);currentAction=null;stage.dataset.interaction='idle';if(inRoom()&&lastTrigger?.isConnected)lastTrigger.focus({preventScroll:true});
}
section.addEventListener('click',event=>{
  const book=event.target.closest('[data-book-id]');if(book){explore({type:'book',id:book.dataset.bookId},lastTrigger);return;}
  const photo=event.target.closest('[data-room-photo]');if(photo){showPanel({type:'photo',collection:photo.dataset.roomPhoto,id:photo.dataset.roomPhotoId});return;}
  const back=event.target.closest('[data-room-panel]');if(back){if(back.dataset.roomPanel==='books')explore({type:'books'},lastTrigger);else showPanel({type:back.dataset.roomPanel});return;}
  const object=event.target.closest('[data-object],[data-room-action]');if(object)explore({type:object.dataset.object||object.dataset.roomAction},object);
});
overlay.querySelector('.overlay-close').addEventListener('click',close);returning.addEventListener('click',close);
document.addEventListener('keydown',event=>{
  if(!document.body.classList.contains('room-exploring'))return;
  if(event.key==='Escape'){event.preventDefault();event.stopPropagation();close();}
  if(event.key==='Tab'){const scope=overlay.hidden?returning:overlay;const items=scope===returning?[returning]:[...scope.querySelectorAll('button:not(:disabled),a[href],[tabindex="0"]')].filter(e=>!e.hidden);if(!items.length)return;const first=items[0],last=items.at(-1);if(event.shiftKey&&(document.activeElement===first||!scope.contains(document.activeElement))){event.preventDefault();last.focus();}else if(!event.shiftKey&&(document.activeElement===last||!scope.contains(document.activeElement))){event.preventDefault();first.focus();}}
},true);
function fallback(message){settleEntry();failed=true;engine?.setActive(false);stage.classList.remove('has-webgl');stage.dataset.renderMode='fallback';status.textContent=message;}
async function loadRoom(){
  if(loading||engine||failed||!desktop.matches||!inRoom())return;
  stage.dataset.renderMode='loading';status.textContent='正在准备私人空间…';
  loading=import('./room-3d.js').then(async({createRoom})=>{
    try{await Promise.all([document.fonts.load('500 40px Fraunces'),document.fonts.load('500 19px Inter'),document.fonts.load('500 29px Inter')]);}catch(e){}
    engine=createRoom({container,books,photos,reduced:reduced.matches,onSelect:action=>explore(action),onHover:hover=>{if(!hover){label.hidden=true;return;}label.textContent=hover.text;label.hidden=false;label.style.left=Math.max(10,Math.min(container.clientWidth-240,hover.x+16))+'px';label.style.top=Math.max(10,hover.y-42)+'px';},onFailure:fallback});
    if(inRoom()&&desktop.matches&&!document.body.classList.contains('room-exploring'))engine.prepareEntry();
    engine.setActive(inRoom()&&desktop.matches);stage.classList.add('has-webgl');stage.dataset.renderMode='webgl';stage.dataset.interaction='idle';status.textContent='';if(inRoom()&&desktop.matches&&!document.body.classList.contains('room-exploring'))beginEntry();
  }).catch(error=>{console.warn('Private room fallback:',error.message);fallback('3D 暂时不可用；下方物件入口仍可正常阅读。');});
  await loading;
}
function settleEntry(){
  entryTicket++;cancelAnimationFrame(entryFrameA);cancelAnimationFrame(entryFrameB);engine?.finishEntry();
  section.classList.remove('room-entering','room-entered','room-entry-reset');stage.dataset.entry='settled';
}
function prepareEntry(){
  settleEntry();
  if(!reduced.matches&&desktop.matches&&!failed){section.classList.add('room-entry-reset','room-entering');stage.dataset.entry='pending';engine?.prepareEntry();}
}
function beginEntry(){
  if(reduced.matches||!desktop.matches||!inRoom()||document.body.classList.contains('room-exploring')){settleEntry();return;}
  const ticket=++entryTicket;
  // Two frames establish the card before starting its single coordinated expansion.
  entryFrameA=requestAnimationFrame(()=>{entryFrameB=requestAnimationFrame(async()=>{
    if(ticket!==entryTicket||!inRoom())return;
    section.classList.remove('room-entry-reset');section.classList.add('room-entering','room-entered');stage.dataset.entry='expanding';
    await engine?.enter();
    if(ticket===entryTicket){stage.dataset.entry='settled';section.classList.remove('room-entering');engine?.resize();}
  });});
}
function updateActive(){
  const here=inRoom();
  const active=here&&desktop.matches;
  setBgm(here);
  engine?.setActive(active);
  if(!inRoom()&&document.body.classList.contains('room-exploring'))close();
  if(!active){settleEntry();if(!desktop.matches){stage.classList.remove('has-webgl');stage.dataset.renderMode='mobile';}}
  else if(!wasRoomActive){
    prepareEntry();
    if(engine&&!failed){stage.classList.add('has-webgl');stage.dataset.renderMode='webgl';beginEntry();}else loadRoom();
  }
  wasRoomActive=active;
}
document.addEventListener('scenechange',updateActive);desktop.addEventListener('change',updateActive);reduced.addEventListener('change',()=>{engine?.setReduced(reduced.matches);if(reduced.matches)settleEntry();});
if(!document.documentElement.classList.contains('scene-mode')){const io=new IntersectionObserver(entries=>{const here=entries[0].isIntersecting;if(here)loadRoom();engine?.setActive(here&&desktop.matches);setBgm(here);});io.observe(stage);}else updateActive();
addEventListener('pagehide',()=>{engine?.setActive(false);setBgm(false);});addEventListener('pageshow',updateActive);document.addEventListener('visibilitychange',()=>{const here=!document.hidden&&inRoom();engine?.setActive(here&&desktop.matches);setBgm(here);});
