# FinTrack — Complete Setup & Usage Guide

---

## What This Project Is

FinTrack is a full-stack personal finance management system with:

- **Backend** — Spring Boot 3 + MySQL + JWT authentication (runs on port `8080`)
- **Frontend** — React 18 + Vite (runs on port `5173`)

Both must be running at the same time for the app to work.

---

## Part 1 — Install the Required Tools

You need these installed on your machine before anything else.

**1. Java 17**
- Download from: https://adoptium.net
- Choose: `Temurin 17 (LTS)` → Windows x64 installer
- After install, verify in CMD:
```
java -version
```
Should print: `openjdk version "17.x.x"`

**2. Maven**
- Download from: https://maven.apache.org/download.cgi
- Download the `Binary zip archive`
- Extract it (e.g. to `C:\maven`)
- Add `C:\maven\bin` to your Windows PATH environment variable
- Verify in CMD:
```
mvn -version
```

**3. MySQL 8**
- Download from: https://dev.mysql.com/downloads/installer/
- Choose `MySQL Installer for Windows`
- During setup, select `MySQL Server` only
- Set root password to `root123` (or whatever you prefer — just update `application.properties` to match)
- Make sure MySQL service is running (check Windows Services or MySQL Workbench)

**4. Node.js 18+**
- Download from: https://nodejs.org
- Choose the `LTS` version
- Verify in CMD:
```
node -v
npm -v
```

---

## Part 2 — Set Up the Database

Open **MySQL Workbench** (installed with MySQL) or any MySQL client, connect with your root credentials, and run this one command:

```sql
CREATE DATABASE IF NOT EXISTS fintrack_db;
```

That's all. Hibernate will automatically create all the tables (`users`, `categories`, `transactions`, `budgets`) when the backend starts for the first time.

---

## Part 3 — Configure the Backend (if your MySQL password is different)

Open this file:
```
fintrack-backend\src\main\resources\application.properties
```

Find these lines and update the fallback values to match your MySQL setup:
```properties
spring.datasource.username=${DB_USERNAME:root}
spring.datasource.password=${DB_PASSWORD:root123}
```

Change `root` and `root123` to your actual MySQL username and password. Everything else can stay as-is.

---

## Part 4 — Start the Backend

Open **Command Prompt** and run:

```cmd
cd C:\Users\LOGAPRIYA\Desktop\Project\fintrack-backend
mvn spring-boot:run
```

The first time this runs, Maven will download all dependencies (takes 2–5 minutes). After that it's fast.

**Wait until you see this line:**
```
Started FintrackApplication in X.XXX seconds (process running for X.XXX)
```

The backend is now live at `http://localhost:8080`. Keep this terminal open — do not close it.

---

## Part 5 — Start the Frontend

Open a **second Command Prompt** (keep the first one running) and run:

```cmd
cd C:\Users\LOGAPRIYA\Desktop\Project\fintrack-frontend
npm install
npm run dev
```

`npm install` only needs to run once. After that you just use `npm run dev`.

**Wait until you see:**
```
  VITE v5.x.x  ready in XXX ms
  ➜  Local:   http://localhost:5173/
```

Now open your browser and go to: **`http://localhost:5173`**

---

## Part 6 — Using the Application

### Register & Login

1. You'll land on the **Login** page
2. Click **"Create one"** to go to Register
3. Fill in your Full Name, Email, and Password (min 6 characters)
4. Click **Create Account** — you'll be logged in automatically and taken to the Dashboard
5. Next time, just use Login with your email and password

---

### Dashboard

The first thing you see after login. It shows:

- **Total Income** — sum of all income transactions this month
- **Total Expenses** — sum of all expense transactions this month
- **Net Balance** — income minus expenses
- **Savings Rate** — what percentage of your income you saved
- **Monthly Trend chart** — income vs expense for the last 6 months
- **Expense Breakdown chart** — pie chart of spending by category
- **Recent Transactions** — your last 5 transactions
- **Budget Progress** — how much of each budget you've used this month

---

### Transactions

Click **Transactions** in the sidebar.

**To add a transaction:**
1. Click **Add Transaction** (top right)
2. Select Type: `Income` or `Expense`
3. Enter the Amount
4. Add a Description (optional)
5. Select a Category (filtered by type automatically)
6. Pick the Date
7. Optionally check **Recurring** and select a period (Daily / Weekly / Monthly / Yearly)
8. Click **Add Transaction**

**To edit:** Click the pencil icon on any row
**To delete:** Click the trash icon on any row (asks for confirmation)
**To filter:** Use the All / Income / Expense buttons at the top

---

### Categories

Click **Categories** in the sidebar.

Default categories are created automatically when you register (Salary, Food & Dining, Rent, etc.).

**To add a custom category:**
1. Click **Add Category**
2. Enter a name
3. Select type: `Income` or `Expense`
4. Pick an emoji icon
5. Pick a color
6. Click **Create Category**

**To edit or delete:** Use the icons on each category card.

---

### Budgets

Click **Budgets** in the sidebar.

**To set a budget:**
1. Select the Month and Year at the top
2. Click **Set Budget**
3. Choose an expense category
4. Enter the monthly spending limit
5. Click **Set Budget**

Each budget card shows:
- A progress bar (green → yellow → red as you approach the limit)
- How much you've spent vs the limit
- A warning banner if you've gone over budget

---

### Reports

Click **Reports** in the sidebar.

1. Select the Month and Year
2. Click **Download PDF**
3. A PDF file downloads automatically to your computer

The PDF includes: financial summary (income, expenses, net balance), full transaction list for that month, and category breakdown.

---

### Settings

Click **Settings** in the sidebar.

- **Profile** — Change your display name or currency (INR / USD / EUR / GBP / JPY). Click **Save Changes** to persist to the database.
- **Appearance** — Switch between Dark and Light theme. The preference is saved in your browser.
- **Security** — Confirms your password is BCrypt-encrypted.

---

## Part 7 — Stopping the App

- To stop the **backend**: go to its terminal and press `Ctrl + C`
- To stop the **frontend**: go to its terminal and press `Ctrl + C`

---

## Part 8 — Starting Again Next Time

Every time you want to use the app:

**Terminal 1 (Backend):**
```cmd
cd C:\Users\LOGAPRIYA\Desktop\Project\fintrack-backend
mvn spring-boot:run
```

**Terminal 2 (Frontend):**
```cmd
cd C:\Users\LOGAPRIYA\Desktop\Project\fintrack-frontend
npm run dev
```

Then open `http://localhost:5173` in your browser. No need to run `npm install` again.

---

## Quick Reference

| What | Where |
|---|---|
| App URL | http://localhost:5173 |
| Backend API | http://localhost:8080 |
| Database | MySQL → `fintrack_db` |
| Backend config | `fintrack-backend/src/main/resources/application.properties` |
| Frontend config | `fintrack-frontend/vite.config.js` |
| JWT expires | 24 hours (then you need to log in again) |
