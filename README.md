# MentorLagbe

Smart Tuition & Mentorship Platform.

## Purpose

Students and parents struggle to find verified tutors by subject, class level, mode (Online/Offline) and monthly budget. Tutors lack a structured platform to showcase batches and manage student enrollments. MentorLagbe solves both in one role-based ecosystem with three roles: Student, Tutor and Admin.

## Live URL

- Client: https://mentor-lagbe-client-rouge.vercel.app/
- Server: <SERVER LIVE URL>
- GitHub (Client): https://github.com/yousufali2525/MentorLagbe-Client
- GitHub (Server): <SERVER GITHUB URL>

## Test Credentials (Admin, Tutor, Student)

| Role | Email | Password |
|---|---|---|
| Admin | <ADMIN EMAIL> | <ADMIN PASSWORD> |
| Tutor | <TUTOR EMAIL> | <TUTOR PASSWORD> |
| Student | <STUDENT EMAIL> | <STUDENT PASSWORD> |

## Key Features

**Public**

- Marketing landing page with hero search, featured approved tuitions, workflow, subjects, platform statistics and testimonials.
- Tuition browser at `/tuitions` with server-side search, subject/class-level/mode filters and pagination; filters are stored in the URL.
- Tuition detail pages at `/tuitions/[id]` with tutor information and a student application form.
- Pricing page with Free and Pro plans for students and tutors, plus payment success and cancel pages.

**Authentication**

- Better Auth sign-in and sign-up for Student and Tutor accounts.
- Role-aware route guards and redirects for the three dashboard areas.
- Better Auth session exchange into a backend JWT, stored-JWT fallback, bearer-token API requests and automatic refresh after a 401 response.

**Student**

- Student dashboard with overview statistics, recent applications and a Pro upgrade banner.
- In-dashboard tuition browser at `/dashboard/student/browse` that keeps the sidebar and top bar visible while preserving URL-based filters and pagination.
- Apply form that submits phone number, preferred schedule and learning note with a pending status.
- My Applications page with application summaries, status filters and cancellation of pending applications.
- Profile page with profile-image upload through the backend endpoint.

**Tutor**

- Tutor dashboard with overview statistics, quick actions, applicant activity and a Pro upgrade banner.
- Post Tuition form with banner-image upload handled by the ImgBB-backed backend endpoint.
- My Tuitions page for reviewing, editing and deleting tuition posts.
- Applicants page showing student contact details, preferred schedule and notes, with accept/reject status actions.

**Admin**

- Admin dashboard with live platform statistics.
- User management with search, active/inactive status and role changes between Student, Tutor and Admin, with self-role protection.
- Tuition management with pending/approved/rejected tabs and an approval flow for publishing or rejecting posts.
- Transactions page listing payments and the aggregated total revenue.

**Shared**

- Role-based dashboards with responsive sidebar, top bar and mobile navigation.
- Dark/light theme toggle persisted in `localStorage` and applied before initial paint.
- Global loading, 404 and error pages, plus route-level loading skeletons.
- Toast notifications for form submissions, CRUD actions, payment actions and errors.

## Tech Stack

- **Framework:** Next.js 16 App Router, React 19 and TypeScript
- **Styling:** Tailwind CSS 4 with Turbopack integration
- **Authentication:** Better Auth with JWT-backed API sessions
- **UI:** Lucide icons, Framer Motion and Sonner toasts
- **Backend:** Express REST API consumed through `apiFetch`

## NPM Packages Used

### Dependencies

| Package | Version | Purpose |
|---|---|---|
| `better-auth` | `^1.7.27` | Authentication client and session handling |
| `framer-motion` | `^12.43.0` | UI animations and scroll reveals |
| `lucide-react` | `^1.77.0` | Icon library |
| `next` | `16.4.6` | Next.js App Router framework |
| `react` | `19.3.0` | React UI library |
| `react-dom` | `19.3.0` | React DOM rendering |
| `sonner` | `^2.0.8` | Toast notifications |

### DevDependencies

| Package | Version | Purpose |
|---|---|---|
| `@tailwindcss/turbopack` | `4.3.3` | Tailwind CSS integration for Turbopack |
| `@types/node` | `^20` | Node.js TypeScript type definitions |
| `@types/react` | `^19` | React TypeScript type definitions |
| `@types/react-dom` | `^19` | React DOM TypeScript type definitions |
| `eslint` | `^9` | Linting |
| `eslint-config-next` | `16.4.6` | Next.js ESLint configuration |
| `tailwindcss` | `4.3.3` | Utility-first CSS framework |
| `typescript` | `^5` | Static type checking |

## Environment Variables

| Name | Description |
|---|---|
| `NEXT_PUBLIC_API_URL` | Express backend origin used by `apiFetch` and the Better Auth session exchange. |

Example `.env.local` with a placeholder value only:

```env
NEXT_PUBLIC_API_URL=https://your-server.example.com
```

## Getting Started

1. Clone the client repository:

   ```bash
   git clone https://github.com/yousufali2525/MentorLagbe-Client.git
   cd MentorLagbe-Client
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Create `.env.local` in the project root using the placeholder example above and replace the values with your own configuration.

4. Start the development server:

   ```bash
   npm run dev
   ```

5. Create a production build:

   ```bash
   npm run build
   ```

6. Start the production server:

   ```bash
   npm run start
   ```
