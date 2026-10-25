"use client";

import { useActionState } from "react";
import { loginAction, type LoginState } from "@/app/admin/login/actions";

export function LoginForm({ next }: { next: string }) {
  const [state, action, pending] = useActionState<LoginState, FormData>(loginAction, { error: null, email: "" });

  return (
    <form action={action} className="space-y-8">
      <input type="hidden" name="next" value={next} />

      <div>
        <label htmlFor="admin-email" className="label block text-ash">
          Email
        </label>
        <input
          id="admin-email"
          name="email"
          type="email"
          autoComplete="username"
          required
          maxLength={254}
          defaultValue={state.email}
          aria-invalid={state.error ? true : undefined}
          aria-describedby={state.error ? "login-error" : undefined}
          className="field"
        />
      </div>

      <div>
        <label htmlFor="admin-password" className="label block text-ash">
          Password
        </label>
        <input
          id="admin-password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          maxLength={1024}
          aria-invalid={state.error ? true : undefined}
          aria-describedby={state.error ? "login-error" : undefined}
          className="field"
        />
      </div>

      <div aria-live="assertive" aria-atomic="true" className="min-h-6">
        {state.error ? (
          <p id="login-error" role="alert" className="text-sm text-bone">
            {state.error}
          </p>
        ) : null}
      </div>

      <button
        type="submit"
        disabled={pending}
        aria-disabled={pending}
        className="label w-full rounded-sm bg-ivory px-5 py-4 text-ink transition-opacity hover:opacity-90 disabled:opacity-60"
      >
        {pending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
