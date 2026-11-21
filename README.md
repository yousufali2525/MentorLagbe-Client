# MentorLagbe

MentorLagbe is a full-stack tuition marketplace that connects students with tutors. Students can browse approved tuition listings, apply for opportunities, track application status, manage their profile, and upgrade to Pro. Tutors can publish and manage tuition posts, review applicants, accept or reject applications, and upgrade to Pro. Administrators can monitor platform statistics, manage users, review pending tuitions, and inspect Stripe transactions.

This repository contains the Next.js client in `client/` and the Express API in `server/`. The frontend is production-ready against the existing backend API; the backend was not modified.

## Live URLs

| Environment | URL |
|---|---|
| Frontend | https://mentor-lagbe-client-rouge.vercel.app |
| Backend API | https://mentorlagbe-server-s98a.onrender.com |

## Admin Credentials

The demo administrator account is defined by `ADMIN_NAME`, `ADMIN_EMAIL`, and `ADMIN_PASSWORD` in `server/.env`.

| Field | Value |
|---|---|
| Name | `MentorLagbe Admin` |
| Email | `yousufali025250@gmail.com` |
| Password | `Asdfghjkl` |

> Keep these credentials private outside the demo environment. The values above are injected from `server/.env`; restart or re-seed the backend if they are changed there.

## Key Features

### Shared

- Unified brand system with teal palette, consistent headings, buttons, cards, tables, badges, skeletons, and empty states
- Responsive navbar, footer, sidebar layouts, and mobile menus for phone, tablet, and desktop
- BetterAuth session resolution with stored-JWT fallback, so protected dashboard reloads show a loader instead of bouncing to `/sign-in`
- JWT attached to every protected request through `apiFetch`, with automatic 401 token refresh
- Sonner toasts for sign in, sign up, sign out, form submissions, CRUD actions, payment actions, and errors
- Global loading, error, and 404 pages using the same brand language
- Optional frontend-only light/dark theme toggle persisted in `localStorage`

### Student

- Marketing home page with exact headline, hero search CTA, featured tuitions, workflow, subjects, stats, and testimonials
- Tuition listing page with URL-synced search, debounced input, class/mode filters, pagination, skeletons, and empty states
- Tuition detail page with eligibility checks, application form, and toasts
- Student dashboard with overview statistics and `MyApplications`
- Application history with pending-application cancellation
- Shared profile page with image upload through the existing ImgBB-backed endpoint

### Tutor

- Tutor dashboard with overview statistics, tuition count, and applicant activity
- Post Tuition form using the shared `TuitionForm`
- My Tuitions with edit and delete CRUD
- Applicants view with accept/reject actions resolved from existing endpoints
- Shared profile page with image upload and profile refresh

### Admin

- Admin dashboard with live platform statistics and quick actions
- User management with search, role filter, active/inactive status, role changes between student and tutor, and pagination
- Pending tuition approval and rejection with detail modal
- Stripe transaction listing with search, status filter, and pagination

### Payments

- Pricing page with Student Free, Student Pro, Tutor Free, and Tutor Pro plans
- Stripe Checkout initiated only through the existing protected backend endpoint
- Success page verifies payment by polling `/api/payments/my-payments` for a paid record matching the Stripe session ID, then refreshes the user
- Cancel page with clear messaging and toast
- Tuition salaries display in Bangladeshi Taka (à§³); Stripe payments remain USD because the backend creates USD sessions

## Installed npm Packages

### Runtime dependencies

| Package | Version |
|---|---|
| `next` | `16.4.6` |
| `react` | `19.3.0` |
| `react-dom` | `19.3.0` |
| `better-auth` | `^1.7.27` |
| `sonner` | `^2.0.8` |
| `framer-motion` | `^12.43.0` |
| `lucide-react` | `^1.77.0` |

### Development dependencies

| Package | Version |
|---|---|
| `tailwindcss` | `4.3.3` |
| `@tailwindcss/turbopack` | `4.3.3` |
| `typescript` | `^5` |
| `eslint` | `^9` |
| `eslint-config-next` | `16.4.6` |
| `@types/node` | `^20` |
| `@types/react` | `^19` |
| `@types/react-dom` | `^19` |

## Local Setup

### Prerequisites

- Node.js and npm
- MongoDB database
- Stripe account for Pro payments
- ImgBB API key for image uploads

### Install

```bash
git clone <your-repository-url>
cd MentorLagbe
cd client && npm install
cd ../server && npm install
```

### Frontend environment

The frontend may use only these variables:

| Variable | Used by client? | Purpose |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | Yes | Express backend origin for `apiFetch` and the BetterAuth client |
| `NEXT_PUBLIC_IMGBB_KEY` | No | Image uploads go through `POST /api/upload/image`; the key stays on the server |
| `NEXT_PUBLIC_STRIPE_PK` | No | The backend returns a hosted Stripe Checkout URL; no client-side Stripe SDK is needed |

Create `client/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

For production, set it to the live backend URL:

```env
NEXT_PUBLIC_API_URL=https://mentorlagbe-server-s98a.onrender.com
```

`.env*` files are ignored by Git. Never commit secrets, tokens, or private keys.

### Backend environment

Create `server/.env` with the variables required by the API, including:

```env
PORT=5000
CLIENT_URL=http://localhost:3000
MONGODB_URI=your_mongodb_connection_string
DB_NAME=mentorlagbe
AUTH_DB_NAME=mentorlagbe_auth
JWT_SECRET=your_secure_jwt_secret
JWT_EXPIRES_IN=7d
BETTER_AUTH_URL=http://localhost:5000
BETTER_AUTH_SECRET=your_secure_better_auth_secret
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
IMGBB_API_KEY=your_imgbb_api_key
ADMIN_NAME=your_admin_name
ADMIN_EMAIL=your_admin_email
ADMIN_PASSWORD=your_admin_password
```

### Run locally

```bash
# terminal 1
cd server
npm run dev

# terminal 2
cd client
npm run dev
```

Frontend: http://localhost:3000  
Backend: http://localhost:5000

### Build

```bash
cd client
npm run build
```

## Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the Next.js development server |
| `npm run build` | Create a production build |
| `npm start` | Serve the production build |
| `npm run lint` | Run ESLint |

## API and Security Notes

- `src/lib/api.ts` owns all backend communication. It attaches `Authorization: Bearer <jwt>` and refreshes the token once on `401`.
- The JWT is obtained only from `GET /api/token` after a BetterAuth cookie session exists; no secret is stored in the client.
- `AuthProvider` resolves the session from BetterAuth, falls back to stored session data, and exposes `refreshUser()` after profile or payment changes.
- `RoleGuard` redirects wrong-role users to their own dashboard rather than to `/sign-in`.
- No backend endpoint or backend file was changed for this client work.
- No Stripe secret, JWT secret, database string, or API key is hardcoded in the client.

## Backend Endpoint Map

Source: backend route, middleware, and BetterAuth config files only. Auth levels are `none`, `token`, `student`, `tutor`, and `admin`; role levels also require the Bearer JWT.

### Health and authentication

| Method | Path | Auth | Request / query | Response | Client use |
|---|---|---|---|---|---|
| `GET` | `/` | none | — | `{ success, message }` | not called |
| `GET` | `/api/health` | none | — | `{ success, message }` | not called |
| `*` | `/api/auth/*` | none | BetterAuth email/password, session cookies | BetterAuth responses | sign-up, sign-in, sign-out, session |
| `GET` | `/api/token` | cookie session | — | `{ success, message, token, user: { id, name, email, role, plan } }` | JWT exchange / refresh |

### Tuitions

| Method | Path | Auth | Request / query | Response | Client use |
|---|---|---|---|---|---|
| `GET` | `/api/tuitions` | none | `search`, `subject`, `location`, `category` | `{ success, count, tuitions }` | browse, featured, recommendations |
| `GET` | `/api/tuitions/my-tuitions` | tutor | — | `{ success, tuitions }` | tutor dashboards and CRUD |
| `GET` | `/api/tuitions/:id` | none | — | `{ success, tuition }` | details page |
| `POST` | `/api/tuitions` | tutor | `title`, `subject`, `classLevel`, `mode`, `description`, `location`, `salary`, `daysPerWeek`, optional `category`, `banner` | `{ success, message, tuition }` | post tuition |
| `PATCH` | `/api/tuitions/:id` | tutor | same full tuition body; resets approval to `pending` | `{ success, message }` | edit tuition |
| `DELETE` | `/api/tuitions/:id` | tutor | — | `{ success, message }` | delete tuition |
| `PATCH` | `/api/tuitions/admin/:id/status` | admin | `{ status: "approved" \| "rejected" }` | `{ success, message }` | approve/reject |

### Applications

| Method | Path | Auth | Request / query | Response | Client use |
|---|---|---|---|---|---|
| `POST` | `/api/applications` | student | `{ tuitionId, message? }` | `{ success, message, data }` | apply |
| `GET` | `/api/applications/my-applications` | student | — | `{ success, total, data }` with tuition/tutor enrichment | student applications |
| `DELETE` | `/api/applications/:id` | student | — | `{ success, message }` | cancel pending application |
| `GET` | `/api/applications/tutor-applicants` | tutor | — | `{ success, total, data }` | tutor applicants |
| `PATCH` | `/api/applications/:id/status` | tutor | `{ status: "accepted" \| "rejected" }` | `{ success, message }` | accept/reject |

### Profile and uploads

| Method | Path | Auth | Request / query | Response | Client use |
|---|---|---|---|---|---|
| `GET` | `/api/users/me` | token | — | `{ success, message, user }` | profile and session refresh |
| `PATCH` | `/api/users/me` | token | optional `name`, `phone`, `location`, `bio`, `profileImage` (HTTPS) | `{ success, message, user }` | profile save |
| `POST` | `/api/upload/image` | token | `{ image, name? }` (base64/data URL, max 8 MB) | `{ success, message, data: { url, displayUrl, deleteUrl } }` | avatar and tuition banner |

### Payments

| Method | Path | Auth | Request / query | Response | Client use |
|---|---|---|---|---|---|
| `POST` | `/api/payments/create-checkout-session` | token, student/tutor, not pro | — | `{ success, message, url }` | Stripe redirect |
| `POST` | `/api/payments/webhook` | none, Stripe signature | raw JSON body | `{ received: true }` or error | backend/webhook only |
| `GET` | `/api/payments/my-payments` | token | — | `{ success, total, payments }` | success-page polling |

### Admin

| Method | Path | Auth | Request / query | Response | Client use |
|---|---|---|---|---|---|
| `GET` | `/api/admin/stats` | admin | — | `{ success, stats }` | admin overview |
| `GET` | `/api/admin/users` | admin | `page`, `limit` max 50, `role`, `search` | `{ success, users, pagination }` | user management |
| `PATCH` | `/api/admin/users/:id/status` | admin | `{ isActive: boolean }` | `{ success, message }` | activate/deactivate |
| `PATCH` | `/api/admin/users/:id/role` | admin | `{ role: "student" \| "tutor" }` | `{ success, message }` | role change |
| `GET` | `/api/admin/tuitions/pending` | admin | — | `{ success, total, tuitions }` | pending review |
| `GET` | `/api/admin/payments` | admin | `page`, `limit` | `{ success, payments, pagination }` | transactions |

## Backend Gaps and Manual Steps

The frontend stays within the existing API. The following capabilities are not implemented because the required backend endpoints or parameters do not exist:

- **Tutor active/closed tuition toggle** — needs `PATCH /api/tuitions/:id/active` or support for `isActive` in `PATCH /api/tuitions/:id`.
- **Admin all-tuitions listing** — needs `GET /api/admin/tuitions`. The admin page currently shows pending requests only.
- **Admin promotion to `admin`** — the existing `PATCH /api/admin/users/:id/role` rejects `admin` and does not sync the BetterAuth role. Use the backend admin setup script manually if a new admin is required.
- **Server-side tuition pagination** — `GET /api/tuitions` has no `page` or `limit`; the client paginates the returned list locally.
- **Server-side `classLevel` and `mode` tuition filters** — those query parameters are ignored by the backend; the client filters locally. `search`, `subject`, `location`, and `category` are sent to the server.
- **Admin status/search query params** — `/api/admin/users` has no status filter and `/api/admin/payments` has no search/status filter; those controls are local to the current page.
- **Bookmarks/saved tuitions** — needs bookmark list/add/remove endpoints.
- **Reviews and ratings** — needs review creation and listing endpoints.
- **Direct Stripe session verification** — the success page verifies indirectly by polling the user's payment records. A dedicated verified-session endpoint would be more reliable.

Additional manual deployment steps:

1. Set `NEXT_PUBLIC_API_URL` in the frontend hosting environment.
2. Set `CLIENT_URL`, `BETTER_AUTH_URL`, MongoDB, JWT, Stripe, and ImgBB variables in the backend hosting environment.
3. Configure Stripe webhooks to point to `https://mentorlagbe-server-s98a.onrender.com/api/payments/webhook`.
4. Allow the deployed frontend origin in backend CORS.
5. Run the backend admin/seed scripts if creating a fresh database.
6. Verify live sign-up, sign-in, tuition approval, application flow, and a Stripe test payment after deployment.

## Project Structure

```text
MentorLagbe/
â”œâ”€â”€ client/
â”‚   â”œâ”€â”€ src/
â”‚   â”‚   â”œâ”€â”€ app/
â”‚   â”‚   â”œâ”€â”€ components/
â”‚   â”‚   â”œâ”€â”€ hooks/
â”‚   â”‚   â””â”€â”€ lib/
â”‚   â”œâ”€â”€ .env.local          # ignored by Git
â”‚   â”œâ”€â”€ next.config.mjs
â”‚   â””â”€â”€ package.json
â””â”€â”€ server/
    â”œâ”€â”€ config/
    â”œâ”€â”€ middleware/
    â”œâ”€â”€ routes/
    â”œâ”€â”€ scripts/
    â””â”€â”€ package.json
```

## License

Developed for educational and demonstration purposes.
