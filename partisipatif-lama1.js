/* SI-BARISAN - Lembaga Partisipatif: formulir pendaftaran, daftar kegiatan, dan daftar peserta.
   Membutuhkan: wilayah.js (WILAYAH) dan main.js (window.SIB berisi url, token, user).
   Data disimpan di Google Sheets (tab "Partisipatif") lewat Code.gs.
   Daftar kegiatan ada di KEG di bawah ini. Ubah kalimatnya di sana, jangan menambah atau menukar urutan
   tanpa memahami bahwa kode (A1, A2, dst.) mengikuti urutan. */
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
      item: [
        "Mengintegrasikan tema lingkungan ke dalam kegiatan intrakurikuler, kokurikuler, ekstrakurikuler, dan budaya madrasah sesuai dengan kurikulum yang berlaku, termasuk Kurikulum Berbasis Cinta.",
        "Mengembangkan madrasah sebagai model madrasah hijau di wilayahnya.",
      ],
    },
    C: {
      judul: "Kegiatan khusus di pondok pesantren",
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
      item: [
        "Menyampaikan nilai ekoteologi melalui pembelajaran agama, sekolah minggu, pasraman, atau kegiatan keagamaan sejenis sesuai dengan ajaran masing-masing.",
        "Membiasakan perilaku ramah lingkungan dalam kegiatan belajar dan ibadah.",
        "Melaksanakan aksi lingkungan bersama orang tua dan komunitas keagamaan.",
      ],
    },
    R: {
      judul: "Kegiatan di rumah ibadah",
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
    kirimSedang = false;

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

  function isiKab() {
    $("#pb").innerHTML =
      '<option value="">Pilih kabupaten/kota</option>' +
      WILAYAH.map(function (w) {
        return '<option value="' + esc(w.kab) + '">' + esc(w.kab) + "</option>";
      }).join("");

    $("#pb").value = (S.user && S.user.kab) || "";
  }

  /*=============== DAFTAR KEGIATAN DI FORMULIR ===============*/
  function grupAktif() {
    var k = $("#pk").value;

    if (k === "Pendidikan keagamaan") return SUB[$("#pj").value] || [];
    if (k === "Rumah ibadah") return ["R"];
    if (k === "Masyarakat") return ["M"];
    return [];
  }

  function hitung() {
    var n = document.querySelectorAll("#pg input:checked").length,
      m = document.querySelectorAll("#pg input").length;

    $("#pc").textContent = n + " dari " + m + " kegiatan dipilih";
  }

  function tampilKeg() {
    var g = grupAktif(),
      pilih = {};

    [].forEach.call(document.querySelectorAll("#pg input:checked"), function (c) {
      pilih[c.value] = 1;
    });

    $("#pkw").hidden = !g.length;

    $("#pg").innerHTML = g
      .map(function (k) {
        return (
          "<h5>" + esc(KEG[k].judul) + "</h5>" +
          KEG[k].item
            .map(function (t, i) {
              var kode = k + (i + 1);
              return (
                '<label class="kg"><input type="checkbox" value="' + kode + '"' +
                (pilih[kode] ? " checked" : "") + '><span class="kode">' + kode +
                "</span><span>" + esc(t) + "</span></label>"
              );
            })
            .join("")
        );
      })
      .join("");

    hitung();
  }

  function ubahKategori() {
    var pend = $("#pk").value === "Pendidikan keagamaan";

    $("#pjw").hidden = !pend;
    if (!pend) $("#pj").value = "";
    tampilKeg();
  }

  function teksKeg(kode) {
    return kode + ". " + KEG[kode.charAt(0)].item[+kode.slice(1) - 1];
  }

  $("#pk").onchange = ubahKategori;
  $("#pj").onchange = tampilKeg;
  $("#pg").addEventListener("change", hitung);

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
        var keg = x.kegiatan && x.kegiatan.length
          ? '<details class="pt-keg"><summary>' + x.kegiatan.length + " kegiatan</summary><ul>" +
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
      kode = [].map.call(document.querySelectorAll("#pg input:checked"), function (c) {
        return c.value;
      });

    if (kirimSedang) return;

    if (!k) return pesan("Pilih kategori terlebih dahulu.", 0);
    if (k === "Pendidikan keagamaan" && !jenis) return pesan("Pilih jenis lembaga.", 0);
    if (nm.length < 3) return pesan("Isi nama lembaga atau kelompok (minimal 3 huruf).", 0);
    if (!kb) return pesan("Pilih kabupaten/kota.", 0);
    if (pen.length < 5) return pesan("Isi penanggung jawab dan nomor HP.", 0);
    if (!kode.length) return pesan("Centang minimal satu kegiatan yang dilaksanakan.", 0);

    kirimSedang = true;
    $("#pd").disabled = true;
    pesan("Mengirim data...", 1);

    kirim({
      action: "part_save",
      id: String(Date.now()),
      data: {
        kategori: k,
        jenis: jenis,
        nama: nm,
        kab: kb,
        pj: pen,
        pengguna: S.user.u,
        kegiatan: kode.map(teksKeg),
      },
    })
      .then(function () {
        $("#pn").value = "";
        $("#pp").value = "";
        [].forEach.call(document.querySelectorAll("#pg input"), function (c) {
          c.checked = false;
        });
        hitung();
        pesan("Lembaga berhasil didaftarkan dan berstatus Menunggu verifikasi.", 1);
        muat();
      })
      .catch(function (e) {
        pesan("Gagal menyimpan (" + e.message + "). Coba lagi.", 0);
      })
      .then(function () {
        kirimSedang = false;
        $("#pd").disabled = false;
      });
  };

  function mulai() {
    isiKab();
    $("#pk").value = "";
    $("#pj").value = "";
    $("#pn").value = "";
    $("#pp").value = "";
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
