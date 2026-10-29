// 书桌交互：视差、纸飞机追手、邮戳盖章、干花随风、便签翻页
export function initDesk() {
  if (window.innerWidth < 1200) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const left = document.querySelector<HTMLElement>('.desk-left');
  const right = document.querySelector<HTMLElement>('.desk-right');
  if (!left || !right) return;

  // ===== E. 整体视差（静止时休眠，鼠标移动才唤醒）=====
  let tx = 0, ty = 0, cx = 0, cy = 0, rafId = 0;
  function parallax() {
    cx += (tx - cx) * 0.06;
    cy += (ty - cy) * 0.06;
    left.style.transform = `translate(${cx * 10}px, ${cy * 8}px)`;
    right.style.transform = `translate(${cx * -14}px, ${cy * -10}px)`;
    // 位置稳定后停止循环，不再每帧重绘
    if (Math.abs(tx - cx) > 0.001 || Math.abs(ty - cy) > 0.001) {
      rafId = requestAnimationFrame(parallax);
    } else {
      rafId = 0;
    }
  }
  let lastMove = 0;
  document.addEventListener('mousemove', e => {
    const now = performance.now();
    if (now - lastMove < 40) return; // 40ms 节流
    lastMove = now;
    tx = (e.clientX / window.innerWidth - 0.5) * 2;
    ty = (e.clientY / window.innerHeight - 0.5) * 2;
    if (!rafId) parallax();
  }, { passive: true });
  parallax();

  // ===== A. 纸飞机追手 =====
  const planeWrap = document.getElementById('plane-wrap')!;
  document.addEventListener('mousemove', e => {
    const r = planeWrap.getBoundingClientRect();
    const px = r.left + r.width / 2, py = r.top + r.height / 2;
    const dx = e.clientX - px, dy = e.clientY - py;
    const dist = Math.hypot(dx, dy);
    if (dist < 420) {
      // 靠近：朝光标方向倾斜并靠近一点
      const angle = Math.max(-18, Math.min(18, dx / 24));
      const near = (420 - dist) / 420;
      planeWrap.style.transform = `translate(${dx * 0.06 * near}px, ${dy * 0.05 * near}px) rotate(${angle * near}deg)`;
    } else {
      planeWrap.style.transform = '';
    }
  }, { passive: true });

  // ===== B. 邮戳盖章 =====
  const stampWrap = document.getElementById('stamp-wrap')!;
  const zone = document.getElementById('stamp-zone')!;
  let stampCount = 0;
  function stamp() {
    stampCount++;
    const today = new Date();
    const dateStr = `${today.getFullYear()}.${String(today.getMonth() + 1).padStart(2, '0')}.${String(today.getDate()).padStart(2, '0')}`;
    const seal = document.createElement('div');
    seal.className = 'desk-seal';
    // 落在右侧桌面上不同位置，最多留 6 个，多了替换最旧
    const pos = (stampCount - 1) % 6;
    seal.style.top = `${46 + (pos % 3) * 26}%`;
    seal.style.right = `${18 + Math.floor(pos / 3) * 44}px`;
    seal.style.transform = `rotate(${(Math.random() * 24 - 12).toFixed(1)}deg)`;
    seal.innerHTML = `
      <svg viewBox="0 0 90 90" width="76" height="76">
        <circle cx="45" cy="45" r="40" fill="none" stroke="#c9647f" stroke-width="2.4" opacity=".85"/>
        <circle cx="45" cy="45" r="32" fill="none" stroke="#c9647f" stroke-width="1" opacity=".7"/>
        <path d="M45 58 C40 52 33 47 33 40 A6.5 6.5 0 0 1 45 36 A6.5 6.5 0 0 1 57 40 C57 47 50 52 45 58Z" fill="#c9647f" opacity=".85"/>
        <text x="45" y="72" text-anchor="middle" font-size="10.5" fill="#c9647f" font-family="KaiTi,serif">${dateStr}</text>
      </svg>`;
    zone.appendChild(seal);
    if (zone.children.length > 6) zone.removeChild(zone.children[0]);
    // 盖章动作：下落+回弹
    seal.animate([
      { transform: `${seal.style.transform} scale(2.4)`, opacity: 0 },
      { transform: `${seal.style.transform} scale(.92)`, opacity: 1, offset: .6 },
      { transform: `${seal.style.transform} scale(1)`, opacity: .9 },
    ], { duration: 380, easing: 'cubic-bezier(.2,.8,.3,1.2)' });
    stampWrap.animate([
      { transform: 'translateY(0)' },
      { transform: 'translateY(8px)' },
      { transform: 'translateY(0)' },
    ], { duration: 220 });
  }
  stampWrap.addEventListener('click', stamp);
  stampWrap.addEventListener('keydown', e => { if ((e as KeyboardEvent).key === 'Enter') stamp(); });

  // ===== C. 干花随风 =====
  const flowerWrap = document.getElementById('flower-wrap')!;
  let swayTimer: ReturnType<typeof setTimeout>;
  document.addEventListener('mousemove', e => {
    const r = flowerWrap.getBoundingClientRect();
    const near = e.clientX > r.left - 90 && e.clientX < r.right + 90 && e.clientY > r.top - 60 && e.clientY < r.bottom + 60;
    if (near) {
      flowerWrap.classList.add('swaying');
      clearTimeout(swayTimer);
      swayTimer = setTimeout(() => flowerWrap.classList.remove('swaying'), 1200);
    }
  }, { passive: true });

  // ===== D. 便签翻页 =====
  const note = document.getElementById('desk-note')!;
  const quotes: string[] = (window as any).__QUOTES?.length ? (window as any).__QUOTES : [
    '把普通的日子，过成值得收藏的日子。',
    '细水长流，来日方长。',
    '和你在一起，连发呆都算约会。',
    '今日宜：一起吃饭、散步、想念。',
  ];
  let qi = 0;
  note.textContent = quotes[0];
  note.addEventListener('click', () => {
    qi = (qi + 1) % quotes.length;
    note.animate([
      { transform: 'rotateX(0deg)', opacity: 1 },
      { transform: 'rotateX(88deg)', opacity: 0 },
    ], { duration: 180, easing: 'ease-in' }).onfinish = () => {
      note.textContent = quotes[qi];
      note.animate([
        { transform: 'rotateX(-88deg)', opacity: 0 },
        { transform: 'rotateX(0deg)', opacity: 1 },
      ], { duration: 220, easing: 'ease-out' });
    };
  });
}
