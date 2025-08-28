// backend/server.js
const express = require("express");
const cors = require("cors");
const admin = require("firebase-admin");

if (!admin.apps.length) {
  // In Cloud Run this uses the project’s default credentials automatically.
  admin.initializeApp();
}

const app = express();
app.use(cors({ origin: true }));
app.use(express.json());

// Verify Firebase ID token
async function requireAuth(req, res, next) {
  const auth = req.headers.authorization || "";
  const m = auth.match(/^Bearer (.+)$/);
  if (!m) return res.status(401).json({ error: "Missing token" });
  try {
    req.user = await admin.auth().verifyIdToken(m[1]);
    next();
  } catch (e) {
    console.error("verifyIdToken failed:", e?.message || e);
    res.status(401).json({ error: "Invalid token" });
  }
}

// Protected routes
app.get("/api/echo", requireAuth, (req, res) => {
  res.json({ uid: req.user.uid, email: req.user.email || null });
});
app.get("/api/me", requireAuth, async (req, res) => {
  const rec = await admin.auth().getUser(req.user.uid);
  res.json({ uid: req.user.uid, email: rec.email || null });
});

app.post("/api/increment", requireAuth, async (req, res) => {
  const ref = admin.firestore().doc(`users/${req.user.uid}`);
  await ref.set(
    { uid: req.user.uid, clicks: admin.firestore.FieldValue.increment(1) },
    { merge: true }
  );
  res.json({ ok: true });
});

const port = process.env.PORT || 8080;
app.listen(port, () => console.log("Backend listening on", port));
