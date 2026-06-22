'use client'

import { useState, useTransition } from 'react'
import { Trash2 } from 'lucide-react'
import type { SidebarLocation } from '../types'
import { deleteLocationAction } from '../image-actions'
import Modal from './ui/Modal'
import Toast from './ui/Toast'
import { BlackButton } from './ui/Buttons'

type Props = {
  initialLocations: SidebarLocation[]
  onLocationDeleted?: (locationId: string) => void
}

export default function LocationsPanel({ initialLocations, onLocationDeleted }: Props) {
  const [locations, setLocations] = useState<SidebarLocation[]>(initialLocations)
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null)
  const [toastOpen, setToastOpen] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const [toastTone, setToastTone] = useState<'success' | 'error'>('success')
  const [isDeleting, startDeleteTransition] = useTransition()

  function showToast(message: string, tone: 'success' | 'error') {
    setToastMessage(message)
    setToastTone(tone)
    setToastOpen(true)
    setTimeout(() => setToastOpen(false), 3000)
  }

  function handleConfirmDelete() {
    if (!deleteTargetId) return
    const idToDelete = deleteTargetId
    setDeleteTargetId(null)

    startDeleteTransition(async () => {
      const result = await deleteLocationAction({ locationId: idToDelete })
      if (!result.success) {
        showToast(result.error ?? 'Failed to delete location.', 'error')
        return
      }
      setLocations((current) => current.filter((l) => l.id !== idToDelete))
      onLocationDeleted?.(idToDelete)
      showToast('Location deleted.', 'success')
    })
  }

  const deleteTarget = locations.find((l) => l.id === deleteTargetId)

  return (
    <div className="mx-auto max-w-[920px] space-y-10">
      <div className="flex items-center gap-3">
        <img src="/location-icon.svg" alt="" className="h-[24px] w-[24px]" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
        <h1 className="text-[22px] font-semibold">Locations ({locations.length})</h1>
      </div>

      <section className="space-y-4">
        <div className="divide-y divide-neutral-200 rounded-xl border border-neutral-200">
          {locations.length === 0 ? (
            <p className="px-6 py-4 text-[15px] text-neutral-500">No locations found.</p>
          ) : (
            locations.map((loc) => (
              <div key={loc.id} className="flex items-center gap-4 px-6 py-4">
                <div className="flex-1 min-w-0">
                  <p className="truncate text-[15px] text-neutral-800">{loc.address}</p>
                  <p className="text-[13px] text-neutral-500">
                    {loc.lat.toFixed(6)}, {loc.lng.toFixed(6)}
                    {loc.isAssigned ? (
                      <span className="ml-3 inline-block rounded-full bg-emerald-100 px-2 py-0.5 text-[12px] font-medium text-emerald-700">
                        Assigned
                      </span>
                    ) : (
                      <span className="ml-3 inline-block rounded-full bg-neutral-100 px-2 py-0.5 text-[12px] font-medium text-neutral-500">
                        Unassigned
                      </span>
                    )}
                  </p>
                </div>

                {!loc.isAssigned ? (
                  <button
                    type="button"
                    aria-label={`Delete ${loc.address}`}
                    disabled={isDeleting}
                    className="shrink-0 text-neutral-400 transition hover:text-red-600 disabled:opacity-50"
                    onClick={() => setDeleteTargetId(loc.id)}
                  >
                    <Trash2 size={18} />
                  </button>
                ) : (
                  <div className="w-[18px] shrink-0" />
                )}
              </div>
            ))
          )}
        </div>
      </section>

      <Modal
        open={!!deleteTargetId}
        title="Delete Location"
        onClose={() => setDeleteTargetId(null)}
      >
        <p className="text-[15px] text-neutral-700">
          Are you sure you want to delete{' '}
          <span className="font-semibold">{deleteTarget?.address ?? 'this location'}</span>?
          This cannot be undone.
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <BlackButton
            className="bg-white text-neutral-900 hover:bg-neutral-100"
            onClick={() => setDeleteTargetId(null)}
          >
            CANCEL
          </BlackButton>
          <BlackButton
            className="bg-red-600 hover:bg-red-700"
            onClick={handleConfirmDelete}
            disabled={isDeleting}
          >
            {isDeleting ? 'DELETING…' : 'DELETE'}
          </BlackButton>
        </div>
      </Modal>

      <Toast open={toastOpen} message={toastMessage} tone={toastTone} />
    </div>
  )
}
