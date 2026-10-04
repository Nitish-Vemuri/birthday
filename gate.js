'use strict';
(() => {
 // Sydney is on daylight saving time (UTC+11) on this date.
 const unlockAt = Date.parse('2026-10-05T00:00:00+11:00');
 const localPreview = ['localhost','127.0.0.1','[::1]'].includes(window.location.hostname) && new URLSearchParams(window.location.search).get('preview') === '1';
 const el = id => document.getElementById(id);
 let opening = false, opened = false, timer;
 const loaded = new Set();
 function loadScript(src) {
  if (loaded.has(src)) return Promise.resolve();
  return new Promise((resolve, reject) => {
   const script = document.createElement('script');
   script.src = src + '?v=20261004-facing';
   script.onload = () => { loaded.add(src); resolve(); };
   script.onerror = () => { script.remove(); reject(new Error('Unable to load '+src)); };
   document.head.append(script);
  });
 }
 async function openGift() {
  if (opening || opened) return;
  opening = true;
  clearInterval(timer);
  el('gate-retry').hidden = true;
  el('gate-status').textContent = 'It’s your birthday! Dudu is opening your gift…';
  try {
   for (const src of ['story.js', 'sound.js', 'app.js']) await loadScript(src);
   opened = true;
   el('birthday-gate').hidden = true;
   el('birthday-content').hidden = false;
   el('title').focus({preventScroll:true});
  } catch {
   el('gate-status').textContent = 'Your gift is ready, but couldn’t load. Check your connection and try again.';
   el('gate-retry').hidden = false;
  } finally { opening = false; }
 }
 function update() {
  if (opened || opening) return;
  const remaining = Math.max(0, Math.ceil((unlockAt - Date.now()) / 1000));
  const parts = [Math.floor(remaining / 86400), Math.floor(remaining / 3600) % 24, Math.floor(remaining / 60) % 60, remaining % 60];
  ['days','hours','minutes','seconds'].forEach((unit,i) => { el('gate-'+unit).textContent = String(parts[i]).padStart(2,'0'); });
  if (localPreview || Date.now() >= unlockAt) void openGift();
 }
 el('gate-retry').addEventListener('click', update);
 document.addEventListener('visibilitychange', update);
 window.addEventListener('pageshow', update);
 timer = setInterval(update, 1000);
 update();
})();
