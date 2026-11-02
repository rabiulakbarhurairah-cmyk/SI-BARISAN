/* SI-BARISAN - data wilayah dan pembagian jalur satuan kerja.
 * Jalur A: lingkup Kankemenag Kab/Kota (KUA, MIN, internal Kankemenag).
 * Jalur B: penilaian mandiri tersendiri (MTsN, MAN).
 * kua = daftar nama KUA Kecamatan per kab/kota (sumber: data KUA se-Sulawesi Selatan).
 * mtsn dan man = jumlah madrasah negeri per kab/kota (acuan target, bukan daftar nama). */
var JALUR = {
  KUA: "A",
  MIN: "A",
  Kankemenag: "A",
  MTsN: "B",
  MAN: "B",
  Kanwil: "-",
};

var WILAYAH = [
  { kab: "Kota Makassar", mtsn: 2, man: 3, kua: ["Biringkanaya", "Bontoala", "Makassar", "Mamajang", "Manggala", "Mariso", "Panakkukang", "Rappocini", "Tallo", "Tamalanrea", "Tamalate", "Ujung Pandang", "Ujung Tanah", "Wajo"] },
  { kab: "Kabupaten Gowa", mtsn: 1, man: 2, kua: ["Bajeng", "Bajeng Barat", "Barombong", "Biringbulu", "Bontolempangan", "Bontomarannu", "Bontonompo", "Bontonompo Selatan", "Bungaya", "Manuju", "Pallangga", "Parangloe", "Parigi", "Pattallassang", "Somba Opu", "Tinggimoncong", "Tombolopao", "Tompobulu"] },
  { kab: "Kabupaten Bone", mtsn: 4, man: 4, kua: ["Ajangale", "Amali", "Awangpone", "Barebbo", "Bengo", "Bontocani", "Cenrana", "Cina", "Dua Boccoe", "Kahu", "Kajuara", "Lamuru", "Lappariaja", "Libureng", "Mare", "Palakka", "Patimpeng", "Ponre", "Salomekko", "Sibulue", "Tanete Riattang", "Tanete Riattang Barat", "Tanete Riattang Timur", "Tellu Siattinge", "Tellulimpoe", "Tonra", "Ulaweng"] },
  { kab: "Kabupaten Maros", mtsn: 2, man: 0, kua: ["Bantimurung", "Bontoa", "Camba", "Cenrana", "Lau", "Mallawa", "Mandai", "Maros Baru", "Marusu", "Moncongloe", "Simbang", "Tanralili", "Tompobulu", "Turikale"] },
  { kab: "Kabupaten Bulukumba", mtsn: 7, man: 2, kua: ["Bontobahari", "Bontotiro", "Bulukumpa", "Gantarang", "Herlang", "Kajang", "Kindang", "Rilau Ale", "Ujung Bulu", "Ujungloe"] },
  { kab: "Kabupaten Bantaeng", mtsn: 1, man: 2, kua: ["Bantaeng", "Bissappu", "Eremerasa", "Gantarangkeke", "Pa'jukukang", "Sinoa", "Tompobulu", "Uluere"] },
  { kab: "Kabupaten Barru", mtsn: 1, man: 2, kua: ["Balusu", "Barru", "Mallusetasi", "Pujananting", "Soppeng Riaja", "Tanete Riaja", "Tanete Rilau"] },
  { kab: "Kota Parepare", mtsn: 1, man: 2, kua: ["Bacukiki", "Bacukiki Barat", "Soreang", "Ujung"] },
  { kab: "Kota Palopo", mtsn: 1, man: 2, kua: ["Bara", "Mungkajang", "Sendana", "Telluwanua", "Wara", "Wara Barat", "Wara Selatan", "Wara Timur", "Wara Utara"] },
  { kab: "Kabupaten Luwu", mtsn: 3, man: 1, kua: ["Bajo", "Bajo Barat", "Bassesang Tempe (Bastem)", "Belopa", "Belopa Utara", "Bua", "Bua Ponrang (Bupon)", "Kamanre", "Lamasi", "Lamasi Timur", "Larompong Selatan", "Latimojong", "Ponrang", "Ponrang Selatan", "Suli", "Suli Barat", "Walenrang", "Walenrang Barat", "Walenrang Timur", "Walenrang Utara"] },
  { kab: "Kabupaten Luwu Utara", mtsn: 1, man: 1, kua: ["Baebunta", "Bone-Bone", "Malangke", "Malangke Barat", "Mappedeceng", "Masamba", "Rampi", "Rongkong", "Sabbang", "Seko", "Sukamaju", "Tana Lili"] },
  { kab: "Kabupaten Luwu Timur", mtsn: 1, man: 1, kua: ["Angkona", "Burau", "Kalaena", "Malili", "Mangkutana", "Nuha", "Tomoni", "Tomoni Timur", "Towuti", "Wasuponda", "Wotu"] },
  { kab: "Kabupaten Pangkajene dan Kepulauan", mtsn: 1, man: 1, kua: ["Balocci", "Bungoro", "Labakkang", "Liukang Kalmas", "Liukang Tangaya", "Liukang Tupabbiring", "Liukang Tupabbiring Utara", "Ma'rang", "Mandalle", "Minasatene", "Pangkajene", "Segeri", "Tondong Tallasa"] },
  { kab: "Kabupaten Pinrang", mtsn: 1, man: 1, kua: ["Batulappa", "Cempa", "Duampanua", "Lanrisang", "Lembang", "Mattiro Bulu", "Mattiro Sompe", "Paleteang", "Patampanua", "Suppa", "Tiroang", "Watang Sawitto"] },
  { kab: "Kabupaten Enrekang", mtsn: 4, man: 2, kua: ["Alla", "Anggeraja", "Baraka", "Baroko", "Bungin", "Buntu Batu", "Cendana", "Curio", "Enrekang", "Maiwa", "Malua", "Masalle"] },
  { kab: "Kabupaten Sidenreng Rappang", mtsn: 3, man: 1, kua: ["Baranti", "Dua Pitue", "Kulo", "Maritengngae", "Panca Lautan", "Panca Rijang", "Pitu Riase", "Pitu Riawa", "Tellu Limpoe", "Watang Pulu", "Watang Sidenreng"] },
  { kab: "Kabupaten Soppeng", mtsn: 1, man: 1, kua: ["Citta", "Donri-Donri", "Ganra", "Lalabata", "Lili Rilau", "Liliriaja", "Marioriawa", "Marioriwawo"] },
  { kab: "Kabupaten Wajo", mtsn: 2, man: 1, kua: ["Belawa", "Bola", "Gilireng", "Keera", "Majauleng", "Maniangpajo", "Pammana", "Penrang", "Pitumpanua", "Sabbangparu", "Sajoanging", "Takkalalla", "Tanasitolo", "Tempe"] },
  { kab: "Kabupaten Sinjai", mtsn: 4, man: 1, kua: ["Bulupoddo", "Pulau Sembilan", "Sinjai Barat", "Sinjai Borong", "Sinjai Selatan", "Sinjai Tengah", "Sinjai Timur", "Sinjai Utara", "Tellulimpoe"] },
  { kab: "Kabupaten Jeneponto", mtsn: 4, man: 2, kua: ["Arungkeke", "Bangkala", "Bangkala Barat", "Batang", "Binamu", "Bontoramba", "Kelara", "Rumbia", "Tamalatea", "Tarowang", "Turatea"] },
  { kab: "Kabupaten Takalar", mtsn: 1, man: 0, kua: ["Galesong", "Galesong Selatan", "Galesong Utara", "Mangarabombang", "Mappakasunggu", "Pattallssang", "Polongbangkeng Selatan", "Polongbangkeng Utara", "Sanribone"] },
  { kab: "Kabupaten Kepulauan Selayar", mtsn: 3, man: 2, kua: ["Benteng", "Bontoharu", "Bontomanal", "Bontomatene", "Bontosikuyu", "Buki", "Pasilambena", "Pasimarannu", "Pasimasunggu", "Pasimasunggu Timur", "Taka Bonerate"] },
  { kab: "Kabupaten Tana Toraja", mtsn: 2, man: 1, kua: ["Bittuang", "Bonggakaradeng", "Gandangbatu Sillanan", "Makale", "Makale Selatan", "Makale Utara", "Masanda", "Mengkendek", "Rantetayo", "Rembon", "Saluputti", "Sangalla", "Simbuang"] },
  { kab: "Kabupaten Toraja Utara", mtsn: 0, man: 0, kua: ["Rantebua", "Rantepao", "Rinding Allo", "Sanggalangi", "Sesean"] },
];
