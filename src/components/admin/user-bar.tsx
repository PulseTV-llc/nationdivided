import { logoutAction } from "@/app/admin/actions";
import { getAdmin } from "@/lib/server/auth";

/** Signed-in user + sign out. Reads the session, so render it inside <Suspense>. */
export async function AdminUserBar() {
  const user = await getAdmin();
  if (!user) return null;
  return (
    <div className="flex items-center gap-4">
      <p className="hidden text-sm text-ash sm:block">
        <span className="text-ivory">{user.name}</span>
        <span className="label ml-2 text-ash">{user.role}</span>
      </p>
      <form action={logoutAction}>
        <button
          type="submit"
          className="label rounded-sm border border-line-strong px-3 py-2 text-ivory transition-colors hover:border-ivory"
        >
          Sign out
        </button>
      </form>
    </div>
  );
}
