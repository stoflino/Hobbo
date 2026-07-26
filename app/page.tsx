"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { getStoredPlayerId, setStoredPlayerId } from "@/lib/auth";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const [usernames, setUsernames] = useState<string[]>([]);
  const [username, setUsername] = useState("");
  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const storedId = getStoredPlayerId();
    if (storedId) {
      router.replace("/dashboard");
      return;
    }
    setCheckingSession(false);

    const supabase = createClient();
    supabase
      .from("players")
      .select("username")
      .order("username")
      .then(({ data, error: fetchError }) => {
        if (fetchError) {
          console.error(fetchError);
          return;
        }
        const names = (data ?? []).map((p) => p.username);
        setUsernames(names);
        if (names.length > 0) setUsername(names[0]);
      });
  }, [router]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (!username.trim()) {
      setError("Vyber nebo zadej uživatelské jméno.");
      return;
    }
    if (pin.length !== 4) {
      setError("PIN musí mít 4 číslice.");
      return;
    }

    setLoading(true);
    const supabase = createClient();

    const { data: player, error: loginError } = await supabase
      .from("players")
      .select("id")
      .eq("username", username.trim())
      .eq("pin", pin)
      .maybeSingle();

    setLoading(false);

    if (loginError || !player) {
      setError("Špatné jméno nebo PIN.");
      return;
    }

    setStoredPlayerId(player.id);
    router.push("/dashboard");
  }

  if (checkingSession) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-street-bg text-street-muted">
        Načítám…
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-street-bg px-4 py-10">
      <div className="w-full max-w-md">
        <header className="mb-8 text-center">
          <p className="mb-2 text-sm uppercase tracking-[0.3em] text-street-muted">
            Táborová hra
          </p>
          <h1 className="text-3xl font-black uppercase tracking-tight text-street-accent">
            Bezdomovci
          </h1>
          <p className="mt-2 text-sm text-street-muted">Přihlas se a přežij ulici</p>
        </header>

        <form
          onSubmit={handleSubmit}
          className="space-y-5 rounded-xl border border-street-border bg-street-card p-6 shadow-xl shadow-black/40"
        >
          <div className="space-y-2">
            <label htmlFor="username-select" className="block text-sm font-semibold text-street-text">
              Jméno hráče
            </label>
            {usernames.length > 0 && (
              <select
                id="username-select"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full rounded-lg border border-street-border bg-street-bg px-4 py-3 text-street-text focus:border-street-accent focus:outline-none"
              >
                {usernames.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
            )}
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Nebo zadej username"
              autoComplete="username"
              className="w-full rounded-lg border border-street-border bg-street-bg px-4 py-3 text-street-text placeholder:text-street-muted focus:border-street-accent focus:outline-none"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="pin" className="block text-sm font-semibold text-street-text">
              PIN (4 číslice)
            </label>
            <input
              id="pin"
              type="password"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={4}
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 4))}
              placeholder="••••"
              autoComplete="off"
              className="w-full rounded-lg border border-street-border bg-street-bg px-4 py-4 text-center text-2xl tracking-[0.5em] text-street-text focus:border-street-accent focus:outline-none"
            />
          </div>

          {error && (
            <p className="rounded-lg bg-street-warmth/20 px-4 py-3 text-center text-sm font-semibold text-street-warmth">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-street-accent py-4 text-lg font-bold uppercase tracking-wider text-black transition hover:bg-street-accent-hover disabled:opacity-50"
          >
            {loading ? "Přihlašuji…" : "Vstoupit do hry"}
          </button>
        </form>
      </div>
    </div>
  );
}
