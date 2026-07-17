// Footer year
document.getElementById('year').textContent = new Date().getFullYear();

// Hero waveform: a trace that reads half like an EKG/vitals monitor,
// half like an audio waveform — the line drifts between the two.
(function () {
  const canvas = document.getElementById('trace');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let w, h, dpr;
  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = canvas.clientWidth;
    h = canvas.clientHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  window.addEventListener('resize', resize);
  resize();

  const accent = '#4dffb0';
  const lines = 3; // stacked traces at different depths
  let t = 0;

  function pointOnLine(x, phase, amp, freq, spikeEvery, spikeChance) {
    // base sine (music) + occasional sharp spike (neural/EKG)
    const base = Math.sin((x * freq) + phase) * amp;
    const cell = Math.floor((x * freq + phase) / spikeEvery);
    const spikeSeed = Math.sin(cell * 999.1) * 0.5 + 0.5;
    let spike = 0;
    if (spikeSeed > 1 - spikeChance) {
      const local = ((x * freq + phase) % spikeEvery) / spikeEvery;
      const d = Math.abs(local - 0.5);
      spike = Math.max(0, 1 - d * 14) * amp * 2.2;
    }
    return base + spike;
  }

  function draw() {
    ctx.clearRect(0, 0, w, h);
    for (let i = 0; i < lines; i++) {
      const depth = i / (lines - 1); // 0 near, 1 far
      const midY = h * (0.62 + depth * 0.16);
      const amp = 26 - depth * 12;
      const alpha = 0.55 - depth * 0.18;
      ctx.beginPath();
      ctx.strokeStyle = accent;
      ctx.globalAlpha = alpha;
      ctx.lineWidth = 1.4;
      const step = 4;
      for (let x = 0; x <= w; x += step) {
        const y = midY - pointOnLine(
          x,
          t * (0.6 + depth * 0.2) + i * 40,
          amp,
          0.012 + depth * 0.002,
          14,
          0.35
        );
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  }

  function loop() {
    t += 1.1;
    draw();
    raf = requestAnimationFrame(loop);
  }

  let raf;
  draw();
  if (!reduceMotion) {
    raf = requestAnimationFrame(loop);
  }
})();
