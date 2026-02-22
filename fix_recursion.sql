-- 1. Create a secure function to check for super admin status that bypasses RLS
create or replace function public.is_super_admin()
returns boolean as $$
begin
  return exists (
    select 1 from public.admin_users
    where id = auth.uid() and role = 'SUPER_ADMIN'
  );
end;
$$ language plpgsql security definer;

-- 2. Drop the existing recursive policy
drop policy if exists "Super Admins can view all admins" on public.admin_users;

-- 3. Recreate the policy using the security definer function
create policy "Super Admins can view all admins" on public.admin_users
    for select using (public.is_super_admin());
