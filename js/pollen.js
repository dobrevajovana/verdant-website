/* VERDANT — drifting pollen and fireflies behind the hero tree (three.js).
   One Points draw call, a tiny shader, paused when the hero is off screen or the tab is hidden.
   Skipped entirely for reduced motion or when WebGL is unavailable. */
(() => {
  const canvas = document.getElementById("pollen");
  if (!canvas || !window.THREE || matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  let renderer;
  try { renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: false, powerPreference: "low-power" }); }
  catch (e) { canvas.remove(); return; }

  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const COUNT = matchMedia("(max-width: 700px)").matches ? 70 : 160;

  // per particle: base position, phase, speed, size, colour mix (0 = pollen green, 1 = firefly amber)
  const pos = new Float32Array(COUNT * 3), seed = new Float32Array(COUNT * 4);
  for (let i = 0; i < COUNT; i++) {
    pos[i * 3] = Math.random() * 2 - 1;
    pos[i * 3 + 1] = Math.random() * 2 - 1;
    seed[i * 4] = Math.random() * 6.283;
    seed[i * 4 + 1] = 0.015 + Math.random() * 0.035;
    seed[i * 4 + 2] = 2 + Math.random() * 5;
    seed[i * 4 + 3] = Math.random() < 0.3 ? 1 : 0;
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  geo.setAttribute("seed", new THREE.BufferAttribute(seed, 4));

  const readColor = (name, fallback) => {
    const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
    try { return new THREE.Color(v || fallback); } catch (e) { return new THREE.Color(fallback); }
  };
  const uniforms = {
    uTime: { value: 0 },
    uDpr: { value: Math.min(2, devicePixelRatio || 1) },
    uPollen: { value: readColor("--leaf-3", "#5bb36f") },
    uFirefly: { value: readColor("--amber", "#e9b44c") },
    uPointer: { value: new THREE.Vector2(9, 9) }
  };
  const mat = new THREE.ShaderMaterial({
    uniforms, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    vertexShader: `
      attribute vec4 seed; uniform float uTime; uniform float uDpr; uniform vec2 uPointer;
      varying float vMix; varying float vGlow;
      void main() {
        vec3 p = position;
        float t = uTime * seed.y;
        p.y = mod(p.y + 1.0 + t, 2.0) - 1.0;                       // rise slowly, wrap at the top
        p.x += sin(uTime * 0.4 + seed.x) * 0.04 + sin(p.y * 3.0 + seed.x) * 0.02;
        vec2 d = p.xy - uPointer; float r = length(d);
        p.xy += normalize(d + 1e-4) * 0.08 * smoothstep(0.25, 0.0, r);  // part around the pointer
        vMix = seed.w;
        vGlow = seed.w > 0.5 ? 0.55 + 0.45 * sin(uTime * 1.6 + seed.x * 3.0) : 0.6;
        gl_Position = vec4(p, 1.0);
        gl_PointSize = seed.z * uDpr * (seed.w > 0.5 ? 1.6 : 1.0);
      }`,
    fragmentShader: `
      uniform vec3 uPollen; uniform vec3 uFirefly; varying float vMix; varying float vGlow;
      void main() {
        float d = length(gl_PointCoord - 0.5);
        float a = smoothstep(0.5, 0.0, d);
        gl_FragColor = vec4(mix(uPollen, uFirefly, vMix), a * a * vGlow);
      }`
  });
  scene.add(new THREE.Points(geo, mat));

  const hero = canvas.parentElement;
  const resize = () => {
    const r = hero.getBoundingClientRect();
    renderer.setPixelRatio(uniforms.uDpr.value);
    renderer.setSize(r.width, r.height, false);
  };
  resize(); addEventListener("resize", resize);

  hero.addEventListener("pointermove", e => {
    const r = hero.getBoundingClientRect();
    uniforms.uPointer.value.set(((e.clientX - r.left) / r.width) * 2 - 1, -(((e.clientY - r.top) / r.height) * 2 - 1));
  });
  hero.addEventListener("pointerleave", () => uniforms.uPointer.value.set(9, 9));

  const recolor = () => { uniforms.uPollen.value = readColor("--leaf-3", "#5bb36f"); uniforms.uFirefly.value = readColor("--amber", "#e9b44c"); };
  matchMedia("(prefers-color-scheme: dark)").addEventListener("change", recolor);
  new MutationObserver(recolor).observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });

  // accumulate time ourselves so particles resume where they paused instead of jumping
  let visible = true, raf = 0, last = 0;
  const frame = (now) => {
    uniforms.uTime.value += Math.min(0.05, (now - last) / 1000);
    last = now;
    renderer.render(scene, camera);
    raf = requestAnimationFrame(frame);
  };
  const run = () => { cancelAnimationFrame(raf); if (visible && !document.hidden) { last = performance.now(); raf = requestAnimationFrame(frame); } };
  new IntersectionObserver(([en]) => { visible = en.isIntersecting; run(); }).observe(hero);
  document.addEventListener("visibilitychange", run);
  run();
})();
