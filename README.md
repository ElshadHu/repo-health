# repo-health

A tool for tracking code quality changes across commits. Helps identify which changes impact codebase health and understand contributor impact on code quality over time.

## Why I'm Building This

I was drinking my coffee this morning thinking about a problem I keep running into: **I waste too much time on open source projects that aren't worth it.**

I open GitHub, search by language, click "recently updated" - but that's deceiving. Some projects are "recently updated" by bots or typo fixes but haven't had real activity in months. I spend hours reading documentation, struggling with dependencies, only to realize the project is abandoned or the maintainers don't respond.

Based on this problem, I decided to go this way:

- **Health Score (0-100)** - Is this project actually active and maintained?
- **Dependency Analysis** - How many dependencies? How complex is the setup?
- **Time Estimations** - How long will it take to set up and build?
- **Community Reports** - Is this a welcoming community or toxic environment?

See [ROADMAP.md](./ROADMAP.md) for the full implementation plan.

---

## Purpose

This project aims to help developers improve code quality by providing commit-level insights. Instead of just seeing current metrics, you can track how quality evolves, identify problematic commits, and understand which contributions improve the codebase versus those that degrade it.

The goal is to make code quality measurable and actionable without getting overwhelmed by complexity.

## Current Status

Phase 1 is complete. The foundation is built with modern tools and proper architecture:

- Next.js 16 with App Router for server-side rendering
- End-to-end type safety using tRPC
- Redis caching to stay within GitHub API limits
- Chakra UI for the interface (GitHub dark theme)
- Zod for input validation
- Prisma ORM with MySQL for data persistence
- GitHub OAuth for private repository access

## Project Structure

```
src/
├── app/                    # Next.js pages and layouts
│   ├── page.tsx           # Main analyzer UI
│   ├── layout.tsx         # Root layout wrapper
│   ├── providers.tsx      # Chakra + tRPC providers
│   └── api/trpc/          # tRPC HTTP handler
│
├── components/             # Reusable UI components
│   ├── PageHeader.tsx     # Header with auth button
│   ├── LoadingState.tsx   # Loading spinner
│   ├── AuthButton.tsx     # GitHub sign in/out
│   ├── repoInput.tsx      # Repository search input
│   └── cards/             # Display cards
│       ├── RepositoryCard.tsx
│       ├── StatCard.tsx
│       ├── CommitListCard.tsx
│       ├── ContributorCard.tsx
│       └── LanguageCard.tsx
│
├── trpc/                   # tRPC configuration
│   ├── init.ts            # tRPC initialization and context
│   ├── router.ts          # Main router definition
│   └── client.tsx         # Client-side tRPC setup
│
├── server/                 # Backend logic
│   ├── routers/
│   │   └── githubRouter.ts    # GitHub API endpoints
│   └── services/
│       └── githubService.ts   # GitHub API calls and caching
│
└── lib/                    # Shared utilities
    ├── prisma.ts          # Prisma client
    ├── redis.ts           # Redis client and cache service
    └── auth.ts            # NextAuth configuration
```

### How It Works

1. User enters a repository URL
2. Frontend validates the input and makes a type-safe tRPC call
3. Backend checks Redis cache first
4. If not cached, fetches data from GitHub API with Octokit
5. Stores result in Redis (1-2 hour TTL) and MySQL
6. Returns structured data to frontend
7. UI displays metrics in organized cards

## Architecture

### Tech Stack

**Frontend**

- Next.js 16
- React 19
- Chakra UI

**Backend**

- tRPC
- Octokit
- Prisma
- Zod

**Data Layer**

- MySQL
- Redis
- GitHub API

### Request Flow

That is how I am seeing the request flow how it works

```
User Input -> Frontend Validation -> tRPC Client -> tRPC Router -> Input Validation (Zod) -> GitHub Service -> Check Redis Cache -> Cache Miss → GitHub API Call -> Store in Cache -> Save Metadata -> MySQL (Prisma) ->
Return Data -> Frontend -> Display Cards
```

## Roadmap

### Phase 1: Foundation (Complete)

- Project setup with Next.js and TypeScript
- tRPC for end-to-end type safety
- Prisma schema and MySQL integration
- GitHub API integration with Octokit
- Redis caching layer
- Input validation with Zod
- Chakra UI design system (GitHub dark theme)
- Server-side rendering
- GitHub OAuth authentication
- Component extraction for maintainability

### Phase 2: Core Analysis (Next)

- Health Score Algorithm (0-100 weighted score)
- Dependency Analysis (package.json, requirements.txt, go.mod, CMakeLists.txt)
- Setup Time Estimation
- Build Time Estimation (compiled languages)

### Phase 3: Community Features

- Community Reports system
- Admin verification panel
- Contributor rankings enhancement

### Phase 4: Polish & Deploy

- Test cases
- Deployment
- More package managers

## Current Features

- Repository search for public GitHub repos
- Private repository access with GitHub OAuth
- Key metrics: stars, forks, commits (90 days), open issues
- Top contributors list
- Language breakdown
- Recent commit activity
- Redis caching for fast repeated queries
- GitHub dark theme UI

## Planned Features

See [ROADMAP.md](./ROADMAP.md) for detailed implementation plan.

- Health Score (0-100)
- Dependency complexity analysis
- Setup and build time estimations
- Community reports with admin verification
- Package vulnerability/severity analysis

## Development Philosophy

This project follows an iterative approach: build it, then improve it. The focus is on getting features working first, then refactoring for maintainability and performance.

1. Make it work
2. Add features incrementally
3. Refactor continuously
4. Optimize when needed
5. Add tests and if breaks get suspicious and fix and add more tests
6. Deploy
