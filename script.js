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
