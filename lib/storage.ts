"use client"

// Lightweight in-browser store for the prototype. Groups live in localStorage
// so several people can simulate being distinct members of the same group from
// different tabs (or the same device) using the shared group code. Cross-tab
// updates are propagated through the native `storage` event, a same-tab custom
// event, and a low-frequency poll as a safety net.

import { useCallback, useEffect, useState } from "react"
import type { AvailabilityState, Group } from "./matching"

const STORAGE_KEY = "quedamos:groups:v1"
const SESSION_KEY = "quedamos:session:v1"
const UPDATE_EVENT = "quedamos:update"

export interface Session {
  code: string
  memberId: string
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
  // Notify listeners in the same tab (the `storage` event only fires elsewhere).
  window.dispatchEvent(new Event(UPDATE_EVENT))
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
    members: [{ id: memberId, name: personName.trim(), submitted: false, availability: {} }],
  }
  writeAll(map)
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

/** Subscribe to a single group and keep it in sync across tabs. */
export function useGroup(code: string | null): Group | null {
  const [group, setGroup] = useState<Group | null>(null)

  const refresh = useCallback(() => {
    if (!code) {
      setGroup(null)
      return
    }
    setGroup(readAll()[code] ?? null)
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
