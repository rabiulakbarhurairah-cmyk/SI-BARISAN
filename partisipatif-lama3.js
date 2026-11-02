/* SI-BARISAN - Lembaga Partisipatif: formulir pendaftaran, kegiatan beserta bukti dukung, dan daftar peserta.
   Membutuhkan: wilayah.js (WILAYAH) dan main.js (window.SIB berisi url, token, user).
   Data disimpan di Google Sheets (tab "Partisipatif" dan "Bukti Partisipatif") dan berkas di Google Drive lewat Code.gs.
   Daftar kegiatan ada di KEG di bawah ini. Ubah kalimatnya di sana. */
(function () {
  var S = window.SIB;
  if (!S) return;

  var $ = function (s) {
    return document.querySelector(s);
  };

  /*=============== DAFTAR KEGIATAN ===============*/
  var KEG = {
    A: {
      judul: "Kegiatan umum pada seluruh satuan pendidikan",
      tanpaKode: true,
      item: [
        "Mengembangkan satuan pendidikan yang hijau dan ramah lingkungan, termasuk berpartisipasi dalam Program Adiwiyata.",
        "Mengintegrasikan nilai ekoteologi dan kearifan lokal ke dalam pembelajaran serta kegiatan pembinaan peserta didik sesuai dengan kurikulum yang berlaku.",
        "Membentuk dan mengelola bank sampah, kebun, atau taman di lingkungan satuan pendidikan.",
        "Membiasakan peserta didik membawa bekal dan botol minum sendiri serta mengurangi penggunaan plastik sekali pakai.",
        "Membentuk kader lingkungan yang berasal dari peserta didik atau santri.",
        "Melaksanakan simulasi kesiapsiagaan bencana yang melibatkan pendidik, tenaga kependidikan, dan peserta didik.",
      ],
    },
    B: {
      judul: "Kegiatan khusus di madrasah",
      tanpaKode: true,
      item: [
        "Mengintegrasikan tema lingkungan ke dalam kegiatan intrakurikuler, kokurikuler, ekstrakurikuler, dan budaya madrasah sesuai dengan kurikulum yang berlaku, termasuk Kurikulum Berbasis Cinta.",
        "Mengembangkan madrasah sebagai model madrasah hijau di wilayahnya.",
      ],
    },
    C: {
      judul: "Kegiatan khusus di pondok pesantren",
      tanpaKode: true,
      item: [
        "Mengembangkan pesantren ramah lingkungan (eko-pesantren).",
        "Menyelenggarakan kajian kitab dan pengajian yang membahas fikih lingkungan serta tanggung jawab manusia terhadap alam.",
        "Mengelola sampah di asrama, dapur umum, dan area kegiatan santri secara berkelanjutan.",
        "Menyediakan sanitasi, air bersih, dan asrama yang bersih, sehat, dan layak digunakan.",
        "Mengembangkan kemandirian pesantren melalui perkebunan, pertanian, peternakan, atau perikanan yang ramah lingkungan.",
        "Melibatkan kiai, pengasuh, pembina, dan santri dalam kegiatan pelestarian lingkungan di masyarakat sekitar pesantren.",
      ],
    },
    D: {
      judul: "Kegiatan khusus di satuan pendidikan keagamaan lainnya",
      tanpaKode: true,
      item: [
        "Menyampaikan nilai ekoteologi melalui pembelajaran agama, sekolah minggu, pasraman, atau kegiatan keagamaan sejenis sesuai dengan ajaran masing-masing.",
        "Membiasakan perilaku ramah lingkungan dalam kegiatan belajar dan ibadah.",
        "Melaksanakan aksi lingkungan bersama orang tua dan komunitas keagamaan.",
      ],
    },
    R: {
      judul: "Kegiatan di rumah ibadah",
      tanpaKode: true,
      item: [
        "Mengembangkan rumah ibadah yang ramah lingkungan melalui pengelolaan sampah, penghematan air dan energi, serta penghijauan.",
        "Memanfaatkan kembali air bekas wudu atau sumber air bekas pakai lainnya untuk menyiram tanaman sesuai dengan kondisi dan kelayakan air.",
        "Menyampaikan pesan pelestarian lingkungan melalui khotbah, ceramah, dharmawacana, atau renungan secara berkala.",
        "Mengurangi penggunaan plastik sekali pakai dalam kegiatan keagamaan.",
        "Memanfaatkan rumah ibadah sebagai pusat edukasi dan penyebaran informasi tentang kesiapsiagaan bencana.",
      ],
    },
    M: {
      judul: "Kegiatan masyarakat",
      tanpaKode: true,
      item: [
        "Melaksanakan penanaman pohon di lahan yang sesuai, termasuk di daerah aliran sungai dan kawasan pesisir.",
        "Mengembangkan pengelolaan sampah berbasis komunitas, seperti bank sampah dan pengolahan sampah organik.",
        "Melaksanakan aksi bersih-bersih sungai, saluran air, dan pantai.",
        "Menyelenggarakan edukasi kesiapsiagaan bencana bersama Badan Penanggulangan Bencana Daerah (BPBD) dan pihak terkait.",
        "Melibatkan tokoh agama, tokoh masyarakat, dan tokoh adat dalam menggerakkan gotong royong untuk menjaga kelestarian lingkungan.",
      ],
    },
  };

  // Kelompok kegiatan yang tampil untuk tiap jenis lembaga (kategori 1)
  var SUB = {
    "Madrasah swasta": ["A", "B"],
    "Pondok pesantren": ["A", "C"],
    "Satuan pendidikan keagamaan lainnya": ["A", "D"],
  };

  var KAT = ["Pendidikan keagamaan", "Rumah ibadah", "Masyarakat"],
    data = [],
    kategori = "Semua",
    kirimSedang = false,
    retryId = null,
    B = {}; // bukti per kegiatan: { f: [berkas], o: catatan, on: dicentang, ok: bukti sah }

  /*=============== ATURAN BUKTI (sama dengan Penilaian Mandiri) ===============*/
  var OK = /\.(jpe?g|png|webp|gif|pdf|docx?|xlsx?)$/i,
    MAXB = 5 * 1024 * 1024,
    MAXF = 5;

  function bk(k) {
    return B[k] || (B[k] = { f: [], o: "", on: false, ok: false, er: "" });
  }

  function isImg(f) {
    return /^image\//.test(f.type) || /\.(jpe?g|png|webp|gif)$/i.test(f.name);
  }

  function fok(f) {
    return !isImg(f) || (!!f.tgl && f.lok.trim().length > 1);
  }

  function evOK(x) {
    return x.f.some(fok) || x.o.trim().length >= 10;
  }

  function sz(n) {
    return n < 1048576
      ? Math.max(1, Math.round(n / 1024)) + " KB"
      : (n / 1048576).toFixed(1) + " MB";
  }

  /*=============== PEMBANTU ===============*/
  function esc(x) {
    return String(x).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function pesan(t, ok) {
    var m = $("#pm");
    m.textContent = t;
    m.style.color = ok ? "#1f8a5b" : "#d64545";
  }

  function kirim(payload) {
    if (!S.url) return Promise.reject(new Error("DRIVE_URL belum diisi."));

    return fetch(S.url, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(Object.assign({}, payload, { token: S.token })),
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
        if (!j || j.ok !== true) throw new Error(j && j.error ? j.error : "Ditolak server.");
        return j;
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

  function isiKab() {
    $("#pb").innerHTML =
      '<option value="">Pilih kabupaten/kota</option>' +
      WILAYAH.map(function (w) {
        return '<option value="' + esc(w.kab) + '">' + esc(w.kab) + "</option>";
      }).join("");

    $("#pb").value = (S.user && S.user.kab) || "";
  }

  /*=============== KEGIATAN DAN BUKTI DI FORMULIR ===============*/
  function grupAktif() {
    var k = $("#pk").value;

    if (k === "Pendidikan keagamaan") return SUB[$("#pj").value] || [];
    if (k === "Rumah ibadah") return ["R"];
    if (k === "Masyarakat") return ["M"];
    return [];
  }

  function hitung() {
    var cbs = document.querySelectorAll("#pg input[type=checkbox]"),
      n = 0;

    [].forEach.call(cbs, function (c) {
      if (bk(c.value).on) n++;
    });

    $("#pc").textContent = n + " dari " + cbs.length + " kegiatan dipilih";
  }

  function flist(k) {
    var x = bk(k),
      el = document.getElementById("fl-" + k);

    if (!el) return;

    el.innerHTML = x.f
      .map(function (f, j) {
        var im = isImg(f);

        return (
          "<li>" +
          (im && f.url
            ? '<img src="' + f.url + '" alt="Pratinjau ' + esc(f.name) + '">'
            : '<span class="dc">' +
              (im ? "FOTO" : f.name.split(".").pop().slice(0, 4).toUpperCase()) +
              "</span>") +
          '<span class="nm">' + esc(f.name) + "<br><small>" + sz(f.size) + "</small></span>" +
          (im
            ? '<input type="date" data-k="' + k + '" data-i="' + j + '" data-d="1" value="' +
              esc(f.tgl) + '" aria-label="Tanggal foto"><input type="text" data-k="' + k +
              '" data-i="' + j + '" data-l="1" value="' + esc(f.lok) +
              '" placeholder="Lokasi foto" maxlength="80" aria-label="Lokasi foto">'
            : "") +
          '<button type="button" class="rm" data-k="' + k + '" data-i="' + j +
          '" aria-label="Hapus berkas">&times;</button></li>'
        );
      })
      .join("");
  }

  // Memperbarui satu kegiatan: kotak centang terbuka kalau bukti sah, tertutup kalau tidak
  function updItem(k) {
    var x = bk(k),
      ok = evOK(x),
      cb = document.querySelector('#pg input[type=checkbox][value="' + k + '"]'),
      wn = document.getElementById("wn-" + k);

    if (ok && !x.ok) x.on = true;
    if (!ok) x.on = false;
    x.ok = ok;

    if (cb) {
      cb.disabled = !ok;
      cb.checked = x.on;
    }

    if (wn) {
      wn.textContent = x.er
        ? x.er
        : !ok
          ? x.f.length
            ? "Foto wajib memuat tanggal dan lokasi agar kegiatan bisa dicentang."
            : "Unggah bukti atau tulis hasil pengamatan dulu agar kegiatan bisa dicentang."
          : "";
    }

    hitung();
  }

  function addF(k, files) {
    var x = bk(k),
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
        er.push("Maksimal " + MAXF + " berkas per kegiatan.");
        return;
      }

      var o = { name: f.name, type: f.type, size: f.size, tgl: "", lok: "", url: "", file: f };
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

    x.er = er.length ? er.join(" ") : "";
    flist(k);
    updItem(k);
  }

  function tampilKeg() {
    var g = grupAktif();

    $("#pkw").hidden = !g.length;

    $("#pg").innerHTML = g
      .map(function (k) {
        return (
          "<h5>" + esc(KEG[k].judul) + "</h5>" +
          KEG[k].item
            .map(function (t, i) {
              var kode = k + (i + 1);
              return (
                '<div class="kgi"><label class="kg"><input type="checkbox" value="' + kode +
                '" disabled>' +
                (KEG[k].tanpaKode ? "" : '<span class="kode">' + kode + "</span>") +
                "<span>" + esc(t) + "</span></label>" +
                '<div class="kgb"><label class="up"><input type="file" multiple ' +
                'accept="image/*,.pdf,.doc,.docx,.xls,.xlsx" data-f="' + kode +
                '" aria-label="Unggah bukti dukung"> + Unggah bukti</label>' +
                '<input class="join__input obs" data-o="' + kode +
                '" placeholder="Atau tulis hasil pengamatan (min. 10 karakter)" maxlength="300" ' +
                'aria-label="Hasil pengamatan">' +
                '<ul class="fl" id="fl-' + kode + '"></ul>' +
                '<div class="wn" id="wn-' + kode + '"></div></div></div>'
              );
            })
            .join("")
        );
      })
      .join("");

    // Pulihkan isian yang sudah ada kalau daftar digambar ulang
    [].forEach.call(document.querySelectorAll("#pg input[type=checkbox]"), function (c) {
      var k = c.value,
        o = document.querySelector('#pg input[data-o="' + k + '"]');

      if (o) o.value = bk(k).o;
      flist(k);
      updItem(k);
    });

    hitung();
  }

  function ubahKategori() {
    var pend = $("#pk").value === "Pendidikan keagamaan";

    $("#pjw").hidden = !pend;
    if (!pend) $("#pj").value = "";
    tampilKeg();
  }

  function teksKeg(kode) {
    var g = KEG[kode.charAt(0)],
      t = g.item[+kode.slice(1) - 1];

    return g.tanpaKode ? t : kode + ". " + t;
  }

  $("#pk").onchange = ubahKategori;
  $("#pj").onchange = tampilKeg;

  $("#pg").addEventListener("change", function (e) {
    var t = e.target;

    if (t.dataset.f) {
      addF(t.dataset.f, t.files);
      t.value = "";
    } else if (t.type === "checkbox") {
      bk(t.value).on = t.checked;
      hitung();
    }
  });

  $("#pg").addEventListener("input", function (e) {
    var t = e.target,
      d = t.dataset;

    if (d.o !== undefined) {
      bk(d.o).o = t.value;
      updItem(d.o);
    } else if (d.d) {
      bk(d.k).f[+d.i].tgl = t.value;
      updItem(d.k);
    } else if (d.l) {
      bk(d.k).f[+d.i].lok = t.value;
      updItem(d.k);
    }
  });

  $("#pg").addEventListener("click", function (e) {
    var b = e.target.closest(".rm");
    if (!b) return;

    var x = bk(b.dataset.k);
    x.f.splice(+b.dataset.i, 1);
    x.er = "";
    flist(b.dataset.k);
    updItem(b.dataset.k);
  });

  /*=============== DAFTAR PESERTA ===============*/
  function tampil() {
    var n = {},
      d;

    data.forEach(function (x) {
      n[x.kategori] = (n[x.kategori] || 0) + 1;
    });

    $("#pf").innerHTML = [["Semua", "Semua kategori"]]
      .concat(
        KAT.map(function (k) {
          return [k, k];
        }),
      )
      .map(function (o) {
        return (
          '<option value="' + esc(o[0]) + '">' + esc(o[1]) + " (" +
          (o[0] === "Semua" ? data.length : n[o[0]] || 0) + ")</option>"
        );
      })
      .join("");
    $("#pf").value = kategori;

    d = data
      .filter(function (x) {
        return kategori === "Semua" || x.kategori === kategori;
      })
      .sort(function (a, b) {
        return String(b.tgl).localeCompare(String(a.tgl)) || Number(b.id) - Number(a.id);
      });

    $("#pt").innerHTML = d
      .map(function (x) {
        var keg =
          x.kegiatan && x.kegiatan.length
            ? '<details class="pt-keg"><summary>' + x.kegiatan.length + " kegiatan" +
              (x.berkas ? " &middot; " + x.berkas + " berkas bukti" : "") + "</summary><ul>" +
              x.kegiatan
                .map(function (t) {
                  return "<li>" + esc(t) + "</li>";
                })
                .join("") +
              "</ul></details>"
            : "-";

        return (
          "<tr><td><b>" + esc(x.nama) + "</b><br><small>" + esc(x.tgl) +
          "</small></td><td>" + esc(x.kategori) +
          (x.jenis ? "<br><small>" + esc(x.jenis) + "</small>" : "") +
          "</td><td>" + esc(x.kab || "-") +
          "</td><td>" + keg +
          '</td><td><span class="pill' + (x.status == "Terverifikasi" ? "" : " m") + '">' +
          esc(x.status) + "</span></td></tr>"
        );
      })
      .join("");

    $("#pe").style.display = d.length ? "none" : "block";
  }

  function muat() {
    if (!S.user) return;

    kirim({ action: "part_list", pengguna: S.user.u, role: S.user.role })
      .then(function (j) {
        data = j.data;
        tampil();
      })
      .catch(function (e) {
        pesan("Daftar peserta belum dapat dimuat (" + e.message + ").", 0);
      });
  }

  $("#pf").onchange = function () {
    kategori = this.value;
    tampil();
  };

  /*=============== SIMPAN ===============*/
  $("#pd").onclick = function () {
    var k = $("#pk").value,
      jenis = $("#pj").value,
      nm = $("#pn").value.trim(),
      kb = $("#pb").value,
      pen = $("#pp").value.trim(),
      kode = [].filter
        .call(document.querySelectorAll("#pg input[type=checkbox]"), function (c) {
          return bk(c.value).on;
        })
        .map(function (c) {
          return c.value;
        });

    if (kirimSedang) return;

    if (!k) return pesan("Pilih kategori terlebih dahulu.", 0);
    if (k === "Pendidikan keagamaan" && !jenis) return pesan("Pilih jenis lembaga.", 0);
    if (nm.length < 3) return pesan("Isi nama lembaga atau kelompok (minimal 3 huruf).", 0);
    if (!kb) return pesan("Pilih kabupaten/kota.", 0);
    if (pen.length < 5) return pesan("Isi penanggung jawab dan nomor HP.", 0);
    if (!kode.length) {
      return pesan("Centang minimal satu kegiatan. Unggah bukti dukungnya lebih dulu.", 0);
    }

    var id = retryId || String(Date.now()),
      catatan = [],
      files = [],
      n = 0;

    kode.forEach(function (kd) {
      var x = bk(kd);

      if (x.o.trim().length >= 10) catatan.push({ kegiatan: teksKeg(kd), teks: x.o.trim() });

      x.f.filter(fok).forEach(function (f) {
        files.push({ kode: kd, kegiatan: teksKeg(kd), f: f });
      });
    });

    kirimSedang = true;
    $("#pd").disabled = true;
    pesan("Mengirim data...", 1);

    kirim({
      action: "part_save",
      id: id,
      data: {
        kategori: k,
        jenis: jenis,
        nama: nm,
        kab: kb,
        pj: pen,
        pengguna: S.user.u,
        kegiatan: kode.map(teksKeg),
        catatan: catatan,
        jumlahBerkas: files.length,
      },
    })
      .then(function () {
        // bukti diunggah satu per satu agar ukuran kiriman tetap kecil
        return files.reduce(function (p, it) {
          return p.then(function () {
            pesan("Mengunggah bukti " + ++n + " dari " + files.length + "...", 1);

            return fileToBase64(it.f.file).then(function (b64) {
              return kirim({
                action: "part_upload",
                id: id,
                nama: nm,
                kategori: k,
                kode: it.kode,
                kegiatan: it.kegiatan,
                berkas: it.f.name,
                mime: it.f.type,
                tgl: it.f.tgl,
                lok: it.f.lok.trim(),
                ukuran: Math.round(it.f.size / 1024),
                data: b64,
              });
            });
          });
        }, Promise.resolve());
      })
      .then(function () {
        retryId = null;
        $("#pn").value = "";
        $("#pp").value = "";
        B = {};
        tampilKeg();
        pesan(
          "Lembaga berhasil didaftarkan (" + kode.length + " kegiatan, " + files.length +
            " berkas bukti) dan berstatus Menunggu verifikasi.",
          1,
        );
        muat();
      })
      .catch(function (e) {
        retryId = id;
        pesan("Gagal mengirim (" + e.message + "). Tekan Daftarkan lagi untuk mengirim ulang.", 0);
      })
      .then(function () {
        kirimSedang = false;
        $("#pd").disabled = false;
      });
  };

  function mulai() {
    isiKab();
    B = {};
    retryId = null;
    $("#pk").value = "";
    $("#pj").value = "";
    $("#pn").value = "";
    $("#pp").value = "";
    $(".pkeg-note").textContent =
      "Unggah bukti dukung atau tulis hasil pengamatan lebih dulu pada kegiatan yang dilaksanakan. Setelah bukti sah, kegiatan otomatis tercentang.";
    ubahKategori();
    pesan("", 1);
    kategori = "Semua";
    data = [];
    tampil();
    muat();
  }

  document.addEventListener("sib:masuk", mulai);

  // Kalau sesi sudah aktif saat berkas ini dimuat (masuk otomatis)
  if (S.user) mulai();
})();
