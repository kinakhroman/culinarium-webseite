"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { KeyRound, Eye, EyeOff, CheckCircle } from "lucide-react";

export default function PasswortZuruecksetzenPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const q = new URLSearchParams(window.location.search).get("email");
    if (q) setEmail(q);
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    const res = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        code: (fd.get("code") as string).trim(),
        password: fd.get("password"),
      }),
    });
    setLoading(false);
    if (res.ok) {
      setDone(true);
      setTimeout(() => router.push(`/login?email=${encodeURIComponent(email)}`), 1800);
    } else {
      const err = await res.json().catch(() => ({}));
      setError(typeof err.error === "string" ? err.error : "Zurücksetzen fehlgeschlagen.");
    }
  }

  if (done) {
    return (
      <div className="bg-white rounded-2xl shadow-lg border border-neutral-100 p-8 text-center">
        <CheckCircle className="h-14 w-14 text-green-500 mx-auto mb-4" />
        <h1 className="font-heading text-2xl font-bold text-neutral-800 mb-2">Passwort geändert</h1>
        <p className="text-neutral-500">Sie werden zur Anmeldung weitergeleitet…</p>
      </div>
    );
  }

  const input =
    "w-full px-4 py-3 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors";

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-neutral-100 p-8">
      <h1 className="font-heading text-2xl font-bold text-neutral-800 text-center mb-2">
        Neues Passwort setzen
      </h1>
      <p className="text-sm text-neutral-500 text-center mb-6">
        Geben Sie den Code aus der E-Mail und Ihr neues Passwort ein.
      </p>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-neutral-700 mb-1">E-Mail</label>
          <input
            type="email" id="email" required value={email}
            onChange={(e) => setEmail(e.target.value)} className={input} placeholder="ihre@email.de"
          />
        </div>
        <div>
          <label htmlFor="code" className="block text-sm font-medium text-neutral-700 mb-1">6-stelliger Code</label>
          <input
            id="code" name="code" required inputMode="numeric" pattern="\d{6}" maxLength={6}
            className={`${input} tracking-[0.3em] text-center text-lg font-semibold`} placeholder="123456"
          />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-neutral-700 mb-1">
            Neues Passwort (min. 8 Zeichen)
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"} id="password" name="password" required minLength={8}
              className={`${input} pr-12`} placeholder="Neues Passwort"
            />
            <button
              type="button" onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {error && <p className="text-red-600 text-sm bg-red-50 p-3 rounded-lg">{error}</p>}

        <button
          type="submit" disabled={loading}
          className="w-full bg-primary text-white py-3 px-6 rounded-xl font-semibold hover:bg-primary-dark transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
        >
          <KeyRound className="h-5 w-5" />
          {loading ? "Wird gespeichert..." : "Passwort ändern"}
        </button>
      </form>

      <p className="text-center text-sm text-neutral-500 mt-6">
        Keinen Code erhalten?{" "}
        <Link href="/passwort-vergessen" className="text-primary font-semibold hover:underline">
          Neu anfordern
        </Link>
      </p>
    </div>
  );
}
