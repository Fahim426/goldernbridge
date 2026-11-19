"use client";

import { useActionState } from "react";
import { ArrowRight } from "lucide-react";
import type { LeadStatus } from "@/generated/prisma/enums";
import { loginAction, updateStatusAction } from "@/app/admin/actions";
import { statusLabels } from "./presentation";

export function LoginForm() {
  const [state, action, pending] = useActionState(loginAction, {});
  return (
    <form action={action} className="staff-form">
      <label htmlFor="staff-email">Email address</label>
      <input type="email" id="staff-email" name="email" autoComplete="username" maxLength={254} required />
      <label htmlFor="staff-password">Password</label>
      <input type="password" id="staff-password" name="password" autoComplete="current-password" maxLength={256} required />
      {state.error && <p className="staff-feedback staff-feedback-error" role="alert">{state.error}</p>}
      <button className="staff-primary" type="submit" disabled={pending}>
        {pending ? "Signing in…" : "Sign in"} <ArrowRight size={17} aria-hidden="true" />
      </button>
    </form>
  );
}

export function StatusForm({ id, status, version }: { id: string; status: LeadStatus; version: number }) {
  const [state, action, pending] = useActionState(updateStatusAction.bind(null, id, version), {});
  return (
    <form action={action} className="staff-form staff-status-form">
      <label htmlFor="lead-status">Lead status</label>
      <select key={version} name="status" id="lead-status" defaultValue={status}>
        {Object.entries(statusLabels).map(([value, label]) => <option value={value} key={value}>{label}</option>)}
      </select>
      <button className="staff-primary" type="submit" disabled={pending}>
        {pending ? "Saving…" : "Save status"}
      </button>
      {state.error && <p role="alert" className="staff-feedback staff-feedback-error">{state.error}</p>}
      {state.message && <p role="status" className="staff-feedback">{state.message}</p>}
    </form>
  );
}
