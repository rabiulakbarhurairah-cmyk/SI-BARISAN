/* SI-BARISAN - Lembaga Partisipatif: formulir pendaftaran dan daftar peserta.
   Membutuhkan: wilayah.js (WILAYAH) dan main.js (window.SIB berisi url, token, user).
   Data disimpan di Google Sheets (tab "Partisipatif") lewat Code.gs. */
(function () {
  var S = window.SIB;
  if (!S) return;

  var $ = function (s) {
    return document.querySelector(s);
  };

  var KAT = ["Pendidikan keagamaan", "Rumah ibadah", "Masyarakat"],
    data = [],
    kategori = "Semua",
    kirimSedang = false;

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
        return (
          "<tr><td><b>" + esc(x.nama) + "</b><br><small>" + esc(x.tgl) +
          "</small></td><td>" + esc(x.kategori) +
          "</td><td>" + esc(x.kab || "-") +
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

  $("#pd").onclick = function () {
    var k = $("#pk").value,
      nm = $("#pn").value.trim(),
      kb = $("#pb").value,
      pj = $("#pp").value.trim();

    if (kirimSedang) return;

    if (!k) return pesan("Pilih kategori terlebih dahulu.", 0);
    if (nm.length < 3) return pesan("Isi nama lembaga atau kelompok (minimal 3 huruf).", 0);
    if (!kb) return pesan("Pilih kabupaten/kota.", 0);
    if (pj.length < 5) return pesan("Isi penanggung jawab dan nomor HP.", 0);

    kirimSedang = true;
    $("#pd").disabled = true;
    pesan("Mengirim data...", 1);

    kirim({
      action: "part_save",
      id: String(Date.now()),
      data: { kategori: k, nama: nm, kab: kb, pj: pj, pengguna: S.user.u },
    })
      .then(function () {
        $("#pn").value = "";
        $("#pp").value = "";
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
    $("#pn").value = "";
    $("#pp").value = "";
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
