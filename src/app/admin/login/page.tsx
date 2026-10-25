import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { LoginForm } from "@/components/admin/login-form";
import { getAdmin } from "@/lib/server/auth";

export const metadata: Metadata = { title: "Sign in" };
export const instant = false;

export default function LoginPage({ searchParams }: PageProps<"/admin/login">) {
  return (
    <div className="mx-auto max-w-md py-8 sm:py-16">
      <p className="label text-ash">Staff only</p>
      <h1 className="display mt-3 text-5xl">Sign in</h1>
      <p className="mt-4 text-ash">
        This area holds private casting applications. Access is limited to authorized StockHouse Films staff.
      </p>
      <div className="mt-10 border-t border-line pt-10">
        <Suspense fallback={<LoginForm next="/admin/casting" />}>
          <LoginGate searchParams={searchParams} />
        </Suspense>
      </div>
    </div>
  );
}

async function LoginGate({ searchParams }: { searchParams: PageProps<"/admin/login">["searchParams"] }) {
  const sp = await searchParams;
  const raw = Array.isArray(sp.next) ? sp.next[0] : sp.next;
  const next =
    typeof raw === "string" &&
    raw.length <= 512 &&
    raw.startsWith("/admin/") &&
    !raw.startsWith("/admin/login") &&
    !raw.includes("\\")
      ? raw
      : "/admin/casting";
  // Already signed in → skip the form. (The server action re-validates `next`.)
  if (await getAdmin()) redirect(next);
  return <LoginForm next={next} />;
}
