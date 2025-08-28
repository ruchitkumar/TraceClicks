import React, { useEffect, useState } from "react";
import "./App.css";
import { auth, db } from "./firebase";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import {
  doc,
  setDoc,
  onSnapshot,
  getDoc,
  increment,
  serverTimestamp,
} from "firebase/firestore";

const apiBase = import.meta.env.VITE_API_BASE;

export default function App() {
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [count, setCount] = useState(0);
  const [apiResponse, setApiResponse] = useState(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let stopDoc = null;
    const stopAuth = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (stopDoc) { stopDoc(); stopDoc = null; }

      if (u) {
        const ref = doc(db, "users", u.uid);
        const snap = await getDoc(ref);
        if (!snap.exists()) {
          await setDoc(
            ref,
            { uid: u.uid, clickCount: 0, createdAt: serverTimestamp() },
            { merge: true }
          );
        }
        stopDoc = onSnapshot(ref, (docSnap) => {
          const data = docSnap.data() || {};
          setCount(typeof data.clickCount === "number" ? data.clickCount : 0);
        });
      } else {
        setCount(0);
      }
    });

    return () => { stopAuth && stopAuth(); stopDoc && stopDoc(); };
  }, []);

  const register = async (e) => {
    e.preventDefault();
    setBusy(true);
    try { await createUserWithEmailAndPassword(auth, email, password); }
    finally { setBusy(false); }
  };

  const login = async (e) => {
    e.preventDefault();
    setBusy(true);
    try { await signInWithEmailAndPassword(auth, email, password); }
    finally { setBusy(false); }
  };

  const logout = async () => {
    setBusy(true);
    try { await signOut(auth); setApiResponse(null); }
    finally { setBusy(false); }
  };

  const incrementClicks = async () => {
    if (!auth.currentUser) return;
    setBusy(true);
    try {
      const ref = doc(db, "users", auth.currentUser.uid);
      await setDoc(
        ref,
        {
          uid: auth.currentUser.uid,
          clickCount: increment(1),
          lastClickedAt: serverTimestamp(),
        },
        { merge: true }
      );
    } finally { setBusy(false); }
  };

  const callApi = async () => {
    if (!auth.currentUser) return;
    setBusy(true);
    try {
      const token = await auth.currentUser.getIdToken();
      const res = await fetch(`${apiBase}/api/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setApiResponse(data);
    } finally { setBusy(false); }
  };

  return (
    <div className="page">
      <header className="topbar">
        <div className="brand">
          <span className="logo">🔥</span>
          <span className="title">Tiny Firebase App</span>
        </div>
        {user && (
          <div className="userchip">
            <span>{user.email}</span>
            <button className="btn btn-outline" onClick={logout} disabled={busy}>
              Log out
            </button>
          </div>
        )}
      </header>

      <main className="container">
        {!user ? (
          <section className="card">
            <h2>Welcome</h2>
            <p className="muted">Sign in or create an account to start tracking clicks.</p>

            <form className="form" onSubmit={login}>
              <label className="label">
                Email
                <input
                  className="input"
                  placeholder="you@example.com"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </label>
              <label className="label">
                Password
                <input
                  className="input"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  minLength={6}
                  required
                />
              </label>

              <div className="row">
                <button className="btn btn-primary" type="submit" disabled={busy}>
                  {busy ? "Signing in…" : "Sign in"}
                </button>
                <button className="btn" type="button" onClick={register} disabled={busy}>
                  {busy ? "Creating…" : "Create account"}
                </button>
              </div>
            </form>
          </section>
        ) : (
          <>
            <section className="card">
              <h2>Your personal click count</h2>
              <div className="stat">{count}</div>
              <button className="btn btn-primary wide" onClick={incrementClicks} disabled={busy}>
                {busy ? "Saving…" : "+1"}
              </button>
              <p className="muted center">Updates in real time; stored in your own Firestore doc.</p>
            </section>

            <section className="card">
              <h2>Protected API test</h2>
              <p className="muted">
                Calls Cloud Run <code>/api/me</code> with your Firebase ID token.
              </p>
              <button className="btn wide" onClick={callApi} disabled={busy}>
                {busy ? "Calling…" : "Call /api/me"}
              </button>
              <pre className="pre">{JSON.stringify(apiResponse, null, 2)}</pre>
            </section>
          </>
        )}
      </main>

      <footer className="foot">
        <span className="muted">© {new Date().getFullYear()} Tiny Firebase App</span>
      </footer>
    </div>
  );
}
