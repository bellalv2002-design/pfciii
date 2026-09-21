"use client"

import { CalendarCheck } from "lucide-react"

export default function Header({
  onLeave,
}: {
  onLeave?: () => void
}) {
  return (
    <header className="sticky top-0 z-20 border-b border-black/5 bg-[#F7F8FA]/80 backdrop-blur-sm">
      <div className="mx-auto flex h-14 w-full max-w-4xl items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <span className="flex size-7 items-center justify-center rounded-lg bg-[#4F63D2] text-white">
            <CalendarCheck className="size-4" aria-hidden="true" />
          </span>
          <span className="text-lg font-semibold tracking-tight text-[#1F2430]">Quedamos</span>
        </div>
        {onLeave ? (
          <button
            type="button"
            onClick={onLeave}
            className="rounded-lg px-3 py-1.5 text-sm font-medium text-[#1F2430]/60 transition-colors hover:bg-black/5 hover:text-[#1F2430]"
          >
            Salir
          </button>
        ) : null}
      </div>
    </header>
  )
}
