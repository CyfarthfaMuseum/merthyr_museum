-- Align book_theme_books RLS with the authenticated admin user id.
-- The existing policies compare email addresses from auth.jwt(), which is brittle
-- when admin_users.email casing or values drift. auth.uid() is the stable key.

drop policy if exists "Admins can view book theme books" on public.book_theme_books;
drop policy if exists "Admins can update book theme books" on public.book_theme_books;
drop policy if exists "Admins can delete book theme books" on public.book_theme_books;
drop policy if exists "Admins can insert book theme books" on public.book_theme_books;

create policy "Admins can view book theme books"
on public.book_theme_books
for select
to authenticated
using (
  exists (
    select 1
    from public.admin_users au
    where au.id = auth.uid()
      and au.status = 'active'::public.admin_user_status
  )
);

create policy "Admins can update book theme books"
on public.book_theme_books
for update
to authenticated
using (
  exists (
    select 1
    from public.admin_users au
    where au.id = auth.uid()
      and au.status = 'active'::public.admin_user_status
      and au.role = any (
        array[
          'super_admin'::public.admin_role,
          'admin'::public.admin_role,
          'editor'::public.admin_role
        ]
      )
  )
)
with check (
  exists (
    select 1
    from public.admin_users au
    where au.id = auth.uid()
      and au.status = 'active'::public.admin_user_status
      and au.role = any (
        array[
          'super_admin'::public.admin_role,
          'admin'::public.admin_role,
          'editor'::public.admin_role
        ]
      )
  )
);

create policy "Admins can delete book theme books"
on public.book_theme_books
for delete
to authenticated
using (
  exists (
    select 1
    from public.admin_users au
    where au.id = auth.uid()
      and au.status = 'active'::public.admin_user_status
      and au.role = any (
        array[
          'super_admin'::public.admin_role,
          'admin'::public.admin_role,
          'editor'::public.admin_role
        ]
      )
  )
);

create policy "Admins can insert book theme books"
on public.book_theme_books
for insert
to authenticated
with check (
  exists (
    select 1
    from public.admin_users au
    where au.id = auth.uid()
      and au.status = 'active'::public.admin_user_status
      and au.role = any (
        array[
          'super_admin'::public.admin_role,
          'admin'::public.admin_role,
          'editor'::public.admin_role
        ]
      )
  )
);