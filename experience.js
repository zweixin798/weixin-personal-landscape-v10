(() => {
  const section=document.querySelector('#experience');
  const scroller=section.querySelector('.scene-scroll')||document.scrollingElement;
  const journey=section.querySelector('.experience-journey');
  const stops=[...section.querySelectorAll('.company-stop')];
  const nodes=[...section.querySelectorAll('.path-node')];
  let queued=false;
  function update(){
    queued=false;
    const viewport=scroller===document.scrollingElement?innerHeight:scroller.clientHeight;
    const top=scroller===document.scrollingElement?0:scroller.getBoundingClientRect().top;
    const centers=stops.map(el=>{const r=el.getBoundingClientRect();return r.top-top+r.height*.45;});
    const progress=Math.max(0,Math.min(1,(viewport*.48-centers[0])/(centers[2]-centers[0])));
    journey.style.setProperty('--journey-progress',progress.toFixed(4));
    const active=centers.reduce((best,c,i)=>Math.abs(c-viewport*.48)<Math.abs(centers[best]-viewport*.48)?i:best,0);
    nodes.forEach((node,i)=>{if(i===active)node.setAttribute('aria-current','step');else node.removeAttribute('aria-current');});
    stops.forEach((stop,i)=>stop.classList.toggle('stop-active',i===active));
  }
  function schedule(){if(!queued){queued=true;requestAnimationFrame(update)}}
  scroller.addEventListener('scroll',schedule,{passive:true});addEventListener('resize',schedule);
  document.addEventListener('scenechange',schedule);
  nodes.forEach((node,i)=>node.addEventListener('click',event=>{event.preventDefault();event.stopPropagation();const current=scroller.scrollTop;const y=stops[i].getBoundingClientRect().top-scroller.getBoundingClientRect().top+current-24;scroller.scrollTo({top:y,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});}));
  update();
})();
