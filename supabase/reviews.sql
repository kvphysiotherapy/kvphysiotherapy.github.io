-- Run once in Supabase SQL Editor. Does not require a paid plan.
create table if not exists public.patient_reviews (
  id uuid primary key,
  visitor_id uuid not null,
  display_name text not null check (char_length(display_name) between 2 and 50),
  body text not null check (char_length(body) between 20 and 1000),
  consent boolean not null check (consent = true),
  created_at timestamptz not null default now()
);
create index if not exists patient_reviews_visitor_time on public.patient_reviews(visitor_id, created_at desc);
alter table public.patient_reviews enable row level security;
revoke all on public.patient_reviews from anon, authenticated;

create or replace function public.get_patient_reviews()
returns table(id uuid, display_name text, body text, created_at timestamptz)
language sql security definer set search_path = '' stable as $$
  select r.id, r.display_name, r.body, r.created_at from public.patient_reviews r
  order by r.created_at desc, r.id limit 200;
$$;

create or replace function public.submit_patient_review(
  p_id uuid, p_visitor uuid, p_name text, p_body text, p_consent boolean, p_website text default ''
)
returns table(id uuid, display_name text, body text, created_at timestamptz)
language plpgsql security definer set search_path = '' as $$
declare existing public.patient_reviews%rowtype;
begin
  if p_id is null or p_visitor is null or p_consent is distinct from true
    or coalesce(p_website, '') <> '' or p_name is null or p_body is null
    or char_length(btrim(p_name)) not between 2 and 50
    or char_length(btrim(p_body)) not between 20 and 1000 then
    raise exception 'Please check your review details';
  end if;
  perform pg_advisory_xact_lock(hashtextextended(p_visitor::text, 0));
  select * into existing from public.patient_reviews r where r.id = p_id;
  if found then
    if existing.visitor_id <> p_visitor or existing.display_name <> btrim(p_name) or existing.body <> btrim(p_body) then
      raise exception 'Request already exists';
    end if;
    return query select existing.id, existing.display_name, existing.body, existing.created_at;
    return;
  end if;
  if exists(select 1 from public.patient_reviews r where r.visitor_id = p_visitor and r.created_at > now() - interval '1 minute') then
    raise exception 'Please wait one minute before posting another review';
  end if;
  insert into public.patient_reviews(id, visitor_id, display_name, body, consent)
  values(p_id, p_visitor, btrim(p_name), btrim(p_body), true);
  return query select r.id, r.display_name, r.body, r.created_at from public.patient_reviews r where r.id = p_id;
end;
$$;
revoke all on function public.get_patient_reviews() from public;
revoke all on function public.submit_patient_review(uuid, uuid, text, text, boolean, text) from public;
grant execute on function public.get_patient_reviews() to anon, authenticated;
grant execute on function public.submit_patient_review(uuid, uuid, text, text, boolean, text) to anon, authenticated;
