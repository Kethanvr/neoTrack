import Link from "next/link";

export default async function Register({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  return <main className="auth-wrap"><section className="panel auth-card">
    <Link href="/" className="brand"><span className="brand-mark">N</span> NeoTrace AI</Link>
    <h1>Create your workspace</h1><p>Your account and activity stay in the local SQLite database.</p>
    {error && <div className="error">{error === "exists" ? "That email already has a local account." : "Check the fields and try again."}</div>}
    <form className="form-grid" method="post" action="/api/auth/register">
      <label>Full name<input name="name" autoComplete="name" minLength={2} required /></label>
      <label>Email<input name="email" type="email" autoComplete="email" required /></label>
      <label>Password<input name="password" type="password" autoComplete="new-password" minLength={8} required /></label>
      <label className="consent"><input name="consent" type="checkbox" required/><span>I understand that NeoTrace records browser-tab metadata and, only when enabled, processes visible-tab screenshots. I can pause or delete my data at any time.</span></label>
      <button className="button" type="submit">Create local account</button>
    </form>
    <div className="auth-foot">Already registered? <Link href="/login">Sign in</Link></div>
  </section></main>;
}

