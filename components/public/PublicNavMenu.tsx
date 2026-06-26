"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { publicHref, type PublicLanguage } from "@/lib/public/types"
import PublicNavPanel from "./PublicNavPanel"

type Props = {
  lang: PublicLanguage
  activePath?: string
  langSwitchHref?: string
}

export default function PublicNavMenu({ lang, activePath, langSwitchHref = "/home" }: Props) {
  const [isOpen, setIsOpen] = useState(false)
  const router = useRouter()

  function toggle() {
    setIsOpen((v) => !v)
  }

  function handleLangChange(newLang: PublicLanguage) {
    setIsOpen(false)
    router.push(publicHref(langSwitchHref, newLang))
  }

  return (
    <>
      {/* Backdrop */}
      {isOpen ? (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-neutral-950/10"
          aria-label="Close menu"
          onClick={() => setIsOpen(false)}
        />
      ) : null}

      {/* Sliding wrapper — panel + handle move together */}
      <div
        className={`fixed inset-y-0 left-0 z-50 flex items-start transition-transform duration-300 ease-out ${
          isOpen ? "translate-x-0" : "-translate-x-[min(84vw,330px)]"
        }`}
      >
        {/* Panel */}
        <div className="h-full w-[min(84vw,330px)]" aria-hidden={!isOpen} inert={!isOpen}>
          <PublicNavPanel
            lang={lang}
            activePath={activePath}
            onLangChange={handleLangChange}
          />
        </div>

        {/* Handle — rides the right edge of the panel */}
        <button
          type="button"
          onClick={toggle}
          className="flex h-10 w-10 shrink-0 items-center justify-center bg-neutral-950/45 text-white shadow-sm backdrop-blur-sm transition hover:bg-neutral-950/60"
          aria-label={isOpen ? "Close menu" : "Open menu"}
          aria-expanded={isOpen}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-5 w-5"
            aria-hidden="true"
          >
            <line
              x1="3" y1="6" x2="21" y2="6"
              style={{
                transformOrigin: "12px 6px",
                transition: "transform 0.3s cubic-bezier(0.4,0,0.2,1)",
                transform: isOpen ? "translateY(6px) rotate(-45deg) scaleX(0.65)" : "none",
              }}
            />
            <line
              x1="3" y1="12" x2="21" y2="12"
              style={{
                transformOrigin: "center",
                transition: "transform 0.3s cubic-bezier(0.4,0,0.2,1)",
                transform: isOpen ? "scaleX(0)" : "none",
              }}
            />
            <line
              x1="3" y1="18" x2="21" y2="18"
              style={{
                transformOrigin: "12px 18px",
                transition: "transform 0.3s cubic-bezier(0.4,0,0.2,1)",
                transform: isOpen ? "translateY(-6px) rotate(45deg) scaleX(0.65)" : "none",
              }}
            />
          </svg>
        </button>
      </div>
    </>
  )
}
