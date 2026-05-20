# MarketMV — Maldives Multi-Vendor Marketplace

A simple, modern multi-vendor marketplace web app for the Maldives. Built for mobile-first browsing, low bandwidth, and easy seller onboarding.

## Tech Stack

- **Frontend:** React + Vite + Tailwind CSS v4
- **Backend:** Firebase (Auth, Firestore, Storage)
- **State:** Zustand (cart) + React Context (auth)
- **Routing:** React Router v7
- **Charts:** Recharts
- **Icons:** Lucide React
- **Hosting:** Netlify

## Quick Start

### 1. Install dependencies

```bash
npm install
```

### 2. Set up Firebase

1. Create a project at [Firebase Console](https://console.firebase.google.com)
2. Enable **Authentication** (Email/Password + Google)
3. Create a **Firestore** database
4. Enable **Storage**
5. Copy `.env.example` to `.env` and fill in your Firebase config:

```bash
cp .env.example .env
```

### 3. Firestore Security Rules (starter)

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth.uid == userId;
    }
    match /stores/{storeId} {
      allow read: if true;
      allow create: if request.auth != null;
      allow update: if request.auth.uid == resource.data.ownerId
        || get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    match /products/{productId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    match /orders/{orderId} {
      allow read, write: if request.auth != null;
    }
    match /favorites/{id} {
      allow read, write: if request.auth != null;
    }
    match /follows/{id} {
      allow read, write: if request.auth != null;
    }
    match /notifications/{id} {
      allow read, write: if request.auth != null;
    }
    match /categories/{id} {
      allow read: if true;
      allow write: if get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
  }
}
```

### 4. Create Firestore Indexes

See `FIRESTORE_SCHEMA.md` for required composite indexes.

### 5. Create an admin user

After registering, manually set a user's `role` field to `admin` in Firestore:

```
users/{your-uid} → { role: "admin" }
```

### 6. Run locally

```bash
npm run dev
```

## Deploy to Netlify

1. Push to GitHub
2. Connect repo in Netlify
3. Add environment variables from `.env.example`
4. Build command: `npm run build`
5. Publish directory: `dist`

SPA redirects are configured in `netlify.toml` and `public/_redirects`.

## Project Structure

```
src/
├── components/     # Reusable UI (Navbar, ProductCard, SearchBar, etc.)
├── pages/          # Route pages
│   ├── auth/       # Login, Register
│   ├── seller/     # Seller dashboard
│   └── admin/      # Admin dashboard
├── layouts/        # Main, Auth, Dashboard layouts
├── hooks/          # useDebounce, useInfiniteScroll
├── context/        # AuthContext
├── stores/         # Zustand cart store
├── services/       # Firebase service layer
├── firebase/       # Firebase config
├── utils/          # Constants, formatters, image compression
└── styles/         # Tailwind CSS
```

## Features

- Browse products from all stores
- Instant search with suggestions
- Store pages with follow & contact
- Cart & checkout (COD + bank transfer screenshot)
- Seller dashboard (products, orders, analytics)
- Admin dashboard (approve stores, manage products/users)
- Favorites, notifications, image compression
- Mobile bottom navigation
- Lazy-loaded images & skeleton loaders

## Payment

No payment gateway integrated yet. Supports:
- Cash on delivery
- Bank transfer with screenshot upload (manual confirmation by seller)

## License

MIT
