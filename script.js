// Menunggu semua elemen HTML dimuat sebelum menjalankan JavaScript
document.addEventListener('DOMContentLoaded', function () {
  // --- PEMILIHAN ELEMEN-ELEMEN HTML ---
  const jenisProgramSelect = document.getElementById('jenisProgram');
  const fixFloatingFields = document.getElementById('fixFloatingFields');
  const stepBerjenjangFields = document.getElementById('stepBerjenjangFields');
  const uangMukaSlider = document.getElementById('uangMuka');
  const uangMukaValue = document.getElementById('uangMukaValue');
  const hargaPropertiInput = document.getElementById('hargaProperti');
  const hitungBtn = document.getElementById('hitungBtn');
  const resultsContainer = document.getElementById('results');

  // --- KONTEN PLACEHOLDER AWAL ---
  const placeholderHTML = `
        <div class="placeholder">
            <h2>Hasil Simulasi Anda</h2>
            <p>Masukkan detail pinjaman di panel kiri dan klik hitung untuk melihat hasilnya di sini.</p>
            <span>✨</span>
        </div>
    `;
  // Tampilkan placeholder saat halaman dimuat
  resultsContainer.innerHTML = placeholderHTML;

  // --- EVENT LISTENERS UNTUK UI INTERAKTIF ---

  // Mengganti field yang tampil sesuai jenis program
  jenisProgramSelect.addEventListener('change', function () {
    if (this.value === 'fixFloating') {
      fixFloatingFields.classList.remove('hidden');
      stepBerjenjangFields.classList.add('hidden');
    } else {
      fixFloatingFields.classList.add('hidden');
      stepBerjenjangFields.classList.remove('hidden');
    }
  });

  // Update persen DP saat slider digeser
  uangMukaSlider.addEventListener('input', function () {
    uangMukaValue.textContent = this.value + '%';
  });

  // Format input harga properti dengan titik ribuan
  hargaPropertiInput.addEventListener('keyup', function (e) {
    let value = this.value.replace(/[^,\d]/g, '').toString();
    let split = value.split(',');
    let sisa = split[0].length % 3;
    let rupiah = split[0].substr(0, sisa);
    let ribuan = split[0].substr(sisa).match(/\d{3}/gi);

    if (ribuan) {
      let separator = sisa ? '.' : '';
      rupiah += separator + ribuan.join('.');
    }
    this.value = rupiah;
  });

  // Menjalankan kalkulasi ketika tombol hitung diklik
  hitungBtn.addEventListener('click', calculateKPR);

  // --- FUNGSI-FUNGSI PERHITUNGAN INTI ---

  function formatRupiah(angka) {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(angka);
  }

  function hitungAngsuran(pokok, bungaBulanan, tenorBulan) {
    if (bungaBulanan <= 0) return pokok / tenorBulan;
    const numerator = pokok * bungaBulanan * Math.pow(1 + bungaBulanan, tenorBulan);
    const denominator = Math.pow(1 + bungaBulanan, tenorBulan) - 1;
    return numerator / denominator;
  }

  function hitungSisaPokok(pokokAwal, angsuran, bungaBulanan, jumlahPembayaran) {
    if (bungaBulanan <= 0) return pokokAwal - angsuran * jumlahPembayaran;
    const term1 = pokokAwal * Math.pow(1 + bungaBulanan, jumlahPembayaran);
    const term2 = angsuran * ((Math.pow(1 + bungaBulanan, jumlahPembayaran) - 1) / bungaBulanan);
    return term1 - term2;
  }

  // --- FUNGSI UTAMA KALKULASI ---

  function calculateKPR() {
    // (Logika perhitungan sama persis seperti sebelumnya, tidak ada perubahan)
    // 1. Ambil semua nilai dari input
    const hargaProperti = parseFloat(document.getElementById('hargaProperti').value.replace(/\./g, ''));
    const persenDP = parseFloat(document.getElementById('uangMuka').value);
    const jenisProgram = document.getElementById('jenisProgram').value;
    const jangkaWaktuTahun = parseInt(document.getElementById('jangkaWaktu').value);
    const asumsiBungaFloating = parseFloat(document.getElementById('asumsiBungaFloating').value);

    // 2. Lakukan perhitungan awal
    const nilaiDP = hargaProperti * (persenDP / 100);
    const plafondPinjaman = hargaProperti - nilaiDP;
    const totalTenorBulan = jangkaWaktuTahun * 12;

    let resultsHTML = `
            <div class="result-item">
                <h3>Ringkasan Pinjaman</h3>
                <p>Harga Properti: <span>${formatRupiah(hargaProperti)}</span></p>
                <p>Uang Muka (${persenDP}%): <span>${formatRupiah(nilaiDP)}</span></p>
                <p>Pokok Pinjaman (Plafond): <span>${formatRupiah(plafondPinjaman)}</span></p>
            </div>
        `;

    // 3. Masuk ke logika percabangan sesuai jenis program
    if (jenisProgram === 'fixFloating') {
      const sukuBungaFix = parseFloat(document.getElementById('sukuBungaFix').value);
      const masaFixTahun = parseInt(document.getElementById('masaKreditFix').value);
      const masaFixBulan = masaFixTahun * 12;

      const bungaFixBulanan = sukuBungaFix / 100 / 12;
      const bungaFloatingBulanan = asumsiBungaFloating / 100 / 12;

      const angsuranFix = hitungAngsuran(plafondPinjaman, bungaFixBulanan, totalTenorBulan);
      const sisaPokok = hitungSisaPokok(plafondPinjaman, angsuranFix, bungaFixBulanan, masaFixBulan);
      const angsuranFloating = hitungAngsuran(sisaPokok, bungaFloatingBulanan, totalTenorBulan - masaFixBulan);

      resultsHTML += `
                <div class="result-item">
                    <h3>Simulasi Fix & Floating</h3>
                    <p>Angsuran Tahun 1 - ${masaFixTahun} (Bunga ${sukuBungaFix}%): <span>${formatRupiah(angsuranFix)} / bulan</span></p>
                    <p>Angsuran Selanjutnya (Asumsi Bunga ${asumsiBungaFloating}%): <span>${formatRupiah(angsuranFloating)} / bulan</span></p>
                </div>
            `;
    } else if (jenisProgram === 'berjenjang') {
      const bungaT1 = parseFloat(document.getElementById('bungaTahun1').value);
      const bungaT2 = parseFloat(document.getElementById('bungaTahun2').value);
      const bungaT3 = parseFloat(document.getElementById('bungaTahun3').value);

      const b1 = bungaT1 / 100 / 12;
      const b2 = bungaT2 / 100 / 12;
      const b3 = bungaT3 / 100 / 12;
      const bFloat = asumsiBungaFloating / 100 / 12;

      const angsuran1 = hitungAngsuran(plafondPinjaman, b1, totalTenorBulan);
      const sisaPokok1 = hitungSisaPokok(plafondPinjaman, angsuran1, b1, 12);

      const angsuran2 = hitungAngsuran(sisaPokok1, b2, totalTenorBulan - 12);
      const sisaPokok2 = hitungSisaPokok(sisaPokok1, angsuran2, b2, 12);

      const angsuran3 = hitungAngsuran(sisaPokok2, b3, totalTenorBulan - 24);
      const sisaPokok3 = hitungSisaPokok(sisaPokok2, angsuran3, b3, 12);

      const angsuranFloating = hitungAngsuran(sisaPokok3, bFloat, totalTenorBulan - 36);

      resultsHTML += `
                <div class="result-item">
                    <h3>Simulasi Step Up Berjenjang</h3>
                    <p>Angsuran Tahun ke-1 (Bunga ${bungaT1}%): <span>${formatRupiah(angsuran1)} / bulan</span></p>
                    <p>Angsuran Tahun ke-2 (Bunga ${bungaT2}%): <span>${formatRupiah(angsuran2)} / bulan</span></p>
                    <p>Angsuran Tahun ke-3 (Bunga ${bungaT3}%): <span>${formatRupiah(angsuran3)} / bulan</span></p>
                    <p>Angsuran Selanjutnya (Asumsi Bunga ${asumsiBungaFloating}%): <span>${formatRupiah(angsuranFloating)} / bulan</span></p>
                </div>
            `;
    }

    // 4. Tampilkan hasilnya di halaman
    resultsContainer.innerHTML = resultsHTML;
  }
});
