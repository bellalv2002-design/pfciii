"use client"

// Lightweight in-browser store for the prototype. Groups live in localStorage
// so several people can simulate being distinct members of the same group from
// different tabs (or the same device) using the shared group code. Cross-tab
// updates are propagated through the native `storage` event, a same-tab custom
// event, and a low-frequency poll as a safety net.

import { useCallback, useEffect, useState } from "react"
import type { AvailabilityState, Group } from "./matching"
import { createDemoMembers } from "./mock-members"
import { createClient } from "./supabase/client"

const STORAGE_KEY = "quedamos:groups:v1"
const SESSION_KEY = "quedamos:session:v1"
const MEMBERSHIPS_KEY = "quedamos:memberships:v1"
const UPDATE_EVENT = "quedamos:update"

export interface Session {
  code: string
  memberId: string
}

/** A group the current person belongs to, remembered for the "Mis grupos" view. */
export interface Membership {
  code: string
  memberId: string
  groupName: string
  joinedAt: number
}

type GroupMap = Record<string, Group>

function readAll(): GroupMap {
  if (typeof window === "undefined") return {}
  try {
    return JSON.parse(window.localStorage.getItem(STORAGE_KEY) || "{}") as GroupMap
  } catch {
    return {}
  }
}

function writeAll(map: GroupMap): void {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(map))
  window.dispatchEvent(new Event(UPDATE_EVENT))
  void syncGroupsToSupabase(map)
}

async function syncGroupsToSupabase(map: GroupMap): Promise<void> {
  try {
    const supabase = createClient()
    for (const group of Object.values(map)) {
      const { data: space } = await supabase.from("espacios").upsert({
        codigo_invitacion: group.code,
        nombre: group.name,
      }, { onConflict: "codigo_invitacion" }).select("id").single()
      if (!space) continue
      for (const member of group.members.filter((m) => !m.isDemo)) {
        const { data: executive } = await supabase.from("ejecutivos").upsert({
          espacio_id: space.id,
          nombre: member.name,
          asistente_nombre: member.name,
        }).select("id").single()
        if (!executive) continue
        const preferences = Object.entries(member.availability).map(([key, state]) => {
          const [dia, hora] = key.split("-").map(Number)
          return { ejecutivo_id: executive.id, dia, hora, estado: state === 2 ? "prioridad_alta" : "disponible" }
        })
        if (preferences.length) await supabase.from("preferencias").upsert(preferences, { onConflict: "ejecutivo_id,dia,hora" })
      }
    }
  } catch { /* local mode remains available if the network is unavailable */ }
}

async function loadGroupFromSupabase(code: string): Promise<Group | null> {
  try {
    const supabase = createClient()
    const { data: space } = await supabase.from("espacios").select("id,codigo_invitacion,nombre,creado_en").eq("codigo_invitacion", code).maybeSingle()
    if (!space) return null
    const { data: executives } = await supabase.from("ejecutivos").select("id,nombre").eq("espacio_id", space.id)
    const ids = (executives ?? []).map((e) => e.id)
    const { data: preferences } = ids.length ? await supabase.from("preferencias").select("ejecutivo_id,dia,hora,estado").in("ejecutivo_id", ids) : { data: [] as any[] }
    const members = (executives ?? []).map((e) => ({
      id: e.id, name: e.nombre, submitted: true,
      availability: Object.fromEntries((preferences ?? []).filter((p) => p.ejecutivo_id === e.id).map((p) => [`${p.dia}-${p.hora}`, p.estado === "prioridad_alta" ? 2 : 1]))
    }))
    return { code: space.codigo_invitacion, name: space.nombre, createdAt: new Date(space.creado_en).getTime(), members }
  } catch { return null }
}

function newId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID()
  }
  return Math.random().toString(36).slice(2)
}

export function generateCode(): string {
  // Avoid ambiguous characters (0/O, 1/I) so codes are easy to share verbally.
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
  let out = ""
  for (let i = 0; i < 6; i++) {
    out += chars[Math.floor(Math.random() * chars.length)]
  }
  return out
}

/** Extract a group code from a raw string that may be a code or an invite link. */
export function parseCode(raw: string): string {
  const trimmed = raw.trim()
  const match = trimmed.match(/[?&]code=([^&]+)/i)
  const value = match ? decodeURIComponent(match[1]) : trimmed
  return value.toUpperCase().replace(/[^A-Z0-9]/g, "")
}

export function createGroup(groupName: string, personName: string): Session {
  const map = readAll()
  let code = generateCode()
  while (map[code]) code = generateCode()

  const memberId = newId()
  map[code] = {
    code,
    name: groupName.trim(),
    createdAt: Date.now(),
    // Demo mode: seed the group with example members so matching can be seen
    // immediately without a second person joining from another device.
    members: [
      { id: memberId, name: personName.trim(), submitted: false, availability: {} },
      ...createDemoMembers(),
    ],
  }
  writeAll(map)
  rememberMembership({ code, memberId, groupName: map[code].name, joinedAt: Date.now() })
  return { code, memberId }
}

export function joinGroup(rawCode: string, personName: string): Session | null {
  const map = readAll()
  const code = parseCode(rawCode)
  const group = map[code]
  if (!group) return null

  const memberId = newId()
  group.members.push({ id: memberId, name: personName.trim(), submitted: false, availability: {} })
  writeAll(map)
  rememberMembership({ code, memberId, groupName: group.name, joinedAt: Date.now() })
  return { code, memberId }
}

export function setAvailability(
  code: string,
  memberId: string,
  key: string,
  state: AvailabilityState,
): void {
  const map = readAll()
  const member = map[code]?.members.find((m) => m.id === memberId)
  if (!member) return
  if (state === 0) delete member.availability[key]
  else member.availability[key] = state
  writeAll(map)
}

export function setSubmitted(code: string, memberId: string, submitted: boolean): void {
  const map = readAll()
  const member = map[code]?.members.find((m) => m.id === memberId)
  if (!member) return
  member.submitted = submitted
  writeAll(map)
}

export function saveSession(session: Session): void {
  window.localStorage.setItem(SESSION_KEY, JSON.stringify(session))
}

export function loadSession(): Session | null {
  if (typeof window === "undefined") return null
  try {
    return JSON.parse(window.localStorage.getItem(SESSION_KEY) || "null") as Session | null
  } catch {
    return null
  }
}

export function clearSession(): void {
  window.localStorage.removeItem(SESSION_KEY)
}

function readMemberships(): Membership[] {
  if (typeof window === "undefined") return []
  try {
    return JSON.parse(window.localStorage.getItem(MEMBERSHIPS_KEY) || "[]") as Membership[]
  } catch {
    return []
  }
}

function writeMemberships(list: Membership[]): void {
  window.localStorage.setItem(MEMBERSHIPS_KEY, JSON.stringify(list))
  window.dispatchEvent(new Event(UPDATE_EVENT))
}

/** Record (or refresh) the fact that this person belongs to a group. */
export function rememberMembership(entry: Membership): void {
  const list = readMemberships().filter((m) => m.code !== entry.code)
  list.push(entry)
  writeMemberships(list)
}

export function forgetMembership(code: string): void {
  writeMemberships(readMemberships().filter((m) => m.code !== code))
}

/**
 * List the groups this person belongs to, most recent first. Drops entries
 * whose underlying group no longer exists (e.g. cleared from another session).
 */
export function useMemberships(): Membership[] {
  const [memberships, setMemberships] = useState<Membership[]>([])

  useEffect(() => {
    const refresh = () => {
      const map = readAll()
      const valid = readMemberships()
        .filter((m) => map[m.code])
        // Keep the stored group name in sync with the source of truth.
        .map((m) => ({ ...m, groupName: map[m.code].name }))
        .sort((a, b) => b.joinedAt - a.joinedAt)
      setMemberships(valid)
    }
    refresh()

    const onStorage = (e: StorageEvent) => {
      if (e.key === MEMBERSHIPS_KEY || e.key === STORAGE_KEY) refresh()
    }
    window.addEventListener("storage", onStorage)
    window.addEventListener(UPDATE_EVENT, refresh)
    const interval = window.setInterval(refresh, 1500)

    return () => {
      window.removeEventListener("storage", onStorage)
      window.removeEventListener(UPDATE_EVENT, refresh)
      window.clearInterval(interval)
    }
  }, [])

  return memberships
}

/** Subscribe to a single group and keep it in sync across tabs. */
export function useGroup(code: string | null): Group | null {
  const [group, setGroup] = useState<Group | null>(null)

  const refresh = useCallback(() => {
    if (!code) {
      setGroup(null)
      return
    }
    const local = readAll()[code] ?? null
    setGroup(local)
    void loadGroupFromSupabase(code).then((remote) => {
      if (!remote) return
      const current = readAll()[code]
      const localOwner = current?.members.find((m) => !m.isDemo && m.id !== remote.members[0]?.id)
      const merged = localOwner ? { ...remote, members: [localOwner, ...remote.members.filter((m) => m.name !== localOwner.name)] } : remote
      const next = { ...readAll(), [code]: merged }
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      setGroup(merged)
    })
  }, [code])

  useEffect(() => {
    refresh()

    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) refresh()
    }
    window.addEventListener("storage", onStorage)
    window.addEventListener(UPDATE_EVENT, refresh)
    const interval = window.setInterval(refresh, 1500)

    return () => {
      window.removeEventListener("storage", onStorage)
      window.removeEventListener(UPDATE_EVENT, refresh)
      window.clearInterval(interval)
    }
  }, [refresh])

  return group
}
