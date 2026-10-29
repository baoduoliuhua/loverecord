// 全站滚动效果：滚动进度墨迹、导航自动收放、回顶纸飞机
export function initScrollEffects() {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // C. 滚动进度墨迹
  const ink = document.createElement('div');
  ink.className = 'scroll-ink';
  document.body.appendChild(ink);
  function updateInk() {
    const h = document.documentElement.scrollHeight - window.innerHeight;
    ink.style.width = `${h > 0 ? Math.min(window.scrollY / h * 100, 100) : 0}%`;
  }

  // D. 导航自动收放
  const nav = document.querySelector<HTMLElement>('.nav');
  let lastY = window.scrollY;
  function updateNav() {
    if (!nav) return;
    const y = window.scrollY;
    if (y > 240 && y > lastY + 4) nav.classList.add('nav-hidden');
    else if (y < lastY - 4 || y < 120) nav.classList.remove('nav-hidden');
    lastY = y;
  }

  // F. 回顶纸飞机
  const fly = document.createElement('button');
  fly.className = 'back-top';
  fly.setAttribute('aria-label', '回到顶部');
  fly.innerHTML = `<svg viewBox="0 0 120 100" width="34" height="28"><path d="M10 55 L105 15 L60 85 L48 60 Z" fill="none" stroke="currentColor" stroke-width="4" stroke-linejoin="round"/><path d="M48 60 L105 15" fill="none" stroke="currentColor" stroke-width="3"/></svg>`;
  document.body.appendChild(fly);
  function updateFly() {
    fly.classList.toggle('visible', window.scrollY > 600);
  }
  fly.addEventListener('click', () => {
    fly.classList.add('flying');
    window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' });
    setTimeout(() => fly.classList.remove('flying'), 800);
  });

  // 滚动事件合并到动画帧，避免高频触发
  let ticking = false;
  window.addEventListener('scroll', () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      updateInk(); updateNav(); updateFly();
      ticking = false;
    });
  }, { passive: true });
  updateInk(); updateNav(); updateFly();
}

// B. 卡片 3D 倾斜（时间轴回忆卡 / 首页天数卡）
export function initCardTilt() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (window.innerWidth < 900) return; // 手机不做

  document.querySelectorAll<HTMLElement>('.tl-card, .days-card').forEach(card => {
    if ((card as any).__tiltInit) return;
    (card as any).__tiltInit = true;
    card.classList.add('tiltable');
    card.addEventListener('mousemove', e => {
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      card.style.transform = `perspective(900px) rotateY(${x * 6}deg) rotateX(${-y * 5}deg) translateY(-3px)`;
      card.style.setProperty('--glare-x', `${(x + 0.5) * 100}%`);
      card.style.setProperty('--glare-y', `${(y + 0.5) * 100}%`);
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });
}
