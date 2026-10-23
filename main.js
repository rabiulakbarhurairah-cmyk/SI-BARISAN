/* SI-BARISAN - logika aplikasi: tema, slider, penilaian mandiri, bukti dukung, daftar penilaian, login. */
(function () {
  /*=============== GOOGLE DRIVE CONFIG ===============*/
  // Isi kedua nilai ini setelah backend Google Apps Script (google-apps-script/Code.gs) di-deploy.
  // Kosongkan DRIVE_URL jika ingin memakai mode lokal saja (data hanya di browser).
  var DRIVE_URL =
    "https://script.google.com/macros/s/AKfycbyjdVCCErX4YjCGMaMZOzsstbZw68r8yErP1rsqYizVUYs2by-6uS7G0edXDpwwuhcd/exec"; // URL Web App (berakhiran /exec)
  var DRIVE_TOKEN = "10928300"; // harus sama dengan TOKEN di Code.gs

  /*=============== HELPERS ===============*/
  var $ = function (s, r) {
      return (r || document).querySelector(s);
    },
    $$ = function (s, r) {
      return [].slice.call((r || document).querySelectorAll(s));
    };

  document.documentElement.classList.add("js");

  /*=============== SHOW MENU ===============*/
  var menu = $("#nav-menu");

  $("#nav-toggle").onclick = function () {
    menu.classList.add("show");
  };

  $("#nav-close").onclick = function () {
    menu.classList.remove("show");
  };

  $$(".nav__link").forEach(function (a) {
    a.onclick = function () {
      menu.classList.remove("show");
    };
  });

  /*=============== DARK LIGHT THEME ===============*/
  var root = document.documentElement,
    tb = $("#theme-button");

  function setTheme(t) {
    root.dataset.theme = t;
    tb.firstChild.nextSibling ? 0 : 0;
    tb.innerHTML =
      '<svg class="i"><use href="#' +
      (t === "dark" ? "sun" : "moon") +
      '"/></svg>';
  }

  var saved = null;

  try {
    saved = localStorage.getItem("theme");
  } catch (e) {}

  setTheme(saved || "light");

  tb.onclick = function () {
    var t = root.dataset.theme === "dark" ? "light" : "dark";
    setTheme(t);

    try {
      localStorage.setItem("theme", t);
    } catch (e) {}
  };

  /*=============== SLIDERS ===============*/
  $$(".slider").forEach(function (s) {
    var tr = $(".slider__track", s),
      n = $$(".slide", s).length,
      i = 0,
      tm,
      x0 = null;

    function go(k) {
      i = (k + n) % n;
      tr.style.transform = "translateX(-" + i * 100 + "%)";
    }

    function play() {
      var d = +s.dataset.auto;

      if (d && !matchMedia("(prefers-reduced-motion:reduce)").matches) {
        clearInterval(tm);

        tm = setInterval(function () {
          go(i + 1);
        }, d);
      }
    }

    $(".prev", s).onclick = function () {
      go(i - 1);
      play();
    };

    $(".next", s).onclick = function () {
      go(i + 1);
      play();
    };

    s.onmouseenter = function () {
      clearInterval(tm);
    };

    s.onmouseleave = play;

    s.addEventListener(
      "touchstart",
      function (e) {
        x0 = e.touches[0].clientX;
      },
      { passive: true },
    );

    s.addEventListener("touchend", function (e) {
      if (x0 === null) return;
      var d = e.changedTouches[0].clientX - x0;

      if (Math.abs(d) > 40) {
        go(i + (d < 0 ? 1 : -1));
        play();
      }

      x0 = null;
    });

    play();
  });

  /*=============== SCROLL: HEADER, SCROLL UP, ACTIVE LINK ===============*/
  var hd = $("#header"),
    up = $("#scroll-up"),
    secs = $$("main section[id]"),
    links = $$(".nav__link");

  function onScroll() {
    var y = window.scrollY;
    hd.classList.toggle("scrolled", y > 40);
    up.classList.toggle("show", y > 350);
    var cur = secs[0].id;

    secs.forEach(function (s) {
      if (y + 120 >= s.offsetTop) cur = s.id;
    });

    links.forEach(function (a) {
      a.classList.toggle("active-link", a.getAttribute("href") === "#" + cur);
    });
  }

  addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /*=============== SCROLL REVEAL ANIMATION ===============*/
  var rv = $$(".rv");

  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(
      function (es) {
        es.forEach(function (e) {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            io.unobserve(e.target);
          }
        });
      },
      // threshold 0: muncul begitu sedikit saja terlihat, aman untuk elemen yang sangat tinggi
      { threshold: 0, rootMargin: "0px 0px -8% 0px" },
    );

    rv.forEach(function (e) {
      io.observe(e);
    });
  } else
    rv.forEach(function (e) {
      e.classList.add("in");
    });

  // Saat menu diklik, tampilkan langsung bagian tujuan tanpa menunggu observer
  $$(".nav__link").forEach(function (a) {
    a.addEventListener("click", function () {
      var t = document.querySelector(a.getAttribute("href"));
      if (!t) return;
      if (t.classList.contains("rv")) t.classList.add("in");
      $$(".rv", t).forEach(function (e) {
        e.classList.add("in");
      });
    });
  });

  /*=============== ASSESSMENT DATA (MINIMUM STANDARDS) ===============*/
  var G = [
    [
      "BARISAN",
      [
        [
          "Bersih",
          "assets/img/BERSIH1.jpeg",
          [
            "Tempat sampah terpilah di area strategis",
            "Jadwal kebersihan dan petugas ditunjuk",
            "Tidak ada sampah berserakan",
            "Toilet dan tempat wudu bersih dan berfungsi",
            "Drainase tidak tersumbat",
            "Pengurangan plastik sekali pakai",
          ],
        ],
        [
          "Asri",
          "assets/img/ASRI.jpeg",
          [
            "Halaman dan area terbuka tertata",
            "Taman atau tanaman hias",
            "Barang dan arsip tersimpan rapi",
            "Tidak ada sudut kumuh",
          ],
        ],
        [
          "Rindang",
          "assets/img/RINDANG.jpeg",
          [
            "Pohon peneduh atau tanaman pot",
            "Biopori atau sumur resapan",
            "Tanaman dipelihara berkala",
            "Program tanam pohon min. 1x setahun",
          ],
        ],
        [
          "Indah",
          "assets/img/INDAH.jpeg",
          [
            "Bangunan dan fasilitas terawat",
            "Papan nama dan penunjuk arah jelas",
            "Media pesan lingkungan dan ekoteologi",
            "Penataan ruang estetis dan serasi",
          ],
        ],
        [
          "Sehat",
          "assets/img/SEHAT.jpeg",
          [
            "Air bersih layak",
            "Sirkulasi udara dan cahaya memadai",
            "Kawasan tanpa rokok",
            "Bebas genangan dan jentik",
            "Sarana cuci tangan",
            "Asrama, dapur, kantin bersih (bila ada)",
          ],
        ],
        [
          "Aman",
          "assets/img/AMAN1.jpeg",
          [
            "APAR masih berlaku",
            "Jalur evakuasi dan titik kumpul",
            "Prosedur kesiapsiagaan bencana disosialisasikan",
            "Pohon, bangunan, listrik diperiksa berkala",
            "Drainase mencegah banjir",
          ],
        ],
        [
          "Nyaman",
          "assets/img/NYAMAN.jpeg",
          [
            "Ruang layanan, kerja, belajar nyaman",
            "Penghematan energi",
            "Penghematan air",
            "Akses disabilitas dan lansia",
          ],
        ],
      ],
    ],
    [
      "SIPAKAINGE",
      [
        [
          "Sipakatau",
          "",
          [
            "Aksi BARISAN diikuti seluruh warga 1x/bulan",
            "Aksi melibatkan perempuan, lansia, disabilitas, murid",
            "Fasilitas dapat dipakai warga saat darurat",
          ],
        ],
        [
          "Sipakalebbi",
          "",
          [
            "Apresiasi perilaku peduli lingkungan",
            "Min. 80% pohon tanam tetap hidup",
            "Plastik, listrik, air menurun dari kondisi awal",
          ],
        ],
        [
          "Sipakainge",
          "",
          [
            "Pesan SIPAKAINGE 2x/bulan",
            "Ekoteologi masuk layanan utama 1x/bulan",
            "Praktik baik dibagikan 1x/tahun",
          ],
        ],
        [
          "Siri' na Pacce",
          "",
          [
            "Ikrar ditandatangani dan dipasang",
            "Simulasi kesiapsiagaan bencana",
            "Aksi solidaritas korban bencana",
          ],
        ],
      ],
    ],
    [
      "Kolaborasi",
      [
        [
          "Kolaborasi",
          "",
          [
            "Kerja sama tertulis dengan pihak luar Kemenag",
            "Kegiatan kolaboratif tiap semester",
            "Dukungan nyata yang sah dan dapat diverifikasi",
          ],
        ],
      ],
    ],
    [
      "Tata Kelola dan Pelaporan",
      [
        [
          "Tata Kelola",
          "",
          [
            "SK Tim Pelaksana",
            "Rencana kegiatan masuk anggaran",
            "Penilaian diajukan tepat waktu",
            "Rencana perbaikan maks. 1 bulan",
            "Laporan semester tepat waktu",
            "Bukti lengkap dan dapat diakses",
          ],
        ],
      ],
    ],
  ];

  /*=============== STATE & SCORING ===============*/
  var st = {},
    KEY = "si-barisan",
    mem = [],
    U = null;

  function na(g, u, i) {
    return g == 0 && u == 4 && i == 5 && !$("#as").checked;
  }

  /*=============== EVIDENCE RULES ===============*/
  var OK = /\.(jpe?g|png|webp|gif|pdf|docx?|xlsx?)$/i,
    MAXB = 5 * 1024 * 1024,
    MAXF = 5;

  function isImg(f) {
    return /^image\//.test(f.type) || /\.(jpe?g|png|webp|gif)$/i.test(f.name);
  }

  function fok(f) {
    return !isImg(f) || (!!f.tgl && f.lok.trim().length > 1);
  }

  function evOK(x) {
    return x.f.some(fok) || x.o.trim().length >= 10;
  }

  function eff(g, u, i) {
    var x = st[g + "." + u + "." + i];
    return x.s > 0 && !evOK(x) ? 0 : x.s;
  }

  function sz(n) {
    return n < 1048576
      ? Math.max(1, Math.round(n / 1024)) + " KB"
      : (n / 1048576).toFixed(1) + " MB";
  }

  function flist(k) {
    var x = st[k],
      el = document.getElementById("f" + k);
    if (!el) return;

    el.innerHTML = x.f
      .map(function (f, j) {
        var im = isImg(f);

        return (
          "<li>" +
          (im && f.url
            ? '<img src="' + f.url + '" alt="Pratinjau ' + esc(f.name) + '">'
            : '<span class="dc">' +
              (im
                ? "FOTO"
                : f.name.split(".").pop().slice(0, 4).toUpperCase()) +
              "</span>") +
          '<span class="nm">' +
          esc(f.name) +
          "<br><small>" +
          sz(f.size) +
          "</small></span>" +
          (im
            ? '<input type="date" data-k="' +
              k +
              '" data-i="' +
              j +
              '" data-d="1" value="' +
              esc(f.tgl) +
              '" aria-label="Tanggal foto"><input type="text" data-k="' +
              k +
              '" data-i="' +
              j +
              '" data-l="1" value="' +
              esc(f.lok) +
              '" placeholder="Lokasi foto" maxlength="80" aria-label="Lokasi foto">'
            : "") +
          '<button type="button" class="rm" data-k="' +
          k +
          '" data-i="' +
          j +
          '" aria-label="Hapus berkas">&times;</button></li>'
        );
      })
      .join("");
  }

  function addF(k, files) {
    var x = st[k],
      er = [];

    [].forEach.call(files, function (f) {
      if (!OK.test(f.name)) {
        er.push(f.name + ": jenis berkas tidak didukung.");
        return;
      }

      if (f.size > MAXB) {
        er.push(f.name + ": lebih dari 5 MB.");
        return;
      }

      if (x.f.length >= MAXF) {
        er.push("Maksimal " + MAXF + " berkas per butir.");
        return;
      }

      var o = {
        name: f.name,
        type: f.type,
        size: f.size,
        tgl: "",
        lok: "",
        url: "",
        file: f,
      };
      x.f.push(o);

      if (isImg(f)) {
        var r = new FileReader();

        r.onload = function () {
          o.url = r.result;
          if (x.f.indexOf(o) > -1) flist(k);
        };

        r.readAsDataURL(f);
      }
    });

    st[k].er = er.length ? er.join(" ") : "";
    flist(k);
    upd();
  }

  function clearF() {}

  function val(g, u) {
    var n = 0,
      s = 0,
      ok = 0;

    G[g][1][u][2].forEach(function (_, i) {
      if (na(g, u, i)) return;
      n++;
      var v = eff(g, u, i);
      s += v;
      if (v == 2) ok++;
    });

    return { v: n ? (s / (n * 2)) * 100 : 0, n: n, ok: ok };
  }

  function avg(g) {
    var a = G[g][1].map(function (_, u) {
      return val(g, u).v;
    });

    return {
      m:
        a.reduce(function (x, y) {
          return x + y;
        }, 0) / a.length,
      mn: Math.min.apply(0, a),
    };
  }

  function kat(x) {
    return x >= 80
      ? "Sangat Baik"
      : x >= 71
        ? "Baik"
        : x >= 60
          ? "Cukup"
          : "Kurang";
  }

  function kc(k) {
    return k == "Cukup" ? " m" : k == "Kurang" ? " l" : "";
  }

  function ig(b, s, k, t) {
    return 0.5 * b + 0.25 * s + 0.15 * k + 0.1 * t;
  }

  function calc() {
    var b = avg(0),
      s = avg(1),
      k = val(2, 0).v,
      t = val(3, 0).v,
      y = $("#y1").checked,
      kz = [0, 1, 2].some(function (i) {
        return eff(2, 0, i) == 0;
      });

    return {
      nb: b.m,
      ns: s.m,
      nk: k,
      nt: t,
      ig: ig(b.m, s.m, k, t),
      B: b.m >= 80 && b.mn >= 60,
      S: s.m >= (y ? 70 : 80) && s.mn >= (y ? 50 : 60),
      K: (y || k >= 80) && !kz,
    };
  }

  function f(x) {
    return x.toFixed(1);
  }

  /*=============== ASSESSMENT FORM & EVIDENCE UPLOAD ===============*/
  function build() {
    retryId = null;

    if ($("#dv")) {
      $("#dv").textContent = DRIVE_URL
        ? "Periksa kembali data dan dokumen yang Anda masukkan sebelum disimpan. Setelah Anda menekan Simpan, data masuk ke Google Sheets dan bukti dukung ke folder Google Drive, dan tidak dapat dihapus kembali."
        : "Mode lokal: data hanya tersimpan di browser ini. Isi DRIVE_URL di main.js untuk mengirim ke Google Drive.";
    }

    var h = "";
    st = {};

    G.forEach(function (g, gi) {
      h +=
        '<details class="grp"' +
        (gi ? "" : " open") +
        "><summary>" +
        g[0] +
        "</summary>";

      g[1].forEach(function (u, ui) {
        if (g[1].length > 1) h += "<h4>" + u[0] + "</h4>";

        u[2].forEach(function (t, i) {
          var k = gi + "." + ui + "." + i;
          st[k] = { s: 0, f: [], o: "", er: "" };

          h +=
            '<div class="it" id="r' +
            k +
            '"><span>' +
            t +
            '</span><div class="seg" data-k="' +
            k +
            '">' +
            [0, 1, 2]
              .map(function (v) {
                return (
                  '<button type="button" aria-pressed="' +
                  (v == 0) +
                  '" data-v="' +
                  v +
                  '">' +
                  v +
                  "</button>"
                );
              })
              .join("") +
            '</div><div class="ub"><label class="up"><input type="file" multiple accept="image/*,.pdf,.doc,.docx,.xls,.xlsx" data-f="' +
            k +
            '" aria-label="Unggah bukti dukung"> + Unggah bukti</label><input class="join__input obs" data-o="' +
            k +
            '" placeholder="Atau tulis hasil pengamatan (min. 10 karakter)" maxlength="300" aria-label="Hasil pengamatan"><ul class="fl" id="f' +
            k +
            '"></ul></div><div class="wn" id="w' +
            k +
            '"></div></div>';
        });
      });

      h += "</details>";
    });

    $("#forms").innerHTML = h;
    upd();
  }

  function upd() {
    var c = calc(),
      ev0 = 0,
      sc0 = 0;

    Object.keys(st).forEach(function (k) {
      if (st[k].s > 0) {
        sc0++;
        if (evOK(st[k])) ev0++;
      }
    });

    Object.keys(st).forEach(function (k) {
      var p = k.split("."),
        t = na(+p[0], +p[1], +p[2]);
      document.getElementById("r" + k).style.opacity = t ? 0.45 : 1;

      document.getElementById("w" + k).textContent = t
        ? "Tidak berlaku: tanpa asrama, dapur, atau kantin."
        : st[k].er
          ? st[k].er
          : st[k].s > 0 && !evOK(st[k])
            ? st[k].f.length
              ? "Foto wajib memuat tanggal dan lokasi. Skor sementara dihitung 0."
              : "Tanpa bukti dukung, skor dihitung 0."
            : "";
    });

    $("#res").innerHTML =
      [
        ["NB", c.nb],
        ["NS", c.ns],
        ["NK", c.nk],
        ["NT", c.nt],
        ["IGBS", c.ig],
      ]
        .map(function (x) {
          return "<div><b>" + f(x[1]) + "</b><span>" + x[0] + "</span></div>";
        })
        .join("") +
      "<div><b>" +
      kat(c.ig) +
      "</b><span>Kategori</span></div><div><b>" +
      ev0 +
      " / " +
      sc0 +
      "</b><span>Butir berbukti</span></div>";

    $("#s1").textContent = f(c.ig);
    $("#s2").textContent = kat(c.ig);
    $("#s3").textContent = f(c.nb);
    $("#s4").textContent = f(c.ns);
    $("#s5").textContent = f(c.nk);
    $("#s6").textContent = f(c.nt);
    $("#sb").style.width = c.ig + "%";

    $("#sts").innerHTML = [
      ["BARISAN", c.B],
      ["SIPAKAINGE", c.S],
      ["Kolaborasi", c.K],
    ]
      .map(function (x) {
        return (
          '<span class="pill' +
          (x[1] ? "" : " l") +
          '">' +
          x[0] +
          ": " +
          (x[1] ? "memenuhi" : "belum memenuhi") +
          "</span>"
        );
      })
      .join("");

    $("#cards").innerHTML = G[0][1]
      .map(function (u, ui) {
        var r = val(0, ui),
          p = Math.round(r.v);

        return (
          '<article class="destination__card"><img src="' +
          u[1] +
          '" alt="" class="destination__img"><div class="destination__data"><h3 class="destination__subtitle">' +
          r.ok +
          " / " +
          r.n +
          ' butir terpenuhi</h3><h2 class="destination__title">' +
          u[0] +
          '</h2><p class="destination__country"><b>' +
          p +
          "</b>&nbsp;nilai unsur" +
          (p < 60 ? " &middot; di bawah ambang 60" : "") +
          '</p><div class="trk"><i style="width:' +
          p +
          '%"></i></div></div></article>'
        );
      })
      .join("");
  }

  $("#forms").addEventListener("click", function (e) {
    var b = e.target.closest("button[data-v]");
    if (!b) return;
    var s = b.parentNode;
    st[s.dataset.k].s = +b.dataset.v;

    [].forEach.call(s.children, function (x) {
      x.setAttribute("aria-pressed", x == b);
    });

    upd();
  });

  $("#forms").addEventListener("change", function (e) {
    var t = e.target;

    if (t.dataset.f) {
      addF(t.dataset.f, t.files);
      t.value = "";
    }
  });

  $("#forms").addEventListener("input", function (e) {
    var t = e.target,
      d = t.dataset;

    if (d.o !== undefined) {
      st[d.o].o = t.value;
      upd();
    } else if (d.d) {
      st[d.k].f[+d.i].tgl = t.value;
      upd();
    } else if (d.l) {
      st[d.k].f[+d.i].lok = t.value;
      upd();
    }
  });

  $("#forms").addEventListener("click", function (e) {
    var b = e.target.closest(".rm");
    if (!b) return;
    st[b.dataset.k].f.splice(+b.dataset.i, 1);
    st[b.dataset.k].er = "";
    flist(b.dataset.k);
    upd();
  });

  $("#as").onchange = $("#y1").onchange = upd;

  // Akun madrasah: jika nama sudah diawali MIN/MTsN/MAN, awalan ikut diganti saat jenis diubah.
  // Nama yang masih kosong atau tidak berawalan jenis dibiarkan apa adanya (diisi manual).
  $("#jn").onchange = function () {
    var n = $("#nm").value.trim(),
      re = /^(MIN|MTsN|MAN)\b/i;

    if (U && U.role == "madrasah" && re.test(n)) {
      $("#nm").value = n.replace(re, this.value);
    }
  };

  $("#rs").onclick = function () {
    build();
    msg("Penilaian diatur ulang.", 1);
  };

  /*=============== SAVED ASSESSMENTS (STORAGE & TABLE) ===============*/
  function load() {
    try {
      return JSON.parse(localStorage.getItem(KEY)) || [];
    } catch (e) {
      return mem;
    }
  }

  function save(d) {
    mem = d;

    try {
      localStorage.setItem(KEY, JSON.stringify(d));
    } catch (e) {}
  }

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      }[c];
    });
  }

  function msg(t, ok) {
    var m = $("#msg");
    m.textContent = t;
    m.style.color = ok ? "#1f8a5b" : "#d64545";
  }

  function vis(x) {
    if (!U) return false;
    if (U.role == "kanwil") return true; // admin melihat semua
    return x.by ? x.by === U.u : x.nm === U.sk; // akun lain hanya miliknya sendiri
  }

  function rows() {
    return load()
      .filter(vis)
      .map(function (x) {
        var g = ig(x.nb, x.ns, x.nk, x.nt);

        return Object.assign(
          {
            ig: g,
            kt: kat(g),
          },
          x,
        );
      })
      .sort(function (a, b) {
        return b.tgl.localeCompare(a.tgl) || b.ig - a.ig;
      });
  }

  function render() {
    var d = rows(),
      kw = U && U.role == "kanwil";

    $("#tb").innerHTML = d
      .map(function (x) {
        return (
          "<tr><td>" +
          esc(x.tgl) +
          "</td><td><b>" +
          esc(x.nm) +
          "</b><br><small>" +
          esc(x.jn) +
          "</small></td><td>" +
          f(x.nb) +
          "</td><td>" +
          f(x.ns) +
          "</td><td>" +
          f(x.nk) +
          "</td><td>" +
          f(x.nt) +
          "</td><td><b>" +
          f(x.ig) +
          '</b></td><td><span class="pill' +
          kc(x.kt) +
          '">' +
          x.kt +
          '</span></td><td><span class="pill' +
          (x.drv == "Gagal" ? " l" : x.drv == "Terkirim" ? "" : " m") +
          '">' +
          (x.drv || "-") +
          "</span></td>" +
          (kw
            ? '<td><button class="button line" data-id="' +
              x.id +
              '">Hapus</button></td>'
            : "") +
          "</tr>"
        );
      })
      .join("");

    $("#em").style.display = d.length ? "none" : "block";
  }

  function capaianTerakhir() {
    var r = rows()[0];
    if (!r) return;
    $("#s1").textContent = f(r.ig);
    $("#s2").textContent = r.kt;
    $("#s3").textContent = f(r.nb);
    $("#s4").textContent = f(r.ns);
    $("#s5").textContent = f(r.nk);
    $("#s6").textContent = f(r.nt);
    $("#sb").style.width = r.ig + "%";
  }

  /*=============== GOOGLE DRIVE (SHEETS & EVIDENCE) ===============*/
  var retryId = null;

  function drivePost(payload) {
    if (!DRIVE_URL) {
      return Promise.reject(new Error("DRIVE_URL belum diisi."));
    }

    if (!DRIVE_TOKEN || DRIVE_TOKEN === "ganti-dengan-token-rahasia") {
      return Promise.reject(
        new Error("DRIVE_TOKEN belum dikonfigurasi dengan benar."),
      );
    }

    var dataKirim = Object.assign({}, payload, {
      token: DRIVE_TOKEN,
    });

    console.log("SI-BARISAN: mengirim ke Apps Script:", dataKirim);

    return fetch(DRIVE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "text/plain;charset=utf-8",
      },
      body: JSON.stringify(dataKirim),
      redirect: "follow",
    })
      .then(function (response) {
        return response.text().then(function (text) {
          console.log(
            "SI-BARISAN: respons Apps Script:",
            response.status,
            text,
          );

          if (!response.ok) {
            throw new Error(
              "HTTP " + response.status + ": " + text.slice(0, 500),
            );
          }

          var json;

          try {
            json = JSON.parse(text);
          } catch (e) {
            throw new Error(
              "Google Apps Script tidak mengembalikan JSON. " +
                "Respons server: " +
                text.slice(0, 500),
            );
          }

          if (!json || json.ok !== true) {
            throw new Error(
              json && json.error
                ? json.error
                : "Google Apps Script menolak permintaan.",
            );
          }

          return json;
        });
      })
      .catch(function (error) {
        console.error("SI-BARISAN Google Apps Script error:", error);

        throw error;
      });
  }

  function sync() {
    if (!DRIVE_URL || !U) return;

    drivePost({ action: "list", pengguna: U.u, semua: U.role == "kanwil" })
      .then(function (r) {
        var ids = {};

        r.data.forEach(function (x) {
          x.drv = "Terkirim";
          ids[String(x.id)] = 1;
        });

        // Pertahankan data lokal yang belum terkirim/gagal. Data "Terkirim" yang sudah
        // tidak ada di Drive (dihapus admin) ikut dibuang, kecuali milik akun lain.
        var sisa = load().filter(function (x) {
          if (ids[String(x.id)]) return false;
          return !(x.drv == "Terkirim" && vis(x));
        });

        save(r.data.concat(sisa));
        render();
        capaianTerakhir();
      })
      .catch(function (e) {
        msg("Gagal memuat data dari Google Drive: " + e.message, 0);
      });
  }

  function fileToBase64(file) {
    return new Promise(function (done, fail) {
      var r = new FileReader();
      r.onload = function () {
        done(String(r.result).split(",")[1] || "");
      };
      r.onerror = function () {
        fail(new Error("berkas tidak dapat dibaca: " + file.name));
      };
      r.readAsDataURL(file);
    });
  }

  // Mengumpulkan seluruh isian formulir menjadi satu paket yang rapi untuk Google Sheets
  function collect(c, id, row) {
    var butir = [],
      files = [],
      sah = 0,
      nilai = 0,
      kode = ["BARISAN", "SIPAKAINGE", "KOLABORASI", "TATA"];

    G.forEach(function (g, gi) {
      g[1].forEach(function (u, ui) {
        u[2].forEach(function (t, i) {
          var x = st[gi + "." + ui + "." + i],
            tb = na(gi, ui, i),
            ok = evOK(x),
            valid = x.f.filter(fok);

          if (!tb && x.s > 0) {
            nilai++;
            if (ok) sah++;
          }

          butir.push({
            standar: g[0],
            unsur: u[0],
            no: i + 1,
            butir: t,
            skorInput: tb ? "TB" : x.s,
            skorHitung: tb ? "TB" : eff(gi, ui, i),
            buktiSah: tb ? "-" : ok ? "Ya" : "Tidak",
            catatan: x.o.trim(),
            berkas: valid.length,
          });

          valid.forEach(function (f) {
            files.push({
              kode: kode[gi] + "-" + u[0].replace(/\W/g, "") + "-" + (i + 1),
              standar: g[0],
              unsur: u[0],
              butir: t,
              nama: f.name,
              mime: f.type,
              tgl: f.tgl,
              lok: f.lok.trim(),
              ukuran: Math.round(f.size / 1024),
              file: f.file,
            });
          });
        });
      });
    });

    return {
      butir: butir,
      files: files,
      penilaian: {
        tanggal: row.tgl,
        satuan: row.nm,
        jenis: row.jn,
        pengguna: U ? U.u : "",
        tahunPertama: $("#y1").checked,
        asrama: $("#as").checked,
        nb: c.nb,
        ns: c.ns,
        nk: c.nk,
        nt: c.nt,
        igbs: c.ig,
        kategori: kat(c.ig),
        okB: c.B,
        okS: c.S,
        okK: c.K,
        butirBerbukti: sah,
        jumlahBerkas: files.length,
      },
    };
  }

  function setDrive(id, s) {
    var d = load();
    d.forEach(function (x) {
      if (x.id === id) x.drv = s;
    });
    save(d);
    render();
  }

  function toDrive(row, c, id) {
    var pack = collect(c, id, row),
      btn = $("#sv"),
      n = 0;

    btn.disabled = true;
    msg("Mengirim data ke Google Drive...", 1);

    drivePost({
      action: "save",
      id: id,
      penilaian: pack.penilaian,
      butir: pack.butir,
    })
      .then(function () {
        // bukti dukung diunggah satu per satu agar ukuran kiriman tetap kecil
        return pack.files.reduce(function (p, f) {
          return p.then(function () {
            msg(
              "Mengunggah bukti " + ++n + " dari " + pack.files.length + "...",
              1,
            );

            return fileToBase64(f.file).then(function (b64) {
              return drivePost({
                action: "upload",
                id: id,
                tanggal: row.tgl,
                satuan: row.nm,
                kode: f.kode,
                standar: f.standar,
                unsur: f.unsur,
                butir: f.butir,
                nama: f.nama,
                mime: f.mime,
                tgl: f.tgl,
                lok: f.lok,
                ukuran: f.ukuran,
                data: b64,
              });
            });
          });
        }, Promise.resolve());
      })
      .then(function () {
        retryId = null;
        setDrive(id, "Terkirim");
        msg(
          "Tersimpan di Google Drive: 1 penilaian, " +
            pack.butir.length +
            " butir, " +
            pack.files.length +
            " berkas bukti.",
          1,
        );
      })
      .catch(function (e) {
        retryId = id;
        setDrive(id, "Gagal");
        msg(
          "Tersimpan di perangkat, tetapi gagal dikirim ke Google Drive (" +
            e.message +
            "). Tekan Simpan lagi untuk mengirim ulang.",
          0,
        );
      })
      .then(function () {
        btn.disabled = false;
      });
  }

  $("#sv").onclick = function () {
    var n = $("#nm").value.trim();

    if (!n) {
      msg("Isi nama satuan kerja terlebih dahulu.", 0);
      $("#nm").focus();
      return;
    }

    if (
      U &&
      U.role == "madrasah" &&
      n.toUpperCase().indexOf($("#jn").value.toUpperCase()) !== 0
    ) {
      msg(
        'Nama satuan kerja harus diawali jenisnya, misalnya "' +
          $("#jn").value +
          ' 1 Makassar".',
        0,
      );
      $("#nm").focus();
      return;
    }

    var c = calc(),
      id = retryId || Date.now(),
      d = load().filter(function (x) {
        return x.id !== id;
      }),
      row = {
        nm: n,
        jn: $("#jn").value,
        nb: c.nb,
        ns: c.ns,
        nk: c.nk,
        nt: c.nt,
        tgl: new Date().toISOString().slice(0, 10),
        id: id,
        by: U ? U.u : "",
        drv: DRIVE_URL ? "Mengirim" : "Lokal",
      };

    d.push(row);
    save(d);
    render();

    if (!DRIVE_URL) {
      msg(
        "Tersimpan di perangkat ini. Google Drive belum dikonfigurasi (isi DRIVE_URL di main.js).",
        1,
      );
      return;
    }

    toDrive(row, c, id);
  };

  $("#tb").addEventListener("click", function (e) {
    var b = e.target.closest("[data-id]");
    if (!b || !U || U.role != "kanwil") return;
    if (!confirm("Hapus penilaian ini?")) return;

    var id = b.dataset.id;
    function lokal() {
      save(load().filter(function (x) { return String(x.id) !== id; }));
      render();
    }

    if (!DRIVE_URL) return lokal();

    b.disabled = true;
    drivePost({ action: "delete", id: id })
      .then(lokal)
      .catch(function (err) {
        b.disabled = false;
        msg("Gagal menghapus di Google Drive: " + err.message, 0);
      });
  });

  $("#clr").onclick = function () {
    if (!U || U.role != "kanwil") return;
    var d = rows();
    if (!d.length || !confirm("Hapus semua penilaian yang tampil?")) return;

    function lokal() {
      save(load().filter(function (x) { return !vis(x); }));
      render();
    }

    if (!DRIVE_URL) return lokal();

    d.reduce(function (p, x) {
      return p.then(function () { return drivePost({ action: "delete", id: x.id }); });
    }, Promise.resolve())
      .then(lokal)
      .catch(function (err) {
        msg("Gagal menghapus di Google Drive: " + err.message, 0);
      });
  };

  $("#csv").onclick = function () {
    var d = rows();

    if (!d.length) {
      alert("Belum ada data untuk diunduh.");
      return;
    }

    if (typeof ExcelJS === "undefined") {
      alert(
        "Pustaka Excel belum termuat. Periksa koneksi internet, lalu muat ulang halaman.",
      );
      return;
    }

    var wb = new ExcelJS.Workbook();
    var ws = wb.addWorksheet("Daftar Penilaian", {
      views: [{ state: "frozen", ySplit: 1 }],
    });

    ws.columns = [
      { header: "Tanggal", key: "tgl", width: 13 },
      { header: "Satuan Kerja", key: "nm", width: 32 },
      { header: "Jenis", key: "jn", width: 13 },
      { header: "NB", key: "nb", width: 9 },
      { header: "NS", key: "ns", width: 9 },
      { header: "NK", key: "nk", width: 9 },
      { header: "NT", key: "nt", width: 9 },
      { header: "IGBS", key: "ig", width: 10 },
      { header: "Kategori", key: "kt", width: 15 },
      { header: "Drive", key: "drv", width: 12 },
    ];

    var thin = { style: "thin", color: { argb: "FFBFBFBF" } };
    var garis = { top: thin, left: thin, bottom: thin, right: thin };

    // Header: tosca dengan tulisan putih, sama seperti tabel di web
    var h = ws.getRow(1);
    h.height = 22;
    h.eachCell(function (c) {
      c.font = { bold: true, color: { argb: "FFFFFFFF" } };
      c.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FF0E4F55" },
      };
      c.alignment = { vertical: "middle", horizontal: "center" };
      c.border = garis;
    });

    function pil(c, bg, fg) {
      c.fill = { type: "pattern", pattern: "solid", fgColor: { argb: bg } };
      c.font = { bold: true, color: { argb: fg } };
    }

    d.forEach(function (x) {
      var r = ws.addRow({
        tgl: x.tgl,
        nm: x.nm,
        jn: x.jn,
        nb: Math.round(x.nb * 10) / 10,
        ns: Math.round(x.ns * 10) / 10,
        nk: Math.round(x.nk * 10) / 10,
        nt: Math.round(x.nt * 10) / 10,
        ig: Math.round(x.ig * 10) / 10,
        kt: x.kt,
        drv: x.drv || "-",
      });

      r.eachCell(function (c, n) {
        c.border = garis;
        c.alignment = {
          vertical: "middle",
          horizontal: n >= 4 ? "center" : "left",
        };
        if (n >= 4 && n <= 8) c.numFmt = "0.0";
      });

      r.getCell("ig").font = { bold: true };

      var kt = r.getCell("kt");
      if (x.kt == "Cukup") pil(kt, "FFFBF0CC", "FF7A5700");
      else if (x.kt == "Kurang") pil(kt, "FFFBE0DC", "FFB03A2E");
      else pil(kt, "FFD9F2E4", "FF17704A");

      var dv = r.getCell("drv");
      if (x.drv == "Gagal") pil(dv, "FFFBE0DC", "FFB03A2E");
      else if (x.drv == "Terkirim") pil(dv, "FFD9F2E4", "FF17704A");
      else pil(dv, "FFFBF0CC", "FF7A5700");
    });

    wb.xlsx.writeBuffer().then(function (buf) {
      var a = document.createElement("a");
      a.href = URL.createObjectURL(
        new Blob([buf], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        }),
      );
      a.download = "daftar-penilaian-si-barisan.xlsx";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(a.href);
    });
  };

  /*=============== AUTHENTICATION (DEMO ACCOUNTS) ===============*/
  var JENIS_ALL = ["KUA", "MIN", "MTsN", "MAN", "Kankemenag", "Kanwil"];

  var AC = [
      {
        u: "kanwil",
        p: "kanwil123",
        n: "Tim Pelaksana Kanwil",
        role: "kanwil",
        sk: "Kanwil Sulawesi Selatan",
        jn: "Kanwil",
      },
      {
        u: "kankemenag",
        p: "kab123",
        n: "Tim Pelaksana Kankemenag",
        role: "kab",
        sk: "Kankemenag Kota Makassar",
        jn: "Kankemenag",
      },
      {
        u: "kua",
        p: "kua123",
        n: "Tim Pelaksana KUA",
        role: "unit",
        sk: "KUA Maros Baru",
        jn: "KUA",
      },
      {
        u: "madrasah",
        p: "mdr123",
        n: "Tim Pelaksana Madrasah",
        role: "madrasah",
        sk: "MAN 2 Makassar",
        jn: "MAN",
        jenis: ["MIN", "MTsN", "MAN"],
      },
    ],
    SK = "si-barisan-sesi",
    fails = 0,
    lockUntil = 0,
    msess = null;

  function getS() {
    try {
      return localStorage.getItem(SK) || msess;
    } catch (e) {
      return msess;
    }
  }

  function setS(v) {
    msess = v;

    try {
      v ? localStorage.setItem(SK, v) : localStorage.removeItem(SK);
    } catch (e) {}
  }

  function find(u) {
    return AC.filter(function (a) {
      return a.u === u;
    })[0];
  }

  function enter(a) {
    U = a;
    $("#login").hidden = true;
    $("#app").hidden = false;
    $("#who").textContent = a.n;
    var k = a.role == "kanwil",
      m = a.role == "madrasah",
      opsi = k ? JENIS_ALL : a.jenis || [a.jn];

    $("#jn").innerHTML = opsi
      .map(function (x) {
        return "<option>" + x + "</option>";
      })
      .join("");

    $("#nm").value = "";
    $("#nm").readOnly = false;
    $("#jn").value = a.jn;
    $("#jn").disabled = !(k || m);
    $("#clr").style.display = k ? "" : "none";
    $("#aksi").style.display = k ? "" : "none";
    build();
    render();
    capaianTerakhir();
    sync();
    msg("", 1);
    window.scrollTo(0, 0);
  }

  function leave() {
    U = null;
    setS(null);
    $("#app").hidden = true;
    $("#login").hidden = false;
    $("#lf").reset();
    $("#lp").type = "password";
    $("#lerr").textContent = "";
    window.scrollTo(0, 0);
  }

  $("#lf").addEventListener("submit", function (e) {
    e.preventDefault();
    if ($("#lf .shine").classList.contains("go")) return;
    var er = $("#lerr"),
      now = Date.now();

    if (now < lockUntil) {
      er.textContent =
        "Terlalu banyak percobaan. Coba lagi dalam " +
        Math.ceil((lockUntil - now) / 1000) +
        " detik.";

      return;
    }

    var u = $("#lu").value.trim().toLowerCase(),
      p = $("#lp").value;

    if (!u || !p) {
      er.textContent = "Isi nama pengguna dan kata sandi.";
      return;
    }

    var a = find(u);

    if (!a || a.p !== p) {
      fails++;

      if (fails >= 5) {
        fails = 0;
        lockUntil = now + 30000;
        er.textContent = "Terlalu banyak percobaan. Coba lagi dalam 30 detik.";
      } else er.textContent = "Nama pengguna atau kata sandi salah.";

      return;
    }

    fails = 0;
    er.textContent = "";
    setS(a.u);
    $("#lp").value = "";

    var btn = $("#lf .shine"),
      inn = $(".btn-in", btn),
      cs = getComputedStyle(btn),
      dx =
        btn.clientWidth -
        parseFloat(cs.paddingLeft) -
        parseFloat(cs.paddingRight) -
        inn.offsetWidth,
      wait = matchMedia("(prefers-reduced-motion:reduce)").matches ? 0 : 700;

    inn.style.setProperty("--dx", Math.max(dx, 0) + "px");
    btn.classList.add("go");

    setTimeout(function () {
      btn.classList.remove("go");
      enter(a);
    }, wait);
  });

  $("#lshow").onchange = function () {
    $("#lp").type = this.checked ? "text" : "password";
  };

  $("#lo").onclick = leave;
  var s0 = getS(),
    a0 = s0 && find(s0);
  if (a0) enter(a0);
  else leave();
})();
