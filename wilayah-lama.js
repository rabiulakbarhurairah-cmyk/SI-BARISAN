/* SI-BARISAN - data wilayah dan pembagian jalur satuan kerja.
 * Jalur A: lingkup Kankemenag Kab/Kota (KUA, MIN, internal Kankemenag).
 * Jalur B: penilaian mandiri tersendiri (MTsN, MAN).
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
  { kab: "Kota Makassar", mtsn: 2, man: 3, kua: ["Biringkanaya", "Bontoala", "Makassar", "Mamajang", "Manggala", "Mariso", "Panakkukang", "Rappocini", "Tallo", "Tamalanrea", "Tamalate", "Ujung Pandang", "Ujung Tanah", "Wajo", "Kepulauan Sangkarrang"] },
  { kab: "Kabupaten Gowa", mtsn: 1, man: 2, kua: ["Somba Opu", "Bontomarannu", "Pattallassang", "Pallangga", "Barombong", "Bajeng", "Bajeng Barat", "Bontonompo", "Bontonompo Selatan", "Tinggimoncong", "Tombolo Pao", "Parigi", "Bungaya", "Bontolempangan", "Tompobulu", "Biringbulu", "Manuju", "Parangloe"] },
  { kab: "Kabupaten Bone", mtsn: 4, man: 4, kua: ["Ajangale", "Amali", "Awangpone", "Barebbo", "Bengo", "Bontocani", "Cenrana", "Cina", "Dua Boccoe", "Kajuara", "Kahu", "Lappariaja", "Lamuru", "Mare", "Patimpeng", "Ponre", "Salomekko", "Sibulue", "Tellu Siattinge", "Tellu Limpoe", "Tanete Riattang", "Tanete Riattang Barat", "Tanete Riattang Timur", "Ulaweng", "Palakka", "Libureng", "Tonra"] },
  { kab: "Kabupaten Maros", mtsn: 2, man: 0, kua: ["Turikale", "Mandai", "Moncongloe", "Maros Baru", "Marusu", "Lau", "Bontoa", "Bantimurung", "Simbang", "Tanralili", "Tompobulu", "Camba", "Cenrana", "Mallawa"] },
  { kab: "Kabupaten Bulukumba", mtsn: 7, man: 2, kua: ["Ujung Bulu", "Gantarang", "Kindang", "Bontobahari", "Bontotiro", "Herlang", "Kajang", "Bulukumpa", "Rilau Ale", "Ujung Loe"] },
  { kab: "Kabupaten Bantaeng", mtsn: 1, man: 2, kua: ["Bantaeng", "Eremerasa", "Gantarang Keke", "Bissappu", "Sinoa", "Pajukukang", "Tompobulu", "Uluere"] },
  { kab: "Kabupaten Barru", mtsn: 1, man: 2, kua: ["Barru", "Balusu", "Mallusetasi", "Soppeng Riaja", "Tanete Rilau", "Tanete Riaja", "Pujananting"] },
  { kab: "Kota Parepare", mtsn: 1, man: 2, kua: ["Bacukiki", "Bacukiki Barat", "Ujung", "Soreang"] },
  { kab: "Kota Palopo", mtsn: 1, man: 2, kua: ["Wara", "Wara Utara", "Wara Selatan", "Wara Timur", "Wara Barat", "Bara", "Telluwanua", "Mungkajang", "Sendana"] },
  { kab: "Kabupaten Luwu", mtsn: 3, man: 1, kua: ["Belopa", "Belopa Utara", "Bua", "Bua Ponrang", "Kamanre", "Lamasi", "Lamasi Timur", "Larompong", "Larompong Selatan", "Latimojong", "Lower", "Padang Sappa", "Ponrang", "Ponrang Selatan", "Suli", "Suli Barat", "Walenrang", "Walenrang Barat", "Walenrang Timur", "Walenrang Utara", "Basse Sangtempe", "Basse Sangtempe Utara"] },
  { kab: "Kabupaten Luwu Utara", mtsn: 1, man: 1, kua: ["Masamba", "Sabbang", "Sabbang Selatan", "Baebunta", "Baebunta Selatan", "Bone-Bone", "Tana Lili", "Malangke", "Malangke Barat", "Mappedeceng", "Rongkong", "Seko", "Rampi", "Sukamaju", "Sukamaju Selatan"] },
  { kab: "Kabupaten Luwu Timur", mtsn: 1, man: 1, kua: ["Malili", "Wotu", "Tomoni", "Tomoni Timur", "Mangkutana", "Nuha", "Towuti", "Wasuponda", "Burau", "Angkona", "Kalaena"] },
  { kab: "Kabupaten Pangkajene dan Kepulauan", mtsn: 1, man: 1, kua: ["Pangkajene", "Bungoro", "Labakkang", "Minasa Tene", "Mandalle", "Ma'rang", "Segeri", "Tondong Tallasa", "Liukang Tupabbiring", "Liukang Tupabbiring Utara", "Liukang Kalmas", "Liukang Tangaya"] },
  { kab: "Kabupaten Pinrang", mtsn: 1, man: 1, kua: ["Watang Sawitto", "Paleteang", "Cempa", "Duampanua", "Lanrisang", "Lembang", "Mattiro Bulu", "Mattiro Sompe", "Suppa", "Tiroang", "Patampanua"] },
  { kab: "Kabupaten Enrekang", mtsn: 4, man: 2, kua: ["Enrekang", "Cendana", "Maiwa", "Bungin", "Baraka", "Buntu Batu", "Anggeraja", "Malua", "Alla", "Curio", "Masalle", "Kasuari"] },
  { kab: "Kabupaten Sidenreng Rappang", mtsn: 3, man: 1, kua: ["Maritengngae", "Watang Sidenreng", "Kulo", "Baranti", "Panca Rijang", "Pitu Riase", "Pitu Riawa", "Wt. Pulu", "Panca Lautang", "Tellu Limpoe", "Duampanua"] },
  { kab: "Kabupaten Soppeng", mtsn: 1, man: 1, kua: ["Lalabata", "Marioriwawo", "Marioriawa", "Donri-Donri", "Citta", "Lilirilau", "Liliriaja", "Ganra"] },
  { kab: "Kabupaten Wajo", mtsn: 2, man: 1, kua: ["Tempe", "Maniangpajo", "Sajoanging", "Majauleng", "Takkalalla", "Penrang", "Gilireng", "Keera", "Pitumpanua", "Pammana", "Belawa", "Bulete", "Bola", "Tanasitolo"] },
  { kab: "Kabupaten Sinjai", mtsn: 4, man: 1, kua: ["Sinjai Utara", "Sinjai Timur", "Sinjai Selatan", "Sinjai Borong", "Sinjai Barat", "Sinjai Tengah", "Bulupodoo", "Tellu Limpoe", "Pulaulima"] },
  { kab: "Kabupaten Jeneponto", mtsn: 4, man: 2, kua: ["Bontoramba", "Tamalatea", "Binamu", "Arungkeke", "Bangkala", "Bangkala Barat", "Batang", "Tarowang", "Kelara", "Rumbia", "Turatea"] },
  { kab: "Kabupaten Takalar", mtsn: 1, man: 0, kua: ["Pattallassang", "Polombangkeng Utara", "Polombangkeng Selatan", "Galesong", "Galesong Selatan", "Galesong Utara", "Sanrobone", "Mappakasunggu", "Laikang", "Kepulauan Tanakeke"] },
  { kab: "Kabupaten Kepulauan Selayar", mtsn: 3, man: 2, kua: ["Benteng", "Bontoharu", "Bontomanai", "Bontosikuyu", "Bontomatene", "Buki", "Pasimasunggu", "Pasimasunggu Timur", "Pasimarannu", "Pasilambena", "Taka Bonerate"] },
  { kab: "Kabupaten Tana Toraja", mtsn: 2, man: 1, kua: ["Makale", "Makale Utara", "Makale Selatan", "Saluputti", "Bonggakaradeng", "Rano", "Mengkendek", "Gandang Batu Sillanan", "Sangalla", "Sangalla Utara", "Sangalla Selatan", "Mappak", "Rembon", "Kurra", "Bunta", "Simbuang", "Masanda", "Malimbong Balepe", "Bituang"] },
  { kab: "Kabupaten Toraja Utara", mtsn: 0, man: 0, kua: ["Rantepao", "Kesu", "Tallunglipu", "Nanggala", "Tondon", "Sopai", "Rantebua", "Sa'dan", "Balusu", "Bangkelekila", "Rindingallo", "Buntu Pepasan", "Awan Rante Karua", "Kapal Pitu", "Tikala", "Dendokan", "Sesean", "Sesean Suloara", "Baruppu", "Pangala"] },
];
