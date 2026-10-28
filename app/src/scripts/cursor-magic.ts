// 全局鼠标交互：移动拖出花瓣/星光轨迹，点击冒出手绘爱心
// 轻量 DOM 粒子，自动尊重 prefers-reduced-motion
(() => {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if ('ontouchstart' in window && navigator.maxTouchPoints > 0 && window.innerWidth < 768) {
    // 手机只保留点击爱心，不做轨迹
  }

  const HEART_SVG = `<svg viewBox="0 0 32 30" width="100%" height="100%"><path d="M16 28 C8 20 1 14 1 8 A7.5 7.5 0 0 1 16 5 A7.5 7.5 0 0 1 31 8 C31 14 24 20 16 28Z" fill="none" stroke="COLOR" stroke-width="2.4" stroke-linecap="round"/></svg>`;
  const PETAL_COLORS = ['#f0b8c6', '#e8a2b4', '#f2cf9d', '#c9a44c', '#a8c29c'];

  let last = 0;
  document.addEventListener('mousemove', (e) => {
    const now = performance.now();
    if (now - last < 90) return; // 节流
    last = now;
    spawnPetal(e.clientX, e.clientY);
  }, { passive: true });

  document.addEventListener('click', (e) => {
    // 不干扰输入控件
    const t = e.target as HTMLElement;
    if (t.closest('input, textarea, select, button, .lightbox')) return;
    spawnHeart(e.clientX, e.clientY);
  });

  function spawnPetal(x: number, y: number) {
    const p = document.createElement('div');
    const size = 5 + Math.random() * 6;
    const color = PETAL_COLORS[Math.floor(Math.random() * PETAL_COLORS.length)];
    p.style.cssText = `position:fixed;left:${x}px;top:${y}px;width:${size}px;height:${size}px;
      background:${color};border-radius:60% 0 60% 0;pointer-events:none;z-index:9998;
      opacity:.85;transform:rotate(${Math.random() * 360}deg);`;
    document.body.appendChild(p);
    const dx = (Math.random() - 0.5) * 50;
    const anim = p.animate([
      { transform: `translate(0,0) rotate(0deg)`, opacity: .85 },
      { transform: `translate(${dx}px, ${30 + Math.random() * 30}px) rotate(${Math.random() > .5 ? 160 : -160}deg)`, opacity: 0 },
    ], { duration: 1100 + Math.random() * 500, easing: 'ease-out' });
    anim.onfinish = () => p.remove();
  }

  function spawnHeart(x: number, y: number) {
    const h = document.createElement('div');
    const size = 22 + Math.random() * 14;
    const color = Math.random() > .4 ? '#d47b5c' : '#c9647f';
    h.innerHTML = HEART_SVG.replace('COLOR', color);
    h.style.cssText = `position:fixed;left:${x - size / 2}px;top:${y - size / 2}px;width:${size}px;height:${size}px;
      pointer-events:none;z-index:9999;`;
    document.body.appendChild(h);
    const anim = h.animate([
      { transform: 'translateY(0) scale(.4) rotate(-8deg)', opacity: 0 },
      { transform: 'translateY(-18px) scale(1.1) rotate(4deg)', opacity: 1, offset: .3 },
      { transform: `translateY(-${70 + Math.random() * 40}px) scale(.9) rotate(${Math.random() > .5 ? 10 : -10}deg)`, opacity: 0 },
    ], { duration: 1400, easing: 'cubic-bezier(.2,.6,.3,1)' });
    anim.onfinish = () => h.remove();
  }
})();
