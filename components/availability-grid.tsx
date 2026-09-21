"use client"

import { Star } from "lucide-react"
import {
  AVAILABLE,
  blockKey,
  DAYS,
  DAYS_SHORT,
  formatHour,
  HIGH_PREF,
  HOURS,
  UNAVAILABLE,
  type AvailabilityState,
} from "@/lib/matching"

const NEXT_STATE: Record<AvailabilityState, AvailabilityState> = {
  [UNAVAILABLE]: AVAILABLE,
  [AVAILABLE]: HIGH_PREF,
  [HIGH_PREF]: UNAVAILABLE,
}

export default function AvailabilityGrid({
  availability,
  onToggle,
  /** Keys of blocks suggested as group matches (highlighted with a ring). */
  suggestedKeys,
}: {
  availability: Record<string, AvailabilityState>
  onToggle: (key: string, next: AvailabilityState) => void
  suggestedKeys?: Set<string>
}) {
  return (
    <div className="overflow-x-auto">
      <div className="min-w-[560px]">
        <div
          className="grid gap-1"
          style={{ gridTemplateColumns: `44px repeat(${DAYS.length}, minmax(0, 1fr))` }}
        >
          {/* Header row */}
          <div aria-hidden="true" />
          {DAYS.map((day, i) => (
            <div
              key={day}
              className="pb-1 text-center text-xs font-medium text-[#1F2430]/70"
              title={day}
            >
              {DAYS_SHORT[i]}
            </div>
          ))}

          {/* Time rows */}
          {HOURS.map((hour) => (
            <RowFragment
              key={hour}
              hour={hour}
              availability={availability}
              onToggle={onToggle}
              suggestedKeys={suggestedKeys}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

function RowFragment({
  hour,
  availability,
  onToggle,
  suggestedKeys,
}: {
  hour: number
  availability: Record<string, AvailabilityState>
  onToggle: (key: string, next: AvailabilityState) => void
  suggestedKeys?: Set<string>
}) {
  return (
    <>
      <div className="flex items-center justify-end pr-1 text-[11px] tabular-nums text-[#1F2430]/50">
        {formatHour(hour)}
      </div>
      {DAYS.map((day, dayIndex) => {
        const key = blockKey(dayIndex, hour)
        const state = availability[key] ?? UNAVAILABLE
        const suggested = suggestedKeys?.has(key) ?? false
        return (
          <Cell
            key={key}
            state={state}
            suggested={suggested}
            label={`${day} ${formatHour(hour)}`}
            onClick={() => onToggle(key, NEXT_STATE[state])}
          />
        )
      })}
    </>
  )
}

function Cell({
  state,
  suggested,
  label,
  onClick,
}: {
  state: AvailabilityState
  suggested: boolean
  label: string
  onClick: () => void
}) {
  const base =
    "relative flex h-9 items-center justify-center rounded-md border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4F63D2]/50"

  const styles =
    state === HIGH_PREF
      ? "border-[#F5B942] bg-[#F5B942] text-[#1F2430]"
      : state === AVAILABLE
        ? "border-[#B7E4C7] bg-[#B7E4C7] text-[#1F2430]"
        : "border-black/[0.07] bg-[#F7F8FA] hover:bg-black/[0.04]"

  const stateLabel =
    state === HIGH_PREF ? "preferencia alta" : state === AVAILABLE ? "disponible" : "no disponible"

  return (
    <button
      type="button"
      onClick={onClick}
      title={`${label} — ${stateLabel}`}
      aria-label={`${label}, ${stateLabel}. Clic para cambiar.`}
      className={`${base} ${styles} ${suggested ? "ring-2 ring-[#2FBF71] ring-offset-1 ring-offset-white" : ""}`}
    >
      {state === HIGH_PREF ? (
        <Star className="size-3.5 fill-current" aria-hidden="true" />
      ) : null}
    </button>
  )
}
