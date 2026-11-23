import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { supabase } from "../lib/supabase.js";

export default function LoginModal({ onClose, onAuthenticated }) {
  const [session, setSession] = useState(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  useEffect(() => {
    if (!supabase) {
      setMessage("Supabase is not configured.");
      setError(true);
      return undefined;
    }

    let active = true;
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (active) setSession(nextSession);
    });

    supabase.auth
      .getSession()
      .then(({ data, error: sessionError }) => {
        if (!active) return;
        if (sessionError) {
          setMessage(sessionError.message);
          setError(true);
          return;
        }
        setSession(data.session);
      })
      .catch((sessionError) => {
        if (!active) return;
        setMessage(sessionError.message || "Could not check the current session.");
        setError(true);
      });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  async function submit(event) {
    event.preventDefault();
    if (!supabase) {
      setMessage("Supabase is not configured.");
      setError(true);
      return;
    }

    setBusy(true);
    setMessage("");
    setError(false);
    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (signInError) {
        setMessage(signInError.message);
        setError(true);
      } else {
        setPassword("");
        onAuthenticated();
      }
    } catch (signInError) {
      setMessage(signInError.message || "Could not sign in. Please try again.");
      setError(true);
    } finally {
      setBusy(false);
    }
  }

  async function signOut() {
    if (!supabase) return;
    setBusy(true);
    setMessage("");
    setError(false);
    try {
      const { error: signOutError } = await supabase.auth.signOut();
      if (signOutError) {
        setMessage(signOutError.message);
        setError(true);
      } else {
        setMessage("You are signed out.");
      }
    } catch (signOutError) {
      setMessage(signOutError.message || "Could not sign out. Please try again.");
      setError(true);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      className="preview-modal login-backdrop"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        className="login-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="login-title"
      >
        <header className="login-modal-header">
          <div>
            <p className="label mono">Portfolio admin</p>
            <h2 id="login-title">{session ? "You’re signed in" : "Welcome back"}</h2>
          </div>
          <button
            className="preview-modal-close"
            type="button"
            onClick={onClose}
            aria-label="Close login"
          >
            <X size={20} />
          </button>
        </header>

        {session ? (
          <div className="login-modal-body">
            <p>Signed in as {session.user.email}.</p>
            <button
              className="btn-pill"
              type="button"
              onClick={onAuthenticated}
              disabled={busy}
            >
              Open admin dashboard
            </button>
            <button className="login-signout" type="button" onClick={signOut} disabled={busy}>
              {busy ? "Signing out…" : "Sign out"}
            </button>
          </div>
        ) : (
          <form className="login-modal-body login-form" onSubmit={submit}>
            <p className="login-intro">Sign in to manage your portfolio content and messages.</p>
            <label>
              Email
              <input
                type="email"
                name="email"
                autoComplete="username"
                required
                autoFocus
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </label>
            <label>
              Password
              <input
                type="password"
                name="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
            </label>
            <button className="btn-pill login-submit" type="submit" disabled={busy}>
              {busy ? "Signing in…" : "Sign in"}
            </button>
          </form>
        )}

        {message && (
          <p className={`login-message${error ? " err" : ""}`} role="status">
            {message}
          </p>
        )}
      </section>
    </div>
  );
}
