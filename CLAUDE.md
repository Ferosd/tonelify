# TONELIFY REDESIGN

## Palet Güncellemesi (2026-07)
- Mor (#9B5DE5) tamamen kaldırıldı; ikincil vurgu artık kor kırmızısı: #D14B32
- Gradyanlar amber→kor: linear-gradient(135deg, #E8712A 0%, #D14B32 100%)
- Koyu ara-section zeminleri sıcak tonlara çekildi: #100D0B / #1A100C
- İkincil metin kontrastı yükseltildi: #A6A6AF (landing) / #A6A29B (app token)
- Yeşil/emerald vurgular amber ailesine dönüştürüldü (#F5A623 / #FFD700)
- Wordmark her yerde Fraunces 700, #F5A623

## Marka Kimliği
- Fraunces başlıklar, SOFT/WONK eksenleri sabitlenmiş
  (https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght,SOFT,WONK@9..144,500..700,100,1&display=swap)
- Satoshi body ve tüm UI metni (https://api.fontshare.com/v2/css?f[]=satoshi@400,500,600,700&display=swap)
- JetBrains Mono teknik değerler
- Not: Satoshi Fontshare'de, Fraunces Google Fonts'ta. Karıştırma, yanlış kaynaktan
  istenen font 404 verir ve sayfa sistem fontuna düşer.
- Ana vurgu: Amber/altın (#F5A623)
- Parlak vurgu: #FFD700
- Arka plan: #08080A (void), #0D0D10 (primary), #141418 (elevated), #1A1A20 (surface)
- Metin: #F2F2F7 (primary), #8E8E93 (secondary)
- Glassmorphism kartlar: backdrop-filter blur(20px), border rgba(255,255,255,0.08)
- Grain overlay opacity 0.03
- CTA gradient: linear-gradient(135deg, #F5A623 0%, #FF6B35 50%, #E8912D 100%)
- Glow efekti: rgba(245, 166, 35, 0.15)

## Tipografi (2026-08 güncellemesi)
- Hero başlık: Fraunces 700, clamp(2.6rem, 5.5vw, 5.25rem), line-height 1.0, letter-spacing -0.015em
- Section başlık: Fraunces 600/700, line-height 1.1, letter-spacing -0.01em
- Body: Satoshi 400, 1.0625rem, line-height 1.65, color #A6A6AF
- Label/üst başlık: Satoshi 500, 0.8125rem, uppercase, letter-spacing 0.08em, color #F5A623
- Amp değerleri: JetBrains Mono 500, color #FFD700
- Fraunces serif olduğu için eski sans'a göre belirgin geniş set eder. Yeni bir
  başlık eklerken punto ve letter-spacing'i satır kırılmasına göre doğrula.

## Butonlar
- Primary: gradient arka plan, color #08080A, border-radius 12px, padding 14px 32px
- Hover: translateY(-2px), box-shadow 0 8px 32px rgba(245,166,35,0.3)
- Ghost: transparent bg, border 1px solid rgba(255,255,255,0.06), backdrop-filter blur(12px)

## Yasaklar
- transition-all kullanma, spesifik property belirt
- Inter, Inter Tight, Space Grotesk, Roboto, Arial, system font kullanma
- Kullanıcıya görünen metinde em dash (—) ve en dash (–) kullanma. Cümleyi
  virgülle, iki nokta ile ya da ayrı cümleyle kur.
- Teal, yeşil, mavi, mor vurgu rengi kullanma
- Lorem ipsum kullanma
- AI buzzword kullanma (leverage, seamlessly, cutting-edge)
- Purple-to-blue gradient kullanma

## Dokunulmayacak Dosyalar
- app/api/ klasörünün tamamı
- lib/stripe.ts
- lib/supabase.ts
- middleware.ts
- Clerk auth yapısı
- S3 AI ENGINE section in page.tsx (contains reference to /video.mp4; do not modify)
- public/frames/ klasörü (frame'leri silme veya taşıma)

## Materyaller
- public/videos/assembly.mp4 (gitar birleşme, 5sn)
- public/videos/deconstruct.mp4 (gitar bölünme, 5sn)
- public/images/guitar-hero.jpg (bütün gitar)
- public/images/guitar-exploded.jpg (parçalanmış gitar)
- public/images/amp-knobs.jpg (amfi close-up)
- public/images/guitar-amp-combo.jpg (gitar + amfi)
- public/frames/ klasörü: frame_0001.jpg → frame_0241.jpg (241 kare, kadın gitarist, amber→kırmızı renk geçişi, Kling 3.0 videodan extract edildi)
- public/video.mp4: ham Kling videosu (10sn, 24fps, 1928x1072)

## Sayfa Yapısı (app/page.tsx)
- Section 1 HERO: canvas frame scrubbing (public/frames/, 241 kare), başlık "Stop Guessing. Start Playing.", CTA "Start Matching Tones", arka plan amber profil → kırmızı tam vücut gitar geçişi
- Section 2 NASIL ÇALIŞIR: guitar-hero.jpg sabit, 3 adım metni
- Section 3 AI TEKNOLOJİSİ: deconstruct.mp4 scroll-synced, "AI analyzes every detail of your tone"
- Section 4 AMP AYARLARI: amp-knobs.jpg, JetBrains Mono ile GAIN: 7.5 BASS: 5.0 vs değerler
- Section 5 CTA: guitar-amp-combo.jpg arka plan, "Try It Free"
- Section 6 FİYATLANDIRMA: glassmorphism kartlar, Beginner vs Expert
- Section 7 FOOTER: guitar-exploded.jpg opacity 0.15 dekor

## Scroll Video Tekniği
- S1 HERO: canvas tabanlı frame scrubbing kullanır (assembly.mp4 kaldırıldı)
  - heroVideoRef kaldırıldı; heroCanvasRef, heroFramesRef, heroFrameIdxRef eklendi
  - object-fit:cover mantığı canvas'a drawCoverFrame() fonksiyonu ile uygulanır
  - 241 kare sayfa yüklenirken preload edilir
  - Aktif kare: ScrollTrigger progress * 240 olarak hesaplanır
- S3 AI ENGINE: video.currentTime = scrollProgress * video.duration (değiştirilmedi)
- Sticky container 100vh
- IntersectionObserver ile lazy load
