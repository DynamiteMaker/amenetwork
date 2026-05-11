import { login } from "./actions";

export default async function AdminLoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-surface-soft">
      <div className="card-soft w-full max-w-md space-y-6 p-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Sign In</h1>
          <p className="mt-2 text-sm text-ink/60">AME Network Admin</p>
        </div>

        <form action={login} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="mt-1 block w-full rounded-md border border-ink/10 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              className="mt-1 block w-full rounded-md border border-ink/10 px-3 py-2 text-sm"
            />
          </div>
          <button type="submit" className="btn-primary-soft w-full">
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
}
