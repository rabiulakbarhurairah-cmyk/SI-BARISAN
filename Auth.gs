/**
 * SI-BARISAN - Auth.gs
 * Login diperiksa di server (bukan di browser). Kata sandi disimpan sebagai hash.
 * Tambahkan sebagai berkas BARU di proyek Apps Script yang sama dengan Code.gs
 * (ikon + di sebelah "Berkas", pilih "Skrip", beri nama Auth).
 */
var MAKS_GAGAL = 5; // salah memasukkan kata sandi sebanyak ini lalu akun terkunci sementara
var KUNCI_DETIK = 900; // lama terkunci: 15 menit
var SESI_DETIK = 21600; // lama sesi: 6 jam (batas maksimum CacheService)

// Jenis satuan kerja yang boleh disimpan oleh tiap peran (diperiksa di server)
var JENIS_AKUN = {
  kanwil: ["KUA", "MIN", "MTsN", "MAN", "Kankemenag", "Kanwil", "Partisipatif"],
  kab: ["Kankemenag", "KUA", "MIN", "Partisipatif"],
  unit: ["KUA"],
  madrasah: ["MIN", "MTsN", "MAN"],
};

/* ===== LANGKAH 1: buat akun =====
   Isi "masuk" (nama pengguna baru) dan "sandi" (kata sandi baru, minimal 12 karakter)
   untuk keempat akun, lalu pilih fungsi aturAkun dan klik Jalankan SATU KALI.
   Sesudah muncul "Akun tersimpan", HAPUS semua kata sandi dari berkas ini dan simpan.
   Kolom "id" dan "role" jangan diubah. */
function aturAkun() {
  var daftar = [
    { masuk: "GANTI", sandi: "GANTI", id: "kanwil", role: "kanwil" },
    { masuk: "GANTI", sandi: "GANTI", id: "kankemenag", role: "kab" },
    { masuk: "GANTI", sandi: "GANTI", id: "kua", role: "unit" },
    { masuk: "GANTI", sandi: "GANTI", id: "madrasah", role: "madrasah" },
  ];

  var out = {},
    dipakai = {};

  daftar.forEach(function (a) {
    var masuk = String(a.masuk).trim().toLowerCase(),
      sandi = String(a.sandi);

    if (masuk === "ganti" || sandi === "GANTI") {
      throw new Error("Isi dulu nama masuk dan kata sandi untuk akun " + a.id);
    }
    if (masuk.length < 6) {
      throw new Error("Nama masuk akun " + a.id + " minimal 6 karakter.");
    }
    if (sandi.length < 12) {
      throw new Error("Kata sandi akun " + a.id + " minimal 12 karakter.");
    }
    if (dipakai[masuk]) {
      throw new Error("Nama masuk tidak boleh sama antar akun: " + masuk);
    }
    dipakai[masuk] = 1;

    var garam = Utilities.getUuid();
    out[masuk] = {
      id: a.id,
      role: a.role,
      s: garam,
      h: hash_(garam, sandi),
    };
  });

  PropertiesService.getScriptProperties().setProperty(
    "AKUN",
    JSON.stringify(out),
  );
  Logger.log(
    "Akun tersimpan: " +
      Object.keys(out).length +
      ". Sekarang HAPUS kata sandi dari berkas ini.",
  );
}

/* ===== Login: dipanggil dari doPost ===== */
function login_(p) {
  var masuk = String(p.u || "")
      .trim()
      .toLowerCase()
      .slice(0, 60),
    sandi = String(p.p || "");

  if (!masuk || !sandi) {
    return { ok: false, error: "Isi nama pengguna dan kata sandi." };
  }

  var cache = CacheService.getScriptCache(),
    kGagal = "gagal-" + masuk,
    kKunci = "kunci-" + masuk;

  if (cache.get(kKunci)) {
    return {
      ok: false,
      error: "Terlalu banyak percobaan. Coba lagi dalam 15 menit.",
    };
  }

  var daftar = JSON.parse(
      PropertiesService.getScriptProperties().getProperty("AKUN") || "{}",
    ),
    a = daftar[masuk];

  if (!a || hash_(a.s, sandi) !== a.h) {
    var n = Number(cache.get(kGagal) || 0) + 1;

    if (n >= MAKS_GAGAL) {
      cache.put(kKunci, "1", KUNCI_DETIK);
      cache.remove(kGagal);
    } else {
      cache.put(kGagal, String(n), KUNCI_DETIK);
    }
    return { ok: false, error: "Nama pengguna atau kata sandi salah." };
  }

  cache.remove(kGagal);

  var sesi = Utilities.getUuid() + Utilities.getUuid();
  cache.put(
    "sesi-" + sesi,
    JSON.stringify({ u: a.id, role: a.role }),
    SESI_DETIK,
  );
  return { ok: true, sesi: sesi, u: a.id };
}

/* Mengembalikan {u, role} kalau sesi sah, atau null */
function sesi_(tok) {
  if (!tok) return null;
  var v = CacheService.getScriptCache().get("sesi-" + String(tok).slice(0, 100));
  return v ? JSON.parse(v) : null;
}

function keluar_(tok) {
  CacheService.getScriptCache().remove("sesi-" + String(tok || "").slice(0, 100));
  return { ok: true };
}

function jenisBoleh_(s, jenis) {
  return (JENIS_AKUN[s.role] || []).indexOf(String(jenis)) > -1;
}

function hash_(garam, sandi) {
  var b = Utilities.computeDigest(
    Utilities.DigestAlgorithm.SHA_256,
    garam + "|" + sandi,
    Utilities.Charset.UTF_8,
  );
  return b
    .map(function (x) {
      return ("0" + (x < 0 ? x + 256 : x).toString(16)).slice(-2);
    })
    .join("");
}
