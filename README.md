# MentorLagbe

MentorLagbe is a full-stack tuition management platform that connects students with tutors. Students can browse tuition opportunities, apply for tuition, manage their applications, and upgrade their accounts. Tutors can post tuition opportunities and manage student applications. Administrators can manage users, tuition posts, and payment transactions.

## Features

### General Features
- Responsive user interface
- User registration and login
- Role-based access control
- Student, Tutor, and Admin roles
- Tuition browsing and details
- Search, filtering, and pagination
- Profile management
- Image upload using ImgBB
- Loading, error, and 404 pages
- Secure API requests
- Toast notifications

### Student Features
- Student dashboard
- Dashboard overview and statistics
- Browse tuition opportunities
- View tuition details
- Apply for tuition
- View submitted applications
- Track application status
- Cancel pending applications
- Manage profile
- Free and Pro plan status

### Tutor Features
- Tutor dashboard
- Post tuition opportunities
- Manage own tuition posts
- Update and delete tuition posts
- View applicants
- Accept or reject applicants
- Manage tutor profile

### Admin Features
- Admin dashboard
- View dashboard statistics
- Manage users
- Manage tuition posts
- Approve or reject tuition posts
- View payment transactions

### Payment Features
- Stripe Checkout integration
- Student and Tutor Pro plan upgrade
- Payment verification through Stripe webhook
- Payment transaction records
- Payment success and cancel pages

## Technologies Used

### Frontend
- Next.js
- React
- TypeScript
- Tailwind CSS
- Lucide React
- ESLint

### Backend
- Node.js
- Express.js
- MongoDB
- Better Auth
- JSON Web Token (JWT)
- Stripe
- CORS
- dotenv

## Project Structure

```text
MentorLagbe/
├── client/
│   ├── src/
│   │   ├── app/
│   │   └── components/
│   ├── package.json
│   └── ...
││
├── server/
│   ├── config/
│   ├── middleware/
│   ├── routes/
│   ├── scripts/
│   │   └── seed.js
│   ├── index.js
│   ├── auth.js
│   └── package.json
│
└── README.md
```

## Installation

### Prerequisites

Make sure you have installed:

- Node.js
- npm
- MongoDB database
- Stripe account for payment configuration
- ImgBB API key for image uploads

### 1. Clone the Repository

```bash
git clone <your-repository-url>
cd MentorLagbe
```

### 2. Install Frontend Dependencies

```bash
cd client
npm install
```

### 3. Install Backend Dependencies

Open another terminal:

```bash
cd server
npm install
```

## Environment Variables

Create environment files for the frontend and backend.

### Frontend Environment

Create `client/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

### Backend Environment

Create `server/.env`:

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
```

**Important:** Replace all placeholder values with your actual credentials. Never commit `.env` or `.env.local` files to GitHub.

## Database

MentorLagbe uses MongoDB.

The application uses the following main collections:

- `users`
- `tuitions`
- `applications`
- `payments`

Authentication may also use a separate database configured through `AUTH_DB_NAME`.

## Seed Data

The project includes a seed script that creates a demo tutor and 12 sample tuition opportunities.

To insert the seed data:

```bash
cd server
npm run seed
```

The seed script inserts sample tuition records with different subjects, locations, educational levels, and salary ranges.

## Running the Project Locally

### Start the Backend

```bash
cd server
npm run dev
```

The backend runs on:

```text
http://localhost:5000
```

### Start the Frontend

Open another terminal:

```bash
cd client
npm run dev
```

The frontend runs on:

```text
http://localhost:3000
```

Open the frontend URL in your browser.

## Available Scripts

### Frontend

| Command | Description |
|---|---|
| `npm run dev` | Start development server |
| `npm run build` | Build the production application |
| `npm start` | Start production server |
| `npm run lint` | Run ESLint |

### Backend

| Command | Description |
|---|---|
| `npm run dev` | Start backend using Nodemon |
| `npm start` | Start backend server |
| `npm run seed` | Insert demo tutor and tuition data |

## Payment Integration

MentorLagbe uses Stripe Checkout for Pro plan upgrades.

To enable payment functionality:

1. Create a Stripe account.
2. Obtain your Stripe API secret key.
3. Configure `STRIPE_SECRET_KEY` in the backend environment.
4. Configure `STRIPE_WEBHOOK_SECRET`.
5. Set the frontend URL through `CLIENT_URL`.
6. Configure your Stripe webhook endpoint to point to the backend payment webhook route.
7. Use Stripe test mode credentials during development.

Never expose Stripe secret keys in frontend code.

## Image Upload

The project uses ImgBB for image hosting.

To enable image uploads:

1. Obtain an ImgBB API key.
2. Set `IMGBB_API_KEY` in the backend environment.
3. Restart the backend server.

## Deployment

### Frontend Deployment

The Next.js frontend can be deployed to platforms that support Next.js, such as Vercel.

Set the following environment variable in your frontend deployment settings:

```env
NEXT_PUBLIC_API_URL=https://your-backend-domain.com
```

### Backend Deployment

The Express backend can be deployed to a Node.js hosting platform such as Render or Railway.

Configure all backend environment variables in the hosting platform's environment settings.

Set:

```env
PORT=5000
CLIENT_URL=https://your-frontend-domain.com
BETTER_AUTH_URL=https://your-backend-domain.com
```

The hosting platform may assign its own port, so the server should use the provided `PORT` environment variable.

### MongoDB Deployment

Use a hosted MongoDB database such as MongoDB Atlas.

- Create a database.
- Configure network access.
- Create a database user.
- Set the MongoDB connection string in `MONGODB_URI`.
- Configure database names using `DB_NAME` and `AUTH_DB_NAME`.

### Production Configuration

Before deploying, make sure:

- Frontend API URL points to the deployed backend.
- Backend CORS allows the deployed frontend domain.
- MongoDB credentials are correct.
- Stripe keys and webhook secret are configured.
- ImgBB API key is configured.
- Environment secrets are not exposed publicly.

## Security

- Authentication-based protected routes
- Role-based authorization
- JWT verification
- Admin authorization middleware
- Stripe webhook signature verification
- Environment-based secret management

## License

This project was developed for educational purposes as part of an assignment.
