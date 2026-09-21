"use client"

import { useEffect, useState } from "react"
import { ArrowLeft, Check, Copy, Link2, Plus, UserPlus } from "lucide-react"
import { createGroup, joinGroup, parseCode, type Session } from "@/lib/storage"

type Mode = "create" | "join"

export default function GroupForm({
  mode,
  onBack,
  onEnter,
  onSwitch,
}: {
  mode: Mode
  onBack: () => void
  onEnter: (session: Session) => void
  onSwitch: (mode: Mode) => void
}) {
  const [personName, setPersonName] = useState("")
  const [groupName, setGroupName] = useState("")
  const [codeInput, setCodeInput] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [created, setCreated] = useState<{ session: Session; groupName: string } | null>(null)

  // Prefill the code when the invite link contains ?code=XXXX
  useEffect(() => {
    if (mode !== "join") return
    const params = new URLSearchParams(window.location.search)
    const code = params.get("code")
    if (code) setCodeInput(code.toUpperCase())
  }, [mode])

  function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!personName.trim() || !groupName.trim()) return
    const session = createGroup(groupName, personName)
    setCreated({ session, groupName: groupName.trim() })
  }

  function handleJoin(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (!personName.trim() || !parseCode(codeInput)) return
    const session = joinGroup(codeInput, personName)
    if (!session) {
      setError("No encontramos un grupo con ese código. Verifícalo e intenta de nuevo.")
      return
    }
    onEnter(session)
  }

  if (created) {
    return (
      <InviteCard
        code={created.session.code}
        groupName={created.groupName}
        onContinue={() => onEnter(created.session)}
      />
    )
  }

  return (
    <section className="mx-auto w-full max-w-md px-4 py-10 sm:py-14">
      <button
        type="button"
        onClick={onBack}
        className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-[#1F2430]/60 transition-colors hover:text-[#1F2430]"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        Volver
      </button>

      <div className="rounded-2xl border border-black/5 bg-white p-6 shadow-sm shadow-black/[0.03] sm:p-8">
        <div className="mb-6 flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-xl bg-[#4F63D2]/10 text-[#4F63D2]">
            {mode === "create" ? (
              <Plus className="size-5" aria-hidden="true" />
            ) : (
              <UserPlus className="size-5" aria-hidden="true" />
            )}
          </span>
          <div>
            <h2 className="text-xl font-semibold text-[#1F2430]">
              {mode === "create" ? "Crear grupo" : "Unirme a un grupo"}
            </h2>
            <p className="text-sm text-[#1F2430]/60">
              {mode === "create"
                ? "Genera un código para invitar a tus compañeros."
                : "Pega el código o link que te compartieron."}
            </p>
          </div>
        </div>

        {mode === "create" ? (
          <form onSubmit={handleCreate} className="flex flex-col gap-4">
            <Field
              label="Tu nombre"
              value={personName}
              onChange={setPersonName}
              placeholder="Ej. Mayerly"
            />
            <Field
              label="Nombre del grupo"
              value={groupName}
              onChange={setGroupName}
              placeholder="Ej. Proyecto Final Grupo 3"
            />
            <SubmitButton disabled={!personName.trim() || !groupName.trim()}>
              Crear grupo
            </SubmitButton>
          </form>
        ) : (
          <form onSubmit={handleJoin} className="flex flex-col gap-4">
            <Field
              label="Código o link de invitación"
              value={codeInput}
              onChange={setCodeInput}
              placeholder="Ej. K7QP2M"
              mono
            />
            <Field
              label="Tu nombre"
              value={personName}
              onChange={setPersonName}
              placeholder="Ej. Rossy"
            />
            {error ? (
              <p className="text-sm font-medium text-[#D64545]" role="alert">
                {error}
              </p>
            ) : null}
            <SubmitButton disabled={!personName.trim() || !parseCode(codeInput)}>
              Unirme al grupo
            </SubmitButton>
          </form>
        )}

        <div className="mt-6 border-t border-black/5 pt-4 text-center text-sm text-[#1F2430]/60">
          {mode === "create" ? (
            <>
              ¿Ya tienes un código?{" "}
              <button
                type="button"
                onClick={() => onSwitch("join")}
                className="font-medium text-[#4F63D2] hover:underline"
              >
                Únete a un grupo
              </button>
            </>
          ) : (
            <>
              ¿No tienes grupo aún?{" "}
              <button
                type="button"
                onClick={() => onSwitch("create")}
                className="font-medium text-[#4F63D2] hover:underline"
              >
                Crea uno nuevo
              </button>
            </>
          )}
        </div>
      </div>
    </section>
  )
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  mono,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  mono?: boolean
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-sm font-medium text-[#1F2430]">{label}</span>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`h-11 rounded-xl border border-black/10 bg-[#F7F8FA] px-3.5 text-base text-[#1F2430] outline-none transition-colors placeholder:text-[#1F2430]/35 focus:border-[#4F63D2] focus:bg-white focus:ring-2 focus:ring-[#4F63D2]/20 ${
          mono ? "font-mono uppercase tracking-widest" : ""
        }`}
      />
    </label>
  )
}

function SubmitButton({
  children,
  disabled,
}: {
  children: React.ReactNode
  disabled?: boolean
}) {
  return (
    <button
      type="submit"
      disabled={disabled}
      className="mt-2 inline-flex h-12 items-center justify-center rounded-xl bg-gradient-to-r from-[#4F63D2] to-[#6C7CE8] px-6 text-base font-medium text-white shadow-sm shadow-[#4F63D2]/25 transition-all hover:brightness-105 active:translate-y-px disabled:pointer-events-none disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4F63D2]/50 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
    >
      {children}
    </button>
  )
}

function InviteCard({
  code,
  groupName,
  onContinue,
}: {
  code: string
  groupName: string
  onContinue: () => void
}) {
  const [copied, setCopied] = useState<"code" | "link" | null>(null)

  const link = typeof window !== "undefined" ? `${window.location.origin}?code=${code}` : ""

  async function copy(value: string, which: "code" | "link") {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(which)
      window.setTimeout(() => setCopied(null), 1800)
    } catch {
      setCopied(null)
    }
  }

  return (
    <section className="mx-auto w-full max-w-md px-4 py-10 sm:py-14">
      <div className="rounded-2xl border border-black/5 bg-white p-6 shadow-sm shadow-black/[0.03] sm:p-8">
        <div className="mb-5 flex flex-col items-center text-center">
          <span className="mb-3 flex size-12 items-center justify-center rounded-full bg-[#2FBF71]/15 text-[#2FBF71]">
            <Check className="size-6" aria-hidden="true" />
          </span>
          <h2 className="text-xl font-semibold text-[#1F2430]">¡Grupo creado!</h2>
          <p className="mt-1 text-sm text-[#1F2430]/60">
            Comparte este código para que{" "}
            <span className="font-medium text-[#1F2430]">{groupName}</span> se sume.
          </p>
        </div>

        <div className="rounded-xl border border-[#4F63D2]/20 bg-[#4F63D2]/[0.04] p-4">
          <p className="text-center text-xs font-medium uppercase tracking-wide text-[#1F2430]/50">
            Código del grupo
          </p>
          <p className="mt-1 text-center font-mono text-3xl font-semibold tracking-[0.35em] text-[#4F63D2]">
            {code}
          </p>
          <div className="mt-4 flex flex-col gap-2">
            <button
              type="button"
              onClick={() => copy(code, "code")}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-white text-sm font-medium text-[#1F2430] ring-1 ring-black/10 transition-colors hover:bg-black/[0.03]"
            >
              {copied === "code" ? (
                <Check className="size-4 text-[#2FBF71]" aria-hidden="true" />
              ) : (
                <Copy className="size-4" aria-hidden="true" />
              )}
              {copied === "code" ? "Código copiado" : "Copiar código"}
            </button>
            <button
              type="button"
              onClick={() => copy(link, "link")}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-white text-sm font-medium text-[#1F2430] ring-1 ring-black/10 transition-colors hover:bg-black/[0.03]"
            >
              {copied === "link" ? (
                <Check className="size-4 text-[#2FBF71]" aria-hidden="true" />
              ) : (
                <Link2 className="size-4" aria-hidden="true" />
              )}
              {copied === "link" ? "Link copiado" : "Copiar link de invitación"}
            </button>
          </div>
        </div>

        <button
          type="button"
          onClick={onContinue}
          className="mt-5 inline-flex h-12 w-full items-center justify-center rounded-xl bg-gradient-to-r from-[#4F63D2] to-[#6C7CE8] px-6 text-base font-medium text-white shadow-sm shadow-[#4F63D2]/25 transition-all hover:brightness-105 active:translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4F63D2]/50 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
        >
          Continuar a mi disponibilidad
        </button>
      </div>
    </section>
  )
}
