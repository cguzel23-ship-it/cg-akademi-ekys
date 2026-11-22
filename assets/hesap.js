// CG Akademi hesap: uygulamayla aynı Firebase hesabı (Google veya e-posta).
// Giriş yapılınca sitedeki işaretler (cg-* anahtarları) ve sınav seçimi
// users/{uid}/progress/web belgesine eşitlenir; uygulama ilerlemesi
// users/{uid}/progress/main belgesinden okunur.
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import {
  getAuth, onAuthStateChanged, GoogleAuthProvider, signInWithPopup,
  signInWithEmailAndPassword, createUserWithEmailAndPassword,
  sendPasswordResetEmail, signOut, updateProfile
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import {
  getFirestore, doc, getDoc, setDoc, serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";

const app = initializeApp({
  apiKey: "AIzaSyC4ub2Kzqwx-Ig0IWWlkFBqHIDJ38K8x0A",
  authDomain: "cg-akademi-dgs.firebaseapp.com",
  projectId: "cg-akademi-dgs",
  storageBucket: "cg-akademi-dgs.firebasestorage.app",
  messagingSenderId: "253803510730"
});
const auth = getAuth(app);
auth.languageCode = "tr";
const db = getFirestore(app);

const SKIP = new Set(["cg-tema", "cg-giris"]);
let user = null, lastSnap = "", pushTimer = null;
const listeners = [];

function localSnapshot() {
  const o = {};
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith("cg-") && !SKIP.has(k)) o[k] = localStorage.getItem(k);
    }
  } catch (e) {}
  return o;
}

function mergeValue(a, b) {
  // İşaret listeleri (JSON dizi) birleşir; diğerlerinde yerel değer kalır.
  try {
    const x = JSON.parse(a), y = JSON.parse(b);
    if (Array.isArray(x) && Array.isArray(y)) {
      if (x.every(v => typeof v === "boolean") && x.length === y.length) {
        return JSON.stringify(x.map((v, i) => v || y[i]));
      }
      return JSON.stringify([...new Set([...x, ...y])]);
    }
    if (x && y && typeof x === "object" && typeof y === "object") {
      const o = { ...y };
      for (const [k, v] of Object.entries(x)) {
        const r = o[k];
        if (r == null) o[k] = v;
        else if (typeof v === "number" && typeof r === "number") o[k] = Math.max(v, r);
        else if (v && r && typeof v === "object" && typeof r === "object") o[k] = (v.t || 0) >= (r.t || 0) ? v : r;
        else o[k] = v;
      }
      return JSON.stringify(o);
    }
  } catch (e) {}
  return a;
}

async function pullWeb() {
  const snap = await getDoc(doc(db, "users", user.uid, "progress", "web"));
  const remote = snap.exists() ? (snap.data().keys || {}) : {};
  for (const [k, v] of Object.entries(remote)) {
    if (SKIP.has(k) || typeof v !== "string") continue;
    let cur = null;
    try { cur = localStorage.getItem(k); } catch (e) {}
    try { localStorage.setItem(k, cur == null ? v : mergeValue(cur, v)); } catch (e) {}
  }
  await pushWeb(true);
}

async function pushWeb(force) {
  if (!user) return;
  const snap = localSnapshot();
  const s = JSON.stringify(snap);
  if (!force && s === lastSnap) return;
  lastSnap = s;
  try {
    await setDoc(doc(db, "users", user.uid, "progress", "web"),
      { keys: snap, updatedAt: serverTimestamp() });
  } catch (e) { console.warn("Site ilerlemesi eşitlenemedi", e); }
}

function schedulePush() {
  clearTimeout(pushTimer);
  pushTimer = setTimeout(() => pushWeb(false), 1500);
}

// ---- Arayüz ----
const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

function hataMetni(e) {
  const c = (e && e.code) || "";
  return ({
    "auth/invalid-email": "E-posta adresi geçersiz.",
    "auth/invalid-credential": "E-posta veya şifre hatalı.",
    "auth/wrong-password": "E-posta veya şifre hatalı.",
    "auth/user-not-found": "Bu e-postayla kayıtlı hesap yok.",
    "auth/email-already-in-use": "Bu e-posta zaten kayıtlı; giriş yapmayı dene.",
    "auth/weak-password": "Şifre en az 6 karakter olmalı.",
    "auth/popup-closed-by-user": "Giriş penceresi kapatıldı.",
    "auth/popup-blocked": "Tarayıcı giriş penceresini engelledi; açılır pencerelere izin ver.",
    "auth/too-many-requests": "Çok fazla deneme yapıldı; biraz sonra tekrar dene.",
    "auth/network-request-failed": "İnternet bağlantısı kurulamadı.",
    "auth/unauthorized-domain": "Bu adresten giriş henüz açılmadı."
  })[c] || "Giriş yapılamadı. Lütfen tekrar dene.";
}

function modal() {
  let m = document.getElementById("cg-giris-modal");
  if (m) return m;
  m = document.createElement("div");
  m.id = "cg-giris-modal";
  m.className = "gm-wrap";
  m.innerHTML = `
  <div class="gm" role="dialog" aria-modal="true" aria-labelledby="gm-baslik">
    <button type="button" class="gm-kapat" aria-label="Kapat">×</button>
    <h2 id="gm-baslik">Giriş yap</h2>
    <p class="gm-alt">Uygulamadaki hesabınla giriş yap; ilerlemen sitede ve uygulamada aynı görünür.</p>
    <button type="button" class="gm-google"><svg viewBox="0 0 48 48" width="20" height="20" aria-hidden="true"><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z"/><path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/><path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z"/><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z"/></svg>Google ile devam et</button>
    <div class="gm-ayrac"><span>veya e-posta ile</span></div>
    <form class="gm-form" novalidate>
      <label class="gm-ad" hidden>Ad Soyad<input name="ad" autocomplete="name"></label>
      <label>E-posta<input name="eposta" type="email" autocomplete="email" required></label>
      <label>Şifre<input name="sifre" type="password" autocomplete="current-password" minlength="6" required></label>
      <p class="gm-hata" role="alert"></p>
      <button type="submit" class="btn primary gm-gonder">Giriş yap</button>
    </form>
    <div class="gm-alt-linkler">
      <button type="button" class="gm-link gm-mod">Hesabın yok mu? Kayıt ol</button>
      <button type="button" class="gm-link gm-unuttum">Şifremi unuttum</button>
    </div>
  </div>`;
  document.body.appendChild(m);
  let kayit = false;
  const f = m.querySelector(".gm-form"), hata = m.querySelector(".gm-hata");
  const kapat = () => { m.classList.remove("acik"); hata.textContent = ""; };
  m.addEventListener("click", e => { if (e.target === m) kapat(); });
  m.querySelector(".gm-kapat").onclick = kapat;
  document.addEventListener("keydown", e => { if (e.key === "Escape") kapat(); });
  m.querySelector(".gm-google").onclick = async () => {
    hata.textContent = "";
    try { await signInWithPopup(auth, new GoogleAuthProvider()); kapat(); }
    catch (e) { hata.textContent = hataMetni(e); }
  };
  m.querySelector(".gm-mod").onclick = () => {
    kayit = !kayit;
    m.querySelector("#gm-baslik").textContent = kayit ? "Kayıt ol" : "Giriş yap";
    m.querySelector(".gm-gonder").textContent = kayit ? "Kayıt ol" : "Giriş yap";
    m.querySelector(".gm-mod").textContent = kayit ? "Zaten hesabın var mı? Giriş yap" : "Hesabın yok mu? Kayıt ol";
    m.querySelector(".gm-ad").hidden = !kayit;
    f.sifre.autocomplete = kayit ? "new-password" : "current-password";
    hata.textContent = "";
  };
  m.querySelector(".gm-unuttum").onclick = async () => {
    const ep = f.eposta.value.trim();
    if (!ep) { hata.textContent = "Önce e-posta adresini yaz."; return; }
    try { await sendPasswordResetEmail(auth, ep); hata.textContent = "Şifre sıfırlama bağlantısı e-postana gönderildi."; }
    catch (e) { hata.textContent = hataMetni(e); }
  };
  f.onsubmit = async e => {
    e.preventDefault();
    hata.textContent = "";
    const ep = f.eposta.value.trim(), sf = f.sifre.value;
    try {
      if (kayit) {
        const r = await createUserWithEmailAndPassword(auth, ep, sf);
        const ad = f.ad.value.trim();
        if (ad) await updateProfile(r.user, { displayName: ad });
      } else {
        await signInWithEmailAndPassword(auth, ep, sf);
      }
      kapat();
    } catch (er) { hata.textContent = hataMetni(er); }
  };
  return m;
}

export function girisAc() {
  const m = modal();
  m.classList.add("acik");
  setTimeout(() => m.querySelector(".gm-google").focus(), 30);
}

export function cikis() { return signOut(auth); }

function navGuncelle() {
  const b = document.querySelector(".hesap-btn");
  if (!b) return;
  if (user) {
    const ad = user.displayName || user.email || "Hesabım";
    b.innerHTML = `<span class="hb-harf">${esc(ad.trim()[0] || "?").toUpperCase()}</span><span class="hb-ad">İlerlemem</span>`; b.setAttribute("aria-label","İlerlemem");
    b.title = ad;
    b.onclick = () => { location.href = "/ilerleme/"; };
  } else {
    b.innerHTML = `<svg class="hb-ikon" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="8" r="4"/><path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6"/></svg><span class="hb-ad">Giriş yap</span>`; b.setAttribute("aria-label","Giriş yap");
    b.title = "Giriş yap";
    b.onclick = girisAc;
  }
}

export function onUser(fn) { listeners.push(fn); if (hazir) fn(user); }
let hazir = false;

onAuthStateChanged(auth, async u => {
  user = u;
  try { u ? localStorage.setItem("cg-giris", "1") : localStorage.removeItem("cg-giris"); } catch (e) {}
  if (u) { try { await pullWeb(); } catch (e) { console.warn(e); } }
  hazir = true;
  navGuncelle();
  listeners.forEach(fn => fn(u));
});

// Site işaretlerini izle: localStorage'a cg-* yazıldığında buluta gönder.
const origSet = Storage.prototype.setItem;
Storage.prototype.setItem = function (k, v) {
  origSet.call(this, k, v);
  if (this === localStorage && user && typeof k === "string" && k.startsWith("cg-") && !SKIP.has(k)) schedulePush();
};
document.addEventListener("visibilitychange", () => { if (document.visibilityState === "hidden") pushWeb(false); });

// Uygulama ilerlemesi (salt okunur)
export async function uygulamaIlerlemesi(belge = "main") {
  if (!user) return null;
  const s = await getDoc(doc(db, "users", user.uid, "progress", belge));
  if (!s.exists()) return null;
  const d = s.data();
  let data = {};
  try { data = JSON.parse(d.data || "{}"); } catch (e) {}
  return { data, updatedAt: d.updatedAt ? d.updatedAt.toDate() : null };
}

export function kullanici() { return user; }

navGuncelle();
