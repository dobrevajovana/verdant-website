/* VERDANT — scroll-driven storytelling with GSAP ScrollTrigger.
   Everything here is enhancement: without GSAP, or with reduced motion, the page is complete as written. */
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduce || !window.gsap || !window.ScrollTrigger) return;
  gsap.registerPlugin(ScrollTrigger);

  const start = () => {
    const V = window.VERDANT || {};

    /* reading progress */
    gsap.to(".progress", { scaleX: 1, ease: "none", scrollTrigger: { start: 0, end: "max", scrub: 0.3 } });

    /* hero: copy rises in, then the landscape drifts apart as you leave */
    gsap.fromTo(".hero-copy > *", { autoAlpha: 0.15, y: 24 }, { autoAlpha: 1, y: 0, duration: 0.9, stagger: 0.08, ease: "power3.out" });
    const heroOut = { trigger: ".hero", start: "top top", end: "bottom top", scrub: 0.6 };
    gsap.to("#hill-back", { y: -40, ease: "none", scrollTrigger: heroOut });
    gsap.to("#hill-mid", { y: -18, ease: "none", scrollTrigger: heroOut });
    gsap.to(".hero-copy", { y: 60, autoAlpha: 0.3, ease: "none", scrollTrigger: heroOut });
    gsap.to(".tree-wrap", { scale: 1.06, transformOrigin: "50% 100%", ease: "none", scrollTrigger: heroOut });

    /* counters */
    gsap.utils.toArray("[data-count]").forEach(n => {
      const end = +n.dataset.count, suf = n.dataset.suffix || "", o = { v: 0 };
      ScrollTrigger.create({ trigger: n, start: "top 90%", once: true,
        onEnter: () => gsap.to(o, { v: end, duration: 1.6, ease: "expo.out", onUpdate: () => n.textContent = Math.round(o.v).toLocaleString("en-US") + suf }) });
    });

    /* section reveals (start at 15% opacity so nothing is ever invisible) */
    ScrollTrigger.batch(".head > *, .reveal", {
      start: "top 88%", once: true,
      onEnter: els => gsap.fromTo(els, { autoAlpha: 0.15, y: 28 }, { autoAlpha: 1, y: 0, duration: 0.8, stagger: 0.07, ease: "power3.out", overwrite: true })
    });

    /* four trees: a pinned walk through 2,000 years on wide screens */
    const mm = gsap.matchMedia();
    mm.add("(min-width: 960px)", () => {
      const sec = document.getElementById("trees"), trees = sec.querySelector(".trees");
      const vp = document.createElement("div"); vp.className = "trees-viewport";
      trees.parentNode.insertBefore(vp, trees); vp.appendChild(trees);
      sec.classList.add("trees-pin");
      const dist = () => Math.max(0, trees.scrollWidth - vp.clientWidth);
      const tl = gsap.timeline({ scrollTrigger: { trigger: sec, start: "top top", end: () => "+=" + (dist() + window.innerHeight * 0.6), pin: true, scrub: 0.8, invalidateOnRefresh: true } });
      tl.to(trees, { x: () => -dist(), ease: "none" }, 0)
        .to(".rail-fill", { scaleX: 1, ease: "none" }, 0);
      // Darwin's sketch draws itself as its card passes
      sec.querySelectorAll(".draw").forEach((p, i) => {
        const L = p.getTotalLength(); gsap.set(p, { strokeDasharray: L, strokeDashoffset: L });
        tl.to(p, { strokeDashoffset: 0, ease: "none", duration: 0.12 }, 0.4 + i * 0.03);
      });
      return () => { sec.classList.remove("trees-pin"); vp.parentNode.insertBefore(trees, vp); vp.remove(); gsap.set(trees, { clearProps: "transform" }); };
    });
    mm.add("(max-width: 959px)", () => {
      document.querySelectorAll("#trees .draw").forEach((p, i) => {
        const L = p.getTotalLength();
        gsap.fromTo(p, { strokeDasharray: L, strokeDashoffset: L }, { strokeDashoffset: 0, duration: 1, delay: i * 0.15, ease: "power2.out", scrollTrigger: { trigger: p, start: "top 85%", once: true } });
      });
    });

    /* one beetle: the graph gently floats while in view */
    gsap.to("#wolf", { y: -14, ease: "none", scrollTrigger: { trigger: "#names", start: "top bottom", end: "bottom top", scrub: 1 } });

    /* ask the graph: type the first question when it comes into view */
    ScrollTrigger.create({ trigger: "#ask", start: "top 65%", once: true, onEnter: () => V.ask && V.ask("forest") });

    /* meaning is distance: rings open up, candidate words drift into place */
    gsap.fromTo("#rings > circle", { scale: 0.6, transformOrigin: "50% 50%" }, { scale: 1, ease: "none", stagger: 0.05,
      scrollTrigger: { trigger: "#distance", start: "top 80%", end: "center center", scrub: 0.8 } });
    if (V.candidates) gsap.fromTo(V.candidates.children, { autoAlpha: 0, scale: 0.4, transformOrigin: "50% 50%" }, { autoAlpha: 1, scale: 1, stagger: 0.08, ease: "back.out(2)", duration: 0.7,
      scrollTrigger: { trigger: "#distance", start: "top 60%", once: true } });

    /* branch cards lean in */
    gsap.fromTo(".bcard", { y: 40, rotate: (i) => [-2, 0, 2][i] || 0 }, { y: 0, rotate: 0, stagger: 0.12, ease: "power3.out", duration: 0.9,
      scrollTrigger: { trigger: "#branches .branches", start: "top 85%", once: true } });

    /* the week grows along its line, seed to harvest */
    const grow = document.querySelector(".growline path");
    if (grow) {
      const L = grow.getTotalLength();
      gsap.fromTo(grow, { strokeDasharray: L, strokeDashoffset: L }, { strokeDashoffset: 0, ease: "none",
        scrollTrigger: { trigger: "#week", start: "top 75%", end: "center 55%", scrub: 0.8 } });
    }
    gsap.fromTo(".day svg", { scale: 0.4, transformOrigin: "50% 100%" }, { scale: 1, stagger: 0.15, ease: "back.out(2.2)", duration: 0.7,
      scrollTrigger: { trigger: ".week", start: "top 80%", once: true } });

    /* magnetic primary buttons on fine pointers */
    if (matchMedia("(pointer: fine)").matches) {
      document.querySelectorAll(".btn-primary").forEach(b => {
        const xTo = gsap.quickTo(b, "x", { duration: 0.4, ease: "power3" }), yTo = gsap.quickTo(b, "y", { duration: 0.4, ease: "power3" });
        b.addEventListener("pointermove", e => { const r = b.getBoundingClientRect(); xTo((e.clientX - r.left - r.width / 2) * 0.25); yTo((e.clientY - r.top - r.height / 2) * 0.35); });
        b.addEventListener("pointerleave", () => { xTo(0); yTo(0); });
      });
    }

    addEventListener("load", () => ScrollTrigger.refresh());
  };

  if (window.VERDANT) start(); else document.addEventListener("verdant:ready", start, { once: true });
})();
