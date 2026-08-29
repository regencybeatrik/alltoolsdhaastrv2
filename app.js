/* =========================================================
   All Tools Dhaa StR — app.js
   Role system: member < vip < owner
   Only owner (admin) can create new accounts.
   Data persisted in localStorage (single-device demo storage).
   ========================================================= */

const SESSION_KEY = "atds_session_v1";
const THEME_KEY = "atds_theme_v1";

/* ---------- Shared user database (npoint.io JSON bin) ----------
   Semua device baca & tulis ke URL yang SAMA, jadi akun yang dibuat
   owner langsung kebaca di HP siapa pun. GANTI URL di bawah dengan
   bin lo sendiri (lihat instruksi setup).
   Isi awal bin HARUS berupa array berisi 1 akun owner, contoh:
   [{"username":"owner","password":"GANTI_PASSWORD_INI","role":"owner","createdAt":0}]
------------------------------------------------------------------- */
const NPOINT_URL = "https://api.npoint.io/89c8900799caa6257c16";

async function getUsers() {
  try {
    const res = await fetch(NPOINT_URL, { cache: "no-store" });
    if (!res.ok) throw new Error("HTTP " + res.status);
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch (err) {
    console.error("Gagal ambil data user:", err);
    return null; // null artinya gagal konek, beda dari [] (kosong)
  }
}

async function saveUsers(list) {
  try {
    const res = await fetch(NPOINT_URL, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(list)
    });
    if (!res.ok) throw new Error("HTTP " + res.status);
    return true;
  } catch (err) {
    console.error("Gagal simpan data user:", err);
    return false;
  }
}

/* ---------- Tool catalog ---------- */
/* minRole: member | vip | owner  (owner tier also unlocks vip-only tools) */
const TOOLS = [
  { id: "walink", icon: "🔗", name: "WA Link Generator", desc: "Buat link wa.me instan", minRole: "member", type: "walink" },
  { id: "analyzer", icon: "📊", name: "Message Analyzer", desc: "Hitung kata, karakter, emoji", minRole: "member", type: "analyzer" },
  { id: "qr", icon: "▦", name: "QR Code Generator", desc: "Buat QR untuk link / teks", minRole: "member", type: "qr" },
  { id: "tiktokdl", icon: "🎵", name: "TikTok Downloader", desc: "Unduh video TikTok tanpa watermark", minRole: "member", type: "tiktokdl" },
  { id: "numfmt", icon: "#", name: "Number Formatter", desc: "Format nomor ke +62", minRole: "member", type: "numfmt" },
  { id: "security", icon: "🛡️", name: "Security Checklist", desc: "Skor keamanan akun", minRole: "member", type: "security" },
  { id: "bulk", icon: "📚", name: "Bulk WA Link", desc: "Generate banyak link sekaligus", minRole: "vip", type: "bulk" },
  { id: "textfmt", icon: "🔤", name: "Text Formatter", desc: "Bold, Italic, Strikethrough, Monospace", minRole: "vip", type: "textfmt" },
  { id: "vcard", icon: "👤", name: "vCard Generator", desc: "Buat file kontak .vcf", minRole: "vip", type: "vcard" },
  { id: "reminder", icon: "⏰", name: "Penjadwal Pengingat", desc: "Pengingat kirim pesan", minRole: "vip", type: "soon" },
  { id: "catalog", icon: "🗂️", name: "Katalog Produk", desc: "Link katalog WA Business", minRole: "vip", type: "soon" },
  { id: "polling", icon: "📈", name: "Polling/Voting", desc: "Buat polling teks", minRole: "member", type: "polling" },
  { id: "grouplink", icon: "👥", name: "Manajer Link Grup", desc: "Simpan link grup + QR", minRole: "vip", type: "grouplink" },
  { id: "autoreply", icon: "↩️", name: "Auto-Reply", desc: "Pesan sibuk/otomatis", minRole: "vip", type: "soon" },
  { id: "privacy", icon: "🔒", name: "Checklist Privasi", desc: "Keamanan & privasi akun", minRole: "member", type: "security" },
  { id: "backup", icon: "🗄️", name: "Backup Chat", desc: "Kalkulator & panduan", minRole: "owner", type: "soon" },
  { id: "passgen", icon: "🔑", name: "Password Generator", desc: "Buat password acak kuat", minRole: "member", type: "passgen" },
  { id: "base64", icon: "🧩", name: "Base64 Encode/Decode", desc: "Encode & decode teks base64", minRole: "member", type: "base64" },
  { id: "caseconv", icon: "🔠", name: "Case Converter", desc: "UPPER, lower, Title, Sentence", minRole: "member", type: "caseconv" },
  { id: "jsonfmt", icon: "🧾", name: "JSON Formatter", desc: "Rapikan & validasi JSON", minRole: "vip", type: "jsonfmt" },
  { id: "color", icon: "🎨", name: "Color Converter", desc: "HEX ⇄ RGB ⇄ HSL", minRole: "member", type: "color" },
  { id: "bmi", icon: "⚖️", name: "Kalkulator BMI", desc: "Hitung indeks massa tubuh", minRole: "member", type: "bmi" },
  { id: "lorem", icon: "📄", name: "Lorem Ipsum Generator", desc: "Teks placeholder instan", minRole: "member", type: "lorem" },
  { id: "agecalc", icon: "🎂", name: "Kalkulator Umur", desc: "Hitung umur dari tanggal lahir", minRole: "member", type: "agecalc" },
  { id: "unitconv", icon: "📏", name: "Konversi Satuan", desc: "Panjang, berat, suhu", minRole: "member", type: "unitconv" },
  { id: "hashgen", icon: "🔐", name: "Hash Generator", desc: "Buat checksum dari teks", minRole: "vip", type: "hashgen" },
  { id: "slug", icon: "🔗", name: "Slug Generator", desc: "Ubah teks jadi URL slug", minRole: "member", type: "slug" },
  { id: "randnum", icon: "🎲", name: "Random Generator", desc: "Angka & string acak", minRole: "member", type: "randnum" },
  { id: "notes", icon: "📝", name: "Catatan Cepat", desc: "Simpan catatan pribadi", minRole: "vip", type: "notes" },
  { id: "discount", icon: "🏷️", name: "Kalkulator Diskon", desc: "Hitung harga setelah diskon", minRole: "member", type: "discount" },
  { id: "countdown", icon: "📅", name: "Countdown Tanggal", desc: "Hitung selisih ke tanggal target", minRole: "vip", type: "countdown" },
];

const ROLE_RANK = { member: 1, vip: 2, owner: 3 };

/* ---------- Session ---------- */
function getSession() {
  return JSON.parse(sessionStorage.getItem(SESSION_KEY) || "null");
}
function setSession(user) {
  sessionStorage.setItem(SESSION_KEY, JSON.stringify({ username: user.username, role: user.role }));
}
function clearSession() {
  sessionStorage.removeItem(SESSION_KEY);
}

/* ---------- UI namespace ---------- */
const AppUI = {
  finishSplash() { goTo(getSession() ? "app" : "login"); }
};

function goTo(screen) {
  document.getElementById("splash").classList.add("hidden");
  document.getElementById("login").classList.add("hidden");
  document.getElementById("app").classList.add("hidden");
  if (screen === "login") document.getElementById("login").classList.remove("hidden");
  if (screen === "app") { document.getElementById("app").classList.remove("hidden"); renderApp(); }
}

/* Splash auto-advances after a longer duration; user can tap "Lewati" to skip anytime */
setTimeout(() => {
  if (!document.getElementById("splash").classList.contains("hidden")) {
    AppUI.finishSplash();
  }
}, 7000);

/* ---------- Login ---------- */
document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const u = document.getElementById("loginUsername").value.trim();
  const p = document.getElementById("loginPassword").value;
  const errEl = document.getElementById("loginError");
  const submitBtn = e.target.querySelector('button[type="submit"]');

  errEl.classList.add("hidden");
  if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = "Memuat..."; }

  const users = await getUsers();

  if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = "Masuk"; }

  if (users === null) {
    errEl.textContent = "Gagal terhubung ke server. Cek koneksi internet lalu coba lagi.";
    errEl.classList.remove("hidden");
    return;
  }

  const found = users.find(x => x.username === u && x.password === p);
  if (found) {
    errEl.classList.add("hidden");
    setSession(found);
    document.getElementById("loginForm").reset();
    goTo("app");
  } else {
    errEl.textContent = "Username atau password salah.";
    errEl.classList.remove("hidden");
  }
});

document.getElementById("logoutBtn").addEventListener("click", () => {
  clearSession();
  goTo("login");
});

/* ---------- Buy Access contact links ---------- */
const CONTACT_PHONE = "6283169793537";
const CONTACT_TELE_USERNAME = "Dha077";
document.getElementById("buyAccessWa").addEventListener("click", (e) => {
  e.preventDefault();
  const msg = encodeURIComponent("Halo, saya mau buy akses All Tools Dhaa StR.");
  window.open(`https://wa.me/${CONTACT_PHONE}?text=${msg}`, "_blank");
});
document.getElementById("buyAccessTele").addEventListener("click", (e) => {
  e.preventDefault();
  window.open(`https://t.me/${CONTACT_TELE_USERNAME}`, "_blank");
});

/* ---------- Theme ---------- */
function applyTheme() {
  const theme = localStorage.getItem(THEME_KEY) || "light";
  document.documentElement.setAttribute("data-theme", theme);
  document.getElementById("themeBtn").textContent = theme === "dark" ? "☀️" : "🌙";
}
document.getElementById("themeBtn").addEventListener("click", () => {
  const cur = localStorage.getItem(THEME_KEY) || "light";
  localStorage.setItem(THEME_KEY, cur === "light" ? "dark" : "light");
  applyTheme();
});

/* ---------- Search ---------- */
document.getElementById("searchBtn").addEventListener("click", () => {
  document.getElementById("searchBar").classList.toggle("hidden");
  document.getElementById("searchInput").focus();
});
document.getElementById("searchInput").addEventListener("input", (e) => {
  renderTools(e.target.value.toLowerCase());
});
document.getElementById("settingsBtn").addEventListener("click", () => {
  openModal(`<h3>Pengaturan</h3>
    <p class="muted small">Mode tema, notifikasi, dan preferensi lain akan hadir di versi berikutnya.</p>`);
});

/* ---------- Bottom nav (visual only for Activity/More) ---------- */
document.querySelectorAll(".nav-item").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".nav-item").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    const nav = btn.dataset.nav;
    if (nav === "activity") {
      openModal(`<h3>Activity</h3><p class="muted small">Riwayat penggunaan tools akan tampil di sini.</p>`);
    } else if (nav === "more") {
      openModal(`<h3>More</h3><p class="muted small">Bantuan, tentang aplikasi, dan pengaturan lanjutan.</p>`);
    } else if (nav === "tools") {
      document.getElementById("toolsGrid").scrollIntoView({ behavior: "smooth" });
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  });
});

/* ---------- Render app (after login) ---------- */
async function renderApp() {
  const session = getSession();
  if (!session) { goTo("login"); return; }

  document.getElementById("userNameLabel").textContent = session.username;
  const badge = document.getElementById("roleBadge");
  badge.textContent = session.role;
  badge.className = "role-badge " + (session.role === "owner" ? "owner" : session.role === "vip" ? "vip" : "");

  document.getElementById("adminSection").classList.toggle("hidden", session.role !== "owner");
  if (session.role === "owner") await renderUserList();

  renderTools("");
}

/* ---------- Tools grid ---------- */
function renderTools(filter) {
  const session = getSession();
  if (!session) return;
  const myRank = ROLE_RANK[session.role];
  const grid = document.getElementById("toolsGrid");
  grid.innerHTML = "";

  TOOLS
    .filter(t => t.name.toLowerCase().includes(filter))
    .forEach(tool => {
      const locked = ROLE_RANK[tool.minRole] > myRank;
      const card = document.createElement("button");
      card.className = "tool-card";
      card.innerHTML = `
        ${locked ? `<span class="tool-lock">🔒 ${tool.minRole.toUpperCase()}</span>` : ""}
        <div class="tool-icon">${tool.icon}</div>
        <h4>${tool.name}</h4>
        <p>${tool.desc}</p>`;
      card.addEventListener("click", () => {
        if (locked) {
          openModal(`<h3>Fitur ${escapeHtml(tool.name)}</h3>
            <p class="muted small">Fitur ini butuh minimal role <strong>${tool.minRole.toUpperCase()}</strong>. Hubungi Owner untuk upgrade akun kamu.</p>`);
        } else {
          openTool(tool);
        }
      });
      grid.appendChild(card);
    });
}

/* ---------- Modal helpers ---------- */
function openModal(html) {
  document.getElementById("modalContent").innerHTML = html;
  document.getElementById("toolModal").classList.remove("hidden");
}
document.getElementById("modalClose").addEventListener("click", closeModal);
document.getElementById("toolModal").addEventListener("click", (e) => {
  if (e.target.id === "toolModal") closeModal();
});
function closeModal() { document.getElementById("toolModal").classList.add("hidden"); }

/* ---------- Tool implementations ---------- */
function openTool(tool) {
  switch (tool.type) {
    case "walink": return toolWaLink();
    case "numfmt": return toolNumFmt();
    case "analyzer": return toolAnalyzer();
    case "textfmt": return toolTextFmt();
    case "qr": return toolQr();
    case "tiktokdl": return toolTiktokDl();
    case "security": return toolSecurity();
    case "vcard": return toolVcard();
    case "bulk": return toolBulk();
    case "polling": return toolPolling();
    case "grouplink": return toolGroupLink();
    case "passgen": return toolPassGen();
    case "base64": return toolBase64();
    case "caseconv": return toolCaseConv();
    case "jsonfmt": return toolJsonFmt();
    case "color": return toolColor();
    case "bmi": return toolBmi();
    case "lorem": return toolLorem();
    case "agecalc": return toolAgeCalc();
    case "unitconv": return toolUnitConv();
    case "hashgen": return toolHashGen();
    case "slug": return toolSlug();
    case "randnum": return toolRandNum();
    case "notes": return toolNotes();
    case "discount": return toolDiscount();
    case "countdown": return toolCountdown();
    default:
      openModal(`<h3>${escapeHtml(tool.name)}</h3><p class="muted small">Fitur ini akan segera hadir. 🚧</p>`);
  }
}

function escapeHtml(s){return s.replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}

function normalizePhone(raw) {
  let n = raw.replace(/[^\d]/g, "");
  if (n.startsWith("0")) n = "62" + n.slice(1);
  if (n.startsWith("620")) n = "62" + n.slice(3);
  if (!n.startsWith("62")) n = "62" + n;
  return n;
}

function toolWaLink() {
  openModal(`
    <h3>WA Link Generator</h3>
    <input id="wlPhone" placeholder="Nomor HP (mis. 08123456789)">
    <textarea id="wlMsg" rows="3" placeholder="Pesan (opsional)"></textarea>
    <button class="btn-primary" id="wlGen">Buat Link</button>
    <div id="wlOut"></div>
  `);
  document.getElementById("wlGen").addEventListener("click", () => {
    const phone = normalizePhone(document.getElementById("wlPhone").value || "");
    const msg = encodeURIComponent(document.getElementById("wlMsg").value || "");
    const link = `https://wa.me/${phone}${msg ? "?text=" + msg : ""}`;
    document.getElementById("wlOut").innerHTML = `
      <div class="modal-result">${link}</div>
      <button class="copy-btn" onclick="navigator.clipboard.writeText('${link}')">Salin Link</button>`;
  });
}

function toolNumFmt() {
  openModal(`
    <h3>Number Formatter</h3>
    <input id="nfInput" placeholder="Contoh: 081234567890">
    <button class="btn-primary" id="nfGen">Format ke +62</button>
    <div id="nfOut"></div>
  `);
  document.getElementById("nfGen").addEventListener("click", () => {
    const val = document.getElementById("nfInput").value || "";
    const formatted = "+" + normalizePhone(val);
    document.getElementById("nfOut").innerHTML = `<div class="modal-result">${formatted}</div>`;
  });
}

function toolAnalyzer() {
  openModal(`
    <h3>Message Analyzer</h3>
    <textarea id="anText" rows="5" placeholder="Tempel pesan di sini..."></textarea>
    <button class="btn-primary" id="anGen">Analisis</button>
    <div id="anOut"></div>
  `);
  document.getElementById("anGen").addEventListener("click", () => {
    const text = document.getElementById("anText").value || "";
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    const chars = text.length;
    const emojiMatches = text.match(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu) || [];
    document.getElementById("anOut").innerHTML = `
      <div class="modal-result">
        Kata: <strong>${words}</strong><br>
        Karakter: <strong>${chars}</strong><br>
        Emoji: <strong>${emojiMatches.length}</strong>
      </div>`;
  });
}

function toolTextFmt() {
  openModal(`
    <h3>Text Formatter (WhatsApp)</h3>
    <textarea id="tfText" rows="3" placeholder="Tulis teks di sini..."></textarea>
    <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:10px;">
      <button class="copy-btn" id="tfBold">Bold</button>
      <button class="copy-btn" id="tfItalic">Italic</button>
      <button class="copy-btn" id="tfStrike">Strikethrough</button>
      <button class="copy-btn" id="tfMono">Monospace</button>
    </div>
    <div id="tfOut"></div>
  `);
  const wrap = (symbol) => {
    const t = document.getElementById("tfText").value || "";
    const out = `${symbol}${t}${symbol}`;
    document.getElementById("tfOut").innerHTML = `
      <div class="modal-result">${escapeHtml(out)}</div>
      <button class="copy-btn" onclick="navigator.clipboard.writeText(${JSON.stringify(out)})">Salin</button>`;
  };
  document.getElementById("tfBold").addEventListener("click", () => wrap("*"));
  document.getElementById("tfItalic").addEventListener("click", () => wrap("_"));
  document.getElementById("tfStrike").addEventListener("click", () => wrap("~"));
  document.getElementById("tfMono").addEventListener("click", () => wrap("```"));
}

function toolQr() {
  openModal(`
    <h3>QR Code Generator</h3>
    <input id="qrText" placeholder="Link atau teks">
    <button class="btn-primary" id="qrGen">Buat QR</button>
    <div id="qrOut" style="text-align:center;margin-top:12px;"></div>
    <p class="muted small">QR dibuat lewat layanan publik api.qrserver.com.</p>
  `);
  document.getElementById("qrGen").addEventListener("click", () => {
    const text = encodeURIComponent(document.getElementById("qrText").value || "");
    document.getElementById("qrOut").innerHTML = text
      ? `<img src="https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${text}" alt="QR" style="border-radius:12px;">`
      : "";
  });
}

/* ---------- TikTok Downloader ---------- */
async function forceDownload(url, filename, btn) {
  const originalText = btn ? btn.textContent : "";
  try {
    if (btn) { btn.textContent = "Mengunduh..."; btn.style.pointerEvents = "none"; }
    const res = await fetch(url);
    if (!res.ok) throw new Error("HTTP " + res.status);
    const blob = await res.blob();
    const blobUrl = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = blobUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(blobUrl), 5000);
    return true;
  } catch (err) {
    console.error("Download gagal, fallback ke tab baru:", err);
    window.open(url, "_blank");
    return false;
  } finally {
    if (btn) { btn.textContent = originalText; btn.style.pointerEvents = ""; }
  }
}

function toolTiktokDl() {
  openModal(`
    <h3>TikTok Downloader</h3>
    <input id="ttUrl" placeholder="Tempel link video TikTok di sini">
    <button class="btn-primary" id="ttGen">Proses Video</button>
    <div id="ttOut"></div>
    <p class="muted small">Menggunakan layanan publik tikwm.com untuk mengambil link unduhan. Kalau tombol unduh gagal otomatis, video akan kebuka di tab baru — tahan/tap lama video lalu pilih "Simpan Video".</p>
  `);
  document.getElementById("ttGen").addEventListener("click", async () => {
    const url = (document.getElementById("ttUrl").value || "").trim();
    const out = document.getElementById("ttOut");
    if (!url) { out.innerHTML = `<p class="error-text">Masukkan link video TikTok dulu.</p>`; return; }
    out.innerHTML = `<p class="muted small">Memproses...</p>`;
    try {
      const res = await fetch(`https://www.tikwm.com/api/?url=${encodeURIComponent(url)}`);
      const json = await res.json();
      if (json.code !== 0 || !json.data) {
        out.innerHTML = `<p class="error-text">Gagal memproses link. Pastikan link valid & video bersifat publik.</p>`;
        return;
      }
      const d = json.data;
      const id = d.id || Date.now();
      const noWm = d.play ? (d.play.startsWith("http") ? d.play : "https://www.tikwm.com" + d.play) : "";
      const withWm = d.wmplay ? (d.wmplay.startsWith("http") ? d.wmplay : "https://www.tikwm.com" + d.wmplay) : "";
      const audio = d.music ? (d.music.startsWith("http") ? d.music : "https://www.tikwm.com" + d.music) : "";
      const cover = d.cover ? (d.cover.startsWith("http") ? d.cover : "https://www.tikwm.com" + d.cover) : "";
      out.innerHTML = `
        ${cover ? `<img src="${cover}" alt="cover" style="width:100%;border-radius:12px;margin-bottom:10px;">` : ""}
        <div class="modal-result">${escapeHtml(d.title || "Tanpa judul")}</div>
        <div style="display:flex;flex-direction:column;gap:8px;margin-top:10px;">
          ${noWm ? `<button class="btn-primary" id="ttDlNoWm" style="display:block;text-align:center;width:100%;">⬇️ Unduh Tanpa Watermark</button>` : ""}
          ${withWm ? `<button class="copy-btn" id="ttDlWm" style="display:block;text-align:center;width:100%;">⬇️ Unduh Dengan Watermark</button>` : ""}
          ${audio ? `<button class="copy-btn" id="ttDlAudio" style="display:block;text-align:center;width:100%;">🎵 Unduh Audio Saja</button>` : ""}
        </div>`;

      if (noWm) document.getElementById("ttDlNoWm").addEventListener("click", (e) => forceDownload(noWm, `tiktok-${id}.mp4`, e.currentTarget));
      if (withWm) document.getElementById("ttDlWm").addEventListener("click", (e) => forceDownload(withWm, `tiktok-${id}-wm.mp4`, e.currentTarget));
      if (audio) document.getElementById("ttDlAudio").addEventListener("click", (e) => forceDownload(audio, `tiktok-${id}.mp3`, e.currentTarget));
    } catch (err) {
      out.innerHTML = `<p class="error-text">Terjadi kesalahan jaringan. Coba lagi nanti.</p>`;
    }
  });
}

function toolSecurity() {
  openModal(`
    <h3>Security & Privacy Checklist</h3>
    <div id="secList" style="display:flex;flex-direction:column;gap:8px;"></div>
    <div id="secScore" class="modal-result">Skor: 0 / 5</div>
  `);
  const items = [
    "Verifikasi 2 langkah aktif",
    "Kode PIN cadangan tersimpan aman",
    "Privasi foto profil dibatasi",
    "Privasi 'Terakhir dilihat' dibatasi",
    "Tidak membagikan OTP ke siapa pun"
  ];
  const list = document.getElementById("secList");
  list.innerHTML = items.map((label, i) => `
    <label style="display:flex;gap:8px;align-items:center;font-size:13px;">
      <input type="checkbox" class="secItem" data-i="${i}"> ${label}
    </label>`).join("");
  list.querySelectorAll(".secItem").forEach(cb => {
    cb.addEventListener("change", () => {
      const checked = list.querySelectorAll(".secItem:checked").length;
      document.getElementById("secScore").textContent = `Skor: ${checked} / ${items.length}`;
    });
  });
}

function toolVcard() {
  openModal(`
    <h3>vCard Generator</h3>
    <input id="vcName" placeholder="Nama lengkap">
    <input id="vcPhone" placeholder="Nomor HP">
    <input id="vcOrg" placeholder="Perusahaan (opsional)">
    <button class="btn-primary" id="vcGen">Buat & Unduh .vcf</button>
  `);
  document.getElementById("vcGen").addEventListener("click", () => {
    const name = document.getElementById("vcName").value || "Tanpa Nama";
    const phone = normalizePhone(document.getElementById("vcPhone").value || "");
    const org = document.getElementById("vcOrg").value || "";
    const vcf = `BEGIN:VCARD\nVERSION:3.0\nFN:${name}\nTEL;TYPE=CELL:+${phone}\nORG:${org}\nEND:VCARD`;
    const blob = new Blob([vcf], { type: "text/vcard" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `${name}.vcf`; a.click();
  });
}

function toolBulk() {
  openModal(`
    <h3>Bulk WA Link</h3>
    <p class="muted small">Satu nomor per baris.</p>
    <textarea id="bkNumbers" rows="4" placeholder="0812xxxx&#10;0813xxxx&#10;0821xxxx"></textarea>
    <textarea id="bkMsg" rows="2" placeholder="Pesan (opsional)"></textarea>
    <button class="btn-primary" id="bkGen">Generate Semua Link</button>
    <div id="bkOut" style="margin-top:10px;display:flex;flex-direction:column;gap:6px;"></div>
  `);
  document.getElementById("bkGen").addEventListener("click", () => {
    const nums = (document.getElementById("bkNumbers").value || "").split("\n").map(s => s.trim()).filter(Boolean);
    const msg = encodeURIComponent(document.getElementById("bkMsg").value || "");
    const out = document.getElementById("bkOut");
    out.innerHTML = nums.map(n => {
      const link = `https://wa.me/${normalizePhone(n)}${msg ? "?text=" + msg : ""}`;
      return `<div class="modal-result" style="font-size:12px;">${link}</div>`;
    }).join("");
  });
}

function toolPolling() {
  openModal(`
    <h3>Polling / Voting (Teks)</h3>
    <input id="plQuestion" placeholder="Pertanyaan polling">
    <textarea id="plOptions" rows="3" placeholder="Satu opsi per baris"></textarea>
    <button class="btn-primary" id="plGen">Buat Teks Polling</button>
    <div id="plOut"></div>
  `);
  document.getElementById("plGen").addEventListener("click", () => {
    const q = document.getElementById("plQuestion").value || "";
    const opts = (document.getElementById("plOptions").value || "").split("\n").map(s => s.trim()).filter(Boolean);
    const emojiNum = ["1️⃣","2️⃣","3️⃣","4️⃣","5️⃣","6️⃣","7️⃣","8️⃣"];
    const text = `📊 *${q}*\n\n` + opts.map((o, i) => `${emojiNum[i] || i+1+"."} ${o}`).join("\n") + `\n\nBalas dengan angka pilihanmu!`;
    document.getElementById("plOut").innerHTML = `
      <div class="modal-result" style="white-space:pre-wrap;">${escapeHtml(text)}</div>
      <button class="copy-btn" onclick="navigator.clipboard.writeText(${JSON.stringify(text)})">Salin</button>`;
  });
}

function toolGroupLink() {
  openModal(`
    <h3>Manajer Link Grup</h3>
    <input id="glName" placeholder="Nama grup">
    <input id="glLink" placeholder="Link undangan grup (chat.whatsapp.com/...)">
    <button class="btn-primary" id="glSave">Simpan</button>
    <div id="glList" style="margin-top:12px;display:flex;flex-direction:column;gap:8px;"></div>
  `);
  const KEY = "atds_grouplinks";
  const load = () => JSON.parse(localStorage.getItem(KEY) || "[]");
  const render = () => {
    const list = load();
    document.getElementById("glList").innerHTML = list.map((g, i) => `
      <div class="modal-result" style="display:flex;justify-content:space-between;align-items:center;">
        <span><strong>${escapeHtml(g.name)}</strong><br><span class="small muted">${escapeHtml(g.link)}</span></span>
        <button class="copy-btn" onclick="navigator.clipboard.writeText('${g.link.replace(/'/g, "\\'")}')">Salin</button>
      </div>`).join("") || `<p class="muted small">Belum ada grup tersimpan.</p>`;
  };
  document.getElementById("glSave").addEventListener("click", () => {
    const name = document.getElementById("glName").value.trim();
    const link = document.getElementById("glLink").value.trim();
    if (!name || !link) return;
    const list = load();
    list.push({ name, link });
    localStorage.setItem(KEY, JSON.stringify(list));
    document.getElementById("glName").value = "";
    document.getElementById("glLink").value = "";
    render();
  });
  render();
}

/* ---------- Password Generator ---------- */
function toolPassGen() {
  openModal(`
    <h3>Password Generator</h3>
    <label class="small muted">Panjang: <span id="pgLenLabel">12</span></label>
    <input type="range" id="pgLen" min="6" max="32" value="12" style="width:100%;">
    <div style="display:flex;flex-direction:column;gap:6px;margin:10px 0;font-size:13px;">
      <label><input type="checkbox" id="pgUpper" checked> Huruf Besar (A-Z)</label>
      <label><input type="checkbox" id="pgLower" checked> Huruf Kecil (a-z)</label>
      <label><input type="checkbox" id="pgNum" checked> Angka (0-9)</label>
      <label><input type="checkbox" id="pgSym"> Simbol (!@#$%)</label>
    </div>
    <button class="btn-primary" id="pgGen">Generate Password</button>
    <div id="pgOut"></div>
  `);
  const lenInput = document.getElementById("pgLen");
  lenInput.addEventListener("input", () => {
    document.getElementById("pgLenLabel").textContent = lenInput.value;
  });
  document.getElementById("pgGen").addEventListener("click", () => {
    const len = parseInt(lenInput.value, 10);
    let chars = "";
    if (document.getElementById("pgUpper").checked) chars += "ABCDEFGHJKLMNPQRSTUVWXYZ";
    if (document.getElementById("pgLower").checked) chars += "abcdefghijkmnpqrstuvwxyz";
    if (document.getElementById("pgNum").checked) chars += "23456789";
    if (document.getElementById("pgSym").checked) chars += "!@#$%^&*-_=+";
    if (!chars) { document.getElementById("pgOut").innerHTML = `<p class="error-text">Pilih minimal 1 jenis karakter.</p>`; return; }
    let pass = "";
    const rand = new Uint32Array(len);
    crypto.getRandomValues(rand);
    for (let i = 0; i < len; i++) pass += chars[rand[i] % chars.length];
    document.getElementById("pgOut").innerHTML = `
      <div class="modal-result" style="font-family:'JetBrains Mono',monospace;">${escapeHtml(pass)}</div>
      <button class="copy-btn" onclick="navigator.clipboard.writeText(${JSON.stringify(pass)})">Salin</button>`;
  });
}

/* ---------- Base64 Encode/Decode ---------- */
function toolBase64() {
  openModal(`
    <h3>Base64 Encode/Decode</h3>
    <textarea id="b64Input" rows="4" placeholder="Masukkan teks..."></textarea>
    <div style="display:flex;gap:8px;margin:10px 0;">
      <button class="btn-primary" id="b64EncBtn" style="flex:1;">Encode</button>
      <button class="btn-primary" id="b64DecBtn" style="flex:1;">Decode</button>
    </div>
    <div id="b64Out"></div>
  `);
  const show = (result, isErr) => {
    document.getElementById("b64Out").innerHTML = isErr
      ? `<p class="error-text">${escapeHtml(result)}</p>`
      : `<div class="modal-result" style="word-break:break-all;">${escapeHtml(result)}</div>
         <button class="copy-btn" onclick="navigator.clipboard.writeText(${JSON.stringify(result)})">Salin</button>`;
  };
  document.getElementById("b64EncBtn").addEventListener("click", () => {
    const t = document.getElementById("b64Input").value || "";
    try { show(btoa(unescape(encodeURIComponent(t))), false); }
    catch { show("Gagal encode teks.", true); }
  });
  document.getElementById("b64DecBtn").addEventListener("click", () => {
    const t = document.getElementById("b64Input").value || "";
    try { show(decodeURIComponent(escape(atob(t))), false); }
    catch { show("Teks bukan Base64 yang valid.", true); }
  });
}

/* ---------- Case Converter ---------- */
function toolCaseConv() {
  openModal(`
    <h3>Case Converter</h3>
    <textarea id="ccInput" rows="4" placeholder="Tulis teks di sini..."></textarea>
    <div style="display:flex;gap:8px;flex-wrap:wrap;margin:10px 0;">
      <button class="copy-btn" id="ccUpper">UPPERCASE</button>
      <button class="copy-btn" id="ccLower">lowercase</button>
      <button class="copy-btn" id="ccTitle">Title Case</button>
      <button class="copy-btn" id="ccSentence">Sentence case</button>
    </div>
    <div id="ccOut"></div>
  `);
  const show = (out) => {
    document.getElementById("ccOut").innerHTML = `
      <div class="modal-result">${escapeHtml(out)}</div>
      <button class="copy-btn" onclick="navigator.clipboard.writeText(${JSON.stringify(out)})">Salin</button>`;
  };
  document.getElementById("ccUpper").addEventListener("click", () => show((document.getElementById("ccInput").value || "").toUpperCase()));
  document.getElementById("ccLower").addEventListener("click", () => show((document.getElementById("ccInput").value || "").toLowerCase()));
  document.getElementById("ccTitle").addEventListener("click", () => {
    const out = (document.getElementById("ccInput").value || "").toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
    show(out);
  });
  document.getElementById("ccSentence").addEventListener("click", () => {
    const t = (document.getElementById("ccInput").value || "").toLowerCase();
    show(t.replace(/(^\s*\w|[.!?]\s*\w)/g, c => c.toUpperCase()));
  });
}

/* ---------- JSON Formatter ---------- */
function toolJsonFmt() {
  openModal(`
    <h3>JSON Formatter</h3>
    <textarea id="jfInput" rows="6" placeholder='{"contoh":"tempel JSON di sini"}'></textarea>
    <button class="btn-primary" id="jfGen">Rapikan & Validasi</button>
    <div id="jfOut"></div>
  `);
  document.getElementById("jfGen").addEventListener("click", () => {
    const raw = document.getElementById("jfInput").value || "";
    try {
      const parsed = JSON.parse(raw);
      const pretty = JSON.stringify(parsed, null, 2);
      document.getElementById("jfOut").innerHTML = `
        <p class="hint-text" style="color:var(--success);">✔ JSON valid</p>
        <div class="modal-result" style="white-space:pre-wrap;font-family:'JetBrains Mono',monospace;font-size:12px;">${escapeHtml(pretty)}</div>
        <button class="copy-btn" onclick="navigator.clipboard.writeText(${JSON.stringify(pretty)})">Salin</button>`;
    } catch (err) {
      document.getElementById("jfOut").innerHTML = `<p class="error-text">✘ JSON tidak valid: ${escapeHtml(err.message)}</p>`;
    }
  });
}

/* ---------- Color Converter ---------- */
function toolColor() {
  openModal(`
    <h3>Color Converter</h3>
    <input type="color" id="colPicker" value="#5B4FE9" style="width:100%;height:44px;border:none;border-radius:12px;">
    <input id="colHex" placeholder="#5B4FE9" value="#5B4FE9" style="margin-top:8px;">
    <button class="btn-primary" id="colGen">Konversi</button>
    <div id="colOut"></div>
  `);
  const convert = (hex) => {
    hex = hex.replace("#", "").trim();
    if (!/^[0-9a-fA-F]{6}$/.test(hex)) return null;
    const r = parseInt(hex.slice(0, 2), 16), g = parseInt(hex.slice(2, 4), 16), b = parseInt(hex.slice(4, 6), 16);
    const r1 = r / 255, g1 = g / 255, b1 = b / 255;
    const max = Math.max(r1, g1, b1), min = Math.min(r1, g1, b1);
    let h = 0, s = 0, l = (max + min) / 2;
    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      if (max === r1) h = (g1 - b1) / d + (g1 < b1 ? 6 : 0);
      else if (max === g1) h = (b1 - r1) / d + 2;
      else h = (r1 - g1) / d + 4;
      h *= 60;
    }
    return { hex: "#" + hex.toUpperCase(), rgb: `rgb(${r}, ${g}, ${b})`, hsl: `hsl(${Math.round(h)}, ${Math.round(s*100)}%, ${Math.round(l*100)}%)` };
  };
  document.getElementById("colPicker").addEventListener("input", (e) => {
    document.getElementById("colHex").value = e.target.value;
  });
  document.getElementById("colGen").addEventListener("click", () => {
    const res = convert(document.getElementById("colHex").value || "");
    document.getElementById("colOut").innerHTML = res ? `
      <div class="modal-result">HEX: <strong>${res.hex}</strong></div>
      <div class="modal-result">RGB: <strong>${res.rgb}</strong></div>
      <div class="modal-result">HSL: <strong>${res.hsl}</strong></div>
    ` : `<p class="error-text">Format HEX tidak valid, contoh: #5B4FE9</p>`;
  });
}

/* ---------- BMI Calculator ---------- */
function toolBmi() {
  openModal(`
    <h3>Kalkulator BMI</h3>
    <input type="number" id="bmiWeight" placeholder="Berat badan (kg)">
    <input type="number" id="bmiHeight" placeholder="Tinggi badan (cm)">
    <button class="btn-primary" id="bmiGen">Hitung BMI</button>
    <div id="bmiOut"></div>
  `);
  document.getElementById("bmiGen").addEventListener("click", () => {
    const w = parseFloat(document.getElementById("bmiWeight").value);
    const h = parseFloat(document.getElementById("bmiHeight").value) / 100;
    if (!w || !h) { document.getElementById("bmiOut").innerHTML = `<p class="error-text">Isi berat & tinggi badan dengan benar.</p>`; return; }
    const bmi = w / (h * h);
    let kategori = "Normal";
    if (bmi < 18.5) kategori = "Kekurangan berat badan";
    else if (bmi < 25) kategori = "Normal";
    else if (bmi < 30) kategori = "Kelebihan berat badan";
    else kategori = "Obesitas";
    document.getElementById("bmiOut").innerHTML = `
      <div class="modal-result">BMI: <strong>${bmi.toFixed(1)}</strong><br>Kategori: <strong>${kategori}</strong></div>`;
  });
}

/* ---------- Lorem Ipsum Generator ---------- */
function toolLorem() {
  const words = ["lorem","ipsum","dolor","sit","amet","consectetur","adipiscing","elit","sed","do","eiusmod","tempor","incididunt","ut","labore","et","dolore","magna","aliqua","enim","ad","minim","veniam","quis","nostrud","exercitation","ullamco","laboris","nisi","aliquip"];
  openModal(`
    <h3>Lorem Ipsum Generator</h3>
    <label class="small muted">Jumlah paragraf: <span id="lrCountLabel">3</span></label>
    <input type="range" id="lrCount" min="1" max="10" value="3" style="width:100%;">
    <button class="btn-primary" id="lrGen">Generate</button>
    <div id="lrOut"></div>
  `);
  const countEl = document.getElementById("lrCount");
  countEl.addEventListener("input", () => document.getElementById("lrCountLabel").textContent = countEl.value);
  document.getElementById("lrGen").addEventListener("click", () => {
    const n = parseInt(countEl.value, 10);
    const paras = [];
    for (let p = 0; p < n; p++) {
      let sentence = [];
      const sentLen = 10 + Math.floor(Math.random() * 8);
      for (let i = 0; i < sentLen; i++) sentence.push(words[Math.floor(Math.random() * words.length)]);
      sentence[0] = sentence[0][0].toUpperCase() + sentence[0].slice(1);
      paras.push(sentence.join(" ") + ".");
    }
    const text = paras.join("\n\n");
    document.getElementById("lrOut").innerHTML = `
      <div class="modal-result" style="white-space:pre-wrap;">${escapeHtml(text)}</div>
      <button class="copy-btn" onclick="navigator.clipboard.writeText(${JSON.stringify(text)})">Salin</button>`;
  });
}

/* ---------- Age Calculator ---------- */
function toolAgeCalc() {
  openModal(`
    <h3>Kalkulator Umur</h3>
    <input type="date" id="acDate">
    <button class="btn-primary" id="acGen">Hitung Umur</button>
    <div id="acOut"></div>
  `);
  document.getElementById("acGen").addEventListener("click", () => {
    const val = document.getElementById("acDate").value;
    if (!val) { document.getElementById("acOut").innerHTML = `<p class="error-text">Pilih tanggal lahir dulu.</p>`; return; }
    const birth = new Date(val);
    const now = new Date();
    let years = now.getFullYear() - birth.getFullYear();
    let months = now.getMonth() - birth.getMonth();
    let days = now.getDate() - birth.getDate();
    if (days < 0) { months--; days += new Date(now.getFullYear(), now.getMonth(), 0).getDate(); }
    if (months < 0) { years--; months += 12; }
    document.getElementById("acOut").innerHTML = `
      <div class="modal-result">Umur kamu: <strong>${years} tahun, ${months} bulan, ${days} hari</strong></div>`;
  });
}

/* ---------- Unit Converter ---------- */
function toolUnitConv() {
  openModal(`
    <h3>Konversi Satuan</h3>
    <select id="ucType">
      <option value="length">Panjang (m ⇄ km ⇄ cm ⇄ mil)</option>
      <option value="weight">Berat (kg ⇄ gram ⇄ pon)</option>
      <option value="temp">Suhu (°C ⇄ °F ⇄ K)</option>
    </select>
    <input type="number" id="ucInput" placeholder="Masukkan nilai">
    <button class="btn-primary" id="ucGen">Konversi</button>
    <div id="ucOut"></div>
  `);
  document.getElementById("ucGen").addEventListener("click", () => {
    const type = document.getElementById("ucType").value;
    const v = parseFloat(document.getElementById("ucInput").value);
    const out = document.getElementById("ucOut");
    if (isNaN(v)) { out.innerHTML = `<p class="error-text">Masukkan angka yang valid.</p>`; return; }
    let html = "";
    if (type === "length") {
      html = `<div class="modal-result">${v} m = <strong>${(v/1000).toFixed(4)} km</strong></div>
              <div class="modal-result">${v} m = <strong>${(v*100).toFixed(2)} cm</strong></div>
              <div class="modal-result">${v} m = <strong>${(v/1609.34).toFixed(4)} mil</strong></div>`;
    } else if (type === "weight") {
      html = `<div class="modal-result">${v} kg = <strong>${(v*1000).toFixed(2)} gram</strong></div>
              <div class="modal-result">${v} kg = <strong>${(v*2.20462).toFixed(2)} pon</strong></div>`;
    } else {
      const f = v * 9/5 + 32;
      const k = v + 273.15;
      html = `<div class="modal-result">${v}°C = <strong>${f.toFixed(1)}°F</strong></div>
              <div class="modal-result">${v}°C = <strong>${k.toFixed(1)} K</strong></div>`;
    }
    out.innerHTML = html;
  });
}

/* ---------- Hash Generator (checksum, non-cryptographic) ---------- */
function toolHashGen() {
  openModal(`
    <h3>Hash Generator</h3>
    <p class="muted small">Checksum ringan untuk verifikasi teks (bukan hash kriptografi).</p>
    <textarea id="hgInput" rows="4" placeholder="Tempel teks di sini..."></textarea>
    <button class="btn-primary" id="hgGen">Buat Hash</button>
    <div id="hgOut"></div>
  `);
  document.getElementById("hgGen").addEventListener("click", () => {
    const t = document.getElementById("hgInput").value || "";
    let h1 = 5381, h2 = 52711;
    for (let i = 0; i < t.length; i++) {
      const c = t.charCodeAt(i);
      h1 = (h1 * 33) ^ c;
      h2 = (h2 * 31) ^ c;
    }
    const hash = (h1 >>> 0).toString(16).padStart(8, "0") + (h2 >>> 0).toString(16).padStart(8, "0");
    document.getElementById("hgOut").innerHTML = `
      <div class="modal-result" style="font-family:'JetBrains Mono',monospace;word-break:break-all;">${hash}</div>
      <button class="copy-btn" onclick="navigator.clipboard.writeText('${hash}')">Salin</button>`;
  });
}

/* ---------- Slug Generator ---------- */
function toolSlug() {
  openModal(`
    <h3>Slug Generator</h3>
    <input id="slInput" placeholder="Judul artikel / teks">
    <button class="btn-primary" id="slGen">Buat Slug</button>
    <div id="slOut"></div>
  `);
  document.getElementById("slGen").addEventListener("click", () => {
    const t = document.getElementById("slInput").value || "";
    const slug = t.toLowerCase().trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");
    document.getElementById("slOut").innerHTML = `
      <div class="modal-result">${escapeHtml(slug)}</div>
      <button class="copy-btn" onclick="navigator.clipboard.writeText(${JSON.stringify(slug)})">Salin</button>`;
  });
}

/* ---------- Random Generator ---------- */
function toolRandNum() {
  openModal(`
    <h3>Random Generator</h3>
    <div style="display:flex;gap:8px;">
      <input type="number" id="rnMin" placeholder="Min" value="1">
      <input type="number" id="rnMax" placeholder="Max" value="100">
    </div>
    <button class="btn-primary" id="rnGen">Acak Angka</button>
    <button class="copy-btn" id="rnStrGen" style="margin-top:8px;width:100%;">Acak String (8 karakter)</button>
    <div id="rnOut"></div>
  `);
  document.getElementById("rnGen").addEventListener("click", () => {
    const min = parseInt(document.getElementById("rnMin").value, 10) || 0;
    const max = parseInt(document.getElementById("rnMax").value, 10) || 100;
    const result = Math.floor(Math.random() * (max - min + 1)) + min;
    document.getElementById("rnOut").innerHTML = `<div class="modal-result">Hasil: <strong>${result}</strong></div>`;
  });
  document.getElementById("rnStrGen").addEventListener("click", () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let s = "";
    for (let i = 0; i < 8; i++) s += chars[Math.floor(Math.random() * chars.length)];
    document.getElementById("rnOut").innerHTML = `
      <div class="modal-result" style="font-family:'JetBrains Mono',monospace;">${s}</div>
      <button class="copy-btn" onclick="navigator.clipboard.writeText('${s}')">Salin</button>`;
  });
}

/* ---------- Catatan Cepat ---------- */
function toolNotes() {
  openModal(`
    <h3>Catatan Cepat</h3>
    <textarea id="ntInput" rows="3" placeholder="Tulis catatan baru..."></textarea>
    <button class="btn-primary" id="ntAdd">Simpan Catatan</button>
    <div id="ntList" style="margin-top:12px;display:flex;flex-direction:column;gap:8px;"></div>
  `);
  const KEY = "atds_notes";
  const load = () => JSON.parse(localStorage.getItem(KEY) || "[]");
  const render = () => {
    const list = load();
    document.getElementById("ntList").innerHTML = list.map((n, i) => `
      <div class="modal-result" style="display:flex;justify-content:space-between;align-items:flex-start;gap:8px;">
        <span style="white-space:pre-wrap;">${escapeHtml(n)}</span>
        <button data-del="${i}" class="copy-btn">Hapus</button>
      </div>`).join("") || `<p class="muted small">Belum ada catatan.</p>`;
    document.querySelectorAll("[data-del]").forEach(btn => {
      btn.addEventListener("click", () => {
        const list2 = load();
        list2.splice(parseInt(btn.dataset.del, 10), 1);
        localStorage.setItem(KEY, JSON.stringify(list2));
        render();
      });
    });
  };
  document.getElementById("ntAdd").addEventListener("click", () => {
    const val = document.getElementById("ntInput").value.trim();
    if (!val) return;
    const list = load();
    list.unshift(val);
    localStorage.setItem(KEY, JSON.stringify(list));
    document.getElementById("ntInput").value = "";
    render();
  });
  render();
}

/* ---------- Kalkulator Diskon ---------- */
function toolDiscount() {
  openModal(`
    <h3>Kalkulator Diskon</h3>
    <input type="number" id="dcPrice" placeholder="Harga awal (Rp)">
    <input type="number" id="dcPercent" placeholder="Diskon (%)">
    <button class="btn-primary" id="dcGen">Hitung</button>
    <div id="dcOut"></div>
  `);
  document.getElementById("dcGen").addEventListener("click", () => {
    const price = parseFloat(document.getElementById("dcPrice").value);
    const pct = parseFloat(document.getElementById("dcPercent").value);
    if (isNaN(price) || isNaN(pct)) { document.getElementById("dcOut").innerHTML = `<p class="error-text">Isi harga & persentase dengan benar.</p>`; return; }
    const potongan = price * (pct / 100);
    const akhir = price - potongan;
    const fmt = (n) => "Rp " + n.toLocaleString("id-ID", { maximumFractionDigits: 0 });
    document.getElementById("dcOut").innerHTML = `
      <div class="modal-result">Potongan: <strong>${fmt(potongan)}</strong></div>
      <div class="modal-result">Harga akhir: <strong>${fmt(akhir)}</strong></div>`;
  });
}

/* ---------- Countdown Tanggal ---------- */
function toolCountdown() {
  openModal(`
    <h3>Countdown Tanggal</h3>
    <input type="date" id="cdDate">
    <button class="btn-primary" id="cdGen">Hitung Selisih</button>
    <div id="cdOut"></div>
  `);
  document.getElementById("cdGen").addEventListener("click", () => {
    const val = document.getElementById("cdDate").value;
    if (!val) { document.getElementById("cdOut").innerHTML = `<p class="error-text">Pilih tanggal target dulu.</p>`; return; }
    const target = new Date(val);
    const now = new Date();
    const diffMs = target.setHours(0,0,0,0) - now.setHours(0,0,0,0);
    const days = Math.round(diffMs / 86400000);
    const label = days === 0 ? "Hari ini!" : days > 0 ? `${days} hari lagi` : `${Math.abs(days)} hari yang lalu`;
    document.getElementById("cdOut").innerHTML = `<div class="modal-result"><strong>${label}</strong></div>`;
  });
}

/* ---------- Admin: user management (owner only) ---------- */
document.getElementById("createUserForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const username = document.getElementById("newUsername").value.trim();
  const password = document.getElementById("newPassword").value;
  const role = document.getElementById("newRole").value;
  const msgEl = document.getElementById("createUserMsg");
  const submitBtn = e.target.querySelector('button[type="submit"]');

  msgEl.style.color = "";
  msgEl.textContent = "";
  if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = "Menyimpan..."; }

  const users = await getUsers();

  if (users === null) {
    msgEl.style.color = "var(--danger)";
    msgEl.textContent = "Gagal terhubung ke server, coba lagi.";
    if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = "Tambah Akun"; }
    return;
  }
  if (users.some(u => u.username === username)) {
    msgEl.style.color = "var(--danger)";
    msgEl.textContent = "Username sudah dipakai.";
    if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = "Tambah Akun"; }
    return;
  }

  users.push({ username, password, role, createdAt: Date.now() });
  const ok = await saveUsers(users);

  if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = "Tambah Akun"; }

  if (!ok) {
    msgEl.style.color = "var(--danger)";
    msgEl.textContent = "Gagal menyimpan akun, coba lagi.";
    return;
  }
  msgEl.style.color = "var(--success)";
  msgEl.textContent = `Akun "${username}" (${role}) berhasil dibuat.`;
  document.getElementById("createUserForm").reset();
  renderUserList();
});

async function renderUserList() {
  const session = getSession();
  const container = document.getElementById("userList");
  container.innerHTML = `<p class="muted small">Memuat daftar akun...</p>`;

  const users = await getUsers();
  if (users === null) {
    container.innerHTML = `<p class="error-text">Gagal memuat daftar akun. Cek koneksi lalu buka ulang.</p>`;
    return;
  }

  container.innerHTML = users.map(u => `
    <div class="user-row">
      <div class="u-left">
        <strong>${escapeHtml(u.username)}</strong>
        <span class="role-badge ${u.role === "owner" ? "owner" : u.role === "vip" ? "vip" : ""}" style="margin-left:4px;">${u.role}</span>
      </div>
      <div style="display:flex;gap:6px;align-items:center;">
        <select data-user="${escapeHtml(u.username)}" class="roleSelect">
          <option value="member" ${u.role === "member" ? "selected" : ""}>member</option>
          <option value="vip" ${u.role === "vip" ? "selected" : ""}>vip</option>
          <option value="owner" ${u.role === "owner" ? "selected" : ""}>owner</option>
        </select>
        ${u.username === session.username ? "" : `<button data-del="${escapeHtml(u.username)}">Hapus</button>`}
      </div>
    </div>
  `).join("") || `<p class="muted small">Belum ada akun.</p>`;

  container.querySelectorAll(".roleSelect").forEach(sel => {
    sel.addEventListener("change", async () => {
      sel.disabled = true;
      const list = await getUsers();
      if (list === null) { sel.disabled = false; return; }
      const target = list.find(u => u.username === sel.dataset.user);
      if (target) target.role = sel.value;
      await saveUsers(list);
      sel.disabled = false;
      if (sel.dataset.user === session.username) { setSession(target); renderApp(); }
    });
  });
  container.querySelectorAll("[data-del]").forEach(btn => {
    btn.addEventListener("click", async () => {
      btn.disabled = true;
      let list = await getUsers();
      if (list === null) { btn.disabled = false; return; }
      list = list.filter(u => u.username !== btn.dataset.del);
      await saveUsers(list);
      renderUserList();
    });
  });
}

/* ---------- Init ---------- */
applyTheme();
