const content=window.SITE_CONTENT||{};
const escapeHTML=value=>String(value).replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
function safeURL(value,{localOnly=false}={}){
  if(typeof value!=='string'||!value.trim())return null;
  try{const url=new URL(value,location.href);if(!['http:','https:'].includes(url.protocol))return null;if(localOnly&&(url.origin!==location.origin||value.startsWith('/')))return null;return url.href;}catch{return null;}
}
if(content.portrait&&safeURL(content.portrait.src,{localOnly:true})){
  const img=document.querySelector('#hero-image');img.src=safeURL(content.portrait.src,{localOnly:true});img.alt=content.portrait.alt||'张薇馨的个人照片';img.style.objectPosition=content.portrait.position||'center';
}
const contactContainers=['#contact-links','#hero-contact-links'].map(sel=>document.querySelector(sel)).filter(Boolean);
for(const [key,label] of Object.entries({email:'EMAIL ↗',resume:'RESUME ↗',github:'GITHUB ↗',x:'X ↗'})){
  const value=content.contact?.[key];if(!value)continue;
  const url=key==='email'?(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)?`mailto:${value}`:null):safeURL(value);
  if(!url)continue;const a=document.createElement('a');a.href=url;a.textContent=label;if(key!=='email'){a.target='_blank';a.rel='noopener noreferrer'}
  contactContainers.forEach((container,i)=>container.append(i===0?a:a.cloneNode(true)));
}
// Optional future project URL. Do not expose a made-up link.
const projectLink=document.querySelector('#project-link');
const projectURL=safeURL(content.projectUrl);
if(projectURL){projectLink.href=projectURL;projectLink.hidden=false;projectLink.removeAttribute('aria-disabled');projectLink.removeAttribute('tabindex');projectLink.target='_blank';projectLink.rel='noopener noreferrer';}
