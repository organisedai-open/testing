# Bits Whispers

A secure, anonymous chat platform built with React, Firebase, and modern web technologies.

## 🚀 Features

- **Anonymous Chat** - No sign-up required, ephemeral usernames
- **Real-time Messaging** - Powered by Firebase Firestore
- **Security** - App Check verification and spam protection
- **Responsive Design** - Mobile-first approach with dark theme

## 🛠️ Tech Stack

- **Frontend:** React + TypeScript + Vite
- **Backend:** Firebase (Firestore, App Check)
- **UI:** Tailwind CSS + Radix UI
- **Deployment:** Netlify

## 🚀 Getting Started

1. Install dependencies: `npm install`
2. Set up environment variables (see `.env.local.example`)
3. Run development server: `npm run dev`
4. Build for production: `npm run build`

## 🔒 Environment Variables

Required Firebase configuration variables:
- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`
- `VITE_FIREBASE_MEASUREMENT_ID`
- `VITE_RECAPTCHA_SITE_KEY`
