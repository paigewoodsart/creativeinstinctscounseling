-- Creative Instincts Counseling — admin-editable site content
-- Run this once, in full, in the Supabase SQL editor for a freshly created project.
-- See SETUP.md for the rest of the one-time setup (creating the admin user,
-- filling in js/supabase-config.js).

create table if not exists public.site_content (
  id integer primary key default 1,
  bio_photo_url text,
  bio_text text,
  philosophy_text text,
  pricing_text text,
  contact_phone text,
  contact_sms text,
  contact_email text,
  updated_at timestamptz default now(),
  constraint site_content_singleton check (id = 1)
);

alter table public.site_content enable row level security;

-- Anyone (including the public site, not logged in) can read the content.
create policy "Public can read site content"
  on public.site_content for select
  to anon, authenticated
  using (true);

-- Only a logged-in admin user can change it.
create policy "Authenticated can update site content"
  on public.site_content for update
  to authenticated
  using (true)
  with check (true);

create policy "Authenticated can insert site content"
  on public.site_content for insert
  to authenticated
  with check (true);

-- Seed row matching what is live on the site today, so the first read
-- returns real content instead of nothing. bio_photo_url is left null on
-- purpose — the site falls back to the built-in Clare-headshot.webp until
-- a photo is uploaded through the admin page.
insert into public.site_content (
  id, bio_photo_url, bio_text, philosophy_text, pricing_text, contact_phone, contact_sms, contact_email
) values (
  1,
  null,
  $$Hello! I’m so glad you’re here.

I’m a Mental Health Counselor and Art Therapist with a private practice in Bellingham, Washington.

I feel privileged to say I have found my dream job, even though it was on accident.

In 2017 during a thru-hike of the PCT, a fellow hiker told me about Art Therapy. As a lifelong artist going through an existential crisis (hence hiking the PCT) I got excited about pursuing a career in Art Therapy. The following fall, I was accepted to Antioch University in Seattle, where I learned that I was in fact training to become a Licensed Mental Health Counselor in addition to an Art Therapist. I loved it immediately, and it made sense. Something clicked.

I love getting to know people and their stories, and find immense joy in seeing people uncover their true selves through our work together. I am a lover of learning, and am always taking classes or trainings, reading, and trying new things in the therapy field.

In addition to being a therapist, I am also a mother, artist, mountain biker, flower gazer, and nature lover. Originally from the Midwest, I made my way to Washington by way of Colorado 9 years ago.$$,
  $$We all deserve to feel at home and safe in our bodies and minds, and it’s my passion to help others find this place. I believe it’s the relationship between my clients and I that is most effective for healing, so it’s important that we’re a good fit. I welcome clients from all backgrounds and am passionate about creating a safe, non-judgemental environment where you feel supported and accepted as you are.

I am a strong believer that large-scale societal forces that surround us, including oppression, affect us greatly; I view clients as individuals while recognizing the larger systems we are all a part of.

I look forward to joining you on your journey!$$,
  'Appointments are 55 minutes at the rate of $160 per session. I accept United Healthcare and Premera Blue Cross insurances. For all other insurances, I can provide you with an invoice to submit for reimbursement.',
  '(360) 218-7190',
  '(360) 218-7190',
  'clare@creativeinstinctscounseling.com'
)
on conflict (id) do nothing;

-- Storage bucket for the bio photo, public read so the site can display it.
insert into storage.buckets (id, name, public)
values ('bio-photos', 'bio-photos', true)
on conflict (id) do nothing;

create policy "Public can view bio photos"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'bio-photos');

create policy "Authenticated can upload bio photos"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'bio-photos');

create policy "Authenticated can update bio photos"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'bio-photos');
