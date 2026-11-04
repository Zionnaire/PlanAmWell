# PlanAmWell 

**A reproductive and sexual health platform for Nigeria: AI health assistant, doctor appointments with in-app video calls, health records, medication reminders, and a health e-commerce store, across mobile, web, and admin.**

🔗 **Website:** https://planamwell.com

<!-- ![Mobile](docs/mobile.png) ![Web](docs/web.png) ![Admin](docs/admin.png) -->

---

## ✨ Features

- **"Ask AmWell" AI assistant:** a multilingual health chatbot in English, Yoruba, Igbo, Hausa, and Nigerian Pidgin, with intent detection (health, buy, info, appointment), product recommendations, voice input through Whisper transcription, and document upload so it can explain lab results.
- **Telemedicine:** browse doctors, book and pay for appointments, and join **WebRTC video calls** with ringing even when the app is backgrounded (Firebase FCM).
- **Find clinics:** real hospitals and clinics from OpenStreetMap, shown on a map.
- **Health records:** medical records and family-member profiles, protected on web by a **WebAuthn biometric gate**.
- **Medication reminders:** schedules, dose logging, and push reminders.
- **E-commerce:** health products, cart, checkout, orders, and reviews, with **Paystack** and **Flutterwave** support.
- **Community & advocacy:** articles, comments, events with RSVP, and partner organisations.
- **WhatsApp integration:** through the Meta WhatsApp Business API.
- **Sign-in:** Google and Apple sign-in on mobile, plus email and password.
- **Admin dashboard:** manage users, doctors, orders, partners, events, advocacy content (rich-text editor), and platform settings, with analytics charts.

## 🧩 Platform

| App | Folder | Stack |
|---|---|---|
| Mobile app | [`frontend/`](frontend) | Expo / React Native, TypeScript, NativeWind, Expo Router, react-native-webrtc, Firebase Messaging, Notifee |
| Web app | [`web/`](web) | Next.js, TypeScript, Tailwind v4, iron-session (BFF), SimpleWebAuthn, Leaflet |
| Admin dashboard | [`Admin/`](Admin) | Next.js, MUI, TipTap, Chart.js / Recharts |
| API | [`backend/`](backend) | Node.js, Express, TypeScript, MongoDB, Socket.IO, GraphQL (Apollo), Groq (Llama 3.3 + Whisper), Cloudinary, Firebase Admin, Microsoft Graph, node-cron, Docker |

The web app uses a backend-for-frontend pattern: the browser talks to Next.js API routes, which proxy to the Express API with server-side sessions.

## 🚀 Getting Started

```bash
# API
cd backend && cp .env.example .env && npm install && npm run dev

# Mobile
cd frontend && npm install && npx expo start      # dev build required for WebRTC / native modules

# Web
cd web && npm install && npm run dev

# Admin
cd Admin && npm install && npm run dev
```

Key backend variables include `MONGODB_URI`, `JWT_SECRET`, `REFRESH_TOKEN_SECRET`, `GROQ_API_KEY`, `CLOUDINARY_*`, `PAYMENT_PROVIDER`, `FIREBASE_*`, `META_*` (WhatsApp), and `MS_*` (email). See `backend/.env.example`.

## 🌿 Branches

`main` holds a combined snapshot of all four apps. Full commit history for each lives on its own branch: [`backend`](../../tree/backend), [`web`](../../tree/web), [`mobile`](../../tree/mobile), and [`admin`](../../tree/admin).

## 👤 Author

**Fowosere Ademola Abraham** ([@Zionnaire](https://github.com/Zionnaire)): Full-Stack & Mobile Engineer, AI Integration
