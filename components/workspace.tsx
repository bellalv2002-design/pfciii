"use client"

import { useMemo, useState } from "react"
import { CalendarDays, Check, Copy, Sparkles, Star, Users } from "lucide-react"
import AvailabilityGrid from "@/components/availability-grid"
import SuggestionsList from "@/components/suggestions-list"
import { getSuggestions, type AvailabilityState } from "@/lib/matching"
import { setAvailability, setSubmitted, useGroup, type Session } from "@/lib/storage"

type Tab = "availability" | "suggestions"

export default function Workspace({
  session,
  onMissing,
}: {
  session: Session
  onMissing: () => void
}) {
  const group = useGroup(session.code)
  const [tab, setTab] = useState<Tab>("availability")
  const [copied, setCopied] = useState(false)

  const me = group?.members.find((m) => m.id === session.memberId) ?? null

  const suggestions = useMemo(
    () => (group ? getSuggestions(group.members, 5) : null),
    [group],
  )

  const suggestedKeys = useMemo(() => {
    if (!suggestions) return new Set<string>()
    const source = suggestions.hasFullMatch ? suggestions.fullMatches : suggestions.top
    return new Set(source.map((b) => b.key))
  }, [suggestions])

  if (group === null || !me) {
    return (
      <section className="mx-auto w-full max-w-md px-4 py-16 text-center">
        <p className="text-sm text-[#1F2430]/60">
          No pudimos encontrar tu grupo en este dispositivo.
        </p>
        <button
          type="button"
          onClick={onMissing}
          className="mt-4 inline-flex h-10 items-center justify-center rounded-xl bg-[#4F63D2] px-5 text-sm font-medium text-white"
        >
          Volver al inicio
        </button>
      </section>
    )
  }

  function toggle(key: string, next: AvailabilityState) {
    setAvailability(session.code, session.memberId, key, next)
  }

  async function copyCode() {
    try {
      await navigator.clipboard.writeText(group!.code)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1800)
    } catch {
      setCopied(false)
    }
  }

  const respondedCount = group.members.filter((m) => m.submitted).length
  const totalCount = group.members.length

  return (
    <section className="mx-auto w-full max-w-3xl px-4 py-6 sm:py-8">
      {/* Group summary */}
      <div className="rounded-2xl border border-black/5 bg-white p-5 shadow-sm shadow-black/[0.03]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-[#1F2430]/45">
              Grupo
            </p>
            <h1 className="text-2xl font-semibold tracking-tight text-[#1F2430]">
              {group.name}
            </h1>
          </div>
          <button
            type="button"
            onClick={copyCode}
            className="inline-flex items-center gap-2 rounded-lg border border-black/10 bg-[#F7F8FA] px-3 py-1.5 font-mono text-sm font-medium tracking-widest text-[#4F63D2] transition-colors hover:bg-black/[0.03]"
            title="Copiar código del grupo"
          >
            {copied ? (
              <Check className="size-4 text-[#2FBF71]" aria-hidden="true" />
            ) : (
              <Copy className="size-4" aria-hidden="true" />
            )}
            {group.code}
          </button>
        </div>

        <div className="mt-4 flex items-center gap-2 text-sm text-[#1F2430]/70">
          <Users className="size-4 text-[#4F63D2]" aria-hidden="true" />
          <span>
            <span className="font-semibold text-[#1F2430]">{respondedCount}</span> de{" "}
            <span className="font-semibold text-[#1F2430]">{totalCount}</span>{" "}
            integrante{totalCount === 1 ? "" : "s"} ya respondieron
          </span>
        </div>
        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-black/[0.06]">
          <div
            className="h-full rounded-full bg-[#4F63D2] transition-all"
            style={{ width: `${totalCount ? (respondedCount / totalCount) * 100 : 0}%` }}
          />
        </div>

        <ul className="mt-4 flex flex-wrap gap-2">
          {group.members.map((member) => (
            <li
              key={member.id}
              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm ${
                member.submitted
                  ? "border-[#2FBF71]/30 bg-[#2FBF71]/[0.08] text-[#1F2430]"
                  : "border-black/10 bg-[#F7F8FA] text-[#1F2430]/70"
              }`}
            >
              {member.submitted ? (
                <Check className="size-3.5 text-[#2FBF71]" aria-hidden="true" />
              ) : (
                <span className="size-1.5 rounded-full bg-[#1F2430]/30" aria-hidden="true" />
              )}
              <span className="font-medium">
                {member.name}
                {member.id === session.memberId ? " (tú)" : ""}
              </span>
              {member.isDemo ? (
                <span className="rounded bg-[#F5B942]/20 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[#B77900]">
                  demo
                </span>
              ) : null}
            </li>
          ))}
        </ul>
      </div>

      {/* Tabs */}
      <div className="mt-5 grid grid-cols-2 gap-1 rounded-xl border border-black/5 bg-white p-1 shadow-sm shadow-black/[0.02]">
        <TabButton active={tab === "availability"} onClick={() => setTab("availability")}>
          <CalendarDays className="size-4" aria-hidden="true" />
          Mi disponibilidad
        </TabButton>
        <TabButton active={tab === "suggestions"} onClick={() => setTab("suggestions")}>
          <Sparkles className="size-4" aria-hidden="true" />
          Sugerencias
        </TabButton>
      </div>

      <div className="mt-5">
        {tab === "availability" ? (
          <div className="rounded-2xl border border-black/5 bg-white p-4 shadow-sm shadow-black/[0.03] sm:p-5">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-medium text-[#1F2430]">Marca tu disponibilidad</h2>
                <p className="text-sm text-[#1F2430]/60">
                  Toca cada bloque para cambiar su estado.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSubmitted(session.code, session.memberId, !me.submitted)}
                className={`inline-flex h-10 items-center justify-center gap-2 rounded-xl px-4 text-sm font-medium transition-all active:translate-y-px ${
                  me.submitted
                    ? "border border-[#2FBF71]/40 bg-[#2FBF71]/10 text-[#2FBF71]"
                    : "bg-gradient-to-r from-[#4F63D2] to-[#6C7CE8] text-white shadow-sm shadow-[#4F63D2]/25 hover:brightness-105"
                }`}
              >
                {me.submitted ? (
                  <>
                    <Check className="size-4" aria-hidden="true" />
                    Disponibilidad guardada
                  </>
                ) : (
                  "Guardar disponibilidad"
                )}
              </button>
            </div>

            <Legend />

            <div className="mt-4">
              <AvailabilityGrid
                availability={me.availability}
                onToggle={toggle}
                suggestedKeys={suggestedKeys}
              />
            </div>

            <p className="mt-3 text-xs text-[#1F2430]/50">
              El contorno verde marca los bloques sugeridos para todo el grupo.
            </p>
          </div>
        ) : (
          <SuggestionsList members={group.members} />
        )}
      </div>
    </section>
  )
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex h-10 items-center justify-center gap-2 rounded-lg text-sm font-medium transition-colors ${
        active ? "bg-[#4F63D2] text-white" : "text-[#1F2430]/60 hover:bg-black/[0.03]"
      }`}
    >
      {children}
    </button>
  )
}

function Legend() {
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-[#1F2430]/60">
      <span className="inline-flex items-center gap-1.5">
        <span className="size-3.5 rounded border border-black/10 bg-[#F7F8FA]" aria-hidden="true" />
        No disponible
      </span>
      <span className="inline-flex items-center gap-1.5">
        <span className="size-3.5 rounded bg-[#B7E4C7]" aria-hidden="true" />
        Disponible
      </span>
      <span className="inline-flex items-center gap-1.5">
        <span className="flex size-3.5 items-center justify-center rounded bg-[#F5B942]">
          <Star className="size-2.5 fill-current text-[#1F2430]" aria-hidden="true" />
        </span>
        Preferencia alta
      </span>
    </div>
  )
}
