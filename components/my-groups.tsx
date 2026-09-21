"use client"

import { ArrowLeft, ArrowRight, CalendarClock, Users } from "lucide-react"
import { forgetMembership, useMemberships, type Session } from "@/lib/storage"

export default function MyGroups({
  onBack,
  onOpen,
}: {
  onBack: () => void
  onOpen: (session: Session) => void
}) {
  const memberships = useMemberships()

  return (
    <section className="mx-auto w-full max-w-4xl px-4 py-8">
      <button
        type="button"
        onClick={onBack}
        className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-[#1F2430]/60 transition-colors hover:text-[#1F2430]"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        Volver
      </button>

      <div className="mb-6 flex items-center gap-3">
        <span className="flex size-9 items-center justify-center rounded-xl bg-[#4F63D2]/10 text-[#4F63D2]">
          <Users className="size-5" aria-hidden="true" />
        </span>
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-[#1F2430]">Mis grupos</h1>
          <p className="text-sm text-[#1F2430]/60">
            {memberships.length === 0
              ? "Todavía no perteneces a ningún grupo."
              : `Perteneces a ${memberships.length} ${memberships.length === 1 ? "grupo" : "grupos"}.`}
          </p>
        </div>
      </div>

      {memberships.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-black/10 bg-white/50 px-6 py-12 text-center">
          <p className="text-sm text-[#1F2430]/60">
            Crea un grupo o únete a uno con un código para verlo aquí.
          </p>
        </div>
      ) : (
        <ul className="flex flex-col gap-3">
          {memberships.map((m) => (
            <li key={m.code}>
              <div className="flex items-center justify-between gap-3 rounded-2xl border border-black/5 bg-white px-4 py-3.5 shadow-sm">
                <button
                  type="button"
                  onClick={() => onOpen({ code: m.code, memberId: m.memberId })}
                  className="flex min-w-0 flex-1 items-center gap-3 text-left"
                >
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#4F63D2]/10 text-[#4F63D2]">
                    <CalendarClock className="size-5" aria-hidden="true" />
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate font-medium text-[#1F2430]">{m.groupName}</span>
                    <span className="block font-mono text-xs tracking-wider text-[#1F2430]/50">
                      {m.code}
                    </span>
                  </span>
                </button>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => forgetMembership(m.code)}
                    className="rounded-lg px-2.5 py-1.5 text-xs font-medium text-[#1F2430]/50 transition-colors hover:bg-black/5 hover:text-[#1F2430]"
                  >
                    Quitar
                  </button>
                  <button
                    type="button"
                    onClick={() => onOpen({ code: m.code, memberId: m.memberId })}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-[#4F63D2] px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-[#4457bd]"
                  >
                    Abrir
                    <ArrowRight className="size-4" aria-hidden="true" />
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
