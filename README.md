# Microjob BD — Premium, Secure, Bilingual Microtask Marketplace

**Brand:** MRS Engineers BD  
**Support Email:** [mrs.engineers.bd26@gmail.com](mailto:mrs.engineers.bd26@gmail.com)  
**Firebase Project ID:** `microjob-bd-9f8d8`  
**Minimum Payout:** ৳20 (BDT) via bKash & Nagad  

---

## 1. Project Overview & Architecture

Microjob BD is a microtask marketplace built specifically for Bangladesh. It connects clients who post small tasks (social media engagement, YouTube views, app testing, surveys, and data entry) with freelancers who earn daily income completing those tasks.

### Core Architectural Principles:
1. **Dual Wallet Separation:**
   - **Client Deposit Wallet:** Holds funds deposited via bKash/Nagad and locks budgets for active job postings in escrow.
   - **Freelancer Earnings Wallet:** Holds earnings released upon client/admin submission approval. Allows cashouts to personal bKash/Nagad wallets.
2. **Append-Only Financial Ledger (`walletTransactions`):**
   - Every financial balance transition (deposit, job reserve, worker payout, withdrawal reservation, refund) creates an immutable ledger entry.
3. **Bilingual Localization (বাংলা & English):**
   - Built-in full dictionary for navigation, forms, validation, wallet balances, statuses, and legal policy pages.
4. **Theme System:**
   - Persistent Light and Dark modes with automatic system preference detection.
5. **Real-time Job Chat:**
   - Text-only conversation between employer and worker scoped to the specific job.
6. **Mandatory Email Verification:**
   - Protects the marketplace against automated bot accounts and multi-account abuse.

---

## 2. Logo & Branding Asset Note

In the master brief, the field `Logo source:` was provided without an image URL. To maintain visual fidelity and prevent broken image links, a custom SVG brand asset was designed and stored locally at:
```
public/assets/microjob-bd-logo.svg
```
To replace this with an official brand image, place your file at `public/assets/microjob-bd-logo.png` or `public/assets/microjob-bd-logo.svg`.

---

## 3. Firebase Configuration & Security Rules

The application is linked to Firebase project **`microjob-bd-9f8d8`**.

- **Firestore Database ID:** `ai-studio-archibuild-1e160337-c485-4e6a-bd55-0872050e6a49`
- **Firestore Security Rules:** `firestore.rules` (Default-deny, ABAC owner and role checks, immutable ledger).
- **Realtime Database Rules:** `database.rules.json` (Real-time presence and typing indicators).
- **Storage Rules:** `storage.rules` (User profile avatars and task submission proofs).

### Deployed Firestore Collections:
- `/users/{userId}`: User profiles, roles, and verification flags.
- `/categories/{categoryId}`: Bilingual job categories managed by admin.
- `/jobs/{jobId}`: Microjobs with budget, workers needed/completed, and proof requirements.
- `/submissions/{submissionId}`: Worker proof submissions, review states, revision notes.
- `/jobConversations/{conversationId}`: Real-time text-only conversations between client and worker.
- `/wallets/{userId}`: Dual wallet balance document.
- `/walletTransactions/{txId}`: Immutable financial ledger.
- `/depositRequests/{requestId}`: Manual bKash/Nagad client deposit requests.
- `/withdrawalRequests/{requestId}`: Freelancer cashout requests.
- `/notifications/{notificationId}`: System and transactional alerts.
- `/contactMessages/{messageId}`: Public inquiries directed to `mrs.engineers.bd26@gmail.com`.
- `/platformSettings/{settingId}`: Dynamic bKash/Nagad numbers, instructions, and limits.
- `/auditLogs/{logId}`: Administrative action logs.

---

## 4. Admin Panel Access

The administrator control center is protected both on the client route and at the database security rules level.

- **Master Admin Email:** `mrs.engineers.bd26@gmail.com`
- **Access Route:** `/admin`
- **Capabilities:**
  - Real-time aggregated KPI overview (users, jobs, deposits, withdrawals).
  - Review & approve deposits (atomically credits Client Deposit Wallet).
  - Review & mark paid withdrawals (records MFS transaction ID).
  - Job moderation & suspension of fraudulent users.
  - Category creation with English and Bengali labels.
  - Dynamic payment settings (bKash & Nagad numbers, deposit guidelines).
  - Support contact inbox.
  - Audit trail of all administrative events.

---

## 5. Deployment Guide

### A. Deploying Static Frontend to GitHub Pages
1. Build the production bundle:
   ```bash
   npm run build
   ```
2. The compiled assets will be placed in the `dist/` directory.
3. Configure your GitHub repository settings to publish from the `gh-pages` branch or the `/dist` directory.

### B. Deploying Firebase Rules
Deploy security rules using the Firebase CLI:
```bash
firebase deploy --only firestore:rules,database,storage
```

---

## 6. Security and Verification Checklist

| Feature | Implemented Status | Verification Method |
| :--- | :--- | :--- |
| **Email/Password Auth** | Implemented | Firebase Authentication with `sendEmailVerification` |
| **Google Sign-In** | Implemented | `signInWithPopup` via GoogleAuthProvider |
| **Email Verification Gate** | Implemented | Banner prompts unverified users, blocks writes |
| **Dual Wallets** | Implemented | Client Deposit & Freelancer Earnings isolated |
| **Immutable Ledger** | Implemented | `walletTransactions` append-only records |
| **bKash & Nagad Deposits** | Implemented | Sender number & TrxID submitted -> Admin verified |
| **bKash & Nagad Withdrawals** | Implemented | Minimum ৳20 threshold enforced -> Reserved in escrow |
| **Job Budget Reservation** | Implemented | Atomic transaction prevents double-spending |
| **Proof Submission System** | Implemented | Dynamic fields (text, screenshots, URLs) |
| **72-Hour Auto-Approval** | Implemented | Configured policy with review deadlines |
| **Job Text-Only Chat** | Implemented | Scoped strictly to client, freelancer, and admin |
| **Bilingual Localization** | Implemented | Full English & বাংলা translations with persistence |
| **Theme System** | Implemented | Light / Dark modes with system & user persistence |
| **Admin Control Center** | Implemented | Restricted to `mrs.engineers.bd26@gmail.com` |
