// Full-screen chapter navigation, progressively enhanced over the static document.
(() => {
  const main = document.querySelector('main');
  const scenes=[...main.children].filter(el=>el.matches('section,article'));
  for(const [i,scene] of scenes.entries()){
    scene.classList.add('scene');scene.dataset.sceneIndex=i;scene.tabIndex=-1;
    const scroll=document.createElement('div');scroll.className='scene-scroll';
    while(scene.firstChild)scroll.append(scene.firstChild);
    scene.append(scroll);
  }
  const controls=document.createElement('nav');controls.className='scene-controls';controls.setAttribute('aria-label','分屏导航');
  controls.innerHTML='<span class="scene-instruction">滑动，进入下一幕</span><span class="scene-status" aria-live="polite" aria-atomic="true"></span><div><button class="previous-scene" aria-label="上一幕">↑</button><button class="next-scene" aria-label="下一幕">↓</button></div>';
  document.body.append(controls);
  const heroIntro=document.createElement('div');
  heroIntro.className='hero-intro';heroIntro.setAttribute('aria-hidden','true');
  heroIntro.innerHTML='<div class="hero-intro-inner"><span class="intro-name">Weixin Zhang</span><span class="intro-motto"><i style="--i:0">Technical by practice.</i><i style="--i:1">Product by craft.</i><i style="--i:2">Business by outcome.</i></span></div>';
  main.append(heroIntro);
  const previous=controls.querySelector('.previous-scene');const next=controls.querySelector('.next-scene');
  let roomArrivalTimer,heroIntroTimer,introPlaying=false;
  const motion=matchMedia('(prefers-reduced-motion: reduce)');
  let current=0,lockedUntil=0,gestureLast=0,gestureSum=0,gestureUsed=false,readingGesture=false,touch=null;
  const findScene=hash=>{const target=document.getElementById(hash.replace(/^#/,''));return scenes.findIndex(scene=>scene===target||scene.contains(target));};
  function go(index,{historyMode='push',focus=false,animate=true,anchor=null}={}){
    index=Math.max(0,Math.min(scenes.length-1,index));
    const old=current;
    clearTimeout(roomArrivalTimer);
    const roomArrival=scenes[index].id==='private'&&old!==index&&matchMedia('(min-width:760px)').matches;
    main.classList.toggle('room-arrival',roomArrival);
    if(roomArrival)roomArrivalTimer=setTimeout(()=>main.classList.remove('room-arrival'),900);
    current=index;gestureSum=0;main.scrollTop=0;main.scrollLeft=0;
    main.classList.toggle('no-scene-motion',!animate||motion.matches);
    scenes.forEach((scene,i)=>{
      scene.style.setProperty('--scene-offset',String(i<current?-1:i>current?1:0));
      scene.classList.toggle('is-current',i===current);scene.inert=i!==current;scene.setAttribute('aria-hidden',String(i!==current));
      if(i===current){scene.querySelectorAll('.visual-reveal').forEach(el=>el.classList.add('is-visible'));}
    });
    if(old!==index){scenes[index].querySelector('.scene-scroll').scrollTop=0;lockedUntil=performance.now()+(motion.matches?120:roomArrival?900:450);}
    const target=anchor?document.getElementById(anchor.replace(/^#/,'')):null;
    const nested=target&&target!==scenes[index]&&scenes[index].contains(target);
    if(nested){const scroll=scenes[index].querySelector('.scene-scroll');scroll.scrollTo({top:target.getBoundingClientRect().top-scroll.getBoundingClientRect().top+scroll.scrollTop-24,behavior:old===index&&animate&&!motion.matches?'smooth':'instant'});}
    document.dispatchEvent(new CustomEvent('scenechange',{detail:{id:scenes[index].id,from:scenes[old].id,animate:animate&&!motion.matches}}));
    const hash=nested?anchor:`#${scenes[index].id}`;
    if(historyMode==='push'&&location.hash!==hash)history.pushState(null,'',hash);
    if(historyMode==='replace')history.replaceState(null,'',hash);
    controls.querySelector('.scene-status').textContent=`${String(index+1).padStart(2,'0')} / ${String(scenes.length).padStart(2,'0')} — ${scenes[index].dataset.title}`;
    previous.disabled=index===0;next.disabled=index===scenes.length-1;
    if(focus||scenes.some((scene,i)=>i!==current&&scene.contains(document.activeElement)))scenes[index].focus({preventScroll:true});
  }
  const scrollArea=()=>scenes[current].querySelector('.scene-scroll');
  function canScroll(direction){const el=scrollArea();return direction>0?el.scrollTop+el.clientHeight<el.scrollHeight-3:el.scrollTop>3;}
  function isInteractive(el){return el.closest('input,textarea,select,[contenteditable="true"],dialog');}
  function modalOpen(){return Boolean(document.querySelector('dialog[open],.room-overlay:not([hidden])'))||document.body.classList.contains('room-exploring');}
  previous.addEventListener('click',()=>go(current-1,{focus:true}));next.addEventListener('click',()=>go(current+1,{focus:true}));
  document.addEventListener('click',event=>{
    const link=event.target.closest('a[href^="#"]');if(!link)return;
    if(introPlaying){event.preventDefault();return;}
    const hash=link.getAttribute('href');const index=hash==='#main'?current:findScene(hash);
    if(index<0)return;event.preventDefault();go(index,{focus:true,anchor:hash});
  });
  addEventListener('popstate',()=>{const i=findScene(location.hash);if(i>=0)go(i,{historyMode:'none',focus:true,anchor:location.hash});});
  addEventListener('hashchange',()=>{const i=findScene(location.hash);if(i>=0)go(i,{historyMode:'none',focus:true,anchor:location.hash});});
  main.addEventListener('wheel',event=>{
    if(introPlaying){event.preventDefault();return;}
    if(event.ctrlKey||modalOpen()||isInteractive(event.target)||Math.abs(event.deltaX)>Math.abs(event.deltaY))return;
    const now=performance.now();if(now-gestureLast>300){gestureUsed=false;readingGesture=false;gestureSum=0;}gestureLast=now;
    const direction=Math.sign(event.deltaY);if(!direction)return;
    if(gestureUsed||now<lockedUntil){event.preventDefault();return;}
    if(canScroll(direction)){gestureSum=0;readingGesture=true;return;}
    event.preventDefault();const delta=event.deltaY*(event.deltaMode===1?16:event.deltaMode===2?innerHeight:1);
    if(Math.sign(gestureSum)!==direction)gestureSum=0;gestureSum+=delta;
    // A firmer push is required right after overflow reading so trailing inertia does not flip the page.
    if(Math.abs(gestureSum)>=(readingGesture?70:25)){gestureUsed=true;go(current+direction);}
  },{passive:false});
  main.addEventListener('touchstart',event=>{if(event.touches.length!==1||modalOpen()||introPlaying)return;touch={x:event.touches[0].clientX,y:event.touches[0].clientY,top:scrollArea().scrollTop,target:event.target};},{passive:true});
  main.addEventListener('touchend',event=>{
    if(!touch||modalOpen()||introPlaying)return;const start=touch;touch=null;const t=event.changedTouches[0];if(!t||isInteractive(start.target))return;
    const dy=start.y-t.clientY,dx=start.x-t.clientX;if(Math.abs(dy)<40||Math.abs(dx)>Math.abs(dy)||performance.now()<lockedUntil)return;
    // A gesture used to read overflow content never also turns the page.
    if(Math.abs(scrollArea().scrollTop-start.top)>4)return;
    if(!canScroll(Math.sign(dy)))go(current+Math.sign(dy));
  },{passive:true});
  document.addEventListener('keydown',event=>{
    if(introPlaying){if(['ArrowDown','ArrowUp','PageDown','PageUp',' ','Home','End'].includes(event.key))event.preventDefault();return;}
    if(modalOpen()||isInteractive(event.target)||event.altKey||event.ctrlKey||event.metaKey)return;
    if(event.target.closest('button,a,summary')&&[' ','Enter','ArrowUp','ArrowDown'].includes(event.key))return;
    const direction=['ArrowDown','PageDown',' '].includes(event.key)?1:['ArrowUp','PageUp'].includes(event.key)?-1:0;
    if(event.key==='Home'||event.key==='End'){event.preventDefault();go(event.key==='Home'?0:scenes.length-1,{focus:true});return;}
    if(!direction)return;event.preventDefault();if(performance.now()<lockedUntil)return;
    if(canScroll(direction)){scrollArea().scrollBy({top:direction*scrollArea().clientHeight*.75,behavior:motion.matches?'instant':'smooth'});}else go(current+direction,{focus:true});
  });
  document.documentElement.classList.add('scene-mode');
  const initialIndex=Math.max(0,findScene(location.hash));
  go(initialIndex,{historyMode:'replace',animate:false,anchor:location.hash});
  let introSeen=false;
  try{introSeen=sessionStorage.getItem('heroIntroPlayed')==='1';}catch(e){}
  if(initialIndex===0&&!motion.matches&&!introSeen){
    introPlaying=true;
    main.classList.add('hero-intro-playing');
    lockedUntil=performance.now()+2850;
    heroIntroTimer=setTimeout(()=>{
      introPlaying=false;
      main.classList.remove('hero-intro-playing');
      main.classList.add('hero-intro-done');
      try{sessionStorage.setItem('heroIntroPlayed','1');}catch(e){}
    },2850);
  }
})();
