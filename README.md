# repo-health

A tool for tracking code quality changes across commits. Helps identify which changes impact codebase health and understand contributor impact on code quality over time.

## Purpose

This project aims to help developers improve code quality by providing commit-level insights. Instead of just seeing current metrics, you can track how quality evolves, identify problematic commits, and understand which contributions improve the codebase versus those that degrade it.

The goal is to make code quality measurable and actionable without getting overwhelmed by complexity.

## Current Status

Phase 1 is complete. The foundation is built with modern tools and proper architecture:

- Next.js 16 with App Router for server-side rendering
- End-to-end type safety using tRPC
- Redis caching to stay within GitHub API limits
- Chakra UI for the interface
- Zod for input validation
- Prisma ORM with MySQL for data persistence

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
│   ├── repoInput.tsx      # Repository search input
│   └── Footer.tsx         # Footer component
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
    └── redis.ts           # Redis client and cache service
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
- tRPC React Query

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
User Input -> Frontend Validation -> tRPC Client -> tRPC Router -> Input Validation (Zod) ->GitHub Service -> Check Redis Cache -> Cache Miss → GitHub API Call -> Store in Cache -> Save Metadata -> MySQL (Prisma) ->
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
- Chakra UI design system
- Server-side rendering
- GitHub token support

### Phase 2: Authentication and Private Repos (Next)

- GitHub OAuth integration
- User authentication system
- Session management
- Private repository access
- Per-user GitHub tokens and rate limits

### Phase 3: Analysis Engine

- Commit-by-commit analysis
- Code quality metrics algorithm ( I got no idea, I will figure it out)
- Track changes over time
- Contributor ranking by code quality impact (I got no idea, it requires sufferring a bit :) )
- Identify commits that degrade quality ( Same here, requires sufferring :) )

After this Phase, I will have at least something that works which I can make it better and Also, definitely I need to tests and deploy the product.

## Current Features

- Repository search for public GitHub repos
- Key metrics: stars, forks, commits (90 days), open issues
- Top contributors list
- Language breakdown
- Recent commit activity
- Redis caching for fast repeated queries

## Planned Features

- GitHub OAuth for private repository access
- Commit-level quality analysis
- Code quality trends over time
- Contributor impact rankings
- Quality degradation detection
- Interactive charts and visualizations
- Webhook support for real-time analysis

## Development Philosophy

This project follows an iterative approach: build it, then improve it. The focus is on getting features working first, then refactoring for maintainability and performance.

1. Make it work
2. Add features incrementally
3. Refactor continuously
4. Optimize when needed
5. Add tests and if breaks get suspicious and fix and add more tests
6. Deploy
