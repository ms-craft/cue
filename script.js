(() => {
  const root = document.querySelector(".product-image"),
    track = root.querySelector(".slider-track"),
    count = root.querySelector(".slider-count"),
    pause = root.querySelector(".pause"),
    reduce = matchMedia("(prefers-reduced-motion: reduce)");
  let index = 0,
    timer,
    paused = reduce.matches;
  function show(n) {
    index = (n + 3) % 3;
    track.style.transform = `translateX(-${index * 100}%)`;
    count.textContent = `0${index + 1} / 03`;
    root
      .querySelectorAll(".slide")
      .forEach((slide, i) => slide.setAttribute("aria-hidden", i !== index));
  }
  function start() {
    clearInterval(timer);
    if (!paused && !document.hidden)
      timer = setInterval(() => show(index + 1), 5000);
  }
  function move(n) {
    show(index + n);
    start();
  }
  root.querySelector(".prev").addEventListener("click", () => move(-1));
  root.querySelector(".next").addEventListener("click", () => move(1));
  function updatePause() {
    pause.textContent = paused ? "▶" : "Ⅱ";
    pause.setAttribute("aria-pressed", String(paused));
    pause.setAttribute(
      "aria-label",
      paused
        ? "Запустить автоматическую смену"
        : "Остановить автоматическую смену",
    );
  }
  pause.addEventListener("click", () => {
    paused = !paused;
    updatePause();
    start();
  });
  document.addEventListener("visibilitychange", start);
  let x = null;
  root.querySelector(".product-slider").addEventListener(
    "touchstart",
    (e) => {
      x = e.changedTouches[0].clientX;
    },
    { passive: true },
  );
  root.querySelector(".product-slider").addEventListener(
    "touchend",
    (e) => {
      if (x !== null) {
        const d = e.changedTouches[0].clientX - x;
        if (Math.abs(d) > 40) move(d < 0 ? 1 : -1);
        x = null;
      }
    },
    { passive: true },
  );
  show(0);
  updatePause();
  start();
})();

(() => {
  const section = document.querySelector(".comparison-rail");
  if (!section) return;

  const cards = [...section.querySelectorAll(".comparison-card")];
  const number = section.querySelector(".comparison-number");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  let enabled = false;
  let ticking = false;

  function update() {
    ticking = false;
    if (!enabled) return;
    const distance = section.offsetHeight - window.innerHeight;
    const progress = Math.min(
      1,
      Math.max(0, -section.getBoundingClientRect().top / Math.max(1, distance)),
    );
    // Each scroll segment reveals Cue first, then moves vertically to the next comparison.
    const position = Math.min(cards.length - 0.001, progress * cards.length);
    const current = Math.floor(position);
    const local = position - current;
    const transition =
      current < cards.length - 1
        ? Math.min(1, Math.max(0, (local - 0.7) / 0.3))
        : 0;
    const slidePosition = current + transition;
    const active = Math.round(slidePosition);
    section.style.setProperty("--progress", progress.toFixed(3));
    number.textContent = String(active + 1).padStart(2, "0");
    cards.forEach((card, index) => {
      const selected = index === active;
      const reveal =
        index < current
          ? 1
          : index > current
            ? 0
            : Math.min(1, Math.max(0, (local - 0.12) / 0.38));
      card.classList.toggle("is-active", selected);
      card.setAttribute("aria-hidden", String(!selected));
      card.style.setProperty(
        "--slide",
        `${((index - slidePosition) * 100).toFixed(2)}%`,
      );
      card.style.setProperty("--reveal", reveal.toFixed(3));
    });
  }

  function queueUpdate() {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(update);
    }
  }

  function configure() {
    enabled =
      !reducedMotion.matches &&
      window.innerHeight >= 400 &&
      window.innerWidth >= 320;
    section.classList.toggle("is-animated", enabled);
    if (
      enabled &&
      section.querySelector(".comparison-sticky").scrollHeight >
        window.innerHeight
    ) {
      enabled = false;
      section.classList.remove("is-animated");
    }
    if (!enabled) {
      cards.forEach((card) => {
        card.classList.remove("is-active");
        card.removeAttribute("aria-hidden");
        card.style.removeProperty("--reveal");
        card.style.removeProperty("--slide");
      });
      return;
    }
    update();
  }

  window.addEventListener("scroll", queueUpdate, { passive: true });
  window.addEventListener("resize", configure);
  reducedMotion.addEventListener("change", configure);
  configure();
})();
