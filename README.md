# SaaS Multi-Tenant QR-Code Print Shop Platform

A highly polished, enterprise-ready, multi-tenant SaaS application that enables local print shops (merchants) to offer instant customer document upload and automated cloud-to-print queues. Customers can scan a counter QR code, choose printing preferences (B&W vs. Color, paper sizes), calculate instant pricing, pay via integrated Indian Gateways (PhonePe / Paytm / Counter Cash), and submit documents. The local counter PC running a lightweight print agent automatically retrieves jobs and routes them to standard physical printers.

---

## 🚀 Complete Production Deployment and Verification Playbook (20 Steps)

Follow this end-to-end playbook to configure, connect, test, and deploy the entire multi-tenant system to production.

---

### Step 1: Install Node.js
- Download and install **Node.js LTS** (version 18 or 20 is recommended) from the official website: [https://nodejs.org](https://nodejs.org).
- Verify the installation in your terminal:
  ```bash
  node --version
  npm --version
  ```

### Step 2: Clone Project
- Clone this repository to your local development machine:
  ```bash
  git clone https://github.com/your-username/qr-print-saas.git
  cd qr-print-saas
  ```

### Step 3: Install Dependencies
- Install all required client and backend server dependencies in the project root:
  ```bash
  npm install
  ```

### Step 4: Create Firebase Project
- Go to the **Firebase Console** ([https://console.firebase.google.com](https://console.firebase.google.com)).
- Click **Add Project**, enter a descriptive project name (e.g., `qr-print-saas`), and follow the prompt. (Google Analytics is recommended but optional).

### Step 5: Enable Authentication
- In the Firebase sidebar menu, navigate to **Build** > **Authentication**.
- Click **Get Started**, then select **Sign-in method**.
- Enable **Email/Password** as a provider, and click **Save**.

### Step 6: Create Firestore Database
- In the Firebase sidebar, navigate to **Build** > **Firestore Database**.
- Click **Create Database**.
- Select **Production Mode** (the repository includes custom rules to apply in production).
- Choose a database server region near your shops (e.g., `asia-south1` for India) and click **Create**.

### Step 7: Enable Storage
- In the Firebase sidebar, navigate to **Build** > **Storage**.
- Click **Get Started**.
- Choose your default storage bucket security rules and region, then click **Done**.

### Step 8: Download Firebase Configuration
- In your Firebase Project Overview dashboard, click the **Web icon (`</>`)** to register a new web app.
- Provide a name (e.g., `QR Print Web App`) and click **Register App**.
- Under "SDK setup and configuration", select **Config**. Copy the JSON configuration values containing your `apiKey`, `authDomain`, `projectId`, etc.

### Step 9: Configure Environment Variables
- Create a `.env` file in the root directory by copying the `.env.example`:
  ```bash
  cp .env.example .env
  ```
- Edit the newly created `.env` file and paste the copied credentials:
  ```env
  VITE_FIREBASE_API_KEY="AIzaSyA1..."
  VITE_FIREBASE_AUTH_DOMAIN="qr-print-saas.firebaseapp.com"
  VITE_FIREBASE_PROJECT_ID="qr-print-saas"
  VITE_FIREBASE_STORAGE_BUCKET="qr-print-saas.appspot.com"
  VITE_FIREBASE_MESSAGING_SENDER_ID="1234567890"
  VITE_FIREBASE_APP_ID="1:123456:web:abcd123"

  # Payment Gateway Configurations (For Render backend APIs)
  PHONEPE_MERCHANT_ID="YOUR_PRODUCTION_PHONEPE_MID"
  PHONEPE_SECRET_KEY="YOUR_PHONEPE_SALT_KEY"
  PAYTM_MERCHANT_ID="YOUR_PRODUCTION_PAYTM_MID"
  PAYTM_MERCHANT_KEY="YOUR_PAYTM_MERCHANT_KEY"
  ```

### Step 10: Run Locally
- Start the Express backend server (which mounts Vite in development mode for seamless local running):
  ```bash
  npm run dev
  ```
- Open your browser and navigate to `http://localhost:3000` to interact with the full-stack system.
- *Notice*: If Firebase variables are configured, the status bar in the simulated browser will display **Firebase Cloud**. If empty, it automatically falls back to **Local Storage Mode** with preloaded mocks for instantaneous sandboxed play!

### Step 11: Deploy Frontend to Vercel
- Install Vercel CLI globally or connect your repository to Vercel in the dashboard:
  ```bash
  npm install -g vercel
  vercel login
  vercel
  ```
- Add the required environment variables (prefixed with `VITE_` as shown in `.env.example`) to your Vercel project configuration dashboard.
- Update `vercel.json` with your backend server URL on Render to proxy `/api/*` endpoints.

### Step 12: Deploy Backend to Render
- Create an account on Render ([https://render.com](https://render.com)) and connect your repository.
- Create a new **Web Service**.
- Select the language as **Node**.
- Configure Build & Start settings:
  - **Build Command**: `npm run build` (This runs `vite build` and bundles the backend server in Node-optimized CommonJS format inside `dist/server.cjs` via `esbuild`).
  - **Start Command**: `npm run start` (Launches the bundled production server).
- In Render's **Environment** tab, upload your `.env` variables (e.g., payment gateway keys, server `PORT=10000`, and Firebase properties).

### Step 13: Connect Frontend and Backend
- Once your Render Web Service is running, copy its live URL (e.g., `https://qr-print-backend.onrender.com`).
- In your Vercel project settings, update the proxy destination in `vercel.json` or update your client-side API fetch paths to route requests to your Render URL.

### Step 14: Verify PhonePe Merchant
- Request production API integration access from the **PhonePe Merchant Portal**.
- Replace `PHONEPE_MERCHANT_ID` and `PHONEPE_SECRET_KEY` in Render env settings with production keys once verified. The platform's integrated backend routes will begin creating active payloads on PhonePe's billing servers.

### Step 15: Verify Paytm Merchant
- Retrieve your production Paytm Merchant ID and Secret Key from the **Paytm Developer Console**.
- Paste them into your Render backend Environment Variables as `PAYTM_MERCHANT_ID` and `PAYTM_MERCHANT_KEY`.

### Step 16: Test QR Upload
- Navigate to your deployed SaaS website and register a test print shop.
- Once registered, click **Customer Portal** or scan the auto-generated counter QR code to open the customer upload website (e.g., `yourdomain.com/mrxprint`).
- Try uploading a test PDF file, choose options (double-sided, color mode), and apply a discount coupon (e.g., `SAVE10` or `WELCOME20`).

### Step 17: Test Print Queue
- Place an order and choose **PhonePe** or **Paytm** to verify the gateway checkout workflow, or choose **Pay at Counter** (cash) to bypass the digital gate.
- Go to the merchant's dashboard. You will see the new job instantly added to the printing queue in a `queued` state.

### Step 18: Build Windows Print Agent
- The repository includes a production-grade Python agent located at `/print-agent/agent.py` to bridge physical hardware and your cloud database.
- Package the script into a standalone Windows `.exe` executable for easy counter deployment using `pyinstaller`:
  ```bash
  pip install pyinstaller requests
  pyinstaller --onefile --icon=assets/printer-icon.ico print-agent/agent.py
  ```
- This outputs a lightweight `agent.exe` inside the `dist/` folder.

### Step 19: Connect Printer
- Place the compiled `agent.exe` on the shop's local Windows counter PC.
- Run the agent through terminal or double-click to configure it to point to your live backend server:
  ```bash
  agent.exe --shop mrxprint --server https://qr-print-backend.onrender.com
  ```
- Ensure the counter PC is connected via USB or Local Network to the physical printer and that the printer is set as the default windows printer.

### Step 20: Go Live
- Once all endpoints return status `200` and the local agent successfully polls the queue, place your custom printed high-quality QR codes on your counters. 
- Customers can now upload, pay, and print completely self-service!

---

## 📂 Architecture and Key Files

- **`/src/firebase.ts`**: Lazy-loads and initializes the client-side Firebase Auth, Firestore, and Storage SDKs. Safely falls back to mock states if variables are not configured yet, preventing initialization crashes.
- **`/src/firebaseService.ts`**: Implements high-performance queries to Firestore collections (`shops`, `orders`, `coupons`, `settings`, `tickets`) matching the exact database structure.
- **`/server.ts`**: Production-ready full-stack Express engine supporting deep request logging, robust CORS protocols, server health metrics, digital payment checkouts (PhonePe & Paytm), and queue handlers for the local PC print agents.
- **`/print-agent/agent.py`**: Local desktop client that listens for jobs on your servers, downloads files from Firebase Cloud Storage, and spools print jobs to the local physical print tray.
- **`vercel.json`**: Standard SPA fallback configurations and secure API proxies for seamless Vercel integrations.
- **`firestore.rules` & `storage.rules`**: Production-ready security profiles guarding merchant tenant accounts from cross-tenant snooping.
