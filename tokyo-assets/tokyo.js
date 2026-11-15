(() => {
  'use strict';
  const slides = [...document.querySelectorAll('main > .slide')];
  const counter = document.getElementById('counter');
  const prev = document.getElementById('prev');
  const next = document.getElementById('next');
  const progress = document.querySelector('.progress');
  let current = 0;
  let scheduled = false;
  slides.forEach((slide, index) => {
    slide.querySelector('.slide-number').textContent = `${String(index + 1).padStart(2, '0')} / ${slides.length}`;
    if (!slide.hasAttribute('aria-labelledby')) {
      const heading = slide.querySelector('h2');
      heading.id = `${slide.id}-title`;
      slide.setAttribute('aria-labelledby', heading.id);
    }
  });
  function update() {
    scheduled = false;
    const marker = Math.min(window.innerHeight * 0.35, 220);
    current = 0;
    slides.forEach((slide, i) => { if (slide.getBoundingClientRect().top <= marker) current = i; });
    counter.textContent = `${current + 1} / ${slides.length}`;
    prev.disabled = current === 0;
    next.disabled = current === slides.length - 1;
    const range = document.documentElement.scrollHeight - window.innerHeight;
    progress.style.width = `${range > 0 ? Math.min(100, window.scrollY / range * 100) : 0}%`;
    document.querySelectorAll('nav a').forEach(a => {
      if (a.hash === `#${slides[current].id}`) a.setAttribute('aria-current', 'location');
      else a.removeAttribute('aria-current');
    });
  }
  function go(delta) {
    const index = Math.max(0, Math.min(slides.length - 1, current + delta));
    slides[index].scrollIntoView({block: 'start'});
  }
  prev.addEventListener('click', () => go(-1));
  next.addEventListener('click', () => go(1));
  document.getElementById('print').addEventListener('click', () => window.print());
  window.addEventListener('scroll', () => { if (!scheduled) { scheduled = true; requestAnimationFrame(update); } }, {passive: true});
  window.addEventListener('resize', update);
  document.addEventListener('keydown', e => {
    if (document.getElementById('photo-dialog').open) return;
    if (e.altKey || e.ctrlKey || e.metaKey || e.shiftKey || e.target.closest('a, button, input, textarea, select, [contenteditable]')) return;
    if (['ArrowDown', 'PageDown', 'ArrowRight'].includes(e.key)) { e.preventDefault(); go(1); }
    if (['ArrowUp', 'PageUp', 'ArrowLeft'].includes(e.key)) { e.preventDefault(); go(-1); }
    if (e.key === 'Home') { e.preventDefault(); slides[0].scrollIntoView(); }
    if (e.key === 'End') { e.preventDefault(); slides[slides.length - 1].scrollIntoView(); }
  });
  document.querySelectorAll('.sources a').forEach(a => {
    if (a.protocol === 'https:') { a.target = '_blank'; a.rel = 'noopener noreferrer'; }
  });
  const photoDialog = document.getElementById('photo-dialog');
  const photoLarge = document.getElementById('photo-large');
  const photoCaption = document.getElementById('photo-caption');
  let photoTrigger = null;
  document.querySelectorAll('.photo-open').forEach(link => {
    link.setAttribute('aria-haspopup', 'dialog');
    link.addEventListener('click', e => {
      if (e.ctrlKey || e.metaKey || e.shiftKey || e.altKey || typeof photoDialog.showModal !== 'function') return;
      e.preventDefault();
      photoTrigger = link;
      photoLarge.src = link.href;
      photoLarge.alt = link.querySelector('img').alt;
      photoCaption.replaceChildren(link.closest('figure').querySelector('figcaption').cloneNode(true));
      document.getElementById('photo-original').href = link.href;
      photoDialog.showModal();
      document.body.classList.add('photo-is-open');
    });
  });
  document.getElementById('photo-close').addEventListener('click', () => photoDialog.close());
  photoDialog.addEventListener('click', e => {
    const rect = photoDialog.getBoundingClientRect();
    if (e.target === photoDialog && (e.clientX < rect.left || e.clientX > rect.right || e.clientY < rect.top || e.clientY > rect.bottom)) photoDialog.close();
  });
  photoDialog.addEventListener('close', () => {
    document.body.classList.remove('photo-is-open');
    if (photoTrigger) photoTrigger.focus({preventScroll: true});
  });
  update();
})();
