# Tiny React + Firebase + Cloud Run Starter

This is the starter project that pairs with the step-by-step guide in chat.

## What it does
- React frontend (Vite) with **Firebase Authentication (email/password)**.
- Tracks a personal click count per logged-in user in **Firestore**.
- Shows the user's live count on the page.
- Minimal **Express API** on **Cloud Run** that verifies Firebase ID tokens and echoes user info.
- **Firebase Hosting** serves the frontend.


## Security
- Firestore rules (see `firestore.rules`) restrict each user to their own `/users/{uid}` doc.
- API checks `Authorization: Bearer <Firebase ID token>` before returning data.
