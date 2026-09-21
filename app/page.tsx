"use client"

import { useEffect, useState } from "react"
import Header from "@/components/header"
import Hero from "@/components/hero"
import GroupForm from "@/components/group-form"
import Workspace from "@/components/workspace"
import Footer from "@/components/footer"
import { clearSession, loadSession, saveSession, type Session } from "@/lib/storage"

type View = "home" | "create" | "join"

export default function Page() {
  const [ready, setReady] = useState(false)
  const [session, setSession] = useState<Session | null>(null)
  const [view, setView] = useState<View>("home")

  useEffect(() => {
    setSession(loadSession())
    // If someone opens an invite link, jump straight to the join screen.
    const code = new URLSearchParams(window.location.search).get("code")
    if (code) setView("join")
    setReady(true)
  }, [])

  function enter(next: Session) {
    saveSession(next)
    setSession(next)
  }

  function leave() {
    clearSession()
    setSession(null)
    setView("home")
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#F7F8FA] text-[#1F2430]">
      <Header onLeave={session ? leave : undefined} />

      <main className="flex-1">
        {!ready ? null : session ? (
          <Workspace session={session} onMissing={leave} />
        ) : view === "home" ? (
          <Hero onCreate={() => setView("create")} onJoin={() => setView("join")} />
        ) : (
          <GroupForm mode={view} onBack={() => setView("home")} onEnter={enter} onSwitch={setView} />
        )}
      </main>

      <Footer />
    </div>
  )
}
