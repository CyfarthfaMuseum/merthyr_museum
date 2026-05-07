'use server'

import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/utils/supabase/admin'

export type AdminUser = {
  id: string
  email: string
  role: string
  status: string
  createdAt: string
}

export async function listAdminUsersAction(): Promise<
  { success: true; users: AdminUser[] } | { success: false; error: string }
> {
  const adminSupabase = createAdminClient()
  const { data, error } = await adminSupabase
    .from('admin_users')
    .select('id, email, role, status, created_at')
    .order('created_at', { ascending: true })

  if (error) return { success: false, error: error.message }

  return {
    success: true,
    users: (data ?? []).map((row) => ({
      id: row.id as string,
      email: row.email as string,
      role: row.role as string,
      status: row.status as string,
      createdAt: row.created_at as string,
    })),
  }
}

export async function inviteAdminUserAction(
  email: string,
  role: string
): Promise<{ success: true; user: AdminUser } | { success: false; error: string }> {
  const adminSupabase = createAdminClient()

  const { data: existing } = await adminSupabase
    .from('admin_users')
    .select('id')
    .eq('email', email)
    .maybeSingle()

  if (existing) {
    return { success: false, error: 'A user with this email already exists.' }
  }

  const { data: inviteData, error: inviteError } = await adminSupabase.auth.admin.inviteUserByEmail(
    email,
    {
      data: { role },
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL ?? ''}/login`,
    }
  )

  if (inviteError) return { success: false, error: inviteError.message }

  const { error: insertError } = await adminSupabase.from('admin_users').upsert(
    {
      id: inviteData.user.id,
      email,
      role,
      status: 'invited',
    },
    { onConflict: 'id' }
  )

  if (insertError) return { success: false, error: insertError.message }

  revalidatePath('/overview')

  return {
    success: true,
    user: {
      id: inviteData.user.id,
      email,
      role,
      status: 'invited',
      createdAt: new Date().toISOString(),
    },
  }
}

export async function updateAdminUserRoleAction(
  userId: string,
  role: string
): Promise<{ success: boolean; error?: string }> {
  const adminSupabase = createAdminClient()

  const { error } = await adminSupabase
    .from('admin_users')
    .update({ role, updated_at: new Date().toISOString() })
    .eq('id', userId)

  if (error) return { success: false, error: error.message }

  revalidatePath('/overview')
  return { success: true }
}

export async function deleteAdminUserAction(
  userId: string
): Promise<{ success: boolean; error?: string }> {
  const adminSupabase = createAdminClient()

  const { error: deleteError } = await adminSupabase
    .from('admin_users')
    .delete()
    .eq('id', userId)

  if (deleteError) return { success: false, error: deleteError.message }

  const { error: authError } = await adminSupabase.auth.admin.deleteUser(userId)
  if (authError) return { success: false, error: authError.message }

  revalidatePath('/overview')
  return { success: true }
}
