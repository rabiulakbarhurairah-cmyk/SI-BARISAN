/* Navbar: sorotan bergeser ala Dynamic Island */
(function () {
  var list = document.querySelector(".nav__list");
  var menu = document.querySelector("#nav-menu");
  if (!list || !menu) return;

  var mq = window.matchMedia("(min-width: 1200px)");
  var links = [].slice.call(list.querySelectorAll(".nav__link"));
  var pill = document.createElement("span");
  pill.className = "nav__pill";
  pill.setAttribute("aria-hidden", "true");
  list.insertBefore(pill, list.firstChild);

  var last = null;

  function aktif() {
    return list.querySelector(".active-link");
  }

  function geser(a, anim) {
    if (!a || !mq.matches || !a.offsetWidth) {
      pill.style.opacity = 0;
      return;
    }
    pill.style.opacity = 1;
    pill.style.width = a.offsetWidth + "px";
    pill.style.transform = "translateX(" + a.offsetLeft + "px)";
    if (anim !== false && a !== last) {
      pill.classList.remove("go");
      void pill.offsetWidth;
      pill.classList.add("go");
    }
    last = a;
  }

  // Tempatkan ulang tanpa animasi (saat ukuran berubah / aplikasi baru tampil)
  function tempat() {
    pill.style.transition = "none";
    geser(aktif(), false);
    void pill.offsetWidth;
    pill.style.transition = "";
  }

  links.forEach(function (a) {
    a.addEventListener("mouseenter", function () { geser(a); });
    a.addEventListener("focus", function () { geser(a); });
    new MutationObserver(function () {
      if (!menu.matches(":hover")) geser(aktif());
    }).observe(a, { attributes: true, attributeFilter: ["class"] });
  });

  menu.addEventListener("mouseleave", function () { geser(aktif()); });

  menu.addEventListener("mousemove", function (e) {
    var r = menu.getBoundingClientRect();
    menu.style.setProperty("--mx", ((e.clientX - r.left) / r.width) * 100 + "%");
  });

  // Hitung ulang saat menu berubah ukuran atau baru terlihat (setelah masuk)
  if (window.ResizeObserver) new ResizeObserver(tempat).observe(list);
  window.addEventListener("resize", tempat);
  if (mq.addEventListener) mq.addEventListener("change", tempat);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(tempat);
  document.addEventListener("sib:masuk", function () { setTimeout(tempat, 50); });
  tempat();
})();
