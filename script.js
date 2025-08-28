document.addEventListener('DOMContentLoaded', function () {
  // --- DATA DUMMY UNTUK PRESET ---
  const presets = {
    rekomendasi: {
      jenisProgram: 'fixFloating',
      sukuBungaFix: 7.5,
      masaKreditFix: 3,
      jangkaWaktu: 20,
    },
    bungaTerendah: {
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
  };

  // --- STATE MANAGEMENT ---
  let isUpdatingDP = false; // Flag untuk mencegah infinite loop di input DP

  // --- FUNGSI FORMAT ANGKA ---
  const formatToRupiah = (angka) => new Intl.NumberFormat('id-ID').format(angka);
  const parseRupiah = (text) => parseFloat(text.replace(/[^0-9]/g, '')) || 0;

  // --- FUNGSI UTAMA KALKULASI KPR ---
  function calculateAndDisplay() {
    // (Fungsi ini akan berisi logika kalkulasi utama dan menampilkan hasil)
    // ... (akan kita isi di bawah) ...
  }

  // --- FUNGSI UNTUK MENSINKRONKAN INPUT & SLIDER ---
  function syncSliderAndInput(slider, input) {
    slider.addEventListener('input', () => {
      input.value = slider.value;
      calculateAndDisplay();
    });
    input.addEventListener('input', () => {
      slider.value = input.value;
      calculateAndDisplay();
    });
  }

  syncSliderAndInput(elements.sukuBungaFixSlider, elements.sukuBungaFix);
  syncSliderAndInput(elements.masaKreditFixSlider, elements.masaKreditFix);
  syncSliderAndInput(elements.jangkaWaktuSlider, elements.jangkaWaktu);

  // --- LOGIKA DUAL INPUT UANG MUKA ---
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
    calculateAndDisplay();
  }

  // --- LOGIKA DINAMIS INPUT BUNGA BERJENJANG ---
  function generateBerjenjangInputs() {
    const count = parseInt(elements.masaKreditBerjenjang.value) || 0;
    elements.berjenjangBungaInputs.innerHTML = ''; // Kosongkan dulu
    for (let i = 1; i <= count; i++) {
      const div = document.createElement('div');
      div.className = 'form-group';
      div.innerHTML = `
                <label>Bunga Tahun ke-${i} (%)</label>
                <input type="number" class="bunga-berjenjang-input" value="7" step="0.1" min="1" max="25">
            `;
      elements.berjenjangBungaInputs.appendChild(div);
    }
    // Tambahkan event listener ke input yang baru dibuat
    document.querySelectorAll('.bunga-berjenjang-input').forEach((input) => {
      input.addEventListener('input', calculateAndDisplay);
    });
    calculateAndDisplay();
  }

  // --- LOGIKA UNTUK MENGISI FORM DARI PRESET ---
  function fillFormWithPreset(presetName) {
    const data = presets[presetName];
    elements.jenisProgram.value = data.jenisProgram;
    toggleProgramFields(); // Update tampilan field

    if (data.jenisProgram === 'fixFloating') {
      elements.sukuBungaFix.value = data.sukuBungaFix;
      elements.sukuBungaFixSlider.value = data.sukuBungaFix;
      elements.masaKreditFix.value = data.masaKreditFix;
      elements.masaKreditFixSlider.value = data.masaKreditFix;
    } else if (data.jenisProgram === 'berjenjang') {
      elements.masaKreditBerjenjang.value = data.masaKreditBerjenjang;
      generateBerjenjangInputs(); // Generate dulu fieldnya
      const bungaInputs = document.querySelectorAll('.bunga-berjenjang-input');
      bungaInputs.forEach((input, index) => {
        input.value = data.bungaBerjenjang[index] || 7;
      });
    }
    elements.jangkaWaktu.value = data.jangkaWaktu;
    elements.jangkaWaktuSlider.value = data.jangkaWaktu;
  }

  // --- FUNGSI UNTUK MENAMPILKAN/SEMBUNYIKAN FIELDS ---
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
    if (pilihan === 'custom') {
      elements.customFields.classList.remove('hidden');
    } else {
      elements.customFields.classList.add('hidden');
      fillFormWithPreset(pilihan);
    }
    calculateAndDisplay();
  }

  // --- EVENT LISTENERS UTAMA ---
  elements.hargaProperti.addEventListener('input', () => updateDP('persen'));
  elements.uangMukaPersen.addEventListener('input', () => updateDP('persen'));
  elements.uangMukaRupiah.addEventListener('input', () => updateDP('rupiah'));
  elements.uangMukaSlider.addEventListener('input', () => updateDP('slider'));
  elements.pilihanBunga.addEventListener('change', handlePilihanBungaChange);
  elements.jenisProgram.addEventListener('change', () => {
    toggleProgramFields();
    calculateAndDisplay();
  });
  elements.masaKreditBerjenjang.addEventListener('input', generateBerjenjangInputs);

  // --- INISIALISASI HALAMAN ---
  function initialize() {
    // Placeholder awal
    elements.resultsContainer.innerHTML = `
            <div class="placeholder">
                <h2>Hasil Simulasi Anda</h2>
                <p>Ubah nilai di panel kiri untuk melihat simulasi secara real-time.</p>
                <span>✨</span>
            </div>
        `;
    toggleProgramFields();
    generateBerjenjangInputs();
    // Panggil kalkulasi pertama kali
    updateDP('persen');
  }

  // --- FUNGSI KALKULASI INTI (DI-REFACTOR) ---
  const hitungAngsuran = (p, r, n) => {
    if (r <= 0) return p / n;
    const num = p * r * Math.pow(1 + r, n);
    const den = Math.pow(1 + r, n) - 1;
    return num / den;
  };
  const hitungSisaPokok = (p, a, r, n) => {
    if (r <= 0) return p - a * n;
    const t1 = p * Math.pow(1 + r, n);
    const t2 = a * ((Math.pow(1 + r, n) - 1) / r);
    return t1 - t2;
  };

  // --- FUNGSI UTAMA YANG DIPANGGIL SETIAP ADA PERUBAHAN ---
  calculateAndDisplay = function () {
    const harga = parseRupiah(elements.hargaProperti.value);
    const dp = parseRupiah(elements.uangMukaRupiah.value);
    const plafond = harga - dp;

    if (plafond <= 0) {
      elements.resultsContainer.innerHTML = `<div class="placeholder"><h2>Plafond Pinjaman Rp 0</h2><p>Naikkan harga properti atau turunkan uang muka.</p></div>`;
      return;
    }

    const pilihan = elements.pilihanBunga.value;
    let jangkaWaktuTahun, jenisProgram;

    if (pilihan === 'custom') {
      jangkaWaktuTahun = parseInt(elements.jangkaWaktu.value);
      jenisProgram = elements.jenisProgram.value;
    } else {
      jangkaWaktuTahun = presets[pilihan].jangkaWaktu;
      jenisProgram = presets[pilihan].jenisProgram;
    }

    const totalTenorBulan = jangkaWaktuTahun * 12;
    let resultsHTML = `
            <div class="result-item">
                <h3>Ringkasan Pinjaman</h3>
                <p>Harga Properti: <span>${formatToRupiah(harga)}</span></p>
                <p>Uang Muka: <span>${formatToRupiah(dp)}</span></p>
                <p>Pokok Pinjaman: <span>${formatToRupiah(plafond)}</span></p>
            </div>
        `;

    if (jenisProgram === 'fixFloating') {
      const sukuBungaFix = (pilihan === 'custom' ? parseFloat(elements.sukuBungaFix.value) : presets[pilihan].sukuBungaFix) / 100 / 12;
      const masaFixTahun = pilihan === 'custom' ? parseInt(elements.masaKreditFix.value) : presets[pilihan].masaKreditFix;
      const masaFixBulan = masaFixTahun * 12;

      const angsuranFix = hitungAngsuran(plafond, sukuBungaFix, totalTenorBulan);
      resultsHTML += `
                <div class="result-item">
                    <h3>Simulasi Fix & Floating</h3>
                    <p>Angsuran ${masaFixTahun} Tahun Pertama: <span>${formatToRupiah(angsuranFix)} / bulan</span></p>
                    <p><em>Detail angsuran floating memerlukan asumsi bunga.</em></p>
                </div>
            `;
    } else if (jenisProgram === 'berjenjang') {
      resultsHTML += `<div class="result-item"><h3>Simulasi Step Up Berjenjang</h3>`;
      let sisaPokok = plafond;
      let sisaTenor = totalTenorBulan;

      const bungaInputs = document.querySelectorAll('.bunga-berjenjang-input');
      bungaInputs.forEach((input, index) => {
        const bungaTahunan = parseFloat(input.value) / 100 / 12;
        const angsuran = hitungAngsuran(sisaPokok, bungaTahunan, sisaTenor);
        resultsHTML += `<p>Angsuran Tahun ke-${index + 1}: <span>${formatToRupiah(angsuran)} / bulan</span></p>`;
        sisaPokok = hitungSisaPokok(sisaPokok, angsuran, bungaTahunan, 12);
        sisaTenor -= 12;
      });
      resultsHTML += `</div>`;
    }

    elements.resultsContainer.innerHTML = resultsHTML;
  };

  // Panggil inisialisasi untuk setup halaman
  initialize();
});
