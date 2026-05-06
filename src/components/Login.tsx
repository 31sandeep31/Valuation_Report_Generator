import { FormEvent, useEffect, useState } from "react";

const STORAGE_KEY = "vansavali.authed";

// Credentials are intentionally only a soft gate.
// They live in the bundle - this is NOT a real authentication boundary,
// just a "please confirm you're the right operator" prompt.
const USERNAME = "Mansang";
const PASSWORD = "M@nsangkot";
const HINT = "Sano Gaudo";

export function isAuthed(): boolean {
  try {
    return sessionStorage.getItem(STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

export function clearAuth(): void {
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

interface Props {
  onSuccess: () => void;
}

export default function Login({ onSuccess }: Props) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showHint, setShowHint] = useState(false);

  useEffect(() => {
    if (isAuthed()) onSuccess();
  }, [onSuccess]);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (username === USERNAME && password === PASSWORD) {
      try { sessionStorage.setItem(STORAGE_KEY, "1"); } catch { /* ignore */ }
      setError("");
      onSuccess();
    } else {
      setError("Incorrect username or password.");
    }
  };

  return (
    <div className="login-container">
      <form className="login-card" onSubmit={submit}>
        <h2>Sign in</h2>
        <p className="muted" style={{ marginTop: -8 }}>
          Valuation Report Generator
        </p>

        <label>
          Username
          <input
            type="text"
            autoComplete="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoFocus
          />
        </label>

        <label>
          Password
          <input
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>

        {error && <div className="login-error">{error}</div>}

        <div className="login-actions">
          <button type="submit" className="btn">Sign in</button>
          <button
            type="button"
            className="btn secondary"
            onClick={() => setShowHint((s) => !s)}
          >
            {showHint ? "Hide hint" : "Forgot? Show hint"}
          </button>
        </div>
        {showHint && (
          <div className="login-hint">
            Hint: <b>{HINT}</b>
          </div>
        )}
      </form>
    </div>
  );
}
