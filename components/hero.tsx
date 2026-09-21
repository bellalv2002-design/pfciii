"use client"

import { Plus, UserPlus, CalendarClock } from "lucide-react"

export default function Hero({
  onCreate,
  onJoin,
}: {
  onCreate: () => void
  onJoin: () => void
}) {
  return (
    <section className="mx-auto w-full max-w-4xl px-4 py-14 sm:py-20">
      <div className="mx-auto flex max-w-2xl flex-col items-center text-center">
        <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#4F63D2]/20 bg-[#4F63D2]/5 px-3 py-1 text-xs font-medium text-[#4F63D2]">
          <CalendarClock className="size-3.5" aria-hidden="true" />
          Coordina sin cadenas de mensajes
        </span>

        <h1 className="text-balance text-3xl font-semibold leading-tight tracking-tight text-[#1F2430] sm:text-4xl">
          Encuentra en segundos el horario en que todo tu grupo puede reunirse
        </h1>

        <p className="mt-4 text-pretty text-base leading-relaxed text-[#1F2430]/60 sm:text-lg">
          Cada integrante marca su disponibilidad y Quedamos calcula
          automáticamente los mejores momentos para verse. Sin apuros, con orden.
        </p>

        <div className="mt-8 flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
          <button
            type="button"
            onClick={onCreate}
            className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#4F63D2] to-[#6C7CE8] px-6 text-base font-medium text-white shadow-sm shadow-[#4F63D2]/25 transition-all hover:brightness-105 active:translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4F63D2]/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#F7F8FA]"
          >
            <Plus className="size-5" aria-hidden="true" />
            Crear grupo
          </button>
          <button
            type="button"
            onClick={onJoin}
            className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-black/10 bg-white px-6 text-base font-medium text-[#1F2430] transition-colors hover:bg-black/[0.03] active:translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4F63D2]/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#F7F8FA]"
          >
            <UserPlus className="size-5" aria-hidden="true" />
            Unirme a un grupo
          </button>
        </div>
      </div>
    </section>
  )
}
