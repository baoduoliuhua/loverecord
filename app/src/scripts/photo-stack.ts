// 拍立得叠牌：多张照片错落叠放，点击顶牌抽到下一张，双击进灯箱
import { esc } from './memories-shared';

export function stackHTML(images: string[], alt: string): string {
  const cards = images.map((url, i) => `
    <figure class="stack-card polaroid" data-i="${i}">
      <img src="${esc(url)}" alt="${esc(alt)} ${i + 1}" loading="lazy" draggable="false" />
    </figure>`).join('');
  return `
  <div class="photo-stack" data-alt="${esc(alt)}">
    <div class="stack-badge">1 / ${images.length}</div>
    <div class="stack-hint">点击翻下一张 · 双击放大</div>
    ${cards}
  </div>`;
}

export function initStacks(root: ParentNode = document) {
  root.querySelectorAll<HTMLElement>('.photo-stack:not([data-init])').forEach(stack => {
    stack.dataset.init = '1';
    const cards = Array.from(stack.querySelectorAll<HTMLElement>('.stack-card'));
    const badge = stack.querySelector<HTMLElement>('.stack-badge')!;
    const images = cards.map(c => c.querySelector('img')!.src);
    let order = cards.map((_, i) => i);
    let animating = false;

    function layout() {
      order.forEach((cardIdx, depth) => {
        const el = cards[cardIdx];
        const rot = depth === 0 ? -2 : depth === 1 ? 3 : depth === 2 ? -4.5 : 5;
        const dx = depth * 7, dy = depth * 5;
        el.style.zIndex = String(cards.length - depth);
        el.style.transform = `translate(${dx}px, ${dy}px) rotate(${rot}deg)`;
        el.style.pointerEvents = depth === 0 ? 'auto' : 'none';
      });
      badge.textContent = `${order[0] + 1} / ${cards.length}`;
    }
    layout();

    cards.forEach(card => {
      card.addEventListener('click', () => {
        if (animating || order[0] !== Number(card.dataset.i)) return;
        animating = true;
        const top = cards[order[0]];
        const anim = top.animate([
          { transform: top.style.transform, opacity: 1 },
          { transform: 'translate(115%, -18px) rotate(14deg)', opacity: 0 },
        ], { duration: 380, easing: 'ease-in' });
        anim.onfinish = () => {
          order.push(order.shift()!);
          layout();
          top.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 250 });
          animating = false;
        };
      });
      card.addEventListener('dblclick', () => openLightbox(images, order[0]));
    });
  });
}

// 简易灯箱（叠牌专用，支持左右切换）
function openLightbox(images: string[], start: number) {
  document.getElementById('stack-lightbox')?.remove();
  let idx = start;
  const box = document.createElement('div');
  box.id = 'stack-lightbox';
  box.className = 'stack-lightbox';
  box.innerHTML = `
    <button class="slb-prev" aria-label="上一张">‹</button>
    <img alt="放大预览" />
    <button class="slb-next" aria-label="下一张">›</button>
    <div class="slb-counter"></div>`;
  document.body.appendChild(box);
  const img = box.querySelector('img')!;
  const counter = box.querySelector<HTMLElement>('.slb-counter')!;
  const show = () => { img.src = images[idx]; counter.textContent = `${idx + 1} / ${images.length}`; };
  show();
  box.querySelector('.slb-prev')!.addEventListener('click', e => { e.stopPropagation(); idx = (idx - 1 + images.length) % images.length; show(); });
  box.querySelector('.slb-next')!.addEventListener('click', e => { e.stopPropagation(); idx = (idx + 1) % images.length; show(); });
  box.addEventListener('click', e => { if (e.target === box) box.remove(); });
  const onKey = (e: KeyboardEvent) => {
    if (e.key === 'Escape') { box.remove(); document.removeEventListener('keydown', onKey); }
    if (e.key === 'ArrowLeft') { idx = (idx - 1 + images.length) % images.length; show(); }
    if (e.key === 'ArrowRight') { idx = (idx + 1) % images.length; show(); }
  };
  document.addEventListener('keydown', onKey);
}
