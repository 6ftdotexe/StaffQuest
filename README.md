# StaffQuest (Expo + GitHub Pages)

Black & yellow gamified restaurant training app. Runs on **Android/iOS (Expo Go)** and also deploys a **web demo to GitHub Pages**.

## Run locally (mobile)
```bash
npm install
npx expo start
```
Scan QR with **Expo Go**.

## Run locally (web)
```bash
npm install
npm run web
```

## Deploy to GitHub Pages
This repo includes a GitHub Actions workflow that builds and deploys the web version automatically.

One-time setup:
1. Push to GitHub
2. Repo → **Settings → Pages**
3. **Source: GitHub Actions**

Then push to `main` and it will deploy.

## Notes
- Google Sign-In + Firebase are stubbed to be “ready,” and the app still works offline using AsyncStorage.
- To fully enable Firebase + Google OAuth, replace `api/firebaseConfig.js` and the OAuth client ID in `screens/LoginScreen.js`.
