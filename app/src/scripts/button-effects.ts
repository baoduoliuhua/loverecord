// 全站按钮交互：磁吸 + 手绘描边 + 按压回弹（墨韵用 CSS）
export function initButtonEffects() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const buttons = document.querySelectorAll<HTMLElement>('.btn, .miss-btn');

  buttons.forEach(btn => {
    // 手绘描边 SVG
    if (!btn.querySelector('.btn-outline')) {
      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svg.setAttribute('class', 'btn-outline');
      svg.setAttribute('aria-hidden', 'true');
      const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      svg.appendChild(rect);
      btn.appendChild(svg);
      requestAnimationFrame(() => {
        const w = btn.offsetWidth, h = btn.offsetHeight;
        svg.setAttribute('viewBox', `0 0 ${w} ${h}`);
        rect.setAttribute('x', '2');
        rect.setAttribute('y', '2');
        rect.setAttribute('width', String(w - 4));
        rect.setAttribute('height', String(h - 4));
        rect.setAttribute('rx', '16');
      });
    }

    // 磁吸
    btn.addEventListener('mousemove', e => {
      const r = btn.getBoundingClientRect();
      const x = (e.clientX - r.left - r.width / 2) / (r.width / 2);
      const y = (e.clientY - r.top - r.height / 2) / (r.height / 2);
      btn.style.setProperty('--mx', `${x * 5}px`);
      btn.style.setProperty('--my', `${y * 4}px`);
    });
    btn.addEventListener('mouseleave', () => {
      btn.style.setProperty('--mx', '0px');
      btn.style.setProperty('--my', '0px');
    });
  });
}
