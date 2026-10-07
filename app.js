const content=window.SITE_CONTENT||{};
const escapeHTML=value=>String(value).replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
function safeURL(value,{localOnly=false}={}){
  if(typeof value!=='string'||!value.trim())return null;
  try{const url=new URL(value,location.href);if(!['http:','https:'].includes(url.protocol))return null;if(localOnly&&(url.origin!==location.origin||value.startsWith('/')))return null;return url.href;}catch{return null;}
}
if(content.portrait&&safeURL(content.portrait.src,{localOnly:true})){
  const img=document.querySelector('#hero-image');img.src=safeURL(content.portrait.src,{localOnly:true});img.alt=content.portrait.alt||'张薇馨的个人照片';img.style.objectPosition=content.portrait.position||'center';
}
const contact=document.querySelector('#contact-links');
for(const [key,label] of Object.entries({email:'EMAIL ↗',resume:'RESUME ↗',github:'GITHUB ↗',x:'X ↗'})){
  const value=content.contact?.[key];if(!value)continue;
  const url=key==='email'?(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)?`mailto:${value}`:null):safeURL(value);
  if(!url)continue;const a=document.createElement('a');a.href=url;a.textContent=label;if(key!=='email'){a.target='_blank';a.rel='noopener noreferrer'}contact.append(a);
}
const books=[
['小说','陀思妥耶夫斯基作品','陀思妥耶夫斯基','#6a4034'],['小说','Moby-Dick','Herman Melville','#536960'],['小说','Ulysses','James Joyce','#a18745'],['哲学','有无之境','陈来','#69584d'],['社科','社会性动物','Elliot Aronson','#6c7d76'],['哲学','第一哲学的支点','王路','#754237'],['社科','理性乐观派','Matt Ridley','#8c8453'],['科学','费曼讲物理','Richard P. Feynman 等','#536b75'],['科学','微积分的力量','Steven Strogatz','#8a694a'],['技术','Build a Large Language Model From Scratch','Sebastian Raschka','#4c5b4e'],['传记','我看见的世界','李飞飞','#8b5745'],['人物','芒格之道','查理·芒格','#685e4d']
];
const dialog=document.querySelector('#object-dialog');
const dialogTitle=document.querySelector('#dialog-title');
const dialogContent=document.querySelector('#dialog-content');
const photos=(content.photos||[]).filter(p=>safeURL(p.src,{localOnly:true}));
let opener;
function showAlbum(){
  dialogTitle.textContent='Places & moments.';
  dialogContent.innerHTML=photos.length?`<p class="collection-note">旅行与日常 / Places & moments</p><div class="photo-grid">${photos.map((p,i)=>`<button data-photo="${i}" aria-label="放大照片：${escapeHTML(p.place||'旅行')} ${escapeHTML(p.date||'')}"><img src="${escapeHTML(safeURL(p.thumb,{localOnly:true})||safeURL(p.src,{localOnly:true}))}" alt="${escapeHTML(p.alt||p.place||'旅行照片')}" width="600" height="750" loading="lazy"><span>${escapeHTML(p.place||'')} ${escapeHTML(p.date||'')}</span></button>`).join('')}</div>`:'<div class="album-empty"><h3>Through a 35mm lens.</h3><p>相册正在整理中。</p></div>';
}
const panels={
  books:()=>{dialogTitle.textContent='On my bookshelf.';dialogContent.innerHTML=`<p class="collection-note">小说 / 哲学 / 科学 / 人物 · 以下为书目排印，并非原版封面。</p><div class="book-wall">${books.map(([category,title,author,color])=>`<article class="book-cover" style="--cover:${color}"><small>${category}</small><h3>${title}</h3><p>${author}</p></article>`).join('')}</div>`},
  album:showAlbum,
  music:()=>{dialogTitle.textContent='A little music.';dialogContent.innerHTML='<div class="music-panel"><div class="record" role="img" aria-label="Beatles 主题的抽象黑胶图形"></div><div><h3>The Beatles</h3><p>Guitar / Singing<br>吉他，弹唱。</p></div></div>'},
  screen:()=>{dialogTitle.textContent='Screen';dialogContent.innerHTML='<div class="screen-posters"><article class="show-poster twin-peaks"><span>Series / 01</span><div class="curtains" aria-hidden="true"></div><h3>Twin<br>Peaks</h3></article><article class="show-poster fleabag"><span>Series / 02</span><div class="poster-ring" aria-hidden="true"></div><h3>Fleabag</h3></article></div><div class="screen-note">Mockumentary / Pseudo-documentary</div>';},
  notebook:()=>{dialogTitle.textContent='Notebook';dialogContent.innerHTML='<div class="notebook-page"><span class="eyebrow">Keywords</span><div class="notebook-keywords"><span>因果</span><span>理解</span><span>系统</span><span>产品</span><span>业务</span><span>交付</span><span>野心</span><span>Agents</span></div></div>';}

};
for(const button of document.querySelectorAll('[data-object]'))button.addEventListener('click',()=>{opener=button;panels[button.dataset.object]();dialog.showModal();document.body.classList.add('modal-open')});
document.querySelector('.close-dialog').addEventListener('click',()=>dialog.close());
dialog.addEventListener('close',()=>{document.body.classList.remove('modal-open');opener?.focus()});
dialog.addEventListener('click',event=>{if(event.target===dialog){const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dialog.close()}});
dialogContent.addEventListener('click',event=>{
  const target=event.target.closest('[data-photo]');
  if(target){const p=photos[Number(target.dataset.photo)];dialogContent.innerHTML=`<button class="back-album">← 返回相册</button><figure class="photo-large"><img src="${escapeHTML(safeURL(p.src,{localOnly:true}))}" alt="${escapeHTML(p.alt||p.place||'旅行照片')}"><figcaption>${escapeHTML(p.place||'')} ${escapeHTML(p.date||'')}</figcaption></figure>`;dialogContent.querySelector('button').focus();}
  if(event.target.closest('.back-album')){showAlbum();dialogContent.querySelector('button')?.focus();}
});
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
const finePointer=matchMedia('(hover: hover) and (pointer: fine)');
let observer;
function setupMotion(){
  observer?.disconnect();document.body.classList.toggle('motion-on',!reduced.matches);
  if(reduced.matches)return;
  observer=new IntersectionObserver(entries=>{for(const entry of entries)if(entry.isIntersecting){entry.target.classList.add('is-visible');observer.unobserve(entry.target)}},{threshold:.15});
  document.querySelectorAll('.visual-reveal').forEach(el=>observer.observe(el));
}
setupMotion();reduced.addEventListener('change',setupMotion);
const room=document.querySelector('.room');
room.addEventListener('pointermove',event=>{if(reduced.matches||!finePointer.matches)return;const r=room.getBoundingClientRect();room.style.setProperty('--px',`${(event.clientX-r.left-r.width/2)/r.width*5}deg`);room.style.setProperty('--py',`${-(event.clientY-r.top-r.height/2)/r.height*4}deg`)});
room.addEventListener('pointerleave',()=>{room.style.setProperty('--px','0deg');room.style.setProperty('--py','0deg')});
