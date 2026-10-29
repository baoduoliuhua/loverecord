// A. 鼠标开花：空白处划过/轻点，开一朵小花后淡去
// C. 斑驳光影：纸面光斑缓慢晃动 + 鼠标视差
export function initBackgroundMagic() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  // ===== C. 斑驳光影 =====
  const dapple = document.createElement('div');
  dapple.className = 'light-dapple';
  document.body.appendChild(dapple);
  let dx = 0, dy = 0, cx = 0, cy = 0, raf = 0;
  document.addEventListener('mousemove', e => {
    dx = (e.clientX / window.innerWidth - 0.5) * 30;
    dy = (e.clientY / window.innerHeight - 0.5) * 20;
    if (!raf) shift();
  }, { passive: true });
  function shift() {
    cx += (dx - cx) * 0.04;
    cy += (dy - cy) * 0.04;
    dapple.style.transform = `translate(${cx}px, ${cy}px)`;
    if (Math.abs(dx - cx) > 0.2 || Math.abs(dy - cy) > 0.2) raf = requestAnimationFrame(shift);
    else raf = 0;
  }

  // ===== A. 鼠标开花 =====
  const FLOWERS = [
    // 樱花
    `<g><circle cx="0" cy="-7" r="4.5" fill="#f0b8c6"/><circle cx="6.7" cy="-2.2" r="4.5" fill="#f0b8c6"/><circle cx="4.1" cy="5.7" r="4.5" fill="#f0b8c6"/><circle cx="-4.1" cy="5.7" r="4.5" fill="#f0b8c6"/><circle cx="-6.7" cy="-2.2" r="4.5" fill="#f0b8c6"/><circle r="2.6" fill="#c9a44c"/></g>`,
    // 四叶草
    `<g><path d="M0 0 C-9 -2 -11 -11 -4 -12 C1 -13 2 -6 0 0Z" fill="#8aa87e"/><path d="M0 0 C2 -9 11 -11 12 -4 C13 1 6 2 0 0Z" fill="#8aa87e"/><path d="M0 0 C9 2 11 11 4 12 C-1 13 -2 6 0 0Z" fill="#8aa87e"/><path d="M0 0 C-2 9 -11 11 -12 4 C-13 -1 -6 -2 0 0Z" fill="#8aa87e"/><path d="M0 0 L0 12" stroke="#8aa87e" stroke-width="1.6"/></g>`,
    // 小雏菊
    `<g><circle cx="0" cy="-6" r="3.4" fill="#fff"/><circle cx="5.2" cy="-3" r="3.4" fill="#fff"/><circle cx="5.2" cy="3" r="3.4" fill="#fff"/><circle cx="0" cy="6" r="3.4" fill="#fff"/><circle cx="-5.2" cy="3" r="3.4" fill="#fff"/><circle cx="-5.2" cy="-3" r="3.4" fill="#fff"/><circle r="3" fill="#f2cf9d"/></g>`,
  ];

  function bloom(x: number, y: number) {
    const f = document.createElement('div');
    f.className = 'bg-bloom';
    const size = 22 + Math.random() * 14;
    const rot = Math.random() * 60 - 30;
    f.style.cssText = `left:${x - size / 2}px;top:${y - size / 2}px;width:${size}px;height:${size}px;`;
    f.innerHTML = `<svg viewBox="-15 -15 30 30" width="100%" height="100%">${FLOWERS[Math.floor(Math.random() * FLOWERS.length)]}</svg>`;
    document.body.appendChild(f);
    f.animate([
      { transform: `scale(0) rotate(${rot - 40}deg)`, opacity: 0 },
      { transform: `scale(1.12) rotate(${rot}deg)`, opacity: 1, offset: .35 },
      { transform: `scale(1) rotate(${rot}deg)`, opacity: 1, offset: .55 },
      { transform: `scale(.9) rotate(${rot + 10}deg)`, opacity: 0 },
    ], { duration: 3200, easing: 'ease-out' }).onfinish = () => f.remove();
  }

  let last = 0;
  document.addEventListener('mousemove', e => {
    const now = performance.now();
    if (now - last < 520) return;
    if (isInteractive(e)) return;
    last = now;
    bloom(e.clientX, e.clientY);
  }, { passive: true });
  document.addEventListener('click', e => {
    if (isInteractive(e)) return;
    bloom(e.clientX, e.clientY);
  });

  function isInteractive(e: MouseEvent): boolean {
    const t = e.target as HTMLElement;
    return !!t.closest('.tl-card, .card, .nav, button, a, input, textarea, select, .polaroid, video, .city-modal, .admin-modal, .lightbox, .stack-lightbox, .book-cover, .photo-stack, .otd-card');
  }
}
