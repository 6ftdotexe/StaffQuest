# StaffQuest Mobile (Expo + Firebase-ready)

Black & yellow native app for gamified restaurant training. Offline-first using AsyncStorage, with Firebase demo placeholders pre-wired (Auth + Firestore). Includes Google Sign-In button in the login form.

## Quick Start
```bash
# 1) Unzip
cd staffquest-mobile

# 2) Install
npm install

# 3) Run
npx expo start
# Scan the QR code with the Expo Go app on your phone
```

## Firebase Demo Notes
- The included `api/firebaseConfig.js` contains **demo placeholder keys**. The app works offline immediately.
- To enable cloud sync + Google Auth, create a Firebase project and replace values in `api/firebaseConfig.js`.
- For Google Sign-In, set your OAuth client ID inside `LoginScreen.js` (search for `YOUR_GOOGLE_OAUTH_CLIENT_ID`).

## Files to Edit for Real Backend
- `api/firebaseConfig.js` → your Firebase keys
- `screens/LoginScreen.js` → your Google OAuth Client ID
- `api/firebase.js` → cloud sync methods (already stubbed)

## Features
- Manual or Google login (Google requires real keys)
- Dashboard with quests, XP, levels
- Quest checklist flow
- Leaderboard
- Admin: create quests
- Black & yellow visual theme
- Glowing S! icon and splash (see /assets)
