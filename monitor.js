/* SI-BARISAN - halaman Monitoring Capaian.
   Isinya sama dengan bagian Monitoring Penilaian di index.html.
   Membutuhkan wilayah.js (JALUR) yang dimuat sebelum berkas ini.
   CATATAN: DRIVE_URL, DRIVE_TOKEN, dan daftar akun AC harus sama dengan di main.js. */
(function () {
  var DRIVE_URL =
    "https://script.google.com/macros/s/AKfycbxP0CheqIQOqnbJU6OOPz_nZocCW9emcSLMm5ngl2fSpF1lv3f3jZ9U9QzyTJPeJzEs/exec";
  var DRIVE_TOKEN = ""; // diisi dari tiket sesi setelah server memeriksanya
  var KEY = "si-barisan",
    SK = "si-barisan-sesi";

  var $ = function (s) {
    return document.querySelector(s);
  };

  /*=============== SESI & TEMA ===============*/
  // U dan JENIS_BOLEH diisi oleh fungsi mulai() di bagian paling bawah,
  // setelah server memastikan sesinya sah.
  var U = null,
    JENIS_BOLEH = null;

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
      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      }[c];
    });
  }

  function f(x) {
    return x.toFixed(1);
  }

  function ig(b, sn, k, t) {
    return 0.5 * b + 0.25 * sn + 0.15 * k + 0.1 * t;
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

  function load() {
    try {
      return JSON.parse(localStorage.getItem(KEY)) || [];
    } catch (e) {
      return [];
    }
  }

  // Aturan yang sama dengan fungsi vis di main.js
  function vis(x) {
    if (!U) return false;
    if (x.part) return true; // data Partisipatif sudah disaring server sesuai akun
    if (U.role == "kanwil" || U.role == "kab") return true; // kanwil dan kankemenag melihat semua

    var by = x.by || x.pengguna || ""; // pemilik input
    var pr = x.byRole || ""; // peran pemilik input (dikirim server)

    if (by && by === U.u) return true; // input sendiri
    if (!pr) return x.nm === U.sk; // data lama tanpa pemilik

    // input kanwil: semua akun, kecuali jenis Kanwil
    if (pr == "kanwil") return x.jn != "Kanwil";

    // input kankemenag dibagikan ke KUA dan MIN
    if (pr == "kab" && x.jn == "KUA" && U.role == "unit") return true;
    if (pr == "kab" && x.jn == "MIN" && U.role == "madrasah") return true;

    // kankemenag melihat semua KUA dan MIN
    if (U.role == "kab" && (x.jn == "KUA" || x.jn == "MIN")) return true;

    return false;
  }

  var data = load(),
    pilih = "", // jenis satuan kerja yang dibuka ("" = belum memilih)
    kabPilih = "Semua",
    kartu = null; // kartu yang dibuka (null = tampilan awal)

  // Urutan kelompok sesuai rancangan: tetap, tidak teracak
  var KARTU = [
    {
      id: "prov",
      judul: "Provinsi (Kanwil)",
      sub: "Kanwil, Kankemenag, MTsN, MAN, Partisipatif",
      jenis: ["Kanwil", "Kankemenag", "MTsN", "MAN", "Partisipatif"],
    },
    {
      id: "kab",
      judul: "Kab/Kota (Kankemenag)",
      sub: "Kankemenag, KUA, MIN, Partisipatif",
      jenis: ["Kankemenag", "KUA", "MIN", "Partisipatif"],
    },
  ];

  // Urutan nama: mengikuti urutan kab/kota di wilayah.js, lalu abjad
  function urutKab(k) {
    for (var i = 0; i < WILAYAH.length; i++) {
      if (WILAYAH[i].kab === k) return i;
    }
    return -1;
  }

  // Semua baris yang boleh dilihat akun ini (belum disaring jenis)
  function dasar() {
    return data
      .filter(vis)
      .filter(function (x) {
        return !JENIS_BOLEH || JENIS_BOLEH.indexOf(x.jn) > -1;
      })
      .map(function (x) {
        // Lembaga Partisipatif tidak punya nilai IGBS
        if (x.part) return Object.assign({ ig: 0, kt: "" }, x);

        var g = ig(x.nb, x.ns, x.nk, x.nt);
        return Object.assign({ ig: g, kt: kat(g) }, x);
      })
      .sort(function (a, b) {
        return (
          urutKab(a.kb) - urutKab(b.kb) ||
          String(a.nm).localeCompare(String(b.nm), "id")
        );
      });
  }

  function cocokJ(x) {
    if (pilih) return x.jn === pilih;
    return !kartu || kartu.jenis.indexOf(x.jn) > -1;
  }

  function cocokK(x) {
    return kabPilih === "Semua" || x.kb === kabPilih;
  }

  // Baris yang tampil: sudah disaring jenis dan kabupaten/kota yang dipilih
  function rows() {
    return dasar().filter(function (x) {
      return cocokJ(x) && cocokK(x);
    });
  }

  // Isi pilihan kabupaten/kota dari wilayah.js
  $("#kabf").innerHTML =
    '<option value="Semua">Semua kabupaten/kota</option>' +
    WILAYAH.map(function (w) {
      return '<option value="' + esc(w.kab) + '">' + esc(w.kab) + "</option>";
    }).join("");

  // Siapa yang boleh memverifikasi baris ini (aturan sama dengan Code.gs dan main.js)
  function bolehVer(x) {
    if (x.drv != "Terkirim") return false;
    if (U.role == "kanwil") return true;
    if (U.role != "kab") return false;

    // Lembaga Partisipatif: Kankemenag boleh memverifikasi semuanya
    if (x.part) return true;

    return x.jn == "KUA" || x.jn == "MIN";
  }

  // Satu baris bukti: berkas (tautan Drive) atau catatan pengamatan
  function buktiLi(bt) {
    var nama =
        bt.url && /^https:\/\//.test(bt.url)
          ? '<a href="' +
            esc(bt.url) +
            '" target="_blank" rel="noopener">' +
            esc(bt.isi) +
            "</a>"
          : esc(bt.isi),
      ket = [bt.tgl, bt.lok]
        .filter(function (v) {
          return v;
        })
        .map(esc)
        .join(", ");

    return (
      "<li>" +
      (bt.jenis === "Catatan" ? "Catatan pengamatan: " : "Berkas: ") +
      nama +
      (ket ? " (" + ket + ")" : "") +
      "</li>"
    );
  }

  // Rincian kegiatan dan bukti lembaga Partisipatif, sebagai acuan verifikasi
  function detailPart(x) {
    var keg = x.kegiatan || [],
      bukti = x.bukti || [];

    if (!keg.length) return "";

    return (
      '<details class="pt-keg"><summary>Lihat kegiatan dan bukti' +
      (x.berkas ? " (" + x.berkas + " berkas)" : "") +
      "</summary><ul>" +
      keg
        .map(function (t) {
          var bt = bukti.filter(function (b) {
            return b.kegiatan === t;
          });

          return (
            "<li>" +
            esc(t) +
            "<ul>" +
            (bt.length
              ? bt
                  .map(function (b) {
                    return buktiLi(b);
                  })
                  .join("")
              : "<li>Belum ada bukti dukung.</li>") +
            "</ul></li>"
          );
        })
        .join("") +
      "</ul></details>"
    );
  }

  function render() {
    var all = dasar(),
      d = rows(),
      sesuaiK = all.filter(cocokK),
      sesuaiJ = all.filter(cocokJ),
      nj = {},
      nk = {},
      ket = [];

    sesuaiK.forEach(function (x) {
      nj[x.jn] = (nj[x.jn] || 0) + 1;
    });

    sesuaiJ.forEach(function (x) {
      nk[x.kb] = (nk[x.kb] || 0) + 1;
    });

    [].forEach.call(document.querySelectorAll("#filt option"), function (o) {
      var v = o.value;
      o.textContent =
        (v === "Semua" ? "Semua jenis" : v) +
        " (" +
        (v === "Semua" ? sesuaiK.length : nj[v] || 0) +
        ")";
    });
    $("#filt").value = pilih;

    [].forEach.call(document.querySelectorAll("#kabf option"), function (o) {
      var v = o.value;
      o.textContent =
        (v === "Semua" ? "Semua kabupaten/kota" : v) +
        " (" +
        (v === "Semua" ? sesuaiJ.length : nk[v] || 0) +
        ")";
    });
    $("#kabf").value = kabPilih;

    if (pilih) ket.push("jenis " + pilih);
    if (kabPilih !== "Semua") ket.push(kabPilih);

    $("#ringkas").textContent =
      "Menampilkan " +
      d.length +
      " dari " +
      all.length +
      " penilaian" +
      (ket.length ? ", " + ket.join(", ") : "") +
      ".";

    $("#tb").innerHTML = d
      .map(function (x) {
        var aksi =
          (!x.part && x.drv == "Terkirim"
            ? '<button type="button" class="button line" data-aksi="rinci" data-id="' +
              esc(x.id) +
              '">Rincian</button> '
            : "") + tombolStatus(x);
        if (!aksi) aksi = "-";

        // Lembaga Partisipatif tidak punya nilai, jadi enam kolom nilai diisi "-"
        var nilai = x.part
          ? "<td>-</td><td>-</td><td>-</td><td>-</td><td>-</td><td>-</td>"
          : "<td>" +
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
            "</span></td>";

        return (
          "<tr><td>" +
          esc(x.tgl) +
          "</td><td><b>" +
          esc(x.nm) +
          "</b><br><small>" +
          esc(x.jn) +
          (x.ket ? " &middot; " + esc(x.ket) : "") +
          "</small>" +
          (x.part ? detailPart(x) : "") +
          "</td><td>" +
          esc(x.jl || JALUR[x.jn] || "-") +
          "</td><td>" +
          esc(x.kb || "-") +
          (x.kc ? "<br><small>" + esc(x.kc) + "</small>" : "") +
          "</td>" +
          nilai +
          '<td><span class="pill' +
          (x.drv == "Gagal" ? " l" : x.drv == "Terkirim" ? "" : " m") +
          '">' +
          (x.drv || "-") +
          '</span></td><td><span class="pill' +
          (x.status == "Terverifikasi"
            ? ""
            : x.status == "Ditolak"
              ? " l"
              : " m") +
          '">' +
          esc(x.status || "Menunggu") +
          "</span>" +
          (x.status == "Ditolak" && x.alasan
            ? "<br><small>Alasan: " + esc(x.alasan) + "</small>"
            : "") +
          (x.oleh ? "<br><small>oleh " + esc(x.oleh) + "</small>" : "") +
          "</td><td>" +
          aksi +
          "</td></tr>"
        );
      })
      .join("");

    $("#em").textContent = ket.length
      ? "Belum ada penilaian untuk pilihan ini."
      : "Belum ada penilaian.";
    $("#em").style.display = d.length ? "none" : "block";
    nav();
  }

  $("#filt").onchange = function () {
    pilih = this.value;
    render();
  };

  $("#kabf").onchange = function () {
    kabPilih = this.value;
    render();
  };

  /*=============== NAVIGASI BERTAHAP: kartu > kelompok > daftar ===============*/
  function ringkasan(jenisList) {
    var r = dasar().filter(function (x) {
        return jenisList.indexOf(x.jn) > -1;
      }),
      n = 0,
      t = 0;

    r.forEach(function (x) {
      if (!x.part) {
        n++;
        t += x.ig;
      }
    });

    return {
      total: r.length,
      ver: r.filter(function (x) {
        return x.status == "Terverifikasi";
      }).length,
      rata: n ? f(t / n) : "-",
    };
  }

  function nav() {
    // Akun Kankemenag hanya melihat kartu Kab/Kota
    var daftarKartu = KARTU.filter(function (k) {
      return !JENIS_BOLEH || k.id === "kab";
    });

    $("#kartu").innerHTML = daftarKartu
      .map(function (k) {
        var s = ringkasan(k.jenis);
        return (
          '<button type="button" class="kartu" data-k="' +
          k.id +
          '"><h3>' +
          esc(k.judul) +
          "</h3><p>" +
          esc(k.sub) +
          '</p><div class="angka"><div><b>' +
          s.total +
          "</b><span>masuk</span></div>" +
          "<div><b>" +
          s.ver +
          "</b><span>terverifikasi</span></div>" +
          "<div><b>" +
          s.rata +
          "</b><span>rata-rata IGBS</span></div></div></button>"
        );
      })
      .join("");

    if (kartu) {
      $("#kelompok").innerHTML = kartu.jenis
        .filter(function (j) {
          return !JENIS_BOLEH || JENIS_BOLEH.indexOf(j) > -1;
        })
        .map(function (j) {
          var n = dasar().filter(function (x) {
            return x.jn === j;
          }).length;
          return (
            '<button type="button" class="kelompok" data-j="' +
            j +
            '"><b>' +
            j +
            "</b><span>" +
            n +
            " sudah masuk</span></button>"
          );
        })
        .join("");
    }

    $("#kartu").hidden = !!kartu;
    $("#kelompok").hidden = !kartu || !!pilih;
    $("#daftar").hidden = !pilih;
    $("#kabw").hidden = !pilih;
    $("#jejak").hidden = !kartu;
    $("#jejakteks").textContent = kartu
      ? kartu.judul + (pilih ? " \u203A " + pilih : "")
      : "";
  }

  $("#kartu").addEventListener("click", function (e) {
    var b = e.target.closest("[data-k]");
    if (!b) return;
    kartu = KARTU.filter(function (k) {
      return k.id === b.dataset.k;
    })[0];
    pilih = "";
    render();
  });

  $("#kelompok").addEventListener("click", function (e) {
    var b = e.target.closest("[data-j]");
    if (!b) return;
    pilih = b.dataset.j;
    kabPilih = "Semua";
    render();
  });

  $("#kembali").onclick = function () {
    if (pilih) pilih = "";
    else kartu = null;
    render();
  };

  /*=============== KIRIM KE GOOGLE APPS SCRIPT ===============*/
  function kirim(payload) {
    return fetch(DRIVE_URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(Object.assign({}, payload, { token: DRIVE_TOKEN })),
      redirect: "follow",
    })
      .then(function (r) {
        return r.text();
      })
      .then(function (t) {
        var j;
        try {
          j = JSON.parse(t);
        } catch (e) {
          throw new Error("Server tidak mengembalikan JSON.");
        }
        if (j && j.sesi === false) {
          location.replace("index.html");
        }
        if (!j || j.ok !== true) {
          throw new Error(j && j.error ? j.error : "Ditolak server.");
        }
        return j;
      });
  }

  /*=============== MUAT DARI GOOGLE DRIVE ===============*/
  function muat() {
    if (!DRIVE_URL) {
      $("#info").textContent =
        "Mode lokal: menampilkan data yang tersimpan di browser ini.";
      return;
    }

    $("#info").textContent = "Memuat data dari Google Drive...";

    Promise.all([
      kirim({
        action: "list",
        pengguna: U.u,
        role: U.role,
        kab: U.kab || "",
      }),
      // Data Lembaga Partisipatif; kalau gagal, data penilaian tetap tampil
      kirim({ action: "part_list", pengguna: U.u, role: U.role }).catch(
        function () {
          return null;
        },
      ),
    ])
      .then(function (hasil) {
        var j = hasil[0],
          pj = hasil[1],
          ids = {};

        j.data.forEach(function (x) {
          x.drv = "Terkirim";
          if (!x.by && x.pengguna) x.by = x.pengguna;
          ids[String(x.id)] = 1;
        });

        var sisa = load().filter(function (x) {
          return !ids[String(x.id)] && x.drv != "Terkirim";
        });

        var part = pj
          ? pj.data.map(function (r) {
              return {
                id: "p" + r.id,
                rid: r.id,
                part: true,
                tgl: r.tgl,
                nm: r.nama,
                jn: "Partisipatif",
                kb: r.kab,
                kc: "",
                jl: "-",
                ket:
                  r.kategori +
                  (r.jenis ? ", " + r.jenis : "") +
                  ", " +
                  (r.kegiatan || []).length +
                  " kegiatan",
                drv: "Terkirim",
                status: r.status,
                oleh: r.oleh,
                alasan: r.alasan || "",
                by: r.by,
                kegiatan: r.kegiatan || [],
                bukti: r.bukti || [],
                berkas: r.berkas || 0,
              };
            })
          : [];

        data = j.data.concat(sisa, part);
        render();
        $("#info").textContent = pj
          ? "Data diperbarui dari Google Drive."
          : "Data penilaian diperbarui, tetapi data Lembaga Partisipatif belum dapat dimuat.";
      })
      .catch(function (e) {
        data = load();
        render();
        $("#info").textContent =
          "Data dari Google Drive belum dapat dimuat (" +
          e.message +
          "). Menampilkan data yang tersimpan di browser ini.";
      });
  }

  $("#muat").onclick = muat;

  /*=============== VERIFIKASI, PENOLAKAN, DAN RINCIAN ===============*/
  var rinciId = null;

  function cari(id) {
    return data.filter(function (r) {
      return String(r.id) === String(id);
    })[0];
  }

  function tombolStatus(x) {
    if (!bolehVer(x)) return "";
    var s = x.status || "Menunggu",
      id = esc(x.id);

    function t(st, label, kls) {
      return (
        '<button type="button" class="button ' +
        kls +
        '" data-aksi="ver" data-id="' +
        id +
        '" data-s="' +
        st +
        '">' +
        label +
        "</button> "
      );
    }

    return (
      (s != "Terverifikasi" ? t("Terverifikasi", "Verifikasi", "gold") : "") +
      (s != "Ditolak" ? t("Ditolak", "Tolak", "line") : "") +
      (s != "Menunggu" ? t("Menunggu", "Batalkan", "line") : "")
    );
  }

  function ubahStatus(x, st, tombol) {
    if (!x || !bolehVer(x)) return;
    var alasan = "";

    if (st === "Ditolak") {
      alasan = (
        prompt(
          "Alasan penolakan untuk " +
            x.nm +
            " (wajib, terlihat oleh satuan kerja):",
        ) || ""
      ).trim();
      if (alasan.length < 5) {
        alert("Penolakan dibatalkan: alasan minimal 5 karakter.");
        return;
      }
    } else if (
      !confirm(
        (st === "Terverifikasi" ? "Verifikasi " : "Kembalikan ke Menunggu: ") +
          x.nm +
          "?",
      )
    ) {
      return;
    }

    if (tombol) tombol.disabled = true;

    kirim({
      action: x.part ? "part_verify" : "verify",
      id: x.part ? x.rid : x.id,
      status: st,
      alasan: alasan,
      pengguna: U.u,
      role: U.role,
    })
      .then(function () {
        x.status = st;
        x.oleh = st === "Menunggu" ? "" : U.u;
        x.alasan = alasan;
        render();
        if (!$("#rinci").hidden && String(x.id) === rinciId) rinciAksi(x);
        $("#info").textContent =
          x.nm +
          (st === "Terverifikasi"
            ? " berhasil diverifikasi."
            : st === "Ditolak"
              ? " ditolak."
              : " dikembalikan ke status Menunggu.");
      })
      .catch(function (err) {
        if (tombol) tombol.disabled = false;
        $("#info").textContent =
          "Gagal memperbarui status (" + err.message + ").";
      });
  }

  $("#tb").addEventListener("click", function (e) {
    var b = e.target.closest("[data-aksi]");
    if (!b) return;
    var x = cari(b.dataset.id);
    if (!x) return;
    if (b.dataset.aksi === "rinci") bukaRinci(x);
    else ubahStatus(x, b.dataset.s, b);
  });

  /* --- Panel rincian --- */
  function berkasLi(u) {
    var nama = /^https:\/\//.test(u.url)
        ? '<a href="' +
          esc(u.url) +
          '" target="_blank" rel="noopener">' +
          esc(u.nama) +
          "</a>"
        : esc(u.nama),
      ket = [
        u.ukuran ? u.ukuran + " KB" : "",
        u.tgl ? "foto " + u.tgl : "",
        u.lok,
      ]
        .filter(Boolean)
        .map(esc)
        .join(", ");
    return (
      "<li>" + nama + (ket ? " <small>(" + ket + ")</small>" : "") + "</li>"
    );
  }

  function rinciHtml(j) {
    if (!j.butir.length) {
      return "<p>Rincian butir belum tersimpan untuk penilaian ini.</p>";
    }

    var bm = {},
      std = "",
      un = "",
      tanpa = 0,
      h = "";

    j.bukti.forEach(function (b) {
      var k = b.standar + "|" + b.unsur + "|" + b.butir;
      (bm[k] = bm[k] || []).push(b);
    });
    j.butir.forEach(function (b) {
      if (Number(b.skorInput) > 0 && b.buktiSah === "Tidak") tanpa++;
    });

    h +=
      '<p class="ringkas">' +
      j.butir.length +
      " butir &middot; " +
      j.bukti.length +
      " berkas bukti &middot; <b>" +
      tanpa +
      "</b> butir berskor tetapi buktinya belum sah (dihitung 0).</p>";

    j.butir.forEach(function (b) {
      if (b.standar !== std) {
        std = b.standar;
        un = "";
        h += '<h4 class="rc-std">' + esc(std) + "</h4>";
      }
      if (b.unsur !== un) {
        un = b.unsur;
        if (un !== std) h += '<h5 class="rc-un">' + esc(un) + "</h5>";
      }

      var bt = bm[b.standar + "|" + b.unsur + "|" + b.butir] || [],
        salah = Number(b.skorInput) > 0 && b.buktiSah === "Tidak",
        hit =
          String(b.skorHitung) !== String(b.skorInput)
            ? " &rarr; dihitung " + esc(b.skorHitung)
            : "";

      h +=
        '<div class="rc-it' +
        (salah ? " rc-salah" : "") +
        '"><div>' +
        esc(b.no) +
        ". " +
        esc(b.butir) +
        '</div><div class="rc-n"><span class="pill m">Skor ' +
        esc(b.skorInput) +
        hit +
        '</span><span class="pill' +
        (b.buktiSah === "Ya" ? "" : salah ? " l" : " m") +
        '">Bukti sah: ' +
        esc(b.buktiSah || "-") +
        "</span></div>";

      if (b.catatan) {
        h +=
          "<div><small>Catatan pengamatan:</small> " +
          esc(b.catatan) +
          "</div>";
      }
      if (bt.length) {
        h += '<ul class="rc-ul">' + bt.map(berkasLi).join("") + "</ul>";
      } else if (b.buktiSah !== "-") {
        h += "<div><small>Tidak ada berkas terunggah.</small></div>";
      }

      h += "</div>";
    });

    return h;
  }

  function rinciAksi(x) {
    $("#rinciStatus").innerHTML =
      '<span class="pill' +
      (x.status == "Terverifikasi" ? "" : x.status == "Ditolak" ? " l" : " m") +
      '">' +
      esc(x.status || "Menunggu") +
      "</span>" +
      (x.status == "Ditolak" && x.alasan
        ? " <small>Alasan: " + esc(x.alasan) + "</small>"
        : "");
    $("#rinciAksi").innerHTML =
      tombolStatus(x) ||
      "<small>Hanya Kanwil yang dapat memverifikasi jenis ini.</small>";
  }

  function bukaRinci(x) {
    rinciId = String(x.id);
    $("#rinciJudul").textContent = x.nm;
    $("#rinciSub").textContent = [
      x.jn,
      x.kb,
      x.tgl,
      "IGBS " +
        f(ig(x.nb, x.ns, x.nk, x.nt)) +
        " (" +
        kat(ig(x.nb, x.ns, x.nk, x.nt)) +
        ")",
    ]
      .filter(Boolean)
      .join(" \u00B7 ");
    $("#rinciStatus").innerHTML = "";
    $("#rinciAksi").innerHTML = "";
    $("#rinciIsi").innerHTML = "<p>Memuat rincian...</p>";
    $("#rinci").hidden = false;
    document.body.style.overflow = "hidden";

    kirim({ action: "detail", id: x.id })
      .then(function (j) {
        if (rinciId !== String(x.id)) return;
        $("#rinciIsi").innerHTML = rinciHtml(j);
        rinciAksi(x);
      })
      .catch(function (e) {
        $("#rinciIsi").innerHTML =
          "<p>Rincian belum dapat dimuat (" + esc(e.message) + ").</p>";
      });
  }

  function tutupRinci() {
    $("#rinci").hidden = true;
    rinciId = null;
    document.body.style.overflow = "";
  }

  $("#rinciTutup").onclick = tutupRinci;
  $("#rinci").addEventListener("click", function (e) {
    if (e.target === this) tutupRinci();
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && !$("#rinci").hidden) tutupRinci();
  });
  $("#rinciAksi").addEventListener("click", function (e) {
    var b = e.target.closest("[data-aksi]");
    if (b) ubahStatus(cari(b.dataset.id), b.dataset.s, b);
  });

  /*=============== UNDUH EXCEL ===============*/
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
    var ws = wb.addWorksheet("Monitoring Capaian", {
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
      { header: "Jalur", key: "jl", width: 8 },
      { header: "Kab/Kota", key: "kb", width: 30 },
      { header: "Kecamatan", key: "kc", width: 22 },
      { header: "Status", key: "status", width: 14 },
    ];

    var thin = { style: "thin", color: { argb: "FFBFBFBF" } };
    var garis = { top: thin, left: thin, bottom: thin, right: thin };

    var h = ws.getRow(1);
    h.height = 22;
    h.eachCell(function (c) {
      c.font = { bold: true, color: { argb: "FFFFFFFF" } };
      c.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FF0B3F6B" },
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
        nb: x.part ? "-" : Math.round(x.nb * 10) / 10,
        ns: x.part ? "-" : Math.round(x.ns * 10) / 10,
        nk: x.part ? "-" : Math.round(x.nk * 10) / 10,
        nt: x.part ? "-" : Math.round(x.nt * 10) / 10,
        ig: x.part ? "-" : Math.round(x.ig * 10) / 10,
        kt: x.part ? "-" : x.kt,
        drv: x.drv || "-",
        jl: x.jl || JALUR[x.jn] || "-",
        kb: x.kb || "",
        kc: x.kc || "",
        status: x.status || "Menunggu",
      });

      r.eachCell(function (c, n) {
        c.border = garis;
        c.alignment = {
          vertical: "middle",
          horizontal: n >= 4 && n <= 11 ? "center" : "left",
        };
        if (n >= 4 && n <= 8) c.numFmt = "0.0";
      });

      r.getCell("ig").font = { bold: true };

      var kt = r.getCell("kt");
      if (x.kt == "Cukup") pil(kt, "FFFBF0CC", "FF7A5700");
      else if (x.kt == "Kurang") pil(kt, "FFFBE0DC", "FFB03A2E");
      else if (!x.part) pil(kt, "FFD9F2E4", "FF17704A");

      var dv = r.getCell("drv");
      if (x.drv == "Gagal") pil(dv, "FFFBE0DC", "FFB03A2E");
      else if (x.drv == "Terkirim") pil(dv, "FFD9F2E4", "FF17704A");
      else pil(dv, "FFFBF0CC", "FF7A5700");
      var sv = r.getCell("status");
      if (x.status == "Terverifikasi") pil(sv, "FFD9F2E4", "FF17704A");
      else pil(sv, "FFFBF0CC", "FF7A5700");
    });

    wb.xlsx.writeBuffer().then(function (buf) {
      var a = document.createElement("a");
      a.href = URL.createObjectURL(
        new Blob([buf], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        }),
      );
      a.download =
        "monitoring-capaian" +
        (!pilih && kabPilih === "Semua" ? "-semua" : "") +
        (!pilih ? "" : "-" + pilih.toLowerCase()) +
        (kabPilih === "Semua"
          ? ""
          : "-" + kabPilih.toLowerCase().replace(/[^a-z0-9]+/g, "-")) +
        ".xlsx";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(a.href);
    });
  };

  /*=============== MULAI: PERIKSA SESI KE SERVER ===============*/
  function mulai(user, token) {
    U = user;
    DRIVE_TOKEN = token;
    $("#mwho").textContent = U.n;

    JENIS_BOLEH = null; // Kanwil dan Kankemenag memonitor semua jenis satuan kerja

    render();
    muat();
  }

  var tiket = "";
  try {
    tiket = localStorage.getItem(SK) || "";
  } catch (e) {}

  if (!tiket || !DRIVE_URL) {
    location.replace("index.html");
    return;
  }

  $("#info").textContent = "Memeriksa sesi...";

  fetch(DRIVE_URL, {
    method: "POST",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify({ action: "sesi", token: tiket }),
    redirect: "follow",
  })
    .then(function (r) {
      return r.text();
    })
    .then(function (t) {
      var j = JSON.parse(t);
      if (
        !j.ok ||
        !j.user ||
        (j.user.role != "kanwil" && j.user.role != "kab")
      ) {
        location.replace("index.html");
        return;
      }
      mulai(j.user, tiket);
    })
    .catch(function () {
      location.replace("index.html");
    });
})();
