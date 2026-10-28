// A top-down koi that swims toward the pointer, with water ripples.
// Mounts a <canvas> inside the hero (between the background logo and the
// hero content) and returns a cleanup function.

const TAU = Math.PI * 2;
const N = 22; // spine points

const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const wrapPi = (a) => {
  while (a > Math.PI) a -= TAU;
  while (a < -Math.PI) a += TAU;
  return a;
};

// Smooth path through points using midpoint quadratic curves.
function smoothCurve(path, pts, first) {
  if (first) path.moveTo(pts[0].x, pts[0].y);
  else path.lineTo(pts[0].x, pts[0].y);
  for (let i = 1; i < pts.length - 1; i++) {
    const mx = (pts[i].x + pts[i + 1].x) / 2;
    const my = (pts[i].y + pts[i + 1].y) / 2;
    path.quadraticCurveTo(pts[i].x, pts[i].y, mx, my);
  }
  const l = pts[pts.length - 1];
  path.lineTo(l.x, l.y);
}

// Half-width of the body at t (0 = nose, 1 = tail root).
function halfWidth(t, maxW) {
  const head = Math.min(1, Math.sqrt(t / 0.14));
  const taper = 1 - 0.82 * Math.pow(t, 1.3);
  return maxW * head * taper;
}

// Orange patches: t along body, off across body (in half-widths),
// rx along body (fraction of length), ry across body (in half-widths).
const PATCHES = [
  { t: 0.18, off: -0.1, rx: 0.065, ry: 0.95 },
  { t: 0.3, off: 0.1, rx: 0.1, ry: 1.1 },
  { t: 0.43, off: -0.08, rx: 0.095, ry: 1.0 },
  { t: 0.56, off: 0.08, rx: 0.07, ry: 0.85 },
  { t: 0.68, off: -0.1, rx: 0.05, ry: 0.65 },
];

function makeFin(bx, by, ang, len, wid) {
  const dx = Math.cos(ang);
  const dy = Math.sin(ang);
  const px = -dy;
  const py = dx;
  const tipx = bx + dx * len;
  const tipy = by + dy * len;
  const mx = bx + dx * len * 0.5;
  const my = by + dy * len * 0.5;
  const path = new Path2D();
  path.moveTo(bx, by);
  path.quadraticCurveTo(mx + px * wid, my + py * wid, tipx, tipy);
  path.quadraticCurveTo(mx - px * wid * 0.5, my - py * wid * 0.5, bx, by);
  const rays = [-0.5, 0, 0.5].map((k) => ({
    x1: bx,
    y1: by,
    x2: tipx + px * wid * k * 0.8,
    y2: tipy + py * wid * k * 0.8,
  }));
  return { path, rays };
}

function makeTail(bx, by, ang, len, spread) {
  const dx = Math.cos(ang);
  const dy = Math.sin(ang);
  const px = -dy;
  const py = dx;
  const mid = { x: bx + dx * len * 0.5, y: by + dy * len * 0.5 };
  const tipL = { x: bx + dx * len + px * spread, y: by + dy * len + py * spread };
  const tipR = { x: bx + dx * len - px * spread, y: by + dy * len - py * spread };
  const notch = { x: bx + dx * len * 0.72, y: by + dy * len * 0.72 };
  const path = new Path2D();
  path.moveTo(bx + px * 2, by + py * 2);
  path.quadraticCurveTo(mid.x + px * spread * 1.3, mid.y + py * spread * 1.3, tipL.x, tipL.y);
  path.quadraticCurveTo(
    (tipL.x + notch.x) / 2 + px * spread * 0.15,
    (tipL.y + notch.y) / 2 + py * spread * 0.15,
    notch.x,
    notch.y,
  );
  path.quadraticCurveTo(
    (tipR.x + notch.x) / 2 - px * spread * 0.15,
    (tipR.y + notch.y) / 2 - py * spread * 0.15,
    tipR.x,
    tipR.y,
  );
  path.quadraticCurveTo(mid.x - px * spread * 1.3, mid.y - py * spread * 1.3, bx - px * 2, by - py * 2);
  path.closePath();
  const rays = [-0.6, 0, 0.6].map((k) => ({
    x1: bx,
    y1: by,
    x2: bx + dx * len * 0.92 + px * spread * k,
    y2: by + dy * len * 0.92 + py * spread * k,
  }));
  return { path, rays };
}

export function initKoiPond(hero) {
  const canvas = document.createElement('canvas');
  canvas.className = 'koi-pond';
  canvas.setAttribute('aria-hidden', 'true');
  canvas.style.cssText =
    'position:absolute;inset:0;width:100%;height:100%;display:block;pointer-events:none;';
  const ctx = canvas.getContext('2d');
  if (!ctx) return () => {};

  // Sit above the blurred background logo, below the welcome text and cards.
  const bgf = hero.querySelector('.bgf');
  hero.insertBefore(canvas, bgf ? bgf.nextSibling : hero.firstChild);

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  const root = document.documentElement;

  let W = 0;
  let H = 0;
  let L = 160; // koi length in px
  let rgb = '95,224,238'; // ripple color, follows the theme

  const koi = { x: 0, y: 0, ang: 0, speed: 1.5, phase: 0, travelled: 0, pts: [], seg: 10 };
  const pointer = { x: 0, y: 0, active: false, inside: false, type: 'mouse', t: 0, rx: 0, ry: 0, rt: 0 };
  const ripples = [];

  const readTheme = () => {
    const v = getComputedStyle(root).getPropertyValue('--glowrgb').trim();
    if (v) rgb = v;
  };
  readTheme();
  const themeObserver = new MutationObserver(readTheme);
  themeObserver.observe(root, { attributes: true, attributeFilter: ['data-theme'] });

  function place(x, y, ang) {
    koi.x = x;
    koi.y = y;
    koi.ang = ang;
    koi.pts = [];
    for (let i = 0; i < N; i++) {
      koi.pts.push({ x: x - Math.cos(ang) * koi.seg * i, y: y - Math.sin(ang) * koi.seg * i });
    }
  }

  function resize() {
    W = hero.clientWidth;
    H = hero.clientHeight;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.max(1, Math.round(W * dpr));
    canvas.height = Math.max(1, Math.round(H * dpr));
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    L = clamp(Math.min(W, H) * 0.50, 500, 700);
    koi.seg = L / (N - 1);
    if (!koi.pts.length && W > 0) place(W * 0.28, H * 0.62, -0.25);
  }

  function addRipple(x, y, maxR, alpha, life = 110, delay = 0, lw = 1.6) {
    if (ripples.length > 48) ripples.shift();
    ripples.push({ x, y, r: 0, maxR, alpha, speed: maxR / life, delay, lw });
  }

  function step(dt, now) {
    const k = dt / 16.667;
    const sc = L / 170;

    const following = pointer.active && (pointer.type === 'mouse' ? pointer.inside : now - pointer.t < 5000);
    let tx;
    let ty;
    if (following) {
      tx = pointer.x;
      ty = pointer.y;
    } else {
      tx = W * (0.5 + 0.32 * Math.sin(now * 0.00031));
      ty = H * (0.5 + 0.24 * Math.sin(now * 0.00047 + 1.3));
    }

    const dx = tx - koi.x;
    const dy = ty - koi.y;
    const dist = Math.hypot(dx, dy);
    const diff = wrapPi(Math.atan2(dy, dx) - koi.ang);
    // Limit turning so the fish makes wide, graceful arcs around the cursor.
    const maxTurn = clamp(koi.speed / (0.28 * L), 0.02, 0.06) * k;
    koi.ang += clamp(diff, -maxTurn, maxTurn);

    const desired = clamp(dist * 0.022, 1.1, 3.2) * sc;
    koi.speed += (desired - koi.speed) * Math.min(1, 0.06 * k);
    koi.x += Math.cos(koi.ang) * koi.speed * k;
    koi.y += Math.sin(koi.ang) * koi.speed * k;
    koi.phase += (0.1 + 0.045 * (koi.speed / sc)) * k;

    const p = koi.pts;
    p[0].x = koi.x;
    p[0].y = koi.y;
    for (let i = 1; i < N; i++) {
      let ux = p[i].x - p[i - 1].x;
      let uy = p[i].y - p[i - 1].y;
      const d = Math.hypot(ux, uy) || 1;
      ux /= d;
      uy /= d;
      p[i].x = p[i - 1].x + ux * koi.seg;
      p[i].y = p[i - 1].y + uy * koi.seg;
    }

    // Small ripples as the koi swims.
    koi.travelled += koi.speed * k;
    if (koi.travelled > 44 * sc) {
      koi.travelled = 0;
      addRipple(p[2].x, p[2].y, L * 0.5, 0.28, 110);
    }

    for (let i = ripples.length - 1; i >= 0; i--) {
      const r = ripples[i];
      if (r.delay > 0) {
        r.delay -= dt;
        continue;
      }
      r.r += r.speed * k;
      if (r.r >= r.maxR) ripples.splice(i, 1);
    }
  }

  function frames(P) {
    const out = [];
    for (let i = 0; i < P.length; i++) {
      const a = P[Math.max(i - 1, 0)];
      const b = P[Math.min(i + 1, P.length - 1)];
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const l = Math.hypot(dx, dy) || 1;
      const tx = dx / l;
      const ty = dy / l;
      out.push({ tx, ty, nx: -ty, ny: tx, a: Math.atan2(ty, tx) });
    }
    return out;
  }

  function drawRipples() {
    for (const r of ripples) {
      if (r.delay > 0 || r.r <= 0) continue;
      const k = r.r / r.maxR;
      const a = r.alpha * Math.pow(1 - k, 1.6);
      if (a < 0.004) continue;
      ctx.beginPath();
      ctx.arc(r.x, r.y, r.r, 0, TAU);
      ctx.fillStyle = `rgba(${rgb},${a * 0.07})`;
      ctx.fill();
      ctx.lineWidth = r.lw * (1 - k * 0.6) + 0.4;
      ctx.strokeStyle = `rgba(${rgb},${a})`;
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(r.x, r.y, r.r * 0.72, 0, TAU);
      ctx.lineWidth = r.lw * 0.6 * (1 - k * 0.6) + 0.3;
      ctx.strokeStyle = `rgba(${rgb},${a * 0.55})`;
      ctx.stroke();
    }
  }

  function drawKoi() {
    const sc = L / 170;
    const base = frames(koi.pts);
    const speedN = clamp(koi.speed / (3.2 * sc), 0, 1);
    const amp = L * (0.035 + 0.03 * speedN);

    // Body wave: displace each spine point sideways.
    const P = koi.pts.map((pt, i) => {
      const t = i / (N - 1);
      const off = Math.sin(koi.phase - t * 3.4) * amp * Math.pow(t, 1.15);
      return { x: pt.x + base[i].nx * off, y: pt.y + base[i].ny * off };
    });
    const F = frames(P);
    const maxW = L * 0.095;
    const w = P.map((_, i) => halfWidth(i / (N - 1), maxW));

    const left = [];
    const right = [];
    for (let i = 0; i < N; i++) {
      left.push({ x: P[i].x + F[i].nx * w[i], y: P[i].y + F[i].ny * w[i] });
      right.push({ x: P[i].x - F[i].nx * w[i], y: P[i].y - F[i].ny * w[i] });
    }
    const body = new Path2D();
    smoothCurve(body, left, true);
    smoothCurve(body, right.slice().reverse(), false);
    body.closePath();

    // Fins
    const flap = Math.sin(koi.phase * 0.5) * 0.16;
    const fins = [];
    const addFin = (idx, side, len, wid, theta, fl) => {
      const bx = P[idx].x + F[idx].nx * side * w[idx] * 0.85;
      const by = P[idx].y + F[idx].ny * side * w[idx] * 0.85;
      fins.push(makeFin(bx, by, F[idx].a + side * (theta + fl * side), len, wid));
    };
    const ip = Math.round(0.2 * (N - 1));
    const iv = Math.round(0.5 * (N - 1));
    addFin(ip, 1, L * 0.21, L * 0.12, 0.95, flap);
    addFin(ip, -1, L * 0.21, L * 0.12, 0.95, -flap);
    addFin(iv, 1, L * 0.12, L * 0.07, 0.8, -flap * 0.6);
    addFin(iv, -1, L * 0.12, L * 0.07, 0.8, flap * 0.6);

    // Tail
    const sway = Math.sin(koi.phase - 3.9) * (0.25 + 0.3 * speedN);
    const tail = makeTail(P[N - 1].x, P[N - 1].y, F[N - 1].a + sway, L * 0.26, L * 0.1);

    // Shadow, filled once as a union so overlaps don't darken.
    const shadow = new Path2D();
    shadow.addPath(body);
    fins.forEach((f) => shadow.addPath(f.path));
    shadow.addPath(tail.path);
    ctx.save();
    ctx.translate(L * 0.045, L * 0.07);
    ctx.fillStyle = 'rgba(2,24,32,.2)';
    ctx.fill(shadow);
    ctx.restore();

    // Fins and tail
    ctx.lineWidth = 1;
    for (const f of [...fins, tail]) {
      ctx.fillStyle = 'rgba(250,253,253,.94)';
      ctx.fill(f.path);
      ctx.strokeStyle = 'rgba(10,70,82,.16)';
      ctx.stroke(f.path);
      ctx.strokeStyle = 'rgba(90,150,162,.38)';
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      for (const r of f.rays) {
        ctx.moveTo(r.x1, r.y1);
        ctx.lineTo(r.x2, r.y2);
      }
      ctx.stroke();
      ctx.lineWidth = 1;
    }

    // Body
    ctx.fillStyle = '#fbfeff';
    ctx.fill(body);

    // Orange patches, clipped to the body
    ctx.save();
    ctx.clip(body);
    ctx.fillStyle = '#1a9ef6';
    for (const pa of PATCHES) {
      const f = pa.t * (N - 1);
      const i0 = Math.min(N - 2, Math.floor(f));
      const fr = f - i0;
      const cx = P[i0].x + (P[i0 + 1].x - P[i0].x) * fr;
      const cy = P[i0].y + (P[i0 + 1].y - P[i0].y) * fr;
      const nx = F[i0].nx;
      const ny = F[i0].ny;
      const wAt = w[i0] + (w[i0 + 1] - w[i0]) * fr;
      ctx.beginPath();
      ctx.ellipse(cx + nx * pa.off * wAt, cy + ny * pa.off * wAt, pa.rx * L, pa.ry * wAt, F[i0].a, 0, TAU);
      ctx.fill();
    }
    ctx.restore();

    ctx.strokeStyle = 'rgba(10,70,82,.18)';
    ctx.lineWidth = 1;
    ctx.stroke(body);

    // Eyes
    ctx.fillStyle = '#17262b';
    for (const side of [1, -1]) {
      const ex = P[1].x + F[1].nx * side * w[1] * 0.62;
      const ey = P[1].y + F[1].ny * side * w[1] * 0.62;
      ctx.beginPath();
      ctx.ellipse(ex, ey, L * 0.017, L * 0.011, F[1].a, 0, TAU);
      ctx.fill();
    }
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    if (!koi.pts.length) return;
    drawRipples();
    drawKoi();
  }

  // Animation loop (paused offscreen / in background tabs / reduced motion)
  let raf = 0;
  let last = 0;
  let visible = true;

  function tick(now) {
    raf = requestAnimationFrame(tick);
    // Users with "reduce motion" on still get the koi, just slower and calmer.
    const dt = Math.min(50, now - (last || now)) * (reduce.matches ? 0.55 : 1);
    last = now;
    if (!koi.pts.length) return;
    step(dt, now);
    draw();
  }
  function start() {
    if (raf || !visible || document.hidden) return;
    last = 0;
    raf = requestAnimationFrame(tick);
  }
  function stop() {
    cancelAnimationFrame(raf);
    raf = 0;
  }

  // Pointer input
  function local(e) {
    const r = hero.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  }
  function onMove(e) {
    const { x, y } = local(e);
    const now = performance.now();
    pointer.x = x;
    pointer.y = y;
    pointer.active = true;
    pointer.inside = true;
    pointer.type = e.pointerType || 'mouse';
    pointer.t = now;
    if (Math.hypot(x - pointer.rx, y - pointer.ry) >= 56 && now - pointer.rt >= 70) {
      pointer.rx = x;
      pointer.ry = y;
      pointer.rt = now;
      addRipple(x, y, L * 0.55, 0.3, 100);
    }
  }
  function onDown(e) {
    onMove(e);
    const { x, y } = local(e);
    for (let i = 0; i < 3; i++) addRipple(x, y, L * 1.25, 0.5, 150, i * 140, 2);
  }
  function onLeave(e) {
    if ((e.pointerType || 'mouse') === 'mouse') pointer.inside = false;
  }

  hero.addEventListener('pointermove', onMove, { passive: true });
  hero.addEventListener('pointerdown', onDown, { passive: true });
  hero.addEventListener('pointerleave', onLeave, { passive: true });

  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(hero);

  const io = new IntersectionObserver((entries) => {
    visible = entries[0].isIntersecting;
    if (visible) start();
    else stop();
  });
  io.observe(hero);

  const onVisibility = () => (document.hidden ? stop() : start());
  document.addEventListener('visibilitychange', onVisibility);

  resize();
  start();

  return () => {
    stop();
    hero.removeEventListener('pointermove', onMove);
    hero.removeEventListener('pointerdown', onDown);
    hero.removeEventListener('pointerleave', onLeave);
    document.removeEventListener('visibilitychange', onVisibility);
    resizeObserver.disconnect();
    io.disconnect();
    themeObserver.disconnect();
    canvas.remove();
  };
}