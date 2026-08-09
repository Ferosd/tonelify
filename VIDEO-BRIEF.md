# Tonelify — Video Üretim Brief'i (Seedance 2.0)

Bu doküman **prompt değildir**. Bu, prompt yazacak kişiye/modele verilecek **teknik + yaratıcı şartname**dir.
Her video için: nereye gideceği, neden gerektiği, sahne tarifi, süre, kompozisyon kuralları, yasaklar ve ffmpeg teslim formatı yazılıdır.

Toplam üretilecek: **6 video / ~46 saniye ham materyal.**
Öncelik: **P0 = olmazsa olmaz (3 video, 21 sn)** · P1 = güçlü katkı (2 video, 10 sn) · P2 = bonus (1 video, 15 sn)

---

## 0. TÜM VİDEOLAR İÇİN GEÇERLİ KURALLAR

Prompt yazan kişi bu bloğu her prompt'un içine gömmeli.

### Renk & ışık (marka)
- Tek ışık ailesi: **amber/altın `#F5A623`** ana vurgu, **`#FFD700`** parlak nokta (specular), **kor kırmızısı `#D14B32`** ikincil/derinlik.
- Arka plan neredeyse siyah: `#08080A` – `#141418`. Sahnenin %70'i karanlık olmalı, ışık heykel gibi çalışmalı (low-key, chiaroscuro).
- Işık yönü: yandan/arkadan (rim light). Düz önden aydınlatma yok.
- Atmosfer: hafif duman/toz partikülü, hafif film grain, lens içi amber bloom. Sahne "sıcak, ter kokan bir prova odası" gibi olmalı — stüdyo temizliği değil.

### Kesin yasaklar (marka ihlali)
- **Mor, mavi, teal, yeşil, pembe** hiçbir tonda kullanılamaz. Neon mavi/mor "tech" estetiği kesinlikle yok.
- Görüntünün içinde **yazı, harf, rakam, logo, marka adı, UI elemanı, arayüz ekranı** olmayacak (AI video harfleri bozuk üretir; ayrıca tüm metni web sitesi HTML olarak üstüne bindiriyor).
- **İnsan yüzü yakın plan yok.** (Mevcut "3D kız" bunun için değişiyor: yüz, izleyicinin dikkatini ürün mesajından çalıyor ve AI yüzü frame frame kayıyor.) İnsan sadece **el/parmak/silüet** olarak görünebilir.
- Kamera sarsıntısı (handheld shake), ani kesme (cut), zoom punch, hız değişimi yok.
- Su, çiçek, uzay, soyut "veri küreleri", devre kartı klişesi, hologram HUD yok.

### Kamera kuralı (en kritik teknik madde)
Bu videolar **scroll ile kare kare geri-ileri sürüklenecek**. Bu yüzden:
- **Tek kesintisiz plan (one continuous take), kesme yok.**
- **Sabit hızda hareket.** Kamera baştan sona aynı tempoda ilerlemeli; hızlanma/yavaşlama olursa scroll "takılıyor" gibi hissettirir.
- Kamera **tek yönde** ilerlemeli (ileri dolly / yatay travelling). Geri dönüş, salınım, "gel-git" hareketi yok.
- Sahnede **rastgele/kaotik hareket eden nesne olmamalı** (uçuşan kıvılcım bulutu vs.). Geri sardığında fizik terse döner ve sahte görünür. Hareket eden her şey kamera veya kontrollü bir mekanizma olsun.

### Kompozisyon & güvenli alan
Sitede tüm başlıklar, butonlar ve kartlar bu videonun **üstüne** biniyor.
- Kadrajın **sol %55'i karanlık ve boş** kalmalı (metin alanı). Ana özne **sağ üçte bir**de dursun.
- Mobilde görüntü 9:16'ya kırpılıyor ve kırpma **yatayda %65 noktasından** alınıyor (`drawCoverFrame`, `xBias = 0.65`). Yani: **sağdaki özne, 16:9 kadrajın sağ %56–100 aralığındaki dikey şeritte tek başına da anlamlı görünmeli.**
- Üstte 120px, altta 160px'lik şeride kritik detay koyma (nav ve scroll indicator oraya biniyor).

### Teknik teslim (ham çıktı)
- 1920×1080, 16:9, **24 fps**, ses yok.
- En yüksek kalite/bitrate ile indir. Upscale gerekiyorsa 2K'ya çık, sonra 1600px'e düşür (downscale detayı korur, upscale uydurur).

---

## P0-1 · MASTER SCROLL — "Signal Chain Flythrough"
**Mevcut 3D kız animasyonunun yerine geçecek olan video budur. Projenin en önemli tek varlığı.**

| | |
|---|---|
| Gider | `public/frames/frame_0001.jpg … frame_0241.jpg` (241 kare, mevcut klasörün üzerine yazılır) |
| Kod | `app/page.tsx` — canvas frame scrubbing, `TOTAL = 241` |
| Süre | **10.0 saniye @ 24 fps = 241 kare** (bu sayı kodda sabit; şaşmamalı) |
| En-boy | 16:9, 1920×1080 |
| Öncelik | P0 |

### Neden
Bu tek video **sayfanın %0'ından %100'üne kadar** arka planda çalışıyor. Kullanıcı scroll ettikçe 7 bölümün (Hero → Trending → Nasıl Çalışır → Özellikler → AI Engine → Amp Ayarları → CTA) tamamı bu videonun üzerinde akıyor. Yani video **bir hikâye anlatmalı**, dekor olmamalı. Şu anki kız videosu hikâye anlatmıyor; sadece renk değiştiriyor.

### Yaratıcı konsept
**Kamera, gitar sinyalinin kendisi olur.** İzleyici sinyalin geçtiği yolu içeriden, tek nefeste kat eder. Gitar tonu uygulaması için "sinyal zinciri" evrensel dildir; hiçbir rakip bunu görselleştirmiyor.

Zaman çizelgesinde beş durak (kesme yok, tek akış — biri diğerinin içine girer):

1. **0.0–2.0 sn — Manyetik (pickup).** Ekstrem makro: humbucker kutup parçalarının üzerinde duran tel. Tel titreşiyor, titreşim bobinin bakır sargılarında amber bir dalga olarak beliriyor. Kamera bobinin sargıları arasından **içeri doğru** dalıyor.
2. **2.0–4.0 sn — Kablo.** Kamera artık jack kablosunun içinde; bakır örgü tünel gibi geçiyor, sinyal önümüzde amber bir nabız olarak ilerliyor, biz onu kovalıyoruz. Örgü telleri kamera etrafında spiral yapıyor.
3. **4.0–6.0 sn — Pedal.** Tünel bir distortion pedalının kasasına açılıyor. İçeriden görüş: diyot ve direnç ormanı, dev ölçekte. Sinyal geçerken kor kırmızısı (`#D14B32`) kıvılcımlar saçıyor — burası tonun "kirlendiği" yer. Kamera hâlâ ileri.
4. **6.0–8.0 sn — Lamba (tube).** Pedaldan çıkış, bir EL34 lambanın cam gövdesinin **içine** giriyor. Kamera camın içinde: filament amber–beyaz akkor hâlinde, ısı dalgaları görünüyor. Sahnenin en parlak, en sıcak anı.
5. **8.0–10.0 sn — Hoparlör.** Kamera lambadan çıkıp bir 12" hoparlör konisinin arkasına geliyor; koni kâğıdı yavaş çekimde nefes alıyor, toz zerreleri havaya kalkıyor. Kamera koninin merkezinden geçip **karanlığa** açılıyor — son kare neredeyse tamamen koyu, sadece kenarda kor kırmızısı bir hâle. (CTA bölümünün metni oraya oturacak.)

### Zorunlu kısıtlar
- Renk yolculuğu: 0 sn'de soğuk-amber kıvılcım → 5 sn'de tam altın → 10 sn'de derin kor kırmızısı/karanlık. Bu geçiş **doğrusal** olsun.
- Kamera **hiç durmadan** ileri gider. Tek bir duraklama bile scroll'da "donmuş" hissi yaratır.
- İlk kare (`frame_0001`) sayfa yüklenirken poster olarak duruyor: **tek başına etkileyici, kompozisyonu tam bir görsel olmalı.**
- Son kare koyu olmalı; sayfanın altındaki statik bölümlere (Pricing, Reviews) yumuşak geçsin.
- Kadrajın solu boş — bkz. güvenli alan kuralı. Tünel/koni merkezi sağa yaslı kalsın.

### Teslim (ffmpeg)
```bash
# 1) Kareleri çıkar (tam 241 kare)
ffmpeg -i master.mp4 -vf "fps=24,scale=1600:-2" -q:v 4 -frames:v 241 \
       -start_number 1 public/frames/frame_%04d.jpg

# 2) Doğrula — 241 dosya ve her biri ~25-45 KB olmalı, toplam < 9 MB
ls public/frames | wc -l
du -sh public/frames
```
Kare sayısı 241'den az çıkarsa videoyu 10.05 sn'ye uzatıp tekrar çıkar; **kodda `TOTAL` değiştirilmeyecek.**

---

## P0-2 · AI ENGINE SCRUB — "Deconstruction"
| | |
|---|---|
| Gider | `public/video.mp4` (aynı dosya adı, üzerine yazılır) |
| Kod | `app/page.tsx` S4 AI ENGINE — **kod dosyasına dokunulmayacak, sadece video dosyası değişecek** |
| Süre | **5.0 saniye @ 24 fps** |
| En-boy | 16:9, 1920×1080 |
| Öncelik | P0 |

### Neden
Bu klip scroll'un %57–%67 aralığına haritalanıyor, yani sayfanın sadece %10'unda 5 saniye oynuyor — hızlı sürüklenen bir bölüm. Uzun ve yavaş bir video burada boşa gider; **kısa ve yoğun** olmalı. Mesaj: "AI tonun her detayını ayrıştırıyor."

### Yaratıcı konsept
**Ayrışma, patlama değil — "sökülme".** Bir elektro gitar havada asılı duruyor, önden hafif açılı. Kamera **yatay olarak sağa doğru sabit hızda kayarken (dolly/travelling)** gitar katman katman kendinden ayrılıyor: önce plaka, sonra manyetikler, sonra potansiyometreler ve teller, sonra gövde ahşabının damarları. Parçalar dağılmıyor — havada **kendi yerlerinde, birbirine paralel katmanlar hâlinde asılı kalıyor** (patlamış teknik çizim / exploded view estetiği). Her katmanın kenarında ince amber bir kontur ışığı var.

Son 1 saniyede parçalar arasında ince amber ışık ipleri beliriyor: sanki AI parçalar arasındaki ilişkiyi haritalıyor. Kesinlikle "hologram HUD" görünümü değil — fiziksel ışık.

### Zorunlu kısıtlar
- Parçalar **düzenli** ayrılır, kaotik uçuşma yok (geri sarınca doğru görünsün).
- Gitar ortada-sağda; sol taraf boş (metin alanı).
- Arka plan tamamen siyah, zemin/yansıma yok — nesne uzayda asılı.

### Teslim (ffmpeg)
Scrub videosu **her karesi keyframe** olmalı, yoksa `currentTime` ataması takılır:
```bash
ffmpeg -i deconstruct_raw.mp4 -c:v libx264 -preset slow -crf 21 \
       -g 1 -keyint_min 1 -sc_threshold 0 -pix_fmt yuv420p -an \
       -vf "scale=1280:-2" -movflags +faststart public/video.mp4
```
Hedef boyut: **< 4 MB.** (Her kare keyframe olduğu için dosya şişer; 1280px ve crf 23'e kadar çıkmak serbest.)

---

## P0-3 · TONE-MATCH BEKLEME DÖNGÜSÜ — "Tube Warm-Up"
| | |
|---|---|
| Gider | `public/videos/analyzing.mp4` + `.webm` (yeni klasör) |
| Kod | `app/tone-match/page.tsx` — arama sürerken gösterilen yükleme durumu |
| Süre | **6.0 saniye, kusursuz döngü (seamless loop)** |
| En-boy | **1:1 kare, 1080×1080** (mobil ve masaüstünde aynı kutuda duracak) |
| Öncelik | P0 |

### Neden
Ürünün en kırılgan anı burası: kullanıcı şarkıyı yazıyor ve OpenAI cevabı **10–25 saniye** sürüyor. Şu an sadece bir spinner var. Bu sürede kullanıcı sekmeyi kapatıyor. Bir amfi lambasının ısınması, bekleme süresini "bir şey gerçekten çalışıyor" hissine çevirir — gitarist için lambaların ısınması zaten *beklemenin* evrensel simgesidir.

### Yaratıcı konsept
Karanlıkta tek bir **EL34/6L6 amfi lambası**, makro çekim, hafif üstten açı. Filament yavaşça soğuk griden amber akkora ısınıyor, cam gövdede sıcak bir parıltı beliriyor, ısı camın etrafındaki havayı hafifçe titretiyor (heat haze), sonra tekrar hafifçe sönümleniyor. Nefes alıp verir gibi. Arkada, odak dışında, ikinci bir lambanın bulanık amber lekesi.

### Zorunlu kısıtlar
- **Döngü kusursuz olmalı:** ilk kare ile son kare aynı parlaklık ve aynı kompozisyonda olmalı. Prompt'ta "starts and ends at the same dim state, continuous loop" mutlaka belirtilmeli.
- Kamera **tamamen sabit** (tripod). Bu bir loop; kamera hareketi döngü dikişini ele verir.
- Nesne merkezde (bu sefer sol boşluk kuralı geçerli değil, kare kadraj ve metin yok).

### Teslim (ffmpeg)
```bash
# Dikiş kusurluysa 0.4 sn crossfade ile kapat:
ffmpeg -i tube_raw.mp4 -filter_complex \
  "[0:v]split[a][b];[a]trim=0:5.6,setpts=PTS-STARTPTS[main];\
   [b]trim=5.6:6.0,setpts=PTS-STARTPTS[tail];\
   [main][tail]xfade=transition=fade:duration=0.4:offset=5.2" \
  -an -c:v libx264 -crf 23 -pix_fmt yuv420p loop_fixed.mp4

# Web teslim (iki format, mobil veri için küçük)
ffmpeg -i loop_fixed.mp4 -vf "scale=640:640" -c:v libx264 -crf 26 -preset slow \
       -pix_fmt yuv420p -an -movflags +faststart public/videos/analyzing.mp4
ffmpeg -i loop_fixed.mp4 -vf "scale=640:640" -c:v libvpx-vp9 -crf 34 -b:v 0 \
       -an public/videos/analyzing.webm
```
Hedef boyut: **< 700 KB.** (Bu dosya her arama başlangıcında yüklenecek.)

---

## P1-1 · ÖZELLİKLER BÖLÜMÜ — "Pedalboard Assembly"
| | |
|---|---|
| Gider | `public/videos/pedalboard.mp4` (+ `.webm`) |
| Kod | `app/page.tsx` S3 FEATURES — bölümün sağ tarafında maskeli video katmanı |
| Süre | **5.0 saniye, scroll'a bağlı** (bölüm görünürken ileri, yukarı scroll'da geri) |
| En-boy | 16:9, 1920×1080 |
| Öncelik | P1 |

### Neden
S3 şu an sadece metin listesi ("efekt zinciri", "sinyal sırası" vs.) — sayfanın en zayıf bölümü. Uygulamanın çıktısı zaten bir pedal/efekt sıralaması; onu göstermek en doğrudan ürün kanıtı.

### Yaratıcı konsept
Üstten (top-down, %100 dik kuş bakışı) boş bir pedalboard. Pedallar **teker teker, sinyal sırasına göre** kadraja girip yerine oturuyor: tuner → overdrive → distortion → modülasyon → delay → reverb. Her pedal yerine otururken kasası hafif "tık" yapıp sabitleniyor ve LED'i amber yanıyor. Son 1 saniyede kablolar pedallar arasında **kendi kendine** kıvrılarak bağlanıyor ve zincir boyunca amber bir nabız soldan sağa geçiyor.

### Zorunlu kısıtlar
- Kamera tamamen sabit, dik tepeden. Perspektif kayması yok.
- Pedal yüzeylerinde **yazı/marka yok** — sade metal kasa, tek knob, tek LED. (AI yazıyı bozar, ayrıca marka hakkı sorunu.)
- LED'ler amber/altın. Kırmızı LED sadece son pedalda kabul.
- Hareket kademeli ve düzenli; her pedal ~0.7 sn.

### Teslim
P0-2 ile aynı all-keyframe encode (scrub edilecek), 1280px, hedef **< 3 MB**.

---

## P1-2 · CTA BÖLÜMÜ — "Speaker Breathing"
| | |
|---|---|
| Gider | `public/videos/cta-loop.mp4` (+ `.webm`) |
| Kod | `app/page.tsx` S6 CTA — arka plan katmanı, üzerinde `#08080A` %55 opaklıkta örtü |
| Süre | **5.0 saniye, kusursuz döngü** |
| En-boy | 16:9, 1920×1080 |
| Öncelik | P1 |

### Neden
"Try It Free" butonunun arkası şu an durağan. Fiziksel olarak hareket eden bir hoparlör konisi, sayfanın en alt CTA'sına ivme katar; ayrıca ses/hareket ilişkisini metin kullanmadan anlatır.

### Yaratıcı konsept
12" hoparlör konisinin ekstrem makro çekimi, hafif eğik açı, sığ alan derinliği. Koni ağır bir riff temposunda **yavaş nefes alıyor** (saniyede yaklaşık 1 vuruş, ağır ve tembel). Her vuruşta koni kâğıdının dokusundan ince toz zerreleri havaya kalkıp amber ışıkta parlıyor. Kenarda kor kırmızısı bir hâle, kadrajın büyük kısmı karanlık.

### Zorunlu kısıtlar
- Vuruş temposu **düzenli** olmalı ki döngü dikişi belli olmasın; ilk ve son kare koninin aynı (dinlenme) pozisyonunda olsun.
- Metin bu videonun üstüne biniyor: kontrast düşük, detay yumuşak olsun; keskin/parlak alan kadrajın **sağ alt** çeyreğinde toplansın.
- Kamera sabit veya çok yavaş tek yönlü drift (maks. %3 kayma).

### Teslim
Loop encode (P0-3 ile aynı mantık), 1280×720, hedef **< 900 KB**.

---

## P2 · PAZARLAMA KLİBİ — "60 Seconds to Your Tone" (dikey)
| | |
|---|---|
| Gider | Site içi değil: TikTok/Reels/Shorts reklamı + `public/og-video.mp4` |
| Süre | **15 saniye** (3×5 sn parça olarak üretilip birleştirilir) |
| En-boy | **9:16, 1080×1920** |
| Öncelik | P2 |

### Neden
TikTok pikseli `app/layout.tsx` içinde zaten kurulu ama kreatif yok. Reklam kreatifi olmadan piksel işe yaramıyor.

### Yaratıcı konsept (3 parça)
1. **0–5 sn — Problem.** Karanlık bir yatak odası prova köşesi; birinin elleri amfi knob'larını umutsuzca çeviriyor, her seferinde biraz daha. Yüz görünmüyor. Işık soğuk ve donuk (amber ama kısık).
2. **5–10 sn — Dönüşüm.** Knob'lar tek tek kendiliğinden doğru değerlere dönüyor, her doğru değerde altın bir tık ışığı. Odanın ışığı ısınıyor.
3. **10–15 sn — Sonuç.** Kamera geri çekiliyor: amfi tam ışığında, hoparlör titreşiyor, oda amber–kor rengine boğulmuş, gitarist silüeti çalıyor.

### Zorunlu kısıtlar
- Dikey kadraj; aksiyon merkezî %60'ta kalmalı (üst/alt platform UI'ı kırpar).
- İlk 1 saniye görsel olarak en güçlü an olmalı (hook).
- Yüz yok, silüet serbest.

---

## ÜRETİM SIRASI (önerilen)
1. **P0-1 Master Scroll** — her şeyin görünümünü bu belirliyor. Onaylanmadan diğerlerini üretme; renk/ışık dilini bu klipten sabitle.
2. **P0-3 Tube Warm-Up** — en kolay, en yüksek UX getirisi.
3. **P0-2 Deconstruction**
4. **P1-1 Pedalboard**, **P1-2 Speaker**
5. **P2 Dikey reklam klibi**

## PROMPT YAZACAK KİŞİYE NOT
Her prompt'ta şunlar açıkça geçmeli, yoksa Seedance kendi varsayılanına kayar:
`one continuous shot, no cuts` · `constant camera speed` · `static/locked camera` (loop olanlarda) · `low-key lighting, amber and ember-red only, no blue no purple no teal` · `no text, no logos, no UI` · `macro / extreme close-up` · `24fps, cinematic, shallow depth of field, subtle film grain` · loop olanlarda `first and last frame identical, seamless loop` · süre etiketi (5s / 10s).
Negatif prompt alanı varsa: `text, watermark, logo, letters, numbers, human face, blue light, purple light, neon, hologram, HUD, camera shake, cuts, zoom, oversaturated`.
