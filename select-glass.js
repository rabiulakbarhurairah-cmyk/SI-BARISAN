/* SI-BARISAN - dropdown kapsul kaca. <select> asli tetap ada (disembunyikan) sehingga main.js, partisipatif.js, dan monitor.js tidak perlu diubah. */
(function () {
  var SEL = "select.join__input,.filt-sel select",
    desc = Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, "value"),
    panel = null,
    cur = null,
    act = -1;

  function refresh(s) {
    var b = s._sg;
    if (!b) return;
    var o = s.options[s.selectedIndex];
    b.firstChild.textContent = o ? o.textContent : "";
    b.disabled = s.disabled;
  }

  function enhance(s) {
    if (s._sg || s.multiple) return;
    var b = document.createElement("button");
    b.type = "button";
    b.className = "join__input sg-btn";
    b.setAttribute("aria-haspopup", "listbox");
    b.setAttribute("aria-expanded", "false");
    var al = s.getAttribute("aria-label");
    if (al) b.setAttribute("aria-label", al);
    b.appendChild(document.createElement("span"));
    s.parentNode.insertBefore(b, s);
    s.classList.add("sg-native");
    s._sg = b;
    b._sel = s;

    // Nilai yang diubah lewat kode (s.value = ...) ikut memperbarui tampilan
    Object.defineProperty(s, "value", {
      configurable: true,
      get: function () {
        return desc.get.call(s);
      },
      set: function (v) {
        desc.set.call(s, v);
        refresh(s);
      },
    });
    new MutationObserver(function () {
      refresh(s);
    }).observe(s, {
      childList: true,
      subtree: true,
      characterData: true,
      attributes: true,
      attributeFilter: ["disabled"],
    });
    s.addEventListener("change", function () {
      refresh(s);
    });
    refresh(s);
  }

  function close(focus) {
    if (!panel) return;
    panel.remove();
    panel = null;
    if (cur) {
      cur.setAttribute("aria-expanded", "false");
      if (focus) cur.focus();
    }
    act = -1;
  }

  function mark(i, scroll) {
    if (!panel) return;
    act = i;
    [].forEach.call(panel.children, function (li, j) {
      li.classList.toggle("act", j === i);
    });
    var li = panel.children[i];
    if (li && scroll)
      panel.scrollTop = li.offsetTop - panel.clientHeight / 2 + li.offsetHeight / 2;
  }

  function pick(i) {
    var s = cur && cur._sel,
      o = s && s.options[i];
    if (!o || o.disabled) return;
    var changed = s.selectedIndex !== i;
    s.selectedIndex = i;
    refresh(s);
    close(true);
    if (changed) {
      s.dispatchEvent(new Event("input", { bubbles: true }));
      s.dispatchEvent(new Event("change", { bubbles: true }));
    }
  }

  function step(d) {
    var s = cur._sel,
      n = s.options.length,
      i = act;
    for (var k = 0; k < n; k++) {
      i = (i + d + n) % n;
      if (!s.options[i].disabled) break;
    }
    mark(i, true);
  }

  function open(b) {
    close();
    var s = b._sel;
    if (!s || s.disabled) return;
    cur = b;
    panel = document.createElement("ul");
    panel.className = "sg-panel";
    panel.setAttribute("role", "listbox");
    [].forEach.call(s.options, function (o, i) {
      var li = document.createElement("li");
      li.className =
        "sg-opt" + (i === s.selectedIndex ? " on" : "") + (o.disabled ? " off" : "");
      li.setAttribute("role", "option");
      li.dataset.i = i;
      li.textContent = o.textContent;
      panel.appendChild(li);
    });
    document.body.appendChild(panel);

    var r = b.getBoundingClientRect(),
      w = Math.max(r.width, 200),
      below = innerHeight - r.bottom,
      h = panel.offsetHeight,
      up = below < Math.min(h, 220) + 16 && r.top > below;
    panel.style.width = w + "px";
    panel.style.left = Math.max(8, Math.min(r.left, innerWidth - w - 8)) + "px";
    panel.style.maxHeight = Math.max(120, Math.min(256, (up ? r.top : below) - 20)) + "px";
    h = panel.offsetHeight;
    panel.style.top = (up ? Math.max(8, r.top - h - 6) : r.bottom + 6) + "px";
    panel.classList.toggle("sg-up", up);
    b.setAttribute("aria-expanded", "true");
    mark(s.selectedIndex, true);

    panel.addEventListener("click", function (e) {
      var li = e.target.closest(".sg-opt");
      if (li) pick(+li.dataset.i);
    });
    panel.addEventListener("pointermove", function (e) {
      var li = e.target.closest(".sg-opt");
      if (li && !li.classList.contains("off")) mark(+li.dataset.i, false);
    });
  }

  document.addEventListener("click", function (e) {
    var b = e.target.closest && e.target.closest(".sg-btn");
    if (b) {
      if (panel && cur === b) close();
      else open(b);
    } else if (panel && !panel.contains(e.target)) close();
  });

  document.addEventListener("keydown", function (e) {
    var b = e.target.closest && e.target.closest(".sg-btn");
    if (!panel) {
      if (b && (e.key === "ArrowDown" || e.key === "ArrowUp")) {
        e.preventDefault();
        open(b);
      }
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      step(1);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      step(-1);
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      pick(act);
    } else if (e.key === "Escape") {
      e.preventDefault();
      close(true);
    } else if (e.key === "Tab") close();
  });

  addEventListener("resize", function () {
    close();
  });
  addEventListener(
    "scroll",
    function (e) {
      if (panel && !panel.contains(e.target)) close();
    },
    true,
  );

  function init() {
    [].forEach.call(document.querySelectorAll(SEL), enhance);
  }
  if (document.readyState === "loading")
    document.addEventListener("DOMContentLoaded", init);
  else init();
  addEventListener("load", init);
})();
