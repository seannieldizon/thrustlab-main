# ThrustLab 🚀

**ThrustLab** is a modern, feature-rich web application built with SvelteKit, featuring an immersive 3D parallax sky background, authentication system, and comprehensive dashboard interface. Experience next-generation web design with smooth animations, responsive layouts, and a visually stunning user experience.

## ✨ Features

### 🎨 Visual Design
- **Interactive 3D Parallax Sky Background** - Canvas-based procedural cloud generation with cursor-reactive parallax effects
- **Anime-Style Clouds** - Multi-layered clouds with realistic textures, depth, and continuous drift animation
- **Night Sky Theme** - Dynamic gradient with 150 procedurally generated stars and glowing moon
- **Glassmorphism UI** - Modern frosted glass effects with backdrop filters
- **Premium Search Experience** - Color-coded, module-aware search results with hover animations and glassmorphism design
- **Interactive Tables** - High-contrast, standardized data tables for better readability
- **Responsive Design** - Mobile-first approach with seamless adaptation across all devices

### 🔐 Authentication
- **Secure Session Management** - Token-based authentication with Oslo crypto library
- **User Registration & Login** - Complete auth flow with password hashing
- **Protected Routes** - Server-side session validation
- **30-Day Sessions** - Automatic session expiration and renewal

### 🏗️ Architecture
- **SvelteKit 2.0** - Full-stack framework with server-side rendering
- **Svelte 5 Runes** - Modern reactive state management (`$state`, `$derived`, `$effect`)
- **TypeScript** - Full type safety throughout the application
- **Drizzle ORM** - Type-safe database operations with PostgreSQL
- **Tailwind CSS 4** - Utility-first styling with JIT compilation
- **Vite 7** - Lightning-fast build tool and dev server

### 📱 Pages & Routes
- **Home Page** - Immersive landing with 3D parallax background
- **Dashboard** - User-specific dashboard with personalized content
- **Hangar Zone** - Project management and organization
- **Test Bay** - Testing and experimentation area
- **Turbofan Engine** - Performance optimization tools
- **Overhaul Station** - Maintenance and updates section
- **Profile** - User profile management
- **Authentication** - Login and sign-up flows

## 🚀 Quick Start

### Prerequisites

- **Node.js** (v18 or higher)
- **Docker** (for PostgreSQL database)
- **npm**, **pnpm**, or **yarn**

### Installation

1. **Clone the repository:**

```bash
git clone https://github.com/joshee2004/thrustlab.git
cd thrustlab
```

2. **Install dependencies:**

```bash
npm install
```

3. **Set up environment variables:**

Create a `.env` file in the root directory:

```env
DATABASE_URL="postgresql://root:mysecretpassword@localhost:5432/local"
```

4. **Start the database:**

```bash
npm run db:start
```

5. **Push database schema:**

```bash
npm run db:push
```

6. **Start the development server:**

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## 📜 Available Scripts

### Development
```bash
npm run dev              # Start development server
npm run dev -- --open    # Start dev server and open in browser
```

### Building
```bash
npm run build            # Create production build
npm run preview          # Preview production build
```

### Database
```bash
npm run db:start         # Start PostgreSQL container
npm run db:push          # Push schema changes to database
npm run db:generate      # Generate database migrations
npm run db:migrate       # Run database migrations
npm run db:studio        # Open Drizzle Studio (database GUI)
```

### Code Quality
```bash
npm run check            # Run TypeScript type checking
npm run check:watch      # Run type checking in watch mode
npm run lint             # Run ESLint and Prettier checks
npm run format           # Format code with Prettier
```

## 🧠 JAJA Assistant Knowledge Base

JAJA now uses a Retrieval-Augmented Generation (RAG) pipeline. To keep the assistant up to date with Module 1/2/3 notes, engine parts, and other docs:

1. **Set your OpenAI API key** (same one used for chat streaming):
	```bash
	export OPENAI_API_KEY=sk-...
	```
2. **Rebuild the knowledge base whenever docs change:**
	```bash
	npm run knowledge:build
	```
	This script chunks every Markdown file under `docs/` plus the turbofan component metadata, embeds them with `text-embedding-3-large`, and writes `src/lib/data/jaja-knowledge.json`.
3. **Commit the generated JSON** so the deployed app can load it at runtime. If the file is missing or empty JAJA falls back to its default prompt and will say when it lacks module-specific context.

> Tip: schedule `npm run knowledge:build` in your release checklist so new lessons or engine updates immediately become searchable by JAJA.

## 🗂️ Project Structure

```
thrustlab/
├── src/
│   ├── lib/
│   │   ├── components/          # Reusable UI components
│   │   │   ├── navbar/          # Navigation components
│   │   │   └── ui/              # UI utility components
│   │   ├── server/              # Server-side code
│   │   │   ├── auth.ts          # Authentication logic
│   │   │   └── db/              # Database configuration
│   │   │       ├── index.ts     # Database connection
│   │   │       └── schema.ts    # Drizzle schema definitions
│   │   └── assets/              # Static assets (images, backgrounds)
│   ├── routes/                  # SvelteKit file-based routing
│   │   ├── +layout.svelte       # Global layout wrapper
│   │   ├── +page.svelte         # Home page with 3D parallax
│   │   ├── dashboard/           # Dashboard route
│   │   ├── login/               # Login page
│   │   ├── sign-up/             # Registration page
│   │   └── ...                  # Other routes
│   ├── app.html                 # HTML template
│   ├── app.css                  # Global styles
│   ├── app.d.ts                 # TypeScript declarations
│   └── hooks.server.ts          # Server-side hooks
├── static/                      # Static files served as-is
├── docs/                        # Documentation
│   ├── 3d-parallax-implementation.md  # Parallax system guide
│   └── FORK.md                  # Contribution guidelines
├── compose.yaml                 # Docker Compose configuration
├── drizzle.config.ts            # Drizzle ORM configuration
├── svelte.config.js             # Svelte/SvelteKit config
├── tsconfig.json                # TypeScript configuration
├── vite.config.ts               # Vite configuration
├── eslint.config.js             # ESLint configuration
└── package.json                 # Dependencies and scripts
```

## 🎨 3D Parallax Background

The home page features a sophisticated 4-layer canvas-based parallax system:

- **Sky Layer** - Night gradient with 150 stars and glowing moon
- **Far Clouds** - 11 distant clouds with subtle parallax (15px offset)
- **Mid Clouds** - 6 medium-distance clouds (35px offset)
- **Near Clouds** - 4 foreground clouds with maximum depth (60px offset)

Each cloud is procedurally generated with 8 overlapping puffs, dual-layer rendering (sharp + blur), and realistic textures. The system responds to cursor movement with pixel-based calculations and includes continuous left-to-right drift animation.

For detailed implementation information, see [3D Parallax Implementation Guide](./docs/3d-parallax-implementation.md).

## 🗄️ Database

ThrustLab uses **PostgreSQL** with **Drizzle ORM** for type-safe database operations.

### Schema

- **Users Table** - User accounts with authentication data
- **Sessions Table** - Active user sessions with expiration
- Foreign key relationships with cascading deletes

### Development Workflow

1. Modify schema in `src/lib/server/db/schema.ts`
2. Generate migration: `npm run db:generate`
3. Apply migration: `npm run db:migrate`
4. Or push directly (development): `npm run db:push`

## 🔒 Authentication

Authentication is handled server-side using:

- **Oslo Crypto** - Secure hashing and encoding
- **Session Tokens** - Base64url-encoded random bytes
- **SHA-256 Hashing** - Session ID generation
- **Cookie-Based Sessions** - HTTP-only cookies for security
- **30-Day Expiration** - Automatic session cleanup

Session validation occurs in `hooks.server.ts` for every request.

## 🤝 Contributing

We welcome contributions! Please see our comprehensive guides:

- **[FORK.md](./docs/FORK.md)** - Complete contribution guidelines, development setup, code style, and PR process
- **[3D Parallax Implementation](./docs/3d-parallax-implementation.md)** - Technical deep dive into the parallax system

### Quick Contribution Steps

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes and commit: `git commit -m 'feat: add amazing feature'`
4. Push to your fork: `git push origin feature/amazing-feature`
5. Open a Pull Request

For detailed instructions on forking, setting up your development environment, code style guidelines, and the PR process, please read [FORK.md](./docs/FORK.md).

## 🛠️ Tech Stack

### Frontend
- **Svelte 5** - Reactive UI framework with modern runes API
- **SvelteKit 2** - Full-stack framework with SSR
- **TypeScript** - Static type checking
- **Tailwind CSS 4** - Utility-first CSS framework
- **Vite 7** - Next-generation build tool

### Backend
- **Node.js** - JavaScript runtime
- **SvelteKit API Routes** - Server-side endpoints
- **Drizzle ORM** - Type-safe database ORM
- **PostgreSQL** - Relational database
- **Oslo Crypto** - Cryptographic utilities

### DevOps
- **Docker Compose** - Container orchestration
- **Vercel Adapter** - Deployment to Vercel
- **ESLint** - Code linting
- **Prettier** - Code formatting

## 📦 Deployment

The project uses `@sveltejs/adapter-vercel` for deployment to Vercel.

### Deploy to Vercel

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

### Environment Variables

Required for production:

```env
DATABASE_URL="your-production-database-url"
```

## 📚 Documentation

- [3D Parallax Implementation](./docs/3d-parallax-implementation.md) - Technical deep dive into the parallax system
- [Contributing Guidelines](./docs/FORK.md) - How to fork and contribute
- [SvelteKit Docs](https://kit.svelte.dev/docs) - Official SvelteKit documentation
- [Drizzle ORM Docs](https://orm.drizzle.team/docs) - Database ORM documentation

## 🐛 Troubleshooting

### Database Connection Issues

```bash
# Check if Docker is running
docker ps

# Restart the database
npm run db:start

# Check logs
docker compose logs db
```

### Build Errors

```bash
# Clear SvelteKit cache
rm -rf .svelte-kit

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Run type checking
npm run check
```

### Port Already in Use

If port 5173 is in use, modify `vite.config.ts` or use:

```bash
npm run dev -- --port 3000
```

## 📄 License

This project is private and proprietary. All rights reserved.

## 👥 Authors

- **joshee2004** - *Initial work* - [GitHub](https://github.com/joshee2004)

## 🙏 Acknowledgments

- **Svelte Team** - For the amazing framework
- **Drizzle Team** - For the excellent ORM
- **Vercel** - For deployment platform
- **Open Source Community** - For inspiration and tools

---

**Built with ❤️ using SvelteKit and Svelte 5** 🚀
