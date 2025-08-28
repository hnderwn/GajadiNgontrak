document.addEventListener('DOMContentLoaded', function () {
  // --- DATA DUMMY UNTUK PRESET ---
  const presets = {
    rekomendasi: {
      name: 'Paket Rekomendasi',
      jenisProgram: 'fixFloating',
      sukuBungaFix: 7.5,
      masaKreditFix: 3,
      jangkaWaktu: 20,
    },
    bungaTerendah: {
      name: 'Paket Bunga Terendah',
      jenisProgram: 'berjenjang',
      masaKreditBerjenjang: 3,
      bungaBerjenjang: [5.5, 7.0, 8.5],
      jangkaWaktu: 25,
    },
  };

  // --- PEMILIHAN SEMUA ELEMEN INTERAKTIF ---
  const elements = {
    hargaProperti: document.getElementById('hargaProperti'),
    uangMukaPersen: document.getElementById('uangMukaPersen'),
    uangMukaRupiah: document.getElementById('uangMukaRupiah'),
    uangMukaSlider: document.getElementById('uangMukaSlider'),
    pilihanBunga: document.getElementById('pilihanBunga'),
    presetInfo: document.getElementById('presetInfo'), // Elemen baru
    customFields: document.getElementById('customFields'),
    jenisProgram: document.getElementById('jenisProgram'),
    fixFloatingFields: document.getElementById('fixFloatingFields'),
    stepBerjenjangFields: document.getElementById('stepBerjenjangFields'),
    sukuBungaFix: document.getElementById('sukuBungaFix'),
    sukuBungaFixSlider: document.getElementById('sukuBungaFixSlider'),
    masaKreditFix: document.getElementById('masaKreditFix'),
    masaKreditFixSlider: document.getElementById('masaKreditFixSlider'),
    masaKreditBerjenjang: document.getElementById('masaKreditBerjenjang'),
    berjenjangBungaInputs: document.getElementById('berjenjangBungaInputs'),
    jangkaWaktu: document.getElementById('jangkaWaktu'),
    jangkaWaktuSlider: document.getElementById('jangkaWaktuSlider'),
    resultsContainer: document.getElementById('results'),
    showTableBtn: document.getElementById('showTableBtn'),
    loader: document.getElementById('loader'),
    amortizationContainer: document.getElementById('amortizationContainer'),
    exportContainer: document.getElementById('exportContainer'),
  };

  // --- STATE MANAGEMENT ---
  let isUpdatingDP = false;
  let amortizationData = [];

  // --- FUNGSI FORMAT ANGKA (DIPERBARUI) ---
  const formatToRupiah = (angka) =>
    new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0, // Tidak ada angka di belakang koma
      maximumFractionDigits: 0, // Pastikan tidak ada angka di belakang koma
    }).format(angka);
  const parseRupiah = (text) => parseFloat(String(text).replace(/[^0-9]/g, '')) || 0;

  // --- FUNGSI KALKULASI INTI ---
  const hitungAngsuran = (p, r, n) => {
    if (r <= 0) return p / n;
    const num = p * r * Math.pow(1 + r, n);
    const den = Math.pow(1 + r, n) - 1;
    return num / den;
  };

  // --- FUNGSI UTAMA KALKULASI & RENDER ---

  // 1. Fungsi untuk kalkulasi & render ringkasan (REAL-TIME)
  function calculateAndDisplaySummary() {
    elements.amortizationContainer.classList.add('hidden');
    elements.exportContainer.innerHTML = '';

    const harga = parseRupiah(elements.hargaProperti.value);
    const dp = parseRupiah(elements.uangMukaRupiah.value);
    const plafond = harga - dp;

    if (plafond <= 0) {
      elements.resultsContainer.innerHTML = `<div class="text-center p-8 bg-slate-800/50 rounded-lg"><h2 class="font-bold text-xl text-white">Plafond Pinjaman Rp 0</h2><p class="text-slate-400 mt-2">Naikkan harga properti atau turunkan uang muka.</p></div>`;
      elements.showTableBtn.classList.add('hidden');
      return;
    }

    elements.showTableBtn.classList.remove('hidden');

    const pilihan = elements.pilihanBunga.value;
    let jangkaWaktuTahun, sukuBungaAwal;

    if (pilihan === 'custom') {
      jangkaWaktuTahun = parseInt(elements.jangkaWaktu.value);
      sukuBungaAwal = parseFloat(elements.sukuBungaFix.value) / 100 / 12;
    } else {
      const preset = presets[pilihan];
      jangkaWaktuTahun = preset.jangkaWaktu;
      sukuBungaAwal = (preset.sukuBungaFix || preset.bungaBerjenjang[0]) / 100 / 12;
    }

    const totalTenorBulan = jangkaWaktuTahun * 12;
    const angsuranPertama = hitungAngsuran(plafond, sukuBungaAwal, totalTenorBulan);
    const totalPembayaran = angsuranPertama * totalTenorBulan;
    const totalBunga = totalPembayaran - plafond;
    const biayaLain = plafond * 0.06;

    elements.resultsContainer.innerHTML = `
            <div class="space-y-6">
                <div class="bg-slate-800/50 p-6 rounded-xl">
                    <h3 class="font-bold text-lg text-white mb-4">Estimasi Pembayaran Pertama</h3>
                    <div class="space-y-3 text-sm">
                        <p class="flex justify-between text-slate-300"><span>Uang Muka</span> <span class="font-semibold text-white">${formatToRupiah(dp)}</span></p>
                        <p class="flex justify-between text-slate-300"><span>Angsuran Pertama</span> <span class="font-semibold text-white">${formatToRupiah(angsuranPertama)}</span></p>
                        <p class="flex justify-between text-slate-300"><span>Estimasi Biaya Lainnya (6%)</span> <span class="font-semibold text-white">${formatToRupiah(biayaLain)}</span></p>
                    </div>
                </div>
                <div class="bg-slate-800/50 p-6 rounded-xl">
                    <h3 class="font-bold text-lg text-white mb-4">Detail Pinjaman</h3>
                    <div class="space-y-3 text-sm">
                        <p class="flex justify-between text-slate-300"><span>Pinjaman Pokok</span> <span class="font-semibold text-white">${formatToRupiah(plafond)}</span></p>
                        <p class="flex justify-between text-slate-300"><span>Estimasi Total Bunga</span> <span class="font-semibold text-white">${formatToRupiah(totalBunga)}</span></p>
                        <p class="flex justify-between text-slate-300"><span>Total Pembayaran</span> <span class="font-semibold text-white">${formatToRupiah(totalPembayaran)}</span></p>
                    </div>
                </div>
            </div>
        `;
  }

  // 2. Fungsi yang dipanggil saat tombol "Tampilkan Tabel" diklik (ON-DEMAND)
  function handleShowTableClick() {
    elements.loader.classList.remove('hidden');
    elements.amortizationContainer.classList.add('hidden');
    elements.exportContainer.innerHTML = '';

    setTimeout(() => {
      const plafond = parseRupiah(elements.hargaProperti.value) - parseRupiah(elements.uangMukaRupiah.value);
      const totalTenorBulan = parseInt(elements.jangkaWaktu.value) * 12;
      const sukuBungaFix = parseFloat(elements.sukuBungaFix.value);

      amortizationData = generateAmortizationData(plafond, totalTenorBulan, sukuBungaFix);
      displayAmortizationTable(amortizationData);
      displayExportButtons();

      elements.loader.classList.add('hidden');
      elements.amortizationContainer.classList.remove('hidden');
    }, 500);
  }

  // --- FUNGSI-FUNGSI PEMBANTU ---

  function generateAmortizationData(plafond, totalTenorBulan, sukuBungaFix) {
    let data = [];
    let sisaPokok = plafond;
    const bungaBulanan = sukuBungaFix / 100 / 12;
    for (let i = 1; i <= totalTenorBulan; i++) {
      const angsuran = hitungAngsuran(plafond, bungaBulanan, totalTenorBulan);
      const bungaPinjaman = sisaPokok * bungaBulanan;
      const pokokPinjaman = angsuran - bungaPinjaman;
      sisaPokok -= pokokPinjaman;
      data.push({
        bulan: i,
        pokok: pokokPinjaman,
        bunga: bungaPinjaman,
        total: angsuran,
        sisa: sisaPokok > 0 ? sisaPokok : 0,
      });
    }
    return data;
  }

  function displayAmortizationTable(data) {
    if (data.length === 0) {
      elements.amortizationContainer.innerHTML = '';
      return;
    }
    let tableHTML = `
            <table class="w-full text-sm text-left text-slate-300">
                <thead class="text-xs text-slate-400 uppercase bg-slate-800/50">
                    <tr>
                        <th scope="col" class="px-6 py-3">Bulan Ke-</th>
                        <th scope="col" class="px-6 py-3">Pokok</th>
                        <th scope="col" class="px-6 py-3">Bunga</th>
                        <th scope="col" class="px-6 py-3">Total Angsuran</th>
                        <th scope="col" class="px-6 py-3">Sisa Utang</th>
                    </tr>
                </thead>
                <tbody>
        `;
    data.forEach((row) => {
      tableHTML += `
                <tr class="border-b border-slate-700 hover:bg-slate-800/50">
                    <td class="px-6 py-4 font-medium text-white">${row.bulan}</td>
                    <td class="px-6 py-4">${formatToRupiah(row.pokok)}</td>
                    <td class="px-6 py-4">${formatToRupiah(row.bunga)}</td>
                    <td class="px-6 py-4 font-semibold text-white">${formatToRupiah(row.total)}</td>
                    <td class="px-6 py-4">${formatToRupiah(row.sisa)}</td>
                </tr>
            `;
    });
    tableHTML += `</tbody></table>`;
    elements.amortizationContainer.innerHTML = tableHTML;
  }

  function displayExportButtons() {
    elements.exportContainer.innerHTML = `
            <button id="exportCsvBtn" class="flex-1 border border-cyan-500 text-cyan-400 font-bold py-2 px-4 rounded-lg hover:bg-cyan-500 hover:text-white transition-colors duration-300">Ekspor ke Excel (.csv)</button>
            <button id="exportPdfBtn" class="flex-1 border border-cyan-500 text-cyan-400 font-bold py-2 px-4 rounded-lg hover:bg-cyan-500 hover:text-white transition-colors duration-300">Ekspor ke PDF</button>
        `;
    document.getElementById('exportCsvBtn').addEventListener('click', exportToCSV);
    document.getElementById('exportPdfBtn').addEventListener('click', exportToPDF);
  }

  function exportToCSV() {
    if (amortizationData.length === 0) return;
    let csvContent = 'data:text/csv;charset=utf-8,';
    csvContent += 'Bulan Ke,Pokok,Bunga,Total Angsuran,Sisa Utang\n';
    amortizationData.forEach((row) => {
      csvContent += `${row.bulan},${Math.round(row.pokok)},${Math.round(row.bunga)},${Math.round(row.total)},${Math.round(row.sisa)}\n`;
    });
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'jadwal_angsuran_gajadingontrak.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  function exportToPDF() {
    if (amortizationData.length === 0) return;
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const tableColumn = ['Bulan Ke-', 'Pokok', 'Bunga', 'Total Angsuran', 'Sisa Utang'];
    const tableRows = amortizationData.map((item) => [item.bulan, formatToRupiah(item.pokok), formatToRupiah(item.bunga), formatToRupiah(item.total), formatToRupiah(item.sisa)]);
    doc.autoTable(tableColumn, tableRows, { startY: 20 });
    doc.text('Jadwal Angsuran - GajadiNgontrak', 14, 15);
    doc.save('jadwal_angsuran_gajadingontrak.pdf');
  }

  function syncSliderAndInput(slider, input) {
    slider.addEventListener('input', () => {
      input.value = slider.value;
      calculateAndDisplaySummary();
    });
    input.addEventListener('input', () => {
      slider.value = input.value;
      calculateAndDisplaySummary();
    });
  }
  syncSliderAndInput(elements.sukuBungaFixSlider, elements.sukuBungaFix);
  syncSliderAndInput(elements.masaKreditFixSlider, elements.masaKreditFix);
  syncSliderAndInput(elements.jangkaWaktuSlider, elements.jangkaWaktu);

  function updateDP(source) {
    if (isUpdatingDP) return;
    isUpdatingDP = true;
    const harga = parseRupiah(elements.hargaProperti.value);
    if (harga === 0) {
      isUpdatingDP = false;
      return;
    }
    if (source === 'persen') {
      const persen = parseFloat(elements.uangMukaPersen.value) || 0;
      const rupiah = (persen / 100) * harga;
      elements.uangMukaRupiah.value = formatToRupiah(rupiah);
      elements.uangMukaSlider.value = persen;
    } else if (source === 'rupiah') {
      const rupiah = parseRupiah(elements.uangMukaRupiah.value);
      const persen = (rupiah / harga) * 100;
      elements.uangMukaPersen.value = persen.toFixed(2);
      elements.uangMukaSlider.value = persen;
    } else if (source === 'slider') {
      const persen = parseFloat(elements.uangMukaSlider.value) || 0;
      const rupiah = (persen / 100) * harga;
      elements.uangMukaPersen.value = persen;
      elements.uangMukaRupiah.value = formatToRupiah(rupiah);
    }
    isUpdatingDP = false;
    calculateAndDisplaySummary();
  }

  function generateBerjenjangInputs() {
    const count = parseInt(elements.masaKreditBerjenjang.value) || 0;
    elements.berjenjangBungaInputs.innerHTML = '';
    for (let i = 1; i <= count; i++) {
      const div = document.createElement('div');
      div.className = 'space-y-2';
      div.innerHTML = `<label class="text-sm font-medium text-slate-400">Bunga Tahun ke-${i} (%)</label><input type="number" class="w-full bg-slate-800/50 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 outline-none transition-colors bunga-berjenjang-input" value="7" step="0.1" min="1" max="25">`;
      elements.berjenjangBungaInputs.appendChild(div);
    }
    document.querySelectorAll('.bunga-berjenjang-input').forEach((input) => {
      input.addEventListener('input', calculateAndDisplaySummary);
    });
  }

  function fillFormWithPreset(presetName) {
    const data = presets[presetName];
    elements.jenisProgram.value = data.jenisProgram;
    toggleProgramFields();
    if (data.jenisProgram === 'fixFloating') {
      elements.sukuBungaFix.value = data.sukuBungaFix;
      elements.sukuBungaFixSlider.value = data.sukuBungaFix;
      elements.masaKreditFix.value = data.masaKreditFix;
      elements.masaKreditFixSlider.value = data.masaKreditFix;
    } else if (data.jenisProgram === 'berjenjang') {
      elements.masaKreditBerjenjang.value = data.masaKreditBerjenjang;
      generateBerjenjangInputs();
      const bungaInputs = document.querySelectorAll('.bunga-berjenjang-input');
      bungaInputs.forEach((input, index) => {
        input.value = data.bungaBerjenjang[index] || 7;
      });
    }
    elements.jangkaWaktu.value = data.jangkaWaktu;
    elements.jangkaWaktuSlider.value = data.jangkaWaktu;
  }

  function toggleProgramFields() {
    if (elements.jenisProgram.value === 'fixFloating') {
      elements.fixFloatingFields.classList.remove('hidden');
      elements.stepBerjenjangFields.classList.add('hidden');
    } else {
      elements.stepBerjenjangFields.classList.remove('hidden');
      elements.fixFloatingFields.classList.add('hidden');
    }
  }

  function handlePilihanBungaChange() {
    const pilihan = elements.pilihanBunga.value;
    const presetInfoEl = elements.presetInfo;
    if (pilihan === 'custom') {
      elements.customFields.classList.remove('hidden');
      presetInfoEl.innerHTML = '';
      presetInfoEl.classList.add('hidden');
    } else {
      elements.customFields.classList.add('hidden');
      const data = presets[pilihan];
      let infoHTML = `
                <div class="bg-slate-800/50 p-4 rounded-lg text-sm border border-cyan-500/30">
                    <p class="font-bold text-white mb-2">${data.name}</p>
                    <ul class="list-disc list-inside text-slate-400 space-y-1">
            `;
      if (data.jenisProgram === 'fixFloating') {
        infoHTML += `<li>Bunga ${data.sukuBungaFix}% fix selama ${data.masaKreditFix} tahun</li>`;
      } else {
        infoHTML += `<li>Bunga berjenjang selama ${data.masaKreditBerjenjang} tahun</li>`;
      }
      infoHTML += `<li>Jangka waktu total ${data.jangkaWaktu} tahun</li></ul></div>`;
      presetInfoEl.innerHTML = infoHTML;
      presetInfoEl.classList.remove('hidden');
      fillFormWithPreset(pilihan);
    }
    calculateAndDisplaySummary();
  }

  // --- EVENT LISTENERS ---
  elements.hargaProperti.addEventListener('input', () => updateDP('persen'));
  elements.uangMukaPersen.addEventListener('input', () => updateDP('persen'));
  elements.uangMukaRupiah.addEventListener('input', () => updateDP('rupiah'));
  elements.uangMukaSlider.addEventListener('input', () => updateDP('slider'));
  elements.pilihanBunga.addEventListener('change', handlePilihanBungaChange);
  elements.jenisProgram.addEventListener('change', () => {
    toggleProgramFields();
    calculateAndDisplaySummary();
  });
  elements.masaKreditBerjenjang.addEventListener('input', generateBerjenjangInputs);
  elements.showTableBtn.addEventListener('click', handleShowTableClick);

  // --- INISIALISASI HALAMAN ---
  function initialize() {
    toggleProgramFields();
    generateBerjenjangInputs();
    updateDP('persen'); // Panggil ini untuk kalkulasi pertama kali
  }

  initialize();
});
