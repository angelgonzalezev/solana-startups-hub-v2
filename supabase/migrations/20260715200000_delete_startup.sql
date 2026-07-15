-- Founders can permanently delete a startup, but only once it is archived:
-- archiving is the reversible step, deletion is final, and forcing the
-- two-step flow keeps a live marketplace listing from vanishing in one click.
-- The payments ledger survives on purpose (payments.target_id carries no
-- foreign key): receipts outlive what they bought.
create or replace function public.delete_startup(startup_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  target public.startups;
begin
  delete from public.startups s
  using public.profiles p
  where s.id = startup_id
    and p.id = s.owner_profile_id
    and p.auth_user_id = auth.uid()
    and s.listing_status = 'archived'
  returning s.* into target;

  if target.id is null then
    raise exception 'Startup not found, not archived, or unauthorized';
  end if;
  return to_jsonb(target);
end;
$$;

revoke all on function public.delete_startup(uuid) from public, anon;
grant execute on function public.delete_startup(uuid) to authenticated;
