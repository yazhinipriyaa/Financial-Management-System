# FinTrack — Personal Financial Management System
### Complete Project Description for Class Presentation

---

## 1. Project Overview

FinTrack is a full-stack web application that helps individuals manage their personal finances.
It allows users to track income and expenses, set monthly budgets, visualize spending patterns
through charts, and download detailed PDF financial reports — all secured behind user
authentication so every person's data is completely private.

The project is built using a modern industry-standard technology stack split into two parts:
a backend REST API and a frontend single-page application that communicate with each other
over HTTP.

---

## 2. Technology Stack

### Backend
| Technology | Purpose |
|---|---|
| Java 17 | Programming language |
| Spring Boot 3.2 | Backend framework — handles HTTP requests, dependency injection, application lifecycle |
| Spring Security | Authentication and authorization |
| Spring Data JPA | Database access layer — maps Java objects to database tables |
| Hibernate | ORM (Object Relational Mapper) — translates Java code into SQL queries |
| MySQL 8 | Relational database — stores all application data |
| JWT (JSON Web Token) | Stateless user authentication tokens |
| OpenPDF | PDF generation library for financial reports |
| Lombok | Reduces boilerplate code (auto-generates getters, setters, constructors) |
| Maven | Build tool and dependency manager |

### Frontend
| Technology | Purpose |
|---|---|
| React 18 | UI library — builds the user interface as reusable components |
| Vite | Fast development server and build tool |
| React Router v6 | Client-side page navigation without full page reloads |
| Axios | HTTP client — sends API requests to the backend |
| Recharts | Chart library — renders pie charts, bar charts, area charts |
| React Hot Toast | Shows success and error notification popups |
| Lucide React | Icon library |
| CSS Variables | Theming system for dark and light mode |

---

## 3. System Architecture

The project follows a Client-Server architecture with a clear separation between frontend and backend.

```
[ Browser / User ]
       |
       | HTTP Requests (JSON)
       v
[ React Frontend — port 5173 ]
       |
       | Proxied API calls to /api/*
       v
[ Spring Boot Backend — port 8080 ]
       |
       | JPA / Hibernate queries
       v
[ MySQL Database — port 3306 ]
```

The frontend never talks to the database directly. It only talks to the backend through
REST API endpoints. The backend is the only layer that reads and writes to the database.
This is called a 3-tier architecture.

---

## 4. Backend Architecture — Layer by Layer

The backend follows the standard Spring Boot layered architecture pattern:

```
Controller Layer  →  receives HTTP requests, sends HTTP responses
      ↓
Service Layer     →  contains all business logic
      ↓
Repository Layer  →  talks to the database using JPA queries
      ↓
Entity Layer      →  Java classes that map to database tables
```

### 4.1 Entity Layer — Database Tables

There are 4 database tables, each represented by a Java class:

**User** (`users` table)
- Stores: id, fullName, email, password (BCrypt encrypted), currency, createdAt, updatedAt
- Each user is completely independent — their data is never shared with other users

**Category** (`categories` table)
- Stores: id, name, type (INCOME or EXPENSE), icon (emoji), color (hex code), user_id
- Each category belongs to one user (foreign key to users table)
- When a user registers, 12 default categories are automatically created for them
  (Salary, Food & Dining, Rent, Transportation, etc.)

**Transaction** (`transactions` table)
- Stores: id, description, amount, type (INCOME or EXPENSE), transactionDate,
  isRecurring, recurrencePeriod, category_id, user_id, createdAt
- Each transaction belongs to one user and optionally one category
- Supports recurring transactions (Daily, Weekly, Monthly, Yearly)

**Budget** (`budgets` table)
- Stores: id, limitAmount, spentAmount, month, year, category_id, user_id
- One budget per category per month per user
- spentAmount is automatically recalculated every time a related transaction is added,
  updated, or deleted

### 4.2 Repository Layer

Each entity has a repository interface that extends JpaRepository.
Spring Data JPA automatically generates the SQL for standard operations (save, find, delete).
Custom queries are written using JPQL (Java Persistence Query Language) with @Query annotation.

Key custom queries:
- Sum all income or expense amounts for a user within a date range
- Group expenses by category for pie chart data
- Group transactions by year and month for trend chart data
- Sum expenses for a specific category within a date range (for budget tracking)

### 4.3 Service Layer

This is where all the business logic lives. There are 5 service classes:

**AuthService**
- register(): checks if email already exists, encrypts password with BCrypt,
  saves user, seeds 12 default categories, generates and returns a JWT token
- login(): verifies credentials using Spring Security's AuthenticationManager,
  generates and returns a JWT token
- updateProfile(): updates the user's name and currency preference in the database

**TransactionService**
- createTransaction(): saves a new transaction, then automatically syncs the
  budget's spentAmount if the transaction is an expense with a category
- updateTransaction(): captures the old category before updating, saves the
  updated transaction, then syncs both the old and new category budgets
- deleteTransaction(): captures category info before deleting, deletes the
  transaction, then syncs the affected budget
- getTransactions(): returns a paginated list of transactions with optional
  filtering by type (INCOME or EXPENSE)
- getDashboardSummary(): calculates total income, total expenses, net balance,
  savings rate, recent 5 transactions, expense breakdown by category, and
  monthly income vs expense trend for the last 6 months — all in one API call

**BudgetService**
- createOrUpdateBudget(): creates a new budget or updates an existing one for
  a given category, month, and year. Calculates and persists the current
  spentAmount before saving
- syncBudgetSpent(): recalculates and saves the spentAmount for a budget by
  summing all expense transactions for that category in that month. Called
  automatically by TransactionService whenever transactions change
- getBudgets(): fetches all budgets for a given month and year, recalculates
  spentAmount live from transactions for accurate display

**CategoryService**
- Full CRUD (Create, Read, Update, Delete) for categories
- Prevents duplicate category names for the same user and type
- All operations verify that the category belongs to the requesting user

**ReportService**
- generateMonthlyReport(): fetches all transactions for a given month,
  calculates totals, and builds a formatted A4 PDF document using OpenPDF.
  The PDF includes a title, user info, financial summary table, and a full
  transaction table with colored income/expense labels. Returns the PDF as
  a byte array which is sent directly to the browser as a file download.

### 4.4 Controller Layer

Each controller maps HTTP endpoints to service methods:

| Controller | Endpoints |
|---|---|
| AuthController | POST /api/auth/register, POST /api/auth/login, GET /api/auth/me, PUT /api/auth/profile |
| TransactionController | GET /api/transactions, POST /api/transactions, PUT /api/transactions/{id}, DELETE /api/transactions/{id}, GET /api/transactions/summary |
| CategoryController | GET /api/categories, POST /api/categories, PUT /api/categories/{id}, DELETE /api/categories/{id} |
| BudgetController | GET /api/budgets, POST /api/budgets, DELETE /api/budgets/{id} |
| ReportController | GET /api/reports/download |

### 4.5 Security Layer — JWT Authentication

This is one of the most important parts of the backend. Here is exactly how it works:

**Registration / Login flow:**
1. User submits email and password
2. Backend verifies credentials
3. Backend generates a JWT token — a digitally signed string that contains the user's
   email and an expiry time (24 hours)
4. Token is sent back to the frontend and stored in the browser's localStorage

**Every subsequent request flow:**
1. Frontend attaches the token to every API request in the Authorization header:
   `Authorization: Bearer <token>`
2. JwtAuthFilter intercepts every incoming request before it reaches any controller
3. Filter extracts the token from the header, validates the signature, checks it hasn't
   expired, and loads the user from the database
4. If valid, the user's identity is stored in Spring Security's SecurityContext
5. Controllers can then access the authenticated user's email via the Authentication object
6. If the token is missing, invalid, or expired, the request is rejected with a 401 error
   and the frontend automatically redirects to the login page

**Why JWT?**
JWT is stateless — the server does not store sessions. Every token is self-contained and
can be verified using just the secret key. This makes the application scalable.

**Password Security:**
Passwords are never stored in plain text. BCrypt hashing is applied before saving.
BCrypt is a one-way hash — it cannot be reversed. On login, the submitted password
is hashed and compared to the stored hash.

---

## 5. Frontend Architecture

The frontend is a React Single Page Application (SPA). This means the browser loads
one HTML file and React dynamically updates the page content without full page reloads.

### 5.1 Folder Structure

```
src/
├── api/          → Axios functions for each backend endpoint
├── components/   → Reusable UI components (Layout, Charts)
├── context/      → Global state (AuthContext, ThemeContext)
├── pages/        → One file per page (Dashboard, Transactions, etc.)
├── styles/       → CSS files for each section
└── utils/        → Helper functions (currency formatting)
```

### 5.2 Routing

React Router v6 handles navigation. There are two types of routes:

- **Public routes** (Login, Register) — accessible without a token
- **Protected routes** (Dashboard, Transactions, etc.) — redirect to login if no token

The ProtectedRoute component checks if a user is logged in before rendering any page.
If not logged in, it redirects to /login automatically.

### 5.3 State Management

**AuthContext** — stores the logged-in user's data (name, email, currency) and JWT token.
Persists to localStorage so the user stays logged in after refreshing the browser.
Provides loginUser(), logout(), and updateUser() functions to all components.

**ThemeContext** — stores the current theme (dark or light).
Applies a data-theme attribute to the HTML root element which switches all CSS variables.
Persists the preference to localStorage.

### 5.4 API Communication

All API calls go through a central Axios instance (axios.js) which:
- Sets the base URL to /api (proxied to localhost:8080 by Vite)
- Automatically attaches the JWT token to every request via a request interceptor
- Automatically redirects to /login if any response returns a 401 status

### 5.5 Pages and Features

**Login & Register Pages**
- Clean form with validation
- On success, stores the JWT token and user data in context and localStorage
- Animated background with floating gradient orbs

**Dashboard Page**
- Calls two APIs simultaneously (summary + budgets) using Promise.all for efficiency
- Displays 4 stat cards: Total Income, Total Expenses, Net Balance, Savings Rate
- Monthly Trend Area Chart — shows income vs expense for the last 6 months
- Expense Breakdown Pie Chart — shows spending distribution by category
- Recent Transactions list — last 5 transactions
- Budget Progress bars — visual progress for each budget this month

**Transactions Page**
- Paginated table (10 per page) with filter buttons (All / Income / Expense)
- Add/Edit modal form with fields: type, amount, description, category, date, recurring
- Category dropdown is automatically filtered to match the selected transaction type
- Toast notifications on success and error
- Submit button is disabled during API call to prevent duplicate submissions

**Categories Page**
- Grid of category cards showing icon, name, and type badge
- Add/Edit modal with emoji icon picker and color picker
- Filter by Income or Expense type

**Budgets Page**
- Month and year selector to view budgets for any period
- Each budget card shows a color-coded progress bar:
  - Green: under 75% of limit
  - Yellow: 75%–99% of limit
  - Red: 100% or over (shows "Over budget!" warning)
- spentAmount is always accurate because it syncs automatically with transactions

**Reports Page**
- Select month and year, click Download PDF
- Backend generates the PDF and streams it as a file download
- Browser automatically saves the file to the user's Downloads folder

**Settings Page**
- Update full name and currency preference — saved to the database via API
- Toggle between Dark and Light theme
- Security status display

---

## 6. Data Flow — Complete Example

Here is a complete walkthrough of what happens when a user adds an expense transaction:

1. User fills in the Add Transaction form and clicks "Add Transaction"
2. React collects the form data and calls createTransaction() in transactionApi.js
3. Axios sends a POST request to /api/transactions with the JWT token in the header
4. JwtAuthFilter intercepts the request, validates the token, identifies the user
5. TransactionController receives the request and calls transactionService.createTransaction()
6. TransactionService:
   a. Looks up the user by email from the JWT
   b. Validates the category belongs to this user
   c. Saves the transaction to the transactions table
   d. Checks if a budget exists for this category and month
   e. If yes, recalculates and saves the new spentAmount to the budgets table
7. Returns the saved transaction as JSON
8. React receives the response, closes the modal, shows a success toast, and refreshes the list
9. The Budgets page, if open, will show the updated progress bar on next load

---

## 7. Database Design

```
users
  id (PK), full_name, email (UNIQUE), password, currency, created_at, updated_at

categories
  id (PK), name, type, icon, color, user_id (FK → users.id)

transactions
  id (PK), description, amount, type, transaction_date, is_recurring,
  recurrence_period, category_id (FK → categories.id), user_id (FK → users.id), created_at

budgets
  id (PK), limit_amount, spent_amount, month, year,
  category_id (FK → categories.id), user_id (FK → users.id)
```

Relationships:
- One User has many Categories (one-to-many)
- One User has many Transactions (one-to-many)
- One User has many Budgets (one-to-many)
- One Category has many Transactions (one-to-many)
- One Category has many Budgets (one-to-many)

---

## 8. Key Technical Concepts Used

| Concept | Where Used |
|---|---|
| REST API | All backend endpoints follow REST conventions (GET, POST, PUT, DELETE) |
| JWT Authentication | Stateless token-based security for all protected routes |
| BCrypt Password Hashing | Passwords are never stored in plain text |
| JPA / ORM | Java objects automatically mapped to database tables |
| JPQL Custom Queries | Aggregation queries for dashboard charts and budget calculations |
| Pagination | Transactions list uses Spring Data's Pageable for server-side pagination |
| CORS Configuration | Backend explicitly allows requests from the frontend's origin |
| React Context API | Global state management for auth and theme without external libraries |
| Axios Interceptors | Centralized token attachment and 401 error handling |
| Vite Proxy | Development proxy routes /api calls to the backend, avoiding CORS issues |
| PDF Generation | OpenPDF library builds a formatted A4 document in memory and streams it |
| CSS Variables | Single source of truth for all colors, enabling instant theme switching |
| Lazy Loading (Spring) | @Lazy annotation breaks circular dependency between TransactionService and BudgetService |

---

## 9. Features Summary

| Feature | Description |
|---|---|
| User Registration | Create account with name, email, password. 12 default categories auto-created. |
| User Login | JWT token issued on successful login, valid for 24 hours |
| Dashboard | Real-time financial overview with 4 KPI cards and 4 charts |
| Transaction Management | Add, edit, delete income and expense transactions with pagination |
| Recurring Transactions | Mark transactions as recurring (Daily/Weekly/Monthly/Yearly) |
| Category Management | Create custom categories with emoji icons and colors |
| Budget Tracking | Set monthly spending limits per category with live progress tracking |
| Budget Auto-Sync | Budget spent amount updates automatically when transactions change |
| PDF Reports | Download a formatted PDF report for any month |
| Profile Settings | Update name and preferred currency (INR, USD, EUR, GBP, JPY) |
| Dark / Light Theme | Toggle between themes, preference saved in browser |
| Data Isolation | Every user sees only their own data — enforced at the service layer |

---

## 10. Project Statistics

| Metric | Count |
|---|---|
| Backend Java files | 22 files |
| Frontend React files | 20 files |
| REST API endpoints | 18 endpoints |
| Database tables | 4 tables |
| Default categories per user | 12 categories |
| Chart types | 3 (Area, Pie, Progress bars) |
| Supported currencies | 5 (INR, USD, EUR, GBP, JPY) |
