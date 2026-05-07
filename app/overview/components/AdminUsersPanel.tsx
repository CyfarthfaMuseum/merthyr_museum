'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Pencil, Trash2 } from 'lucide-react'
import type { AdminUser } from '../admin-users-actions'
import {
  inviteAdminUserAction,
  updateAdminUserRoleAction,
  deleteAdminUserAction,
} from '../admin-users-actions'
import { createClient } from '@/utils/supabase/client'
import Input from './ui/Input'
import { BlackButton } from './ui/Buttons'
import Modal from './ui/Modal'
import Toast from './ui/Toast'

const ROLE_OPTIONS = [
  { value: 'admin', label: 'Admin' },
  { value: 'editor', label: 'Editor' },
]

function roleLabel(role: string) {
  return ROLE_OPTIONS.find((r) => r.value === role)?.label ?? role
}

type Props = {
  initialUsers: AdminUser[]
  currentUserId: string
}

export default function AdminUsersPanel({ initialUsers, currentUserId }: Props) {
  const router = useRouter()
  const [users, setUsers] = useState<AdminUser[]>(initialUsers)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState('admin')
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null)
  const [lastUserModalOpen, setLastUserModalOpen] = useState(false)
  const [toastOpen, setToastOpen] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const [toastTone, setToastTone] = useState<'success' | 'error'>('success')
  const [isInviting, startInviteTransition] = useTransition()
  const [isDeleting, startDeleteTransition] = useTransition()
  const [updatingRoleId, setUpdatingRoleId] = useState<string | null>(null)

  function showToast(message: string, tone: 'success' | 'error') {
    setToastMessage(message)
    setToastTone(tone)
    setToastOpen(true)
    setTimeout(() => setToastOpen(false), 3000)
  }

  function handleInvite() {
    const email = inviteEmail.trim()
    if (!email) {
      showToast('Please enter an email address.', 'error')
      return
    }

    startInviteTransition(async () => {
      const result = await inviteAdminUserAction(email, inviteRole)
      if (!result.success) {
        showToast(result.error ?? 'Failed to send invitation.', 'error')
        return
      }
      setUsers((current) => [...current, result.user])
      setInviteEmail('')
      showToast('Invitation sent successfully.', 'success')
    })
  }

  function handleRoleChange(userId: string, newRole: string) {
    setUpdatingRoleId(userId)
    // optimistically update
    setUsers((current) =>
      current.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
    )
    updateAdminUserRoleAction(userId, newRole).then((result) => {
      setUpdatingRoleId(null)
      if (!result.success) {
        showToast(result.error ?? 'Failed to update role.', 'error')
      }
    })
  }

  function handleDeleteClick(userId: string) {
    if (users.length <= 1) {
      setLastUserModalOpen(true)
      return
    }
    setDeleteTargetId(userId)
  }

  function handleConfirmDelete() {
    if (!deleteTargetId) return
    const idToDelete = deleteTargetId
    const isSelf = idToDelete === currentUserId
    setDeleteTargetId(null)

    startDeleteTransition(async () => {
      const result = await deleteAdminUserAction(idToDelete)
      if (!result.success) {
        showToast(result.error ?? 'Failed to delete user.', 'error')
        return
      }
      if (isSelf) {
        const supabase = createClient()
        await supabase.auth.signOut()
        router.replace('/login')
        return
      }
      setUsers((current) => current.filter((u) => u.id !== idToDelete))
      showToast('User removed.', 'success')
    })
  }

  const deleteTarget = users.find((u) => u.id === deleteTargetId)

  return (
    <div className="mx-auto max-w-[920px] space-y-10">
      <div className="flex items-center gap-3">
        <img src="/admin-icon.png" alt="" className="h-[24px] w-[24px]" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
        <h1 className="text-[22px] font-semibold">Admin Users ({users.length})</h1>
      </div>

      {/* Invite new user */}
      <section className="space-y-4">
        <h2 className="text-[18px] font-semibold">Add New User</h2>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Input
            type="email"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            placeholder="Enter Email"
            className="flex-1"
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleInvite()
            }}
          />
          <select
            value={inviteRole}
            onChange={(e) => setInviteRole(e.target.value)}
            className="h-12 rounded-xl border border-neutral-300 bg-white px-4 text-[16px] text-neutral-800 outline-none transition focus:border-neutral-500 sm:w-40"
          >
            {ROLE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <BlackButton onClick={handleInvite} disabled={isInviting} className="sm:w-auto">
            {isInviting ? 'INVITING...' : 'INVITE USER'}
          </BlackButton>
        </div>
      </section>

      {/* User list */}
      <section className="space-y-4">
        <h2 className="text-[18px] font-semibold">Users</h2>
        <div className="divide-y divide-neutral-200 rounded-xl border border-neutral-200">
          {users.length === 0 ? (
            <p className="px-6 py-4 text-[15px] text-neutral-500">No users found.</p>
          ) : (
            users.map((user) => (
              <div
                key={user.id}
                className="flex items-center gap-4 px-6 py-4"
              >
                <span className="flex-1 truncate text-[15px] text-neutral-800">
                  {user.email}
                </span>

                <button
                  type="button"
                  aria-label={`Edit ${user.email}`}
                  className="shrink-0 text-neutral-400 transition hover:text-neutral-700"
                  onClick={() => {
                    // Focus the role select for this row
                    document.getElementById(`role-select-${user.id}`)?.focus()
                  }}
                >
                  <Pencil size={16} />
                </button>

                <select
                  id={`role-select-${user.id}`}
                  value={user.role}
                  onChange={(e) => handleRoleChange(user.id, e.target.value)}
                  disabled={updatingRoleId === user.id}
                  className="h-10 rounded-lg border border-neutral-300 bg-white px-3 text-[15px] text-neutral-800 outline-none transition focus:border-neutral-500 disabled:opacity-50"
                >
                  {ROLE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>

                <button
                  type="button"
                  aria-label={`Delete ${user.email}`}
                  disabled={isDeleting}
                  onClick={() => handleDeleteClick(user.id)}
                  className="shrink-0 text-neutral-400 transition hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-30"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))
          )}
        </div>
      </section>

      <Toast open={toastOpen} message={toastMessage} tone={toastTone} />

      <Modal
        open={deleteTargetId !== null}
        title="Remove user"
        onClose={() => setDeleteTargetId(null)}
      >
        <p className="text-neutral-700">
          Are you sure you want to remove{' '}
          <span className="font-semibold">{deleteTarget?.email}</span>?{' '}
          {deleteTarget?.id === currentUserId
            ? 'This will remove your own account and sign you out immediately.'
            : 'This action cannot be undone.'}
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <BlackButton onClick={() => setDeleteTargetId(null)}>CANCEL</BlackButton>
          <BlackButton
            className="bg-red-600 hover:bg-red-700"
            onClick={handleConfirmDelete}
            disabled={isDeleting}
          >
            {isDeleting ? 'REMOVING...' : 'CONFIRM REMOVE'}
          </BlackButton>
        </div>
      </Modal>

      <Modal
        open={lastUserModalOpen}
        title="Cannot remove user"
        onClose={() => setLastUserModalOpen(false)}
      >
        <p className="text-neutral-700">
          There must be at least one admin user on the platform. Add another user before removing this one.
        </p>
        <div className="mt-6 flex justify-end">
          <BlackButton onClick={() => setLastUserModalOpen(false)}>OK</BlackButton>
        </div>
      </Modal>
    </div>
  )
}
