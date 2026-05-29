# BlogSpace 🖊️

A production-ready, full-stack multi-user blogging platform built with React 18, Node.js, TypeScript, and PostgreSQL.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite + TypeScript + Tailwind CSS |
| Backend | Node.js + Express.js + TypeScript |
| Database | PostgreSQL + Prisma ORM |
| Auth | JWT + HttpOnly Cookies + bcrypt |
| Rich Text | React Quill + react-markdown |
| Validation | Zod |
| Icons | lucide-react |

## Features

- **Authentication** — Register, login, logout with JWT + HttpOnly cookies
- **Role-Based Access** — READER, AUTHOR, ADMIN roles with protected routes
- **Rich Text Editor** — React Quill with Markdown toggle and live preview
- **Posts** — Create, edit, delete, publish/draft, auto-slug generation
- **Comments** — Threaded comments with delete (own or admin)
- **Reactions** — Like / Dislike system with counts
- **Search** — Full-text search across posts
- **Dark Mode** — System-aware with manual toggle
- **Responsive** — Mobile-first design
- **Security** — Helmet, CORS, HTML sanitization, rate limiting

## Prerequisites

- Node.js 18+
- PostgreSQL 14+
- npm or yarn

## Setup

### 1. Clone & Install

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 2. Configure Environment

```bash
cd backend
cp .env.example .env
```

Edit `.env`:
```env
DATABASE_URL="postgresql://YOUR_USER:YOUR_PASSWORD@localhost:5432/blogspace"
JWT_SECRET="your-super-secret-key-min-32-chars"
JWT_EXPIRES_IN="7d"
PORT=5000
NODE_ENV="development"
CLIENT_URL="http://localhost:5173"
```

### 3. Database Setup

```bash
cd backend

# Run migrations
npx prisma migrate dev --name init

# Generate Prisma client
npx prisma generate

# Seed with sample data (optional)
npm run db:seed
```

### 4. Run Development Servers

```bash
# Terminal 1 — Backend
cd backend
npm run dev

# Terminal 2 — Frontend
cd frontend
npm run dev
```

- Frontend: http://localhost:5173
- Backend API: http://localhost:5000
- Prisma Studio: `npm run db:studio` (in backend/)

## Seed Credentials

After running `npm run db:seed`:

| Role | Email | Password |
|------|-------|----------|
| ADMIN | admin@blogspace.dev | admin123456 |
| AUTHOR | author@blogspace.dev | author123456 |

## API Reference

### Auth
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/v1/auth/register` | — | Register new user |
| POST | `/api/v1/auth/login` | — | Login |
| GET | `/api/v1/auth/me` | ✓ | Get current user |
| POST | `/api/v1/auth/logout` | — | Logout |
| PATCH | `/api/v1/auth/profile` | ✓ | Update profile |

### Posts
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/v1/posts` | — | List published posts (paginated) |
| GET | `/api/v1/posts/search?q=` | — | Search posts |
| GET | `/api/v1/posts/slug/:slug` | — | Get post by slug |
| GET | `/api/v1/posts/:id` | — | Get post by ID |
| GET | `/api/v1/posts/my-posts` | ✓ | Get own posts |
| POST | `/api/v1/posts` | AUTHOR+ | Create post |
| PUT | `/api/v1/posts/:id` | AUTHOR+ | Update post |
| DELETE | `/api/v1/posts/:id` | AUTHOR+ | Delete post |
| POST | `/api/v1/posts/:id/react` | ✓ | Like/dislike post |

### Comments
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/v1/posts/:postId/comments` | — | Get comments |
| POST | `/api/v1/posts/:postId/comments` | ✓ | Create comment |
| DELETE | `/api/v1/comments/:id` | ✓ | Delete comment |

## Project Structure

```
blogSpace/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── seed.ts
│   └── src/
│       ├── controllers/    # Route handlers
│       ├── middleware/     # Auth, roles, validation
│       ├── routes/         # Express routers
│       ├── schemas/        # Zod schemas
│       ├── lib/            # Prisma client
│       ├── utils/          # Slug generator
│       └── index.ts        # App entry point
└── frontend/
    └── src/
        ├── api/            # Axios instance
        ├── components/     # Reusable UI components
        ├── context/        # Auth & Theme contexts
        ├── hooks/          # Custom hooks
        ├── pages/          # Route pages
        └── types/          # TypeScript types
```

## Production Build

```bash
# Backend
cd backend
npm run build
npm start

# Frontend
cd frontend
npm run build
# Serve dist/ with nginx or similar
```

## Security Notes

- Change `JWT_SECRET` to a strong random string in production
- Set `NODE_ENV=production` to enable secure cookies
- Configure proper CORS origins
- Use environment variables — never commit `.env`
