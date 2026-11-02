/* SI-BARISAN - halaman Monitor Satker.
   Isinya sama dengan bagian Monitoring Penilaian di index.html.
   Membutuhkan wilayah.js (JALUR) yang dimuat sebelum berkas ini.
   CATATAN: DRIVE_URL, DRIVE_TOKEN, dan daftar akun AC harus sama dengan di main.js. */
(function () {
  var DRIVE_URL =
    "https://script.google.com/macros/s/AKfycbwXWIVJyE5cf2FrvYWnR0H7hBa2K-Qy8w3DlCjisRCbTsS7gaV_XYaLua2R4O4SadDpTA/exec";
  var DRIVE_TOKEN = "10928300";
  var KEY = "si-barisan",
    SK = "si-barisan-sesi";

  // Salinan ringkas akun di main.js (hanya yang dibutuhkan untuk aturan tampilan)
  var AC = [
    { u: "kanwil", n: "Tim Pelaksana Kanwil", role: "kanwil", sk: "Kanwil Sulawesi Selatan" },
    { u: "kankemenag", n: "Tim Pelaksana Kankemenag", role: "kab", sk: "Kankemenag Kota Makassar", kab: "Kota Makassar" },
    { u: "kua", n: "Tim Pelaksana KUA", role: "unit", sk: "KUA Maros Baru", kab: "Kabupaten Maros" },
    { u: "madrasah", n: "Tim Pelaksana Madrasah", role: "madrasah", sk: "MAN 2 Makassar", kab: "Kota Makassar" },
  ];

  var $ = function (s) {
    return document.querySelector(s);
  };

  function find(u) {
    return AC.filter(function (a) {
      return a.u === u;
    })[0];
  }

  /*=============== SESI & TEMA ===============*/
  var s = null;
  try {
    s = localStorage.getItem(SK);
  } catch (e) {}

  var U = s && find(s);

  if (!U) {
    location.replace("index.html");
    return;
  }

  $("#mwho").textContent = U.n;

  var root = document.documentElement,
    tm = $("#mtema");

  function setTheme(t) {
    root.dataset.theme = t;
    tm.textContent = t === "dark" ? "Mode terang" : "Mode gelap";
  }

  var saved = null;
  try {
    saved = localStorage.getItem("theme");
  } catch (e) {}
  setTheme(saved || "light");

  tm.onclick = function () {
    var t = root.dataset.theme === "dark" ? "light" : "dark";
    setTheme(t);
    try {
      localStorage.setItem("theme", t);
    } catch (e) {}
  };

  /*=============== DATA & ATURAN TAMPILAN ===============*/
  function esc(x) {
    return String(x).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function f(x) {
    return x.toFixed(1);
  }

  function ig(b, sn, k, t) {
    return 0.5 * b + 0.25 * sn + 0.15 * k + 0.1 * t;
  }

  function kat(x) {
    return x >= 80 ? "Sangat Baik" : x >= 71 ? "Baik" : x >= 60 ? "Cukup" : "Kurang";
  }

  function kc(k) {
    return k == "Cukup" ? " m" : k == "Kurang" ? " l" : "";
  }

  function load() {
    try {
      return JSON.parse(localStorage.getItem(KEY)) || [];
    } catch (e) {
      return [];
    }
  }

  // Aturan yang sama dengan fungsi vis di main.js
  function vis(x) {
    if (U.role == "kanwil") return true;
    var pemilik = find(x.by);
    if (pemilik && pemilik.role == "kanwil") return x.jn != "Kanwil";
    if (
      pemilik &&
      pemilik.role == "kab" &&
      ((x.jn == "KUA" && U.role == "unit") ||
        (x.jn == "MIN" && U.role == "madrasah"))
    )
      return true;
    if (U.role == "kab" && (x.jn == "KUA" || x.jn == "MIN")) return true;
    return x.by ? x.by === U.u : x.nm === U.sk;
  }

  var data = load();

  function rows() {
    return data
      .filter(vis)
      .map(function (x) {
        var g = ig(x.nb, x.ns, x.nk, x.nt);
        return Object.assign({ ig: g, kt: kat(g) }, x);
      })
      .sort(function (a, b) {
        return String(b.tgl).localeCompare(String(a.tgl)) || b.ig - a.ig;
      });
  }

  function render() {
    var d = rows();

    $("#tb").innerHTML = d
      .map(function (x) {
        return (
          "<tr><td>" + esc(x.tgl) +
          "</td><td><b>" + esc(x.nm) + "</b><br><small>" + esc(x.jn) +
          "</small></td><td>" + esc(x.jl || JALUR[x.jn] || "-") +
          "</td><td>" + esc(x.kb || "-") +
          (x.kc ? "<br><small>" + esc(x.kc) + "</small>" : "") +
          "</td><td>" + f(x.nb) +
          "</td><td>" + f(x.ns) +
          "</td><td>" + f(x.nk) +
          "</td><td>" + f(x.nt) +
          "</td><td><b>" + f(x.ig) +
          '</b></td><td><span class="pill' + kc(x.kt) + '">' + x.kt +
          '</span></td><td><span class="pill' +
          (x.drv == "Gagal" ? " l" : x.drv == "Terkirim" ? "" : " m") + '">' +
          (x.drv || "-") + "</span></td></tr>"
        );
      })
      .join("");

    $("#em").style.display = d.length ? "none" : "block";
  }

  /*=============== MUAT DARI GOOGLE DRIVE ===============*/
  function muat() {
    if (!DRIVE_URL) {
      $("#info").textContent = "Mode lokal: menampilkan data yang tersimpan di browser ini.";
      return;
    }

    $("#info").textContent = "Memuat data dari Google Drive...";

    fetch(DRIVE_URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({
        action: "list",
        pengguna: U.u,
        role: U.role,
        kab: U.kab || "",
        token: DRIVE_TOKEN,
      }),
      redirect: "follow",
    })
      .then(function (r) {
        return r.text();
      })
      .then(function (t) {
        var j = JSON.parse(t);
        if (!j || j.ok !== true) throw new Error(j && j.error ? j.error : "Ditolak server.");

        var ids = {};
        j.data.forEach(function (x) {
          x.drv = "Terkirim";
          ids[String(x.id)] = 1;
        });

        var sisa = load().filter(function (x) {
          return !ids[String(x.id)] && x.drv != "Terkirim";
        });

        data = j.data.concat(sisa);
        render();
        $("#info").textContent = "Data diperbarui dari Google Drive.";
      })
      .catch(function (e) {
        data = load();
        render();
        $("#info").textContent =
          "Data dari Google Drive belum dapat dimuat (" + e.message +
          "). Menampilkan data yang tersimpan di browser ini.";
      });
  }

  $("#muat").onclick = muat;

  /*=============== UNDUH EXCEL ===============*/
  $("#csv").onclick = function () {
    var d = rows();

    if (!d.length) {
      alert("Belum ada data untuk diunduh.");
      return;
    }

    if (typeof ExcelJS === "undefined") {
      alert("Pustaka Excel belum termuat. Periksa koneksi internet, lalu muat ulang halaman.");
      return;
    }

    var wb = new ExcelJS.Workbook();
    var ws = wb.addWorksheet("Monitor Satker", { views: [{ state: "frozen", ySplit: 1 }] });

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
      { header: "Jalur", key: "jl", width: 8 },
      { header: "Kab/Kota", key: "kb", width: 30 },
      { header: "Kecamatan", key: "kc", width: 22 },
    ];

    var thin = { style: "thin", color: { argb: "FFBFBFBF" } };
    var garis = { top: thin, left: thin, bottom: thin, right: thin };

    var h = ws.getRow(1);
    h.height = 22;
    h.eachCell(function (c) {
      c.font = { bold: true, color: { argb: "FFFFFFFF" } };
      c.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF0B3F6B" } };
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
        jl: x.jl || JALUR[x.jn] || "-",
        kb: x.kb || "",
        kc: x.kc || "",
      });

      r.eachCell(function (c, n) {
        c.border = garis;
        c.alignment = { vertical: "middle", horizontal: n >= 4 && n <= 11 ? "center" : "left" };
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
      a.download = "monitor-satker-si-barisan.xlsx";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(a.href);
    });
  };

  render();
  muat();
})();
