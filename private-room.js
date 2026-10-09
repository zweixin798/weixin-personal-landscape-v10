const data=window.SITE_CONTENT||{};
const books=data.books||[],photos=data.photos||[];
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
    panel.innerHTML='<h2 id="room-panel-title">On my bookshelf.</h2><div class="shelf-browser">'+books.map(b=>`<button class="shelf-book" data-book-id="${esc(b.id)}" style="--book-color:${esc(b.color)};--book-ink:${bookInk(b.color)}" aria-label="打开 ${esc(b.title)}"><small>${esc(b.category)}</small><strong>${esc(b.title)}</strong><span>${esc(b.author)}</span></button>`).join('')+'</div>';
  }else if(action.type==='book'){
    const b=books.find(b=>b.id===action.id);if(!b)return;
    const index=books.indexOf(b);
    panel.innerHTML=`<div class="reading-spread" style="--book-color:${esc(b.color)}"><article class="reading-page left-page"><span class="eyebrow">${esc(b.category)}${b.year?' / '+esc(b.year):''}</span><h2 id="room-panel-title">${esc(b.title)}</h2><p class="book-author">${esc(b.author)}</p><div class="book-intro">${b.intro?esc(b.intro):'书籍简介待补充。'}</div><span class="page-number">01</span></article><article class="reading-page right-page"><span class="eyebrow">Reading Notes</span><h3>我的阅读心得</h3><div class="personal-notes">${b.notes?esc(b.notes).replace(/\n/g,'<br>'):'<p class="notes-pending">Notes coming later.</p>'}</div><span class="page-number">02</span></article></div><div class="reading-navigation"><button data-book-id="${esc(books[(index+books.length-1)%books.length].id)}">← 上一本</button><button data-room-panel="books">回到书架目录</button><button data-book-id="${esc(books[(index+1)%books.length].id)}">下一本 →</button></div>`;
  }else if(action.type==='album'){
    panel.innerHTML='<h2 id="room-panel-title">Places & moments.</h2><div class="contact-sheet">'+photos.map((p,i)=>`<button data-room-photo="${i}" class="contact-photo" style="--tilt:${[-4,3,-2,4][i%4]}deg" aria-label="放大照片：${esc(p.alt||p.place||'旅行照片')}"><img src="${esc(photoURL(p.thumb||p.src))}" alt="${esc(p.alt||'旅行照片')}" width="480" height="600" loading="lazy"><span>${esc(p.place)} ${esc(p.date)}</span><small>${String(i+1).padStart(2,'0')}</small></button>`).join('')+'</div>';
  }else if(action.type==='photo'){
    const p=photos[action.index];if(!p)return;
    panel.innerHTML=`<h2 id="room-panel-title" class="sr-only">${esc(p.alt||'照片详情')}</h2><button class="back-to-album" data-room-panel="album">← 返回相册</button><figure class="room-photo-large"><img src="${esc(photoURL(p.src))}" alt="${esc(p.alt||'旅行照片')}"><figcaption>${esc(p.place)} ${esc(p.date)}</figcaption></figure>`;
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
  if(!document.body.classList.contains('room-exploring'))lastTrigger=trigger||stage.querySelector(`[data-room-action="${action.type==='book'?'books':action.type==='photo'?'album':action.type}"]`);
  setLocked(true);overlay.hidden=true;returning.hidden=false;returning.focus({preventScroll:true});stage.classList.add('room-focused');stage.dataset.interaction='focusing';label.hidden=true;
  if(engine&&desktop.matches&&inRoom())await engine.focus(action);
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
  const photo=event.target.closest('[data-room-photo]');if(photo){showPanel({type:'photo',index:Number(photo.dataset.roomPhoto)});return;}
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
    if(document.fonts)await document.fonts.load('400 16px "DM Serif Display"').catch(()=>null);
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
  const active=inRoom()&&desktop.matches;
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
if(!document.documentElement.classList.contains('scene-mode')){const io=new IntersectionObserver(entries=>{if(entries[0].isIntersecting)loadRoom();engine?.setActive(entries[0].isIntersecting&&desktop.matches);});io.observe(stage);}else updateActive();
addEventListener('pagehide',()=>engine?.setActive(false));addEventListener('pageshow',updateActive);document.addEventListener('visibilitychange',()=>engine?.setActive(!document.hidden&&inRoom()&&desktop.matches));
