(() => {
  const section=document.querySelector('#education');
  const scroller=section.querySelector('.scene-scroll')||document.scrollingElement;
  const shift=section.querySelector('#question-shift');
  const chapters=[...section.querySelectorAll('.education-chapter,#question-shift')];
  const links=[...section.querySelectorAll('.education-chapters a')];
  let queued=false;
  function update(){
    queued=false;
    const top=scroller===document.scrollingElement?0:scroller.getBoundingClientRect().top;
    const height=scroller===document.scrollingElement?innerHeight:scroller.clientHeight;
    const rect=shift.getBoundingClientRect();
    const leading=shift.querySelector('.education-thread').offsetHeight;
    const trailing=shift.querySelector('.thread-to-graduate').offsetHeight;
    const progress=Math.max(0,Math.min(1,(top+height*.6-rect.top+leading)/(rect.height+leading+trailing)));
    shift.style.setProperty('--education-progress',progress.toFixed(4));
    const distances=chapters.map(el=>Math.abs(el.getBoundingClientRect().top-top-height*.25));
    const active=distances.indexOf(Math.min(...distances));
    links.forEach((link,i)=>i===active?link.setAttribute('aria-current','step'):link.removeAttribute('aria-current'));
  }
  function schedule(){if(!queued){queued=true;requestAnimationFrame(update);}}
  scroller.addEventListener('scroll',schedule,{passive:true});addEventListener('resize',schedule);document.addEventListener('scenechange',schedule);update();
})();
