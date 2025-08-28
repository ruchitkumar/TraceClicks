# Tiny React + Firebase + Cloud Run Starter

This is the starter project that pairs with the step-by-step guide in chat.

## What it does
- React frontend (Vite) with **Firebase Authentication (email/password)**.
- Tracks a personal click count per logged-in user in **Firestore**.
- Shows the user's live count on the page.
- Minimal **Express API** on **Cloud Run** that verifies Firebase ID tokens and echoes user info.
- **Firebase Hosting** serves the frontend.

## Quick start
1) Create a Firebase project and enable **Email/Password** in *Authentication*.
2) Create Firestore (Native).
3) In Firebase console -> Project settings -> *Your apps* -> Web app: copy SDK config.
4) Copy `.env.example` to `.env` in `frontend/` and paste your config. Set `VITE_API_BASE` after API deploy.
5) Install deps & run:
   ```bash
   cd frontend && npm install && npm run dev
   cd ../backend && npm install && npm start
   ```
6) Deploy backend to Cloud Run, update `VITE_API_BASE`, then build & deploy frontend to Firebase Hosting.

## Security
- Firestore rules (see `firestore.rules`) restrict each user to their own `/users/{uid}` doc.
- API checks `Authorization: Bearer <Firebase ID token>` before returning data.
