/* SI-BARISAN - Monitor Satker: gerak island header + kilau kaca. Muat paling akhir. */
(function () {
  var h = document.querySelector(".mhead");
  if (!h) return;

  // Bungkus teks tombol kembali agar bisa menghilang saat island mengecil
  var back = h.querySelector("a.button");
  if (back && !back.querySelector(".tx")) {
    back.innerHTML = '<span>&larr;</span><span class="tx">&nbsp;Kembali ke aplikasi</span>';
  }

  var scrolled = false,
    hover = false,
    pinned = false,
    ptype = "mouse";

  function sync() {
    var c = scrolled && !hover && !pinned;
    if (h.classList.contains("compact") === c) return;
    h.classList.toggle("compact", c);
    h.classList.remove("pop");
    void h.offsetWidth;
    h.classList.add("pop");
  }

  h.addEventListener("animationend", function (e) {
    if (e.animationName === "mh-pop") h.classList.remove("pop");
  });

  addEventListener(
    "scroll",
    function () {
      scrolled = scrollY > 60;
      if (!scrolled) pinned = false;
      sync();
    },
    { passive: true },
  );

  h.addEventListener("pointerenter", function (e) {
    if (e.pointerType === "mouse") {
      hover = true;
      sync();
    }
  });
  h.addEventListener("pointerleave", function () {
    hover = false;
    sync();
  });
  h.addEventListener("focusin", function () {
    hover = true;
    sync();
  });
  h.addEventListener("focusout", function () {
    hover = false;
    sync();
  });
  h.addEventListener("pointerdown", function (e) {
    ptype = e.pointerType;
  });

  // Layar sentuh: ketukan pertama hanya membuka island
  h.addEventListener(
    "click",
    function (e) {
      if (h.classList.contains("compact") && ptype !== "mouse") {
        e.preventDefault();
        e.stopPropagation();
        pinned = true;
        sync();
      }
    },
    true,
  );
  document.addEventListener("click", function (e) {
    if (pinned && !h.contains(e.target)) {
      pinned = false;
      sync();
    }
  });

  // Kilau kaca mengikuti kursor
  var SEL = ".mhead,.tbox,.button,.drive-note";
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
