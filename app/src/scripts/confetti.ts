// 彩带庆祝：DOM 粒子，从顶部洒落
export function confetti(count = 80) {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const COLORS = ['#d47b5c', '#c9a44c', '#8aa87e', '#6b8ea8', '#f0b8c6', '#e8a2b4'];
  for (let i = 0; i < count; i++) {
    const p = document.createElement('div');
    const size = 6 + Math.random() * 8;
    const color = COLORS[i % COLORS.length];
    const isCircle = Math.random() > 0.5;
    p.style.cssText = `position:fixed;top:-20px;left:${Math.random() * 100}vw;width:${size}px;height:${size * (isCircle ? 1 : 0.6)}px;
      background:${color};border-radius:${isCircle ? '50%' : '2px'};pointer-events:none;z-index:9997;`;
    document.body.appendChild(p);
    const anim = p.animate([
      { transform: 'translateY(0) rotate(0deg)', opacity: 1 },
      { transform: `translate(${(Math.random() - 0.5) * 220}px, ${window.innerHeight + 60}px) rotate(${Math.random() * 900 - 450}deg)`, opacity: 0.7 },
    ], { duration: 2400 + Math.random() * 2000, delay: Math.random() * 600, easing: 'cubic-bezier(.2,.6,.4,1)' });
    anim.onfinish = () => p.remove();
  }
}
