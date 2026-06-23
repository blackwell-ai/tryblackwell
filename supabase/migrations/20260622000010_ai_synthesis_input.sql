-- Read path for the AI tag synthesizer. The marketplace schema isn't exposed to
-- the Data API, so the server route can't select an entity's freeform text via
-- supabase-js — it goes through this service-role-only RPC, which returns the
-- text to tag plus the current tag vocabulary (so the model reuses existing
-- tags). Writes go back through public.apply_ai_tags (also service-role-only).
create or replace function public.ai_synthesis_input(p_kind text, p_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = marketplace, public, pg_temp
as $$
declare v_text text; v_vocab jsonb;
begin
  if p_kind = 'reviewer' then
    select concat_ws('. ',
             nullif(r.product_interests, ''),
             nullif(array_to_string(r.niches, ', '), ''))
      into v_text
      from marketplace.reviewers r where r.id = p_id;
  elsif p_kind = 'brand' then
    select concat_ws('. ', nullif(b.product_description, ''), nullif(b.category, ''))
      into v_text
      from marketplace.brands b where b.id = p_id;
  else
    raise exception 'bad kind';
  end if;

  select coalesce(jsonb_agg(label order by usage desc, label), '[]'::jsonb) into v_vocab
  from (
    select t.label,
      (select count(*) from marketplace.reviewer_tags rt where rt.tag_id = t.id) +
      (select count(*) from marketplace.brand_tags    bt where bt.tag_id = t.id) as usage
    from marketplace.tags t
    order by usage desc, t.label
    limit 120
  ) s;

  return jsonb_build_object('text', coalesce(v_text, ''), 'vocabulary', v_vocab);
end;
$$;

revoke all on function public.ai_synthesis_input(text, uuid) from public, anon, authenticated;
grant execute on function public.ai_synthesis_input(text, uuid) to service_role;
