"use client"

import { useEffect, useMemo, useState } from "react"
import { Loader2, Sparkles, Star, Users } from "lucide-react"
import {
  formatBlockLabel,
  getSuggestions,
  type BlockScore,
  type Member,
} from "@/lib/matching"

export default function SuggestionsList({ members }: { members: Member[] }) {
  const suggestions = useMemo(() => getSuggestions(members, 5), [members])

  // Recompute "loading" feedback whenever the underlying availability changes.
  const signature = useMemo(
    () =>
      members
        .filter((m) => m.submitted)
        .map((m) => `${m.id}:${Object.entries(m.availability).sort().join(",")}`)
        .join("|"),
    [members],
  )

  const [recalculating, setRecalculating] = useState(false)
  useEffect(() => {
    setRecalculating(true)
    const t = window.setTimeout(() => setRecalculating(false), 650)
    return () => window.clearTimeout(t)
  }, [signature])

  if (recalculating) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-black/5 bg-white p-10 text-center shadow-sm shadow-black/[0.03]">
        <Loader2 className="size-6 animate-spin text-[#4F63D2]" aria-hidden="true" />
        <p className="text-sm font-medium text-[#1F2430]/70">
          Buscando el mejor horario para tu grupo...
        </p>
      </div>
    )
  }

  if (suggestions.respondedCount === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-black/10 bg-white p-10 text-center">
        <p className="text-sm text-[#1F2430]/60">
          Aún nadie ha guardado su disponibilidad. En cuanto lo hagan, aquí
          aparecerán los mejores horarios para reunirse.
        </p>
      </div>
    )
  }

  const list = suggestions.top
  const highlight = suggestions.hasFullMatch ? suggestions.fullMatches : list

  return (
    <div className="flex flex-col gap-4">
      <div
        className={`rounded-2xl border p-4 ${
          suggestions.hasFullMatch
            ? "border-[#2FBF71]/30 bg-[#2FBF71]/[0.07]"
            : "border-[#F5B942]/30 bg-[#F5B942]/[0.07]"
        }`}
      >
        <div className="flex items-start gap-3">
          <span
            className={`mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg ${
              suggestions.hasFullMatch ? "bg-[#2FBF71]/20 text-[#2FBF71]" : "bg-[#F5B942]/25 text-[#B77900]"
            }`}
          >
            <Sparkles className="size-4" aria-hidden="true" />
          </span>
          <div>
            <p className="text-sm font-semibold text-[#1F2430]">
              {suggestions.hasFullMatch
                ? "¡Hay horarios donde coincide todo el grupo!"
                : "Aún no hay coincidencia total"}
            </p>
            <p className="mt-0.5 text-sm text-[#1F2430]/60">
              {suggestions.hasFullMatch
                ? `Estos ${highlight.length} bloque${highlight.length === 1 ? "" : "s"} funcionan para los ${suggestions.respondedCount} integrantes que respondieron.`
                : "Te mostramos los bloques con mayor cantidad de integrantes disponibles."}
            </p>
          </div>
        </div>
      </div>

      <ol className="flex flex-col gap-2">
        {list.map((block, index) => (
          <SuggestionRow
            key={block.key}
            rank={index + 1}
            block={block}
            total={suggestions.respondedCount}
          />
        ))}
      </ol>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 px-1 text-xs text-[#1F2430]/50">
        <span className="inline-flex items-center gap-1.5">
          <span className="size-3 rounded bg-[#2FBF71]" aria-hidden="true" />
          Coincidencia total del grupo
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Star className="size-3 fill-[#F5B942] text-[#F5B942]" aria-hidden="true" />
          Preferencia alta
        </span>
      </div>
    </div>
  )
}

function SuggestionRow({
  rank,
  block,
  total,
}: {
  rank: number
  block: BlockScore
  total: number
}) {
  return (
    <li
      className={`flex items-center gap-3 rounded-xl border bg-white p-3 shadow-sm shadow-black/[0.02] ${
        block.isFullMatch ? "border-[#2FBF71]/40" : "border-black/5"
      }`}
    >
      <span
        className={`flex size-8 shrink-0 items-center justify-center rounded-lg text-sm font-semibold ${
          block.isFullMatch ? "bg-[#2FBF71]/15 text-[#2FBF71]" : "bg-[#4F63D2]/10 text-[#4F63D2]"
        }`}
      >
        {rank}
      </span>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-[#1F2430]">
          {formatBlockLabel(block.day, block.hour)}
        </p>
        <p className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-[#1F2430]/60">
          <span className="inline-flex items-center gap-1">
            <Users className="size-3.5" aria-hidden="true" />
            {block.availableCount} de {total} disponibles
          </span>
          {block.highPrefCount > 0 ? (
            <span className="inline-flex items-center gap-1 text-[#B77900]">
              <Star className="size-3.5 fill-[#F5B942] text-[#F5B942]" aria-hidden="true" />
              {block.highPrefCount} preferencia alta
            </span>
          ) : null}
        </p>
      </div>

      {block.isFullMatch ? (
        <span className="shrink-0 rounded-full bg-[#2FBF71]/15 px-2.5 py-1 text-xs font-medium text-[#2FBF71]">
          100%
        </span>
      ) : null}
    </li>
  )
}
