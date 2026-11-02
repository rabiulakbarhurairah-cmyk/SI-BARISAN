/* SI-BARISAN - gerak nav bar ala dynamic island + liquid glass. Gantikan nav.js lama. */
(function () {
  var $ = function (s, r) {
    return (r || document).querySelector(s);
  };
  var hd = $("#header"),
    menu = $("#nav-menu"),
    list = menu && $(".nav__list", menu);
  if (!hd || !menu || !list) return;

  var pill = $(".nav__pill", list);
  if (!pill) {
    pill = document.createElement("i");
    pill.className = "nav__pill";
    list.insertBefore(pill, list.firstChild);
  }

  var desk = matchMedia("(min-width:1200px)"),
    reduce = matchMedia("(prefers-reduced-motion:reduce)").matches,
    last = { x: 0, w: 0 },
    tm;

  // Indeks untuk animasi bertahap menu laci
  [].forEach.call(list.querySelectorAll("li"), function (li, i) {
    li.style.setProperty("--i", i);
  });

  function set(x, w) {
    pill.style.transform = "translateX(" + x + "px)";
    pill.style.width = w + "px";
  }

  function measure() {
    var a = $(".active-link", list);
    return a && desk.matches ? { x: a.offsetLeft, w: a.offsetWidth } : null;
  }

  // Lompat langsung tanpa transisi
  function jump() {
    var m = measure();
    if (!m) return;
    pill.style.transition = "none";
    set(m.x, m.w);
    last = m;
  }

  // Pindah dengan efek meregang lalu menyusut (kaca cair)
  function move() {
    var m = measure();
    if (!m || (m.x === last.x && m.w === last.w)) return;
    if (reduce || !last.w) {
      jump();
      return;
    }
    pill.style.transition = "";
    var l = Math.min(last.x, m.x),
      r = Math.max(last.x + last.w, m.x + m.w);
    pill.style.transition = "transform .17s ease-out, width .17s ease-out";
    set(l, r - l);
    clearTimeout(tm);
    tm = setTimeout(function () {
      pill.style.transition = "";
      set(m.x, m.w);
    }, 170);
    pill.classList.remove("go");
    void pill.offsetWidth;
    pill.classList.add("go");
    last = m;
  }

  // Ikuti posisi menu aktif saat kapsul mengecil atau melebar
  function follow(ms) {
    var t0 = performance.now();
    (function f() {
      jump();
      if (performance.now() - t0 < ms) requestAnimationFrame(f);
      else pill.style.transition = "";
    })();
  }

  // Menu aktif berubah karena menggulir atau klik
  new MutationObserver(move).observe(list, {
    attributes: true,
    attributeFilter: ["class"],
    subtree: true,
  });

  // Header menjadi island saat digulir
  var wasScrolled = hd.classList.contains("scrolled");
  new MutationObserver(function () {
    var s = hd.classList.contains("scrolled");
    if (s === wasScrolled) return;
    wasScrolled = s;
    if (!desk.matches) return;
    menu.classList.remove("pop");
    void menu.offsetWidth;
    menu.classList.add("pop");
    follow(800);
  }).observe(hd, { attributes: true, attributeFilter: ["class"] });

  menu.addEventListener("animationend", function (e) {
    if (e.animationName === "isl-pop") menu.classList.remove("pop");
  });
  ["pointerenter", "pointerleave", "focusin", "focusout"].forEach(function (n) {
    menu.addEventListener(n, function () {
      if (desk.matches && hd.classList.contains("scrolled")) follow(800);
    });
  });

  addEventListener("resize", jump);
  if (desk.addEventListener) desk.addEventListener("change", jump);
  if (document.fonts) document.fonts.ready.then(jump);
  requestAnimationFrame(function () {
    jump();
    pill.style.transition = "";
  });

  // Laci (tablet dan ponsel): tutup dengan Esc atau ketuk di luar
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") menu.classList.remove("show");
  });
  document.addEventListener("click", function (e) {
    if (
      menu.classList.contains("show") &&
      !menu.contains(e.target) &&
      !e.target.closest("#nav-toggle")
    )
      menu.classList.remove("show");
  });

  // Kilau kaca mengikuti kursor pada kapsul, kartu, dan tombol
  var SEL =
    ".nav__menu,.tbox,.unduh-card,.stat,.grp,.lcard,.button";
  document.addEventListener(
    "pointermove",
    function (e) {
      var t = e.target.closest && e.target.closest(SEL);
      if (!t) return;
      var r = t.getBoundingClientRect();
      t.style.setProperty("--mx", e.clientX - r.left + "px");
      t.style.setProperty("--my", e.clientY - r.top + "px");
    },
    { passive: true },
  );
})();
