// 导航墨迹跟随：波浪线随鼠标在菜单间滑动，离开滑回当前页
export function initNavInk() {
  const links = document.querySelector<HTMLElement>('.nav-links');
  const ink = document.getElementById('nav-ink');
  if (!links || !ink) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const active = links.querySelector<HTMLElement>('a.active') || links.querySelector('a');
  let targetX = 0, targetW = 0, curX = 0, curW = 0, raf = 0;

  function measure(el: HTMLElement) {
    const lr = links.getBoundingClientRect();
    const r = el.getBoundingClientRect();
    return { x: r.left - lr.left - 4, w: r.width + 8 };
  }

  function to(el: HTMLElement, immediate = false) {
    const { x, w } = measure(el);
    targetX = x; targetW = w;
    if (immediate) { curX = x; curW = w; paint(); }
    if (!raf) tick();
  }

  function paint() {
    ink.style.left = `${curX}px`;
    ink.style.width = `${curW}px`;
  }

  function tick() {
    curX += (targetX - curX) * 0.18;
    curW += (targetW - curW) * 0.18;
    paint();
    if (Math.abs(targetX - curX) > 0.3 || Math.abs(targetW - curW) > 0.3) {
      raf = requestAnimationFrame(tick);
    } else {
      curX = targetX; curW = targetW; paint(); raf = 0;
    }
  }

  if (active) to(active, true);
  links.querySelectorAll<HTMLElement>('a').forEach(a => {
    a.addEventListener('mouseenter', () => to(a));
  });
  links.addEventListener('mouseleave', () => { if (active) to(active); });
  window.addEventListener('resize', () => { if (active) to(active, true); });
}
