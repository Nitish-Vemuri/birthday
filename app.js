'use strict';
const $ = id => document.getElementById(id);
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
let step=0,wished=false,raf=0,startTime=0,elapsed=0,pausedAt=0,ready=false,imageFailure=false,confettiTimer;
let introChoice='ask',hugCalled=false;
const sceneDuration=()=>step===0&&introChoice==='yes'?1700:STORY[step].duration;
const soundId=()=>step===0?'welcome_'+introChoice:STORY[step].id;
const opened=new Set();
const clamp=v=>Math.max(0,Math.min(1,v));
const mix=(a,b,p)=>a+(b-a)*clamp(p);
const ease=p=>1-Math.pow(1-clamp(p),3);
const beat=(t,speed=150)=>Math.floor(t/speed)%2;
function visible(id,show){$(id).hidden=!show;}
function actor(id,pose,x,y,{flip=id==='bubu',rotate=0,scale=1,front=2,run=false}={}){
 const el=$(id),sprite=el.firstElementChild;el.hidden=false;el.style.left=x+'%';el.style.top=y+'%';el.style.zIndex=front;el.style.transform=`translate(-50%,-50%) rotate(${rotate}deg) scale(${flip?-scale:scale},${scale})`;
 sprite.classList.toggle('running',run);el.classList.toggle('is-running',run);const columns=id==='pair'?2:4,rows=(id==='pair'||run)?2:3;sprite.style.backgroundPosition=`${(pose%columns)*100/(columns-1)}% ${Math.floor(pose/columns)*100/(rows-1)}%`;
}
function label(id,text,x,y){const el=$(id);el.hidden=false;if(el.textContent!==text)el.textContent=text;el.style.left=x+'%';el.style.top=y+'%';}
function heart(x,y,scale=1){visible('flying-heart',true);$('flying-heart').style.left=x+'%';$('flying-heart').style.top=y+'%';$('flying-heart').style.transform=`translate(-50%,-50%) scale(${scale})`;}
function resetStage(){['dudu','bubu','pair','bubble-a','bubble-b','place-a','place-b','flying-heart','coffee-shop','spark','welcome-art'].forEach(id=>visible(id,false));}
const scenes={
 welcome(t){
  const quiet=reducedMotion.matches;
  if(introChoice==='yes'){const hop=quiet?0:Math.abs(Math.sin(Math.min(t,1400)/220))*5;actor('dudu',5,50,65-hop,{scale:1.65,rotate:quiet?0:Math.sin(t/160)*5});label('bubble-a','Yaaay! Come with me! ♡',50,21);heart(80,45,.6);}
  else if(introChoice==='no'){actor('dudu',t<650?7:6,50,65,{scale:1.65,rotate:quiet?0:Math.sin(Math.min(t,1600)/300)*5});label('bubble-a','You don’t have an option… click YES!',50,20);}
  else{actor('dudu',t<1800?5+beat(t,400):0,50,65,{scale:1.65,rotate:quiet?0:Math.sin(t/900)*2});label('bubble-a','I made something just for you…',50,20);heart(80,45,.5);}
 },
 distance(t){
  if(t<2200){const p=t/2200,phase=(t%400)/400,pose=Math.floor(phase*4),bounce=Math.sin(phase*Math.PI*2)*.7;actor('dudu',pose,mix(-16,30,p),60-bounce,{run:true,rotate:3});actor('bubu',pose+4,mix(116,70,p),60-bounce,{flip:true,run:true,rotate:-3});}
  else if(t<2600){const p=(t-2200)/400;actor('dudu',3,30,60,{rotate:-10*Math.sin(p*Math.PI),scale:1-.1*Math.sin(p*Math.PI)});actor('bubu',3,70,60,{flip:true,rotate:10*Math.sin(p*Math.PI),scale:1-.1*Math.sin(p*Math.PI)});label('spark','✧',50,48);}
  else{const p=clamp((t-2600)/650),fall=p*p;actor('dudu',4,mix(30,24,p),mix(60,68,fall)-Math.sin(p*Math.PI)*3,{rotate:-18*Math.sin(p*Math.PI)});actor('bubu',4,mix(70,76,p),mix(60,68,fall)-Math.sin(p*Math.PI)*3,{rotate:18*Math.sin(p*Math.PI)});if(t>3250)visible('place-a',true);if(t>3550)visible('place-b',true);if(t>4600){const p=ease((t-4600)/2300);heart(mix(24,76,p),32-Math.sin(p*Math.PI)*12,.6+Math.sin(p*Math.PI)*.25);}}
 },
 chatter(t){
  if(t<2300){actor('dudu',0,31,65,{rotate:t>1300?-10:0});actor('bubu',5+beat(t,360),69,64-Math.abs(Math.sin(t/360))*.5);label('bubble-b','And then…',69,24);if(t>1300)label('bubble-a','…',28,36);}
  else if(t<3700){actor('dudu',0,31,65);actor('bubu',7,69,65);label('bubble-b','Duduuu?',69,27);}
  else if(t<4200){const p=ease((t-3700)/500);actor('dudu',10,mix(31,43,p),65);actor('bubu',7,69,65);label('bubble-a','I’m here.',31,30);}
  else if(t<6000){actor('pair',0,50,61,{scale:mix(.95,1,ease((t-4200)/500))});heart(51,20,.65);label('bubble-a','I’m listening, Bubuuu.',49,34);}
  else{actor('dudu',0,35,65,{rotate:Math.sin(t/550)*2});actor('bubu',5+beat(t,330),65,64);label('bubble-b','So, anyway…',66,25);heart(27,36,.45);}
 },
 coffee(t){
  if(t>=1550){visible('coffee-shop',true);$('coffee-shop').style.opacity=String(.92*ease((t-1550)/550));}
  if(t<1550){actor('dudu',0,32,65);actor('bubu',5+beat(t,170),67,65);label('bubble-b','And another thing…',65,26);}
  else if(t<2550){const p=ease((t-1550)/1000);actor('dudu',1+beat(t,140),mix(32,50,p),65-Math.abs(Math.sin(t/130)));actor('bubu',0,mix(67,65,p),64,{scale:mix(1,.9,p)});}
  else if(t<5300){actor('bubu',8+beat(t,350),64,61,{scale:.87,front:1});actor('dudu',0,46,67,{front:3});label('bubble-b','Can you order mine…?',65,36);if(t>4100)label('bubble-a','Two coffees, please.',27,20);}
  else{const p=ease((t-5300)/2000);actor('dudu',0,mix(46,29,p),66);actor('bubu',5+beat(t,180),mix(64,62,p),64);label('bubble-b','Anyway, where was I?',62,31);label('bubble-a','☕',26,40);}
 },
 emergency(t){
  if(!hugCalled){actor('bubu',8,68,64);label('bubble-b','One hug, please?',66,25);heart(38,63,.8);return;}
  if(t<900){actor('bubu',10,68,64);heart(46,61,.85);label('bubble-b','Duduuu!',68,25);}
  else if(t<2900){const p=(t-900)/2000;actor('dudu',Math.floor(t/100)%4,mix(-20,40,p),64-Math.sin(t/100),{run:true,rotate:5});actor('bubu',6,68,64);label('bubble-a','Coming!',29,25);}
  else if(t<3600){actor('dudu',3,mix(40,44,ease((t-2900)/700)),64,{rotate:-8});actor('bubu',10,68,64);label('bubble-a','Made it!',30,25);}
  else{actor('pair',0,53,62,{scale:1+Math.sin(clamp((t-3600)/3200)*Math.PI)*.06});heart(53,23,.65);label('bubble-a','You called? ♡',52,34);}
 },
 parcel(t){
  if(t<2200){actor('pair',1,42,62,{scale:.92,rotate:Math.sin(t/180)*2});label('bubble-a','It’ll fit. Probably.',43,22);}
  else if(t<3700){actor('pair',2,42,62,{scale:.94,rotate:Math.sin(t/100)*2});label('bubble-a',t<3100?'Just… a little…':'Oh!',43,22);}
  else{actor('dudu',10,23,65);actor('bubu',t<5700?0:11,77,65,{scale:t>5700?1+Math.sin((t-5700)/180)*.03:1});visible('place-b',true);const p=ease((t-3700)/2000);if(t<5800)heart(mix(30,77,p),36-Math.sin(p*Math.PI)*14,1.1);else{heart(64,25,.5);label('bubble-b','All this… for me?',70,37);label('spark','♡  ♡  ♡',50,23);}}
 },
 birthday(t){
  if(t<1800){const p=ease(t/1800);actor('dudu',10,mix(12,36,p),64);actor('bubu',10,mix(88,64,p),64);}
  else if(t<3400){actor('pair',0,50,62,{scale:mix(.9,1,ease((t-1800)/500))});heart(50,24,.65);}
  else{actor('pair',wished?0:3,50,63,{scale:mix(.85,1,ease((t-3400)/600))});label('bubble-a',wished?'May your wish come true.':'Happy birthday, Bubuuu!',50,23);heart(84,39,.5);}
 },
 notes(t){actor('dudu',11,30,64,{rotate:Math.sin(t/500)*3});actor('bubu',11,70,64,{rotate:-Math.sin(t/500)*3});heart(50,27,.6);},
 hug(t){if(t<1800){const p=ease(t/1800);actor('dudu',10,mix(10,38,p),64);actor('bubu',10,mix(90,62,p),64);}else{actor('pair',0,50,60,{scale:1+Math.sin(clamp((t-1800)/4200)*Math.PI)*.07});heart(50,25,.6);label('bubble-a','Birthday hugs: unlimited. ♡',50,16);}}
};
function draw(time){resetStage();const page=STORY[step];scenes[page.id](Math.min(time,sceneDuration()));$('time-fill').style.transform=`scaleX(${clamp(time/sceneDuration())})`;}
function tick(now){elapsed=Math.min(now-startTime,sceneDuration());draw(reducedMotion.matches?sceneDuration():elapsed);raf=elapsed<sceneDuration()?requestAnimationFrame(tick):0;if(!raf){storyAudio.finished();if(step===0&&introChoice==='yes'){step=1;render();}}}
function play(){storyAudio.stop();cancelAnimationFrame(raf);raf=0;pausedAt=0;elapsed=0;resetStage();if(!ready)return;if(STORY[step].id==='emergency'&&!hugCalled){draw(0);return;}if(reducedMotion.matches&&!(step===0&&introChoice==='yes')){elapsed=sceneDuration();draw(elapsed);storyAudio.play(soundId(),sceneDuration());return;}startTime=performance.now();draw(reducedMotion.matches?sceneDuration():0);if(document.hidden)pausedAt=startTime;else{raf=requestAnimationFrame(tick);storyAudio.play(soundId(),sceneDuration());}}
function chooseIntro(choice){
 if(step!==0||introChoice==='yes')return;introChoice=choice;storyAudio.prime();
 $('intro-no').disabled=choice==='yes';$('next').disabled=choice==='yes';$('replay').disabled=choice==='yes'||!ready;
 $('hint').textContent=choice==='yes'?'Dudu knew you’d say yes! Opening your gift…':'';
 $('stage').setAttribute('aria-label',choice==='yes'?'Dudu jumps happily, then opens the birthday story.':'Dudu gives a cheeky smile and says: You don’t have an option… click YES!');
 if(choice==='no')$('next').focus({preventScroll:true});$('scene').scrollIntoView({block:'start',behavior:'instant'});play();
 // Keep the story usable even when artwork cannot load.
 if(imageFailure&&choice==='yes'){step=1;render();}
}
function celebrate(){if(reducedMotion.matches)return;const host=document.querySelector('.confetti');clearTimeout(confettiTimer);host.replaceChildren();for(let i=0;i<36;i++){const bit=document.createElement('i');bit.style.left=Math.random()*100+'%';bit.style.background=['#b63258','#e5a5b3','#d7aa52','#9c799f'][i%4];bit.style.animationDelay=Math.random()*.5+'s';bit.style.borderRadius=i%2?'50%':'1px';host.append(bit);}confettiTimer=setTimeout(()=>host.replaceChildren(),3700);}
function addNotes(){const list=document.createElement('div');list.className='notes';const messages=['You make ordinary days feel special.','Even from far away, you’re close to my heart.','I’m so glad I get to celebrate you.'];messages.forEach((message,i)=>{const b=document.createElement('button');b.className='note'+(opened.has(i)?' open':'');b.setAttribute('aria-expanded',String(opened.has(i)));b.textContent='♡ '+(opened.has(i)?message:['A little truth','A little reminder','One more thing'][i]);b.onclick=()=>{opened.has(i)?opened.delete(i):opened.add(i);b.classList.toggle('open',opened.has(i));b.setAttribute('aria-expanded',String(opened.has(i)));b.textContent='♡ '+(opened.has(i)?message:['A little truth','A little reminder','One more thing'][i]);};list.append(b);});$('extra').append(list);}
function addWish(){const b=document.createElement('button');b.className='cake';b.innerHTML=`<span class="birthday-candle" aria-hidden="true">${wished?'✨':'🕯️'}</span><span class="cake-label">${wished?'Wish made. Sending it to the stars.':'Make a wish & blow out your candle'}</span>`;b.setAttribute('aria-label',wished?'Your birthday wish has been made':'Blow out the birthday candle');const wish=document.createElement('p');wish.className='wish';wish.setAttribute('role','status');wish.textContent=wished?'May this year be extra kind to you. ♡':'';b.onclick=()=>{if(wished)return;wished=true;b.innerHTML='<span class="birthday-candle" aria-hidden="true">✨</span><span class="cake-label">Wish made. Sending it to the stars.</span>';b.setAttribute('aria-label','Your birthday wish has been made');wish.textContent='May this year be extra kind to you. ♡';draw(elapsed);celebrate();};$('extra').append(b,wish);}
function render(focus=true){
 const p=STORY[step];storyAudio.stop();cancelAnimationFrame(raf);clearTimeout(confettiTimer);document.querySelector('.confetti').replaceChildren();
 if(step===0)introChoice='ask';$('intro-no').hidden=step!==0;$('intro-no').disabled=false;$('next').disabled=false;$('replay').disabled=!ready;
 $('chapter').textContent=p.chapter;$('count').textContent=`${String(step+1).padStart(2,'0')} / ${String(STORY.length).padStart(2,'0')}`;$('eyebrow').textContent=p.eyebrow;$('title').innerHTML=p.title;$('description').innerHTML=p.description;$('description').hidden=!p.description;$('next').innerHTML=p.button+' <span aria-hidden="true">♡</span>';$('back').hidden=step===0;$('hint').textContent=p.hint;$('extra').replaceChildren();$('scene').dataset.kind=p.id;$('stage').setAttribute('aria-label',p.alt);$('scene-caption').textContent=imageFailure?p.alt:p.caption;$('scene-caption').hidden=!imageFailure&&!p.caption;$('duration').textContent=(p.duration/1000).toFixed(1)+' sec';
 document.querySelectorAll('.progress span').forEach((el,i)=>el.classList.toggle('active',i===step));document.querySelector('.progress').setAttribute('aria-label',`Chapter ${step+1} of ${STORY.length}`);
 if(p.id==='emergency'){hugCalled=false;const b=document.createElement('button');b.id='hug-call';b.className='hug-call';b.textContent='♥  Emergency hug';b.onclick=()=>{hugCalled=true;storyAudio.prime();play();$('hint').textContent='Hug requested. Express delivery! ♡';};$('extra').append(b);}if(p.id==='notes')addNotes();if(p.id==='birthday')addWish();
 $('scene').classList.remove('enter');void $('scene').offsetWidth;$('scene').classList.add('enter');play();if(focus){$('title').focus({preventScroll:true});$('scene').scrollIntoView({block:'start',behavior:'instant'});}
}
$('next').addEventListener('click',()=>{storyAudio.prime();if(step===0){chooseIntro('yes');return;}if(step===STORY.length-1){play();celebrate();$('hint').textContent='One more hug, just for you. ♡';return;}step++;render();});$('intro-no').addEventListener('click',()=>chooseIntro('no'));$('back').addEventListener('click',()=>{storyAudio.prime();if(step>0){step--;render();}});$('replay').addEventListener('click',()=>{storyAudio.prime();if(STORY[step].id==='emergency')hugCalled=true;play();});
document.addEventListener('visibilitychange',()=>{if(document.hidden){storyAudio.stop();if(raf){pausedAt=performance.now();cancelAnimationFrame(raf);raf=0;}}else if(pausedAt&&elapsed<sceneDuration()){startTime+=performance.now()-pausedAt;pausedAt=0;raf=requestAnimationFrame(tick);storyAudio.play(soundId(),sceneDuration(),elapsed);}});
reducedMotion.addEventListener('change',play);
$('sound-toggle').addEventListener('click',()=>{if(storyAudio.toggle()&&ready)storyAudio.play(soundId(),sceneDuration(),reducedMotion.matches?0:elapsed);});
const progress=document.querySelector('.progress');progress.replaceChildren(...STORY.map(()=>document.createElement('span')));render(false);
// Start after assets load so slower connections don't miss the animation.
$('art-status').hidden=false;$('art-status').textContent='The bears are getting ready…';$('replay').disabled=true;
Promise.all(['bears.png','dudu-poses.png','bubu-poses.png','together-poses.png','run-cycle.png','cafe-backdrop.png'].map(src=>new Promise((resolve,reject)=>{const img=new Image();img.onload=resolve;img.onerror=()=>reject(new Error(src));img.src=src;}))).then(()=>{ready=true;$('art-status').hidden=true;$('replay').disabled=step===0&&introChoice==='yes';play();}).catch(()=>{imageFailure=true;visible('scene-caption',true);$('stage').classList.add('art-failed');$('art-status').textContent='The illustrations couldn’t load. Please refresh to try again. You can still read every chapter.';$('scene-caption').textContent=STORY[step].alt;if(step===0&&introChoice==='yes'){step=1;render();}});
