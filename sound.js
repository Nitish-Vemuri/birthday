'use strict';
// Original music and wordless cartoon sounds; no recordings or third-party samples.
function makeSceneScore(id,durationMs){
 const end=durationMs/1000,notes=[];
 const add=(at,length,hz,to=hz,volume=.04,type='sine',voice=false)=>{if(at<end&&length>0)notes.push({at,length:Math.min(length,end-at),hz,to,volume,type,voice});};
 const bell=(at,hz,volume=.035)=>{add(at,.7,hz,hz,volume);add(at,.32,hz*2.76,hz*2.76,volume*.16);};
 const babble=(from,until,base=450,volume=.075)=>{const pitches=[1,1.15,.93,1.3,1.08,.88,1.2];let i=0;for(let t=from;t<until-.14;t+=i%4===3?.34:.21){const f=base*pitches[i%pitches.length];add(t,.14+(i%3)*.02,f,f*(i%2?.84:1.12),volume,'sawtooth',true);i++;}};
 // A soft music-box phrase under every chapter, leaving space for the character sounds.
 const tune=[523.25,659.25,783.99,659.25,587.33,698.46,880,783.99];
 for(let i=0,t=.12;t<end-.6;i++,t+=.72)bell(t,tune[(i+(['coffee','parcel'].includes(id)?2:0))%tune.length],['chatter','coffee'].includes(id)?.014:.025);
 if(id==='welcome_ask'){
  babble(.25,1.7,255,.06);bell(2.05,784,.04);
 }else if(id==='welcome_no'){
  add(.1,.24,300,180,.07,'sawtooth',true);babble(.55,2.2,270,.065);bell(2.35,880,.045);
 }else if(id==='welcome_yes'){
  [523,659,784,1046].forEach((f,i)=>bell(.08+i*.19,f,.055));babble(.25,.85,330,.06);
 }else if(id==='distance'){
  for(let t=.16;t<2.15;t+=.2){add(t,.075,135,65,.055,'triangle');add(t+.065,.06,175,75,.045,'triangle');}
  add(2.2,.3,220,65,.11,'triangle');add(2.25,.37,580,140,.075,'sine');bell(3.35,659,.035);bell(3.6,784,.035);[659,784,1046].forEach((f,i)=>bell(4.9+i*.28,f,.045));
 }else if(id==='chatter'){
  babble(.15,1.95);add(2.38,.3,620,300,.085,'sawtooth',true);add(2.85,.2,400,270,.065,'sawtooth',true);[523,659,784].forEach((f,i)=>bell(4.3+i*.16,f,.055));babble(6.1,7.8,470);
 }else if(id==='coffee'){
  babble(.12,1.4);bell(1.65,1174,.035);bell(1.9,1568,.025);babble(2.8,3.65,500,.038);babble(4.15,4.95,230,.065);bell(5.3,1318,.04);babble(5.9,7.5,460,.065);
  }else if(id==='emergency'){
  bell(.12,880,.05);bell(.35,1046,.05);for(let t=1;t<2.9;t+=.19)add(t,.07,150,70,.05,'triangle');add(2.95,.4,600,130,.06);[523,659,784].forEach((f,i)=>bell(3.65+i*.18,f,.05));babble(4.6,5.4,260,.05);
 }else if(id==='parcel'){
  [0.4,1.1,1.8,2.5].forEach(t=>add(t,.18,180,115,.065,'triangle'));add(3.1,.6,140,820,.075,'sine');[784,1046,1318].forEach((f,i)=>bell(4.1+i*.2,f,.05));
 }else if(id==='birthday'){
  [523,659,784,1046].forEach((f,i)=>bell(3.5+i*.3,f,.06));
 }else if(id==='hug'||id==='notes'){
  [261.63,329.63,392].forEach((f,i)=>add(.5+i*.3,1.8,f,f,.014,'sine'));
 }
 return notes.sort((a,b)=>a.at-b.at);
}
const storyAudio=(()=>{
 let context,master,enabled=true,epoch=0,available=true,endTimer;
 const active=new Set();
 try{enabled=localStorage.getItem('birthday-sound')!=='off';}catch{}
 const update=(state,message)=>{const button=document.getElementById('sound-toggle'),status=document.getElementById('sound-status');button.textContent=enabled?'Sound on':'Sound off';button.setAttribute('aria-pressed',String(enabled));button.disabled=!available;status.dataset.state=state;status.textContent=message;};
 function stop(){epoch++;clearTimeout(endTimer);if(!context)return;for(const entry of active){try{entry.gain.gain.cancelScheduledValues(context.currentTime);entry.gain.gain.setTargetAtTime(0,context.currentTime,.005);entry.osc.stop(context.currentTime+.02);}catch{} }active.clear();}
 function prime(){
  if(!enabled||!available)return;
  try{if(!context){const Constructor=window.AudioContext||window.webkitAudioContext;if(!Constructor)throw new Error('unsupported');context=new Constructor();master=context.createGain();master.gain.value=.65;const limiter=context.createDynamicsCompressor();limiter.threshold.value=-12;limiter.knee.value=12;limiter.ratio.value=6;master.connect(limiter);limiter.connect(context.destination);}if(context.state!=='running')context.resume().catch(()=>update('blocked','Tap Replay to enable sound.'));}
  catch{available=false;update('unavailable','Sound isn’t available in this browser. The story still works.');}
 }
 function schedule(note,base,offset,end){
  if(note.at<offset||note.at>=end)return;
  const at=base+note.at-offset,length=Math.min(note.length,end-note.at),osc=context.createOscillator(),gain=context.createGain();let filter;
  osc.type=note.type;osc.frequency.setValueAtTime(note.hz,at);osc.frequency.exponentialRampToValueAtTime(Math.max(20,note.to),at+length*.85);
  gain.gain.setValueAtTime(.0001,at);gain.gain.exponentialRampToValueAtTime(note.volume,at+Math.min(.012,length*.15));gain.gain.exponentialRampToValueAtTime(.0001,at+length);
  if(note.voice){filter=context.createBiquadFilter();filter.type='bandpass';filter.Q.value=1.5;filter.frequency.setValueAtTime(note.hz*2.5,at);filter.frequency.exponentialRampToValueAtTime(note.to*3.7,at+length);osc.connect(filter);filter.connect(gain);}else osc.connect(gain);
  gain.connect(master);const entry={osc,gain};active.add(entry);osc.onended=()=>{osc.disconnect();gain.disconnect();filter?.disconnect();active.delete(entry);};osc.start(at);osc.stop(at+length+.01);
 }
 async function play(id,durationMs,offsetMs=0){
  stop();const ticket=epoch;
  if(!available)return;
  if(!enabled){update('muted','Sound is off.');return;}
  if(!context){update('waiting','Tap Replay or open your surprise to hear the music.');return;}
  try{await context.resume();if(ticket!==epoch||!enabled||document.hidden)return;const offset=offsetMs/1000,end=durationMs/1000;if(offset>=end){update('ready','Sound is ready. Tap Replay to hear this scene.');return;}const base=context.currentTime+.025;makeSceneScore(id,durationMs).forEach(note=>schedule(note,base,offset,end));update('playing','Music + little cartoon sounds · tap Sound on to mute.');endTimer=setTimeout(()=>{if(ticket===epoch)finished();},(end-offset)*1000+40);}
  catch{if(ticket===epoch)update('blocked','Tap Replay to enable sound.');}
 }
 function toggle(){enabled=!enabled;try{localStorage.setItem('birthday-sound',enabled?'on':'off');}catch{}if(!enabled){stop();update('muted','Sound is off.');}else prime();return enabled;}
 function finished(){if(enabled&&context)update('ready','Tap Replay to hear it again.');}
 update(enabled?'waiting':'muted',enabled?'Tap Replay or open your surprise to hear the music.':'Sound is off.');
 return {prime,play,stop,toggle,finished};
})();
