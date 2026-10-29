// 导航字符小跳 + 翻页转场
export function initNavPlayful() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  // C. 字符小跳：拆分文字为逐字 span，hover 依次上跳
  document.querySelectorAll<HTMLElement>('.nav-links a').forEach(a => {
    const text = a.textContent || '';
    a.innerHTML = [...text].map((ch, i) =>
      `<span class="nav-char" style="transition-delay:${i * 45}ms">${ch === ' ' ? '&nbsp;' : ch}</span>`
    ).join('');
  });

  // D. 翻页转场：进入时纸面淡入，离开时轻轻掀起
  document.body.classList.add('page-enter');
  setTimeout(() => document.body.classList.remove('page-enter'), 500);

  document.querySelectorAll<HTMLAnchorElement>('.nav-links a, .nav-brand').forEach(a => {
    a.addEventListener('click', e => {
      const href = a.getAttribute('href') || '';
      if (!href.startsWith('/') || href === window.location.pathname) return;
      e.preventDefault();
      document.body.classList.add('page-leave');
      setTimeout(() => { window.location.href = href; }, 240);
    });
  });
}
