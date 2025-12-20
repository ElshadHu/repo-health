# repo-health

A tool for analyzing GitHub repository health, identifying vulnerable dependencies, and understanding contributor impact.

## Features

- **Health Score (0-100)** - Activity, maintenance, community, and documentation scores
- **Dependency Analysis** - Scan for vulnerable packages across multiple ecosystems
- **PR Analytics** - Merge times, author breakdown, AI reviewer detection
- **Contributor Journey** - Visualize first-time → returning → core contributor flow
- **Related PRs** - Find community fixes for vulnerabilities
- **GitHub OAuth** - Access private repositories

---

## Supported Ecosystems

| Language              | File                                 | Ecosystem | Status  |
| --------------------- | ------------------------------------ | --------- | ------- |
| JavaScript/TypeScript | `package.json`                       | npm       | Working |
| Python                | `requirements.txt`, `pyproject.toml` | PyPI      | Working |
| Go                    | `go.mod`                             | Go        | Working |
| Rust                  | `Cargo.toml`                         | crates.io | Working |
| C++                   | `conanfile.txt`                      | Conan     | Working |
| C#                    | `packages.config`                    | NuGet     | Working |

---

## Tech Stack

**Frontend**: Next.js 16, React 19, Chakra UI  
**Backend**: tRPC, Octokit, Zod  
**Data**: MySQL (Prisma), Redis, OSV API

---

## Project Structure

```
src/
├── app/                      # Next.js pages
│   └── prs/[owner]/[repo]/  # PR analytics page
├── components/               # UI components
│   ├── cards/               # Stat cards
│   ├── prs/                 # PR analytics UI
│   └── dependencies/        # Vulnerability UI
├── server/
│   ├── routers/             # tRPC endpoints
│   ├── services/
│   │   ├── github/          # GitHub API
│   │   ├── deps/            # Dependency analysis
│   │   ├── prs/             # PR analysis
│   │   │   └── analyze.ts   # PR service
│   │   ├── healthScore.ts   # Score calculation
│   │   └── calculations.ts  # Algorithms
│   └── types/               # TypeScript types
├── trpc/                     # tRPC config
└── lib/                      # Redis, Prisma, Auth
```

---

## PR Analytics

Analyze pull request patterns and community contributor behavior.

| Metric                | Description                               | Data Source           |
| --------------------- | ----------------------------------------- | --------------------- |
| Total PRs             | Open, closed, and merged counts           | GitHub Pulls API      |
| Merge Time            | Average and median time to merge          | PR timestamps         |
| Author Breakdown      | Maintainers vs Community vs Bots          | author_association    |
| AI Reviewer Detection | Comments from CodeRabbit, Dependabot, etc | Issue/Review comments |
| Contributor Journey   | First-time → Returning → Regular → Core   | PR author history     |

### AI Bots Detected

| Bot Name            | Type        |
| ------------------- | ----------- |
| coderabbitai[bot]   | Code Review |
| dependabot[bot]     | Dependency  |
| renovate[bot]       | Dependency  |
| github-actions[bot] | CI/CD       |

---

## Roadmap Progress

### Completed (~80%)

- [x] Next.js + tRPC + Prisma setup
- [x] GitHub API integration with caching
- [x] Health Score algorithm
- [x] GitHub OAuth for private repos
- [x] Dependency vulnerability scanning (6 languages)
- [x] Related PRs search
- [x] Issue existence check
- [x] **PR Analytics** - Merge times, author breakdown, AI detection
- [x] **Contributor Journey** - Sankey diagram visualization
- [x] **AI Interaction Tracking** - Community wrestling with AI reviews
- [x] **Search History** - Save searches for logged-in users, autocomplete with Fuse.js

### In Progress (~15%)

- [ ] UI polish and responsive design
- [ ] Search functionality in vulnerability table
- [ ] Better error handling

### Planned (~10%)

- [ ] **Issues Analysis** - Find related issues, track issue patterns
- [ ] **Discussions Analysis** - Community engagement metrics
- [ ] Community reports system
- [ ] Setup time estimation
- [ ] More languages (Java/Maven, PHP/Composer)
- [ ] Historical trend charts

---

## Quick Start

```bash
# Install dependencies
npm install

# Set environment variables
cp .env.example .env

# Run database migrations
npx prisma db push

# Start dev server
npm run dev
```

Required environment variables:

- `DATABASE_URL` - MySQL connection string
- `REDIS_URL` - Redis connection string
- `NEXTAUTH_SECRET` - Auth secret
- `GITHUB_ID` - GitHub OAuth app ID
- `GITHUB_SECRET` - GitHub OAuth app secret
