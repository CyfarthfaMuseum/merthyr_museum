import type { SidebarCounts } from '../types'
import { GreenButton } from './ui/Buttons'

type Props = {
  userEmail: string
  counts: SidebarCounts
}

export default function Sidebar({ userEmail, counts }: Props) {
  return (
    <aside className="hidden w-[420px] shrink-0 border-r border-neutral-300 xl:flex xl:flex-col">
      <div className="border-b border-neutral-200 px-8 py-12">
        <div className="text-[34px] font-semibold tracking-tight text-emerald-700">
          HER·STORIES
        </div>
        <div className="mt-1 text-[14px] font-semibold uppercase leading-tight tracking-wide text-emerald-700">
          Content
          <br />
          Manager
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="border-b border-neutral-200 px-8 py-8">
          <div className="mb-6 text-[20px] font-semibold">
            Content ({counts.totalContent})
          </div>
          <GreenButton className="w-full">ADD NEW</GreenButton>
        </div>

        <div className="border-b border-neutral-200 px-8 py-6">
          <div className="text-[18px] font-semibold">Books ({counts.books})</div>

          {counts.historicalFictionBooks > 0 ? (
            <div className="mt-4 text-[15px] text-neutral-700">
              Historical Fiction ({counts.historicalFictionBooks})
            </div>
          ) : null}
        </div>

        {counts.biographies > 0 ? (
          <div className="border-b border-neutral-200 px-8 py-6">
            <div className="text-[18px] font-semibold">
              Biographies ({counts.biographies})
            </div>
          </div>
        ) : null}

        <div className="border-b border-neutral-200 px-8 py-6">
          <div className="text-[18px] font-semibold">Stories ({counts.stories})</div>
        </div>

        <div className="border-b border-neutral-200 px-8 py-6">
          <div className="text-[18px] font-semibold">
            Paintings ({counts.paintings})
          </div>
        </div>

        <div className="border-b border-neutral-200 px-8 py-6">
          <div className="text-[18px] font-semibold">
            Artefacts ({counts.artifacts})
          </div>
        </div>
      </div>

      <div className="border-t border-neutral-300 px-8 py-6">
        <div className="text-[18px] font-semibold">LOG OUT</div>
        <div className="text-[15px] text-neutral-600">{userEmail}</div>
      </div>
    </aside>
  )
}