# WAVE Payment Simulation

This is a Next.js application that simulates a real-time payment gateway with an Admin Control Panel.

## 🚀 Quick Start (Deploy to Vercel)

The easiest way to check this is to deploy it for free on Vercel.

1.  **Upload to GitHub**:
    - Create a new repository on GitHub.
    - Upload all these files to it.

2.  **Deploy on Vercel**:
    - Go to [Vercel.com](https://vercel.com) and sign up.
    - Click "Add New Project" -> "Import" your GitHub repo.
    - Click **Deploy**.

## 🔥 Setting up Real-Time (Firebase)

To make the Admin Panel and Checkout talk to each other, you need Firebase keys.

1.  Go to [console.firebase.google.com](https://console.firebase.google.com).
2.  Create a new project.
3.  Go to **Build** -> **Realtime Database** -> **Create Database**.
4.  Go to **Project Settings** -> **General** -> Scroll down to "Your apps" -> Click `</>` (Web).
5.  Copy the config values (apiKey, etc.).
6.  In Vercel, go to **Settings** -> **Environment Variables** and add them:
    - `NEXT_PUBLIC_FIREBASE_API_KEY`
    - `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
    - `NEXT_PUBLIC_FIREBASE_DATABASE_URL`
    - ...etc

## 📂 Project Structure

- `/admin`: The secure control panel (Enter any 16-digit key to login).
- `/site1/checkout`: The customer payment page.

## 🛠 Local Development

If you want to run it on your computer:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).
