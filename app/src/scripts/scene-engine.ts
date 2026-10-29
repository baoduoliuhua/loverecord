// 场景引擎：生成场景 HTML + 初始化动画（供动态渲染的回忆卡片使用）
export function sceneHTML(scene: string): string {
  if (scene === 'seaside') return `
<div class="scene scene-seaside" aria-hidden="true">
  <svg viewBox="0 0 800 220" preserveAspectRatio="none">
    <defs>
      <linearGradient id="ss-sky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#ffe3c2"/><stop offset="1" stop-color="#ffc9a3"/>
      </linearGradient>
      <linearGradient id="ss-sea" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#7fa8c4"/><stop offset="1" stop-color="#4d6f8a"/>
      </linearGradient>
    </defs>
    <rect width="800" height="220" fill="url(#ss-sky)"/>
    <circle cx="640" cy="60" r="30" fill="#ffbe7a" class="ss-sun"/>
    <g class="ss-gull" stroke="#5a5148" stroke-width="3" fill="none" stroke-linecap="round">
      <path d="M-30 50 q 10 -12 20 0 q 10 -12 20 0"/>
    </g>
    <g class="ss-gull ss-gull2" stroke="#5a5148" stroke-width="2.5" fill="none" stroke-linecap="round">
      <path d="M-60 80 q 8 -10 16 0 q 8 -10 16 0"/>
    </g>
    <rect y="120" width="800" height="100" fill="url(#ss-sea)"/>
    <foreignObject x="0" y="110" width="800" height="110">
      <canvas class="ss-canvas" width="800" height="110" style="width:100%;height:100%;display:block"></canvas>
    </foreignObject>
  </svg>
</div>`;

  if (scene === 'mountain') return `
<div class="scene scene-mountain" aria-hidden="true">
  <svg viewBox="0 0 800 240">
    <defs>
      <linearGradient id="mt-sky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#e6eef5"/><stop offset="1" stop-color="#f7f3e8"/>
      </linearGradient>
    </defs>
    <rect width="800" height="240" fill="url(#mt-sky)"/>
    <path d="M-40 240 L200 60 L380 240 Z" fill="#a4b8a0"/>
    <path d="M240 240 L520 30 L790 240 Z" fill="#7e9a86"/>
    <path d="M520 30 L580 85 L550 80 L575 120 L520 240 L465 120 L490 80 L460 85 Z" fill="#94ac99"/>
    <path d="M478 78 L520 30 L562 78 L540 70 L520 80 L500 70 Z" fill="#fff"/>
    <path class="mt-path" d="M300 240 Q 360 190 400 170 T 480 110 T 520 40"
      stroke="#d47b5c" stroke-width="3" fill="none" stroke-dasharray="6 8" stroke-linecap="round"/>
    <g class="mt-climber">
      <circle r="7" fill="#d47b5c" stroke="#fff" stroke-width="2.5"/>
      <text y="4" text-anchor="middle" font-size="9" fill="#fff">⚑</text>
    </g>
    <g class="mt-flag">
      <line x1="520" y1="40" x2="520" y2="6" stroke="#5a5148" stroke-width="3"/>
      <path class="mt-flagcloth" d="M520 6 L556 14 L520 24 Z" fill="#d47b5c"/>
    </g>
    <g class="mt-cloud" fill="#ffffff" opacity=".85">
      <ellipse cx="180" cy="120" rx="60" ry="16"/><ellipse cx="230" cy="112" rx="44" ry="14"/>
    </g>
    <g class="mt-cloud mt-cloud2" fill="#ffffff" opacity=".7">
      <ellipse cx="600" cy="150" rx="70" ry="16"/><ellipse cx="650" cy="142" rx="40" ry="12"/>
    </g>
  </svg>
</div>`;

  if (scene === 'city') {
    let lights = '';
    const buildings = [[46,116,48,96],[126,86,58,126],[216,136,43,76],[291,66,68,146],[391,111,48,101],[471,91,58,121],[561,126,48,86],[641,101,63,111],[731,136,43,76]];
    for (let i = 0; i < 60; i++) {
      const b = buildings[i % 9];
      const col = Math.floor(i / 9) % 3;
      const x = b[0] + col * (b[2] / 3) + 4;
      const y = Math.min(b[1] + Math.floor(i / 27) * 22 + (i % 3) * 20, 200);
      lights += `<rect x="${x}" y="${y}" width="7" height="9" rx="1" class="ct-light ct-d${i % 5}"/>`;
    }
    return `
<div class="scene scene-city" aria-hidden="true">
  <svg viewBox="0 0 800 220">
    <defs>
      <linearGradient id="ct-sky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#2b3247"/><stop offset="1" stop-color="#4a4260"/>
      </linearGradient>
    </defs>
    <rect width="800" height="220" fill="url(#ct-sky)"/>
    <g fill="#fff" class="ct-stars">
      <circle cx="80" cy="30" r="1.6"/><circle cx="200" cy="50" r="1.2"/><circle cx="330" cy="24" r="1.5"/>
      <circle cx="470" cy="40" r="1.2"/><circle cx="600" cy="26" r="1.6"/><circle cx="720" cy="52" r="1.3"/>
    </g>
    <circle cx="680" cy="42" r="20" fill="#f2e6c8" opacity=".9"/>
    <g>
      <rect x="40" y="110" width="60" height="110" fill="#3a4055"/>
      <rect x="120" y="80" width="70" height="140" fill="#333a50"/>
      <rect x="210" y="130" width="55" height="90" fill="#3a4055"/>
      <rect x="285" y="60" width="80" height="160" fill="#2f364b"/>
      <rect x="385" y="105" width="60" height="115" fill="#3a4055"/>
      <rect x="465" y="85" width="70" height="135" fill="#333a50"/>
      <rect x="555" y="120" width="60" height="100" fill="#3a4055"/>
      <rect x="635" y="95" width="75" height="125" fill="#333a50"/>
      <rect x="725" y="130" width="55" height="90" fill="#3a4055"/>
    </g>
    <g class="ct-lights" fill="#ffd98a">${lights}</g>
    <rect y="208" width="800" height="12" fill="#232838"/>
  </svg>
</div>`;
  }

  if (scene === 'rain') return `
<div class="scene scene-rain" aria-hidden="true">
  <canvas class="rain-canvas" width="800" height="200" style="width:100%;height:auto;display:block"></canvas>
  <div class="rain-label">🌧️ 那天下着雨</div>
</div>`;

  if (scene === 'fireworks') return `
<div class="scene scene-fireworks" aria-hidden="true">
  <canvas class="fw-canvas" width="800" height="240" style="width:100%;height:auto;display:block;cursor:crosshair"></canvas>
  <div class="fw-label">🎆 点一下，放一朵烟花</div>
</div>`;

  if (scene === 'starlight') {
    const stars = Array.from({ length: 40 }, (_, i) => {
      const x = (i * 37) % 790 + 5, y = (i * 53) % 130 + 8, r = (i % 3) * 0.5 + 0.8;
      return `<circle cx="${x}" cy="${y}" r="${r}" class="sl-star sl-d${i % 4}"/>`;
    }).join('');
    return `
<div class="scene scene-starlight" aria-hidden="true">
  <svg viewBox="0 0 800 200">
    <defs>
      <linearGradient id="sl-sky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#141b2e"/><stop offset="1" stop-color="#2c3350"/>
      </linearGradient>
    </defs>
    <rect width="800" height="200" fill="url(#sl-sky)"/>
    <g fill="#fff">${stars}</g>
    <circle cx="660" cy="46" r="22" fill="#f2e6c8" opacity=".92"/>
    <circle cx="650" cy="40" r="20" fill="#141b2e" opacity=".25"/>
    <g class="sl-meteor"><line x1="0" y1="0" x2="70" y2="26" stroke="#fff" stroke-width="2" stroke-linecap="round" opacity=".9"/></g>
    <g class="sl-meteor sl-meteor2"><line x1="0" y1="0" x2="55" y2="20" stroke="#fff" stroke-width="1.5" stroke-linecap="round" opacity=".8"/></g>
    <path d="M0 200 L120 160 L260 200 L420 150 L600 200 L760 165 L800 200 Z" fill="#1a2033"/>
    <text x="30" y="180" font-size="20" fill="#f2e6c8" opacity=".85">✨ 一起看的星空</text>
  </svg>
</div>`;
  }

  if (['spring', 'summer', 'autumn', 'winter'].includes(scene)) {
    const label = { spring: '🌸 春', summer: '☀️ 夏', autumn: '🍂 秋', winter: '❄️ 冬' }[scene];
    const particles = Array.from({ length: 14 }, (_, i) => `<span class="particle p${i}"></span>`).join('');
    return `<div class="scene scene-season scene-${scene}" aria-hidden="true"><div class="season-label">${label}</div>${particles}</div>`;
  }
  return '';
}

// 初始化场景动画（对 root 内新插入的场景生效，可重复调用）
// 性能：滚出视口的 Canvas 场景自动暂停绘制
const canvasVisibility = new WeakMap<HTMLCanvasElement, boolean>();
const visibilityObserver = typeof IntersectionObserver !== 'undefined'
  ? new IntersectionObserver(entries => {
      for (const en of entries) canvasVisibility.set(en.target as HTMLCanvasElement, en.isIntersecting);
    }, { rootMargin: '100px' })
  : null;

export function initScenes(root: ParentNode = document) {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  root.querySelectorAll('.scene-season:not([data-init])').forEach(scene => {
    (scene as HTMLElement).dataset.init = '1';
    scene.querySelectorAll('.particle').forEach((p, i) => {
      const el = p as HTMLElement;
      el.style.left = `${(i * 7.3 + Math.random() * 5) % 100}%`;
      el.style.setProperty('--dx', `${(Math.random() - 0.3) * 120}px`);
      el.style.animationDuration = `${5 + Math.random() * 6}s`;
      el.style.animationDelay = `${-Math.random() * 8}s`;
    });
  });

  root.querySelectorAll<HTMLCanvasElement>('.ss-canvas:not([data-init])').forEach(canvas => {
    canvas.dataset.init = '1'; visibilityObserver?.observe(canvas); canvasVisibility.set(canvas, true);
    const ctx = canvas.getContext('2d')!;
    const W = canvas.width, H = canvas.height;
    const ripples: { x: number; y: number; t: number }[] = [];
    let t = 0;
    const toCanvas = (e: MouseEvent | Touch) => {
      const r = canvas.getBoundingClientRect();
      return { x: (e.clientX - r.left) * (W / r.width), y: (e.clientY - r.top) * (H / r.height) };
    };
    canvas.addEventListener('mousemove', e => {
      const p = toCanvas(e);
      ripples.push({ x: p.x, y: p.y, t: 0 });
      if (ripples.length > 12) ripples.shift();
    }, { passive: true });
    canvas.addEventListener('touchmove', e => {
      const p = toCanvas(e.touches[0]);
      ripples.push({ x: p.x, y: p.y, t: 0 });
      if (ripples.length > 12) ripples.shift();
    }, { passive: true });

    function rippleOffset(x: number): number {
      let off = 0;
      for (const r of ripples) {
        const d = Math.abs(x - r.x);
        off += Math.sin(d * 0.09 - r.t * 0.25) * 7 * Math.exp(-d * 0.012) * Math.exp(-r.t * 0.03);
      }
      return off;
    }
    const waves = [
      { base: 22, amp: 6, len: 0.018, speed: 0.020, color: 'rgba(255,255,255,.55)', width: 3 },
      { base: 52, amp: 7, len: 0.014, speed: -0.014, color: 'rgba(255,255,255,.38)', width: 2.5 },
      { base: 82, amp: 8, len: 0.011, speed: 0.010, color: 'rgba(255,255,255,.24)', width: 2 },
    ];
    function draw() {
      ctx.clearRect(0, 0, W, H);
      for (const w of waves) {
        ctx.beginPath();
        ctx.strokeStyle = w.color;
        ctx.lineWidth = w.width;
        for (let x = 0; x <= W; x += 4) {
          const y = w.base + Math.sin(x * w.len + t * w.speed * 60) * w.amp + rippleOffset(x);
          x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }
        ctx.stroke();
      }
      ripples.forEach(r => r.t += 1);
      for (let i = ripples.length - 1; i >= 0; i--) if (ripples[i].t > 90) ripples.splice(i, 1);
      t += 0.016;
      if (!reduced && canvasVisibility.get(canvas) !== false) requestAnimationFrame(draw); else if (!reduced) setTimeout(() => requestAnimationFrame(draw), 400);
    }
    draw();
  });

  // ===== 雨天：雨滴下落 + 落地涟漪 =====
  root.querySelectorAll<HTMLCanvasElement>('.rain-canvas:not([data-init])').forEach(canvas => {
    canvas.dataset.init = '1'; visibilityObserver?.observe(canvas); canvasVisibility.set(canvas, true);
    const ctx = canvas.getContext('2d')!;
    const W = canvas.width, H = canvas.height;
    const drops = Array.from({ length: 70 }, () => ({
      x: Math.random() * W, y: Math.random() * H,
      len: 8 + Math.random() * 8, speed: 5 + Math.random() * 4,
    }));
    const rings: { x: number; r: number; alpha: number }[] = [];
    function draw() {
      ctx.fillStyle = '#3d4f63';
      ctx.fillRect(0, 0, W, H);
      ctx.strokeStyle = 'rgba(190,215,235,.55)';
      ctx.lineWidth = 1.4;
      for (const d of drops) {
        ctx.beginPath();
        ctx.moveTo(d.x, d.y);
        ctx.lineTo(d.x - 2, d.y + d.len);
        ctx.stroke();
        d.y += d.speed;
        if (d.y > H - 14) {
          if (rings.length < 30) rings.push({ x: d.x, r: 1, alpha: .5 });
          d.y = -d.len; d.x = Math.random() * W;
        }
      }
      // 地面水波
      for (let i = rings.length - 1; i >= 0; i--) {
        const g = rings[i];
        ctx.beginPath();
        ctx.strokeStyle = `rgba(200,220,240,${g.alpha})`;
        ctx.ellipse(g.x, H - 8, g.r * 1.8, g.r * 0.5, 0, 0, Math.PI * 2);
        ctx.stroke();
        g.r += 0.7; g.alpha -= 0.008;
        if (g.alpha <= 0) rings.splice(i, 1);
      }
      // 地面
      ctx.fillStyle = 'rgba(255,255,255,.04)';
      ctx.fillRect(0, H - 6, W, 6);
      if (!reduced && canvasVisibility.get(canvas) !== false) requestAnimationFrame(draw); else if (!reduced) setTimeout(() => requestAnimationFrame(draw), 400);
    }
    draw();
  });

  // ===== 烟火：自动 + 点击绽放 =====
  root.querySelectorAll<HTMLCanvasElement>('.fw-canvas:not([data-init])').forEach(canvas => {
    canvas.dataset.init = '1'; visibilityObserver?.observe(canvas); canvasVisibility.set(canvas, true);
    const ctx = canvas.getContext('2d')!;
    const W = canvas.width, H = canvas.height;
    type P = { x: number; y: number; vx: number; vy: number; life: number; color: string };
    let parts: P[] = [];
    const COLORS = ['#ffd98a', '#f2a2b8', '#a8c8f0', '#c9a4e8', '#f5e6b8'];
    function burst(x: number, y: number) {
      const color = COLORS[Math.floor(Math.random() * COLORS.length)];
      for (let i = 0; i < 60; i++) {
        const a = (i / 60) * Math.PI * 2;
        const sp = 1.6 + Math.random() * 2.2;
        parts.push({ x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, life: 60 + Math.random() * 25, color });
      }
    }
    canvas.addEventListener('click', e => {
      const r = canvas.getBoundingClientRect();
      burst((e.clientX - r.left) * (W / r.width), (e.clientY - r.top) * (H / r.height));
    });
    let tick = 0;
    // 星星背景（固定随机一次）
    const stars = Array.from({ length: 45 }, () => ({ x: Math.random() * W, y: Math.random() * H * 0.7, r: Math.random() * 1.2 + .4 }));
    function draw() {
      ctx.fillStyle = '#171e30';
      ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = 'rgba(255,255,255,.7)';
      for (const s of stars) { ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2); ctx.fill(); }
      for (let i = parts.length - 1; i >= 0; i--) {
        const p = parts[i];
        ctx.globalAlpha = Math.max(p.life / 70, 0);
        ctx.fillStyle = p.color;
        ctx.beginPath(); ctx.arc(p.x, p.y, 2, 0, Math.PI * 2); ctx.fill();
        p.x += p.vx; p.y += p.vy; p.vy += 0.035; p.vx *= 0.985; p.life--;
        if (p.life <= 0) parts.splice(i, 1);
      }
      ctx.globalAlpha = 1;
      tick++;
      if (tick % 200 === 100) burst(W * (0.2 + Math.random() * 0.6), H * (0.2 + Math.random() * 0.3));
      if (!reduced && canvasVisibility.get(canvas) !== false) requestAnimationFrame(draw); else if (!reduced) setTimeout(() => requestAnimationFrame(draw), 400);
    }
    if (reduced) { burst(W / 2, H / 3); }
    draw();
  });

  root.querySelectorAll('.scene-mountain:not([data-init])').forEach(scene => {
    (scene as HTMLElement).dataset.init = '1';
    const trail = scene.querySelector<SVGPathElement>('.mt-path');
    const climber = scene.querySelector<SVGGElement>('.mt-climber');
    if (!trail || !climber) return;
    const total = trail.getTotalLength();
    const setPos = (ratio: number) => {
      const p = trail.getPointAtLength(total * Math.min(Math.max(ratio, 0), 1));
      climber.setAttribute('transform', `translate(${p.x}, ${p.y})`);
    };
    setPos(0.05);
    if (reduced) { setPos(1); return; }
    const onScroll = () => {
      const r = (scene as HTMLElement).getBoundingClientRect();
      setPos((window.innerHeight - r.top) / (window.innerHeight * 0.85));
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  });
}
