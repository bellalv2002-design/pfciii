// Demo-mode members for "Quedamos".
//
// While group data still lives in each browser's localStorage, two people on
// different devices can't see each other's availability yet. To let the team or
// a reviewer experience the matching feature end to end, every new group is
// seeded with these example members. Their availability is fixed and varied so
// that some blocks coincide for everyone and others only partially.
//
// The patterns below are designed so that a few blocks (e.g. Martes 18:00-19:00
// and Jueves 19:00-20:00) are shared by all three demo members. If the real
// person also marks those blocks, they surface as full-group matches; otherwise
// the results still show realistic partial coincidences.

import { AVAILABLE, HIGH_PREF, blockKey, type AvailabilityState, type Member } from "./matching"

interface Slot {
  day: number
  hour: number
  state: AvailabilityState
}

interface DemoTemplate {
  id: string
  name: string
  slots: Slot[]
}

const A = AVAILABLE
const H = HIGH_PREF

// day index: 0 Lun · 1 Mar · 2 Mié · 3 Jue · 4 Vie · 5 Sáb · 6 Dom
const DEMO_TEMPLATES: DemoTemplate[] = [
  {
    id: "demo-ana",
    name: "Ana (ejemplo)",
    slots: [
      { day: 0, hour: 18, state: A },
      { day: 0, hour: 19, state: A },
      { day: 0, hour: 20, state: A },
      { day: 1, hour: 18, state: H }, // shared
      { day: 1, hour: 19, state: H }, // shared
      { day: 2, hour: 17, state: A },
      { day: 2, hour: 18, state: A },
      { day: 3, hour: 19, state: H }, // shared
      { day: 3, hour: 20, state: A }, // shared
      { day: 5, hour: 10, state: A },
      { day: 5, hour: 11, state: A },
      { day: 5, hour: 12, state: A },
    ],
  },
  {
    id: "demo-carlos",
    name: "Carlos (ejemplo)",
    slots: [
      { day: 0, hour: 8, state: A },
      { day: 0, hour: 9, state: A },
      { day: 0, hour: 10, state: A },
      { day: 1, hour: 9, state: A },
      { day: 1, hour: 10, state: A },
      { day: 1, hour: 18, state: A }, // shared
      { day: 1, hour: 19, state: A }, // shared
      { day: 2, hour: 14, state: A },
      { day: 2, hour: 15, state: A },
      { day: 3, hour: 19, state: A }, // shared
      { day: 3, hour: 20, state: H }, // shared
      { day: 3, hour: 21, state: A },
      { day: 4, hour: 16, state: A },
      { day: 4, hour: 17, state: A },
    ],
  },
  {
    id: "demo-sofia",
    name: "Sofía (ejemplo)",
    slots: [
      { day: 1, hour: 18, state: A }, // shared
      { day: 1, hour: 19, state: A }, // shared
      { day: 1, hour: 20, state: A },
      { day: 2, hour: 18, state: H },
      { day: 3, hour: 18, state: A },
      { day: 3, hour: 19, state: H }, // shared
      { day: 3, hour: 20, state: A }, // shared
      { day: 4, hour: 15, state: A },
      { day: 4, hour: 16, state: A },
      { day: 4, hour: 17, state: A },
      { day: 5, hour: 10, state: A },
      { day: 5, hour: 11, state: A },
    ],
  },
]

function toAvailability(slots: Slot[]): Record<string, AvailabilityState> {
  const out: Record<string, AvailabilityState> = {}
  for (const { day, hour, state } of slots) {
    out[blockKey(day, hour)] = state
  }
  return out
}

/**
 * Build fresh demo members for a new group. Each is returned already
 * "submitted" so its availability is counted in the matching results the moment
 * the real person saves their own.
 */
export function createDemoMembers(): Member[] {
  return DEMO_TEMPLATES.map((tpl) => ({
    id: tpl.id,
    name: tpl.name,
    submitted: true,
    availability: toAvailability(tpl.slots),
    isDemo: true,
  }))
}
