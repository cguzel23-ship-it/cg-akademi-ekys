# DEVİR DOSYASI — Zihin Dedektifi (15 Kasım 2026, 14:20)

Yeni oturumda önce bunu oku. Kullanıcıyla **Türkçe**, kısa ve net konuş.

## 1. Kanal ve kalıcı kurallar
- YouTube: UCCW6NPhhUUN45NIDNdMY1sA · Instagram: @zihindedektiffi (ig_user_id 29524420767245903)
- Yayınlanmış videolara dokunma; kalıcı silmeden önce sor.
- Şifre, kart, doğrulama kodu, API anahtarı girme ya da oluşturma. AI Studio'da "Create key" ya da faturalandırmaya tıklama; ücretli plan yok.
- Zihin Dedektifi ve CG Okulu içerikleri karışmaz. Kullanıcı dışında gerçek yüz yok; telifli müzik, logo ya da karakter yok.
- Sağlık içeriği: ilaç adı ya da doz yok, "bir uzmana danış" ekle.
- Rakamlara Pazar akşamları bakılır.
- Araştırmada Chrome'daki Perplexity kullanılır.
- Her değişiklikten sonra dosya gönderme.
- Tarayıcı: kullanıcının ana PC'si **"Browser 1" (deviceId 5645c9f8-380f-4e3b-b6ae-8f33cd8ead42)**; Zihin Dedektifi YouTube hesabı burada açık. "Browser 2" (03978d05…) başka bir Google hesabı ("The Mind Detective"), YouTube yüklemesi orada olmaz. PC açıkken dosya seçip yükleme yetkisi var.

## 2. Yayın planı (15 Kas kararı: günde 2 uzun video)
| Saat (TR) | İçerik |
|---|---|
| 08:00 / 12:00 / **17:00** | Shorts (18:00'dekiler 17:00'ye alındı) + her birinden 5 dk sonra IG Reel |
| 10:00 | Bazı günlerde eski uyku videoları (Dede Korkut 16 Kas, Petra 17 Kas) |
| **18:00** | **Stoacılık serisi** — her gün 1 bölüm: bölüm n = 16 Kas + (n−1) gün → 20. bölüm 5 Ara. UTC: 15:00Z |
| **21:30** | **Spinoza serisi** 1–16 — 15–30 Kas, tümü yüklü ve planlı. UTC: 18:30Z |

## 3. Stoacılık serisi durumu
| # | Video ID | Yayın | Durum |
|---|---|---|---|
| 1 | nuoo4kADsY0 | 16 Kas 18:00 | yüklendi ✔ |
| 2 | uxnsfRfTRrM | 17 Kas 18:00 | yüklendi ✔ |
| 3 | 15ZIbk4bVcM | 18 Kas 18:00 | yüklendi ✔ |
| 4 | nKBc4AnsIyE | 19 Kas 18:00 | yüklendi ✔ |
| 5–20 | — | 20 Kas – 5 Ara | **ses yok** → her gün 11:00'den sonra Gemini TTS |

- Oynatma listeleri: Stoacılık Serisi 🌙 **PLX6QysR1SlwA** (sıralı 1-2-3-4) + Felsefeyle Uyu **PLYer_xVuyiP4**.
- Spinoza video ID'leri (1–16): Cd_ttKo2ylk, jJ_iVY3mieE, fVl11R4GUlU, -6thTJ9ulvc, OeFgaNU-Bi0, s0p5a6wy5VY, bWYtdaz2jMo, IN7LQL5jV9U, m6Qzk758W0s, eAoy7cqj1mI, XCCZx2q71EU, 4fwtnR-gepk, R-5zakm0QDQ, GKx5ORqLgDc, jRboWl20F1M, GCoN6E4f-t8.
- Diğer listeler: kafandaki_dosyalar PLV5hDAdvLXZo, eser_dosyalari PLNtPGdpKURpU, tarihle_uyu PLRVZgJIH_ozQ, bilimle_uyu PLad_zqoK0DLs, efsane_mi_gercek_mi PLdMeFXAmvHAQ, spinoza_serisi PLVK5jrj97nms.

## 4. Dosyalar (GitHub: cguzel23-ship-it/cg-akademi-ekys)
- Dal **zd-gorseller**:
  - `stoa/uyku_stoa01..20.md` metinler
  - `stoa/chunks.json` (75 parça; 1–9 ve 11–16. bölümler 4 parça, 10 ve 17–20. bölümler 3 parça)
  - `stoa/meta.json` (başlık, açıklama, etiket, k1, k2, clip). **"at" alanları eski 21:30 değerinde; yayın saatini at(n)=2026-11-16T15:00Z+(n−1) gün ile hesapla.**
  - `stoa/tools/`: build_stoa.py, kapak_stoa.py, pipe_stoa2.sh, build.py, kapak.py, sil.wav, muzik_pad.wav
  - `stock/` (Pexels klipleri)
- Dal **zd-videolar**: `ZD_STnnR_partXX` (70 MB parçalar) + `ZD_STOAnn_kapak.jpg`, Reels `ZD_KDnn.mp4`.
- Proje belgeleri: claude/stoa-serisi-plan.md, claude/ig-paylasim-yontemi.md, claude/uyku-stoaNN-metin.md.

### Yeni oturumda kurulum
1. zd-gorseller dalını /home/claude/zdgen'e, zd-videolar dalını /home/claude/zdvid'e klonla. zdvid için: `--depth 1 --filter=blob:none --sparse`.
2. `stoa/tools/*` dosyalarını bir çalışma klasörüne (sp/) kopyala.
3. build_stoa.py içindeki MUS yolunu sp/muzik_pad.wav yap. S=/home/claude/zdgen/stock kalır.
4. Font: Poppins-Bold (/usr/share/fonts/truetype/google-fonts/).

## 5. Üretim hattı
1. **Ses (Gemini TTS)**
   - Adres: aistudio.google.com/generate-speech, model gemini-3.8-flash-tts, ses **Riko**.
   - Her parça için YENİ sekme aç (Chrome sekme başına 1 indirme). Paralel olabilir.
   - Sayfa açılınca 3–4 sn bekle.
   - "Create new dialog"a tıkla, yaklaşık (349, 285–300).
   - Konuşmacı ayarına tıkla (1360, 362).
   - JS ile:
     - Riko kartını seç. `button.voice-card-content` "Riko" ile başlar; yoksa ses arama kutusuna "Riko" yaz.
     - Paneli kapat.
     - `fetch(raw .../zd-gorseller/stoa/chunks.json?ts)` yap ve `d[N].join(' ... ')` ile textarea'ya yaz.
     - Run'a bas. Stop kaybolana kadar bekle; sonuç `window.__done` içinde olur.
   - Download'a gerçek tıklama yap: (992, 603) ya da (992, 659).
   - Kota: günde yaklaşık 15–17 üretim, saat 11:00 TR'de yenilenir. Kota uyarısı çıkarsa JS ile kapat; faturalandırmaya ASLA tıklama.
2. **Dosyalar**
   - İnenler `~/Downloads/Generated Audio November DD, 2026 - H_MMAM (k).wav` olarak kaydedilir: 24 kHz mono, 48000 B/s.
   - Parçayı süreyle eşle: bytes/48000 ≈ beklenen süre (yaklaşık 14,4 karakter/sn).
   - `device_stage_files` ile al.
   - `riko/stNN_k.wav` olarak kopyala.
   - `sil.wav` (1,5 sn) ile concat → `riko/stoaNN.wav`.
   - `/mnt/user-data/uploads/Downloads/*.wav` dosyalarını sil.
3. **Kurgu ve push**
   - `bash pipe_stoa2.sh n…` çalıştır: build → kapak → 70m split → zd-videolar push → zdvid/.git içindeki büyük blob'ları temizler.
   - **Disk dar (yaklaşık 3 GB boş):** her bölümden sonra temizlik şart. Push sırasında disk dolarsa bölüm yeniden kurulur.
4. **YouTube yükleme**
   - Chrome Browser 1'de `studio.youtube.com/channel/UCCW…/videos/upload?d=ud` aç.
   - JS ile raw parçaları sırayla fetch et (stream reader) → File → `input[type=file]`'a DataTransfer ile ver → change event.
   - youtu.be linkinden video ID'sini al.
   - "Video yükleme işlemi tamamlandı" yazınca X'e bas (1184, 70).
   - Süre: yaklaşık 10 dk indirme + 10 dk yükleme.
5. **Ayarlar (Composio workbench, youtube)**
   - `proxy_execute PUT videos part=snippet`: title, description, tags, categoryId 27, tr.
   - `PUT part=status`: private + publishAt + embeddable, selfDeclaredMadeForKids False.
   - `YOUTUBE_UPDATE_THUMBNAIL`: videoId, thumbnailUrl = raw zd-videolar ZD_STOAnn_kapak.jpg.
   - `playlistItems POST` ile iki listeye ekle (gerekirse position ver).

## 6. Bekleyen işler
- [ ] 16 Kas'tan itibaren her gün 11:00 sonrası: Stoacılık 5–8 sesi → kurgu → yükleme (20–23 Kas'a yetişmeli); sonra 9–20.
- [ ] Haftalık deneme Short "Bekle Biraz": metin zd-gorseller `stoa/deneme_short_01.md`; ses kotası artarsa üretilecek.
- [ ] Kanal ana sayfası: 3 boş bölümün (Geçmiş canlı yayınlar, Gönderiler, Ortak çalışmalar) kaldırılıp öne çıkan video Mrr3GNH_1pc eklenmesi için kullanıcının cevabı bekleniyor.
- [ ] IG Reel zamanlanmış görevleri (#5–#37) çalıştıkça GitHub/Composio yöntemiyle paylaş (claude/ig-paylasim-yontemi.md). vidIQ kredisi yok.
- [ ] 16/18/20 Kas online deneme sonuç görevleri ayrı (okul) — Zihin Dedektifi ile karıştırma.

## 7. Analitik notları (15 Kas)
- Toplam izleme: reklam 222,8 sa · Shorts akışı 56,3 sa · **organik uzun video yaklaşık 15 sa** (para kazanma için 4000 saate yalnızca bu sayılır).
- Organikte en iyiler: Nemrut (2,7 sa), 13 Gizem (2,1 sa), Evliya Çelebi (1,6 sa; reklamsız).
- Reklam organik izleyici getirmedi: reklamlı videoların organiği reklamsızla aynı seviyede. Öneri: reklamı bırak, düzenli uyku serisi yayınla. Karar kullanıcıda.
