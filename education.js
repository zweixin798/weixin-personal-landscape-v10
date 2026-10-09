(() => {
  const section=document.querySelector('#education');
  const scroller=section.querySelector('.scene-scroll')||document.scrollingElement;
  const chapters=[...section.querySelectorAll('#undergraduate,#question-shift,#understanding')];
  const links=[...section.querySelectorAll('.education-chapters a')];
  const horizontal=matchMedia('(min-width:960px)');
  let queued=false;
  function update(){
    queued=false;
    const top=scroller===document.scrollingElement?0:scroller.getBoundingClientRect().top;
    const height=scroller===document.scrollingElement?innerHeight:scroller.clientHeight;
    const distances=chapters.map(el=>Math.abs(el.getBoundingClientRect().top-top-height*.25));
    const active=horizontal.matches?chapters.findIndex(el=>'#'+el.id===location.hash):distances.indexOf(Math.min(...distances));
    links.forEach((link,i)=>i===active?link.setAttribute('aria-current','step'):link.removeAttribute('aria-current'));
  }
  function schedule(){if(!queued){queued=true;requestAnimationFrame(update);}}
  scroller.addEventListener('scroll',schedule,{passive:true});addEventListener('resize',schedule);document.addEventListener('scenechange',schedule);addEventListener('hashchange',schedule);
  horizontal.addEventListener('change',()=>{if(horizontal.matches)scroller.scrollTop=0;schedule();});update();
})();
