-- Tonelify — Supabase güvenlik/bakım düzeltmeleri (2026-07)
-- Supabase Dashboard > SQL Editor'e yapıştırıp tek seferde çalıştır.
-- Uygulama tüm sorgularını service role ile attığı için bunların hiçbiri
-- mevcut akışları etkilemez; sadece dışarıdan anon key ile gelen erişimi
-- kapatır ve eksik sayaç fonksiyonunu kurar.

-- ---------------------------------------------------------------
-- 1) EKSİK: aylık match sayacı atomik fonksiyonu
-- Denetimde rpc("increment_match_usage") PGRST202 döndü, yani bu fonksiyon
-- veritabanında yok. lib/subscription.ts şu an read-modify-write fallback'ine
-- düşüyor: çalışıyor ama eşzamanlı iki match'te sayaç bir eksik sayabilir.
-- ---------------------------------------------------------------
alter table public.match_usage
    drop constraint if exists match_usage_user_month_key;
alter table public.match_usage
    add constraint match_usage_user_month_key unique (user_id, month);

create or replace function public.increment_match_usage(p_user_id text, p_month text)
returns void
language sql
security definer
set search_path = public
as $$
    insert into public.match_usage (user_id, month, match_count, updated_at)
    values (p_user_id, p_month, 1, now())
    on conflict (user_id, month)
    do update set
        match_count = match_usage.match_count + 1,
        updated_at = now();
$$;

-- security definer fonksiyonu anon'a açık kalmasın: sadece service role çağırsın.
revoke execute on function public.increment_match_usage(text, text) from public, anon, authenticated;
grant execute on function public.increment_match_usage(text, text) to service_role;

-- ---------------------------------------------------------------
-- 2) gear_requests: Advisor'ın uyardığı "WITH CHECK (true)" insert policy'si
-- Form /api/gear-requests route'undan service role ile yazıyor, bu policy'ye
-- uygulamanın ihtiyacı yok. Kaldırınca Advisor uyarısı da kapanır.
-- (Denetimde anon insert zaten 42501 ile reddedildi — policy muhtemelen
--  sadece authenticated role'e bağlı; yine de gereksiz yüzeyi kaldırıyoruz.)
-- ---------------------------------------------------------------
drop policy if exists "Users can create requests" on public.gear_requests;

-- ---------------------------------------------------------------
-- 3) KONTROL SORGULARI — çalıştırıp çıktıyı bana gösterebilirsin
-- ---------------------------------------------------------------

-- 3a) profiles'a bağlı foreign key'ler duruyor mu?
-- Duruyorsa: hiç tone kaydetmemiş girişli bir kullanıcı ekipman eklemeye veya
-- gear request göndermeye çalıştığında FK ihlali alır (profiles satırı yalnızca
-- app/api/save-tone/route.ts içinde oluşuyor, Clerk sign-up webhook'u yok).
select conname, conrelid::regclass as tablo
from pg_constraint
where confrelid = 'public.profiles'::regclass and contype = 'f';

-- 3b) Kalan tüm policy'ler
select schemaname, tablename, policyname, roles, cmd, qual, with_check
from pg_policies
where schemaname = 'public'
order by tablename, policyname;
