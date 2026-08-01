import Link from "next/link";

export default async function Login({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  return <main className="auth-wrap"><section className="panel auth-card">
    <Link href="/" className="brand"><span className="brand-mark">N</span> NeoTrace AI</Link>
    <h1>Welcome back</h1><p>Open your private activity workspace.</p>
    {error && <div className="error">Email or password is incorrect.</div>}
    <form className="form-grid" method="post" action="/api/auth/login">
      <label>Email<input name="email" type="email" autoComplete="email" required /></label>
      <label>Password<input name="password" type="password" autoComplete="current-password" required /></label>
      <button className="button" type="submit">Sign in</button>
    </form>
    <div className="auth-foot">New here? <Link href="/register">Create a local account</Link></div>
  </section></main>;
}

