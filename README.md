# TH-LOTTO React Project

This project contains the **React Frontend** for the Lottery Application and the **Google Apps Script Backend**.

## 1. Google Apps Script (Backend)

1.  Go to [script.google.com](https://script.google.com/) and create a new project.
2.  Copy the content of `google-apps-script/Code.gs` from this repository.
3.  Paste it into your Apps Script project's `Code.gs` file.
4.  **Important:**
    *   Update `SPREADSHEET_ID` with your actual Google Sheet ID.
    *   Ensure the Sheet has all the required tabs (Users, Transactions, etc.). You can run `setupDatabase()` function once to create them.
5.  **Deploy as Web App:**
    *   Click "Deploy" -> "New deployment".
    *   Select type: "Web app".
    *   Description: "API v1".
    *   Execute as: "Me".
    *   **Who has access: "Anyone" (Required for React App to access it)**.
6.  Copy the **Web App URL** (ends with `/exec`).
7.  Update the URL in `lottery-react/src/services/api.js`:
    ```javascript
    const APPS_SCRIPT_URL = 'YOUR_WEB_APP_URL';
    ```

## 2. React Application (Frontend)

This project is built with [Vite](https://vitejs.dev/).

### Local Development

1.  Navigate to the `lottery-react` folder:
    ```bash
    cd lottery-react
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Run the development server:
    ```bash
    npm run dev
    ```

### Deployment to Vercel

1.  Push this code to a GitHub repository.
2.  Go to [Vercel](https://vercel.com/) and Import the project.
3.  Vercel should automatically detect **Vite**.
4.  Click **Deploy**.

## Features

*   **User System:** Login, Register, Profile, Affiliate.
*   **Betting:** Lottery List, Countdown Timer, Keypad Input, Slip Management.
*   **Wallet:** Deposit (QR + Slip Upload), Withdraw, History.
*   **Results:** Automatic sync from external source, Manual Admin entry.
*   **Admin Panel:** Dashboard, User Management, Transaction Approval.

## External Results Sync

The backend includes a `syncExternalResults()` function that scrapes the provided Google Sheet PubHTML link.
*   You can set up a **Time-driven Trigger** in Apps Script (Edit -> Current project's triggers) to run `syncExternalResults` every 15 minutes to keep results up-to-date automatically.
