# repo-health

A **contributor-first platform** for understanding GitHub repositories and making open source contributions easier. Designed to help contributors find the right issues, understand codebases faster, and avoid common pitfalls.

> **Mission**: Make open source contribution less intimidating and more accessible for everyone.

## Features

- **Health Score (0-100)** - Activity, maintenance, community, and documentation scores
- **Dependency Analysis** - Scan for vulnerable packages across multiple ecosystems
- **PR Analytics** - Merge times, author breakdown, AI reviewer detection
- **Issue Analytics** - Crackability scores, hidden gems, hot issues for finding contribution opportunities
- **Activity Monitor** - Anomaly detection for commit patterns using Z-score analysis
- **Project Overview** - AI-powered codebase visualization and file-issue mapping
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
│   ├── api/                  # API routes (tRPC, auth)
│   ├── prs/                  # PR analytics
│   ├── issues/               # Issue analytics
│   ├── dependencies/         # Dependency analysis
│   └── activity/             # Activity monitor
├── components/               # UI components
│   ├── cards/                # Stat cards
│   ├── prs/                  # PR analytics UI
│   ├── issues/               # Issue analytics UI
│   ├── dependencies/         # Vulnerability UI
│   ├── anomaly/              # Activity monitor UI
│   └── overview/             # Architecture diagram
├── server/
│   ├── routers/              # tRPC endpoints
│   ├── services/
│   │   ├── github/           # GitHub API
│   │   ├── deps/             # Dependency analysis
│   │   ├── prs/              # PR analysis
│   │   ├── issues/           # Issue analysis
│   │   ├── anomaly/          # Activity anomaly detection
│   │   ├── overview/         # AI-powered file-issue mapping
│   │   └── user/             # User/auth services
│   └── types/                # TypeScript types
├── trpc/                     # tRPC config
├── lib/                      # Redis, Prisma, Auth
├── types/                    # Shared TypeScript types
└── generated/                # Prisma generated client
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
- [x] **Issue Analytics** - Crackability scores, hidden gems, hot issues
- [x] **Activity Monitor** - Anomaly detection using Z-score analysis, burst detection, churn analysis
- [x] **Project Overview** - D3 architecture diagram with AI-powered file-issue mapping

### In Progress (~15%)

- [x] UI polish and responsive design
- [ ] Search functionality in vulnerability table
- [ ] Better error handling

### Planned (~10%)

- [ ] **Discussions Analysis** - Community engagement metrics
- [ ] Community reports system
- [ ] Setup time estimation
- [ ] More languages (Java/Maven, PHP/Composer)
- [ ] Historical trend charts

---

## Issue Analytics

Analyze repository issues to find contribution opportunities and assess maintainer responsiveness.

| Metric             | Description                  | Calculation                        |
| ------------------ | ---------------------------- | ---------------------------------- |
| Crackability Score | How approachable an issue is | Labels + length + age + reactions  |
| Hidden Gems        | Overlooked high-value issues | High reactions + old + no assignee |
| Hot Issues         | Active discussions           | Comments > 5 + recent activity     |
| Issue Pathways     | Journey from open → closed   | State transitions + timing         |

### Crackability Score Algorithm

```
Score = (labelScore × 0.3) + (lengthScore × 0.2) + (ageScore × 0.2) + (reactionScore × 0.3)
```

| Factor                   | Score | Condition     |
| ------------------------ | ----- | ------------- |
| `good first issue` label | +30   | Label present |
| `help wanted` label      | +20   | Label present |
| Short description        | +20   | < 500 chars   |
| Old issue                | -10   | > 90 days     |
| High reactions           | +15   | > 5 reactions |

### Difficulty Grades

| Grade  | Score Range | Meaning                 |
| ------ | ----------- | ----------------------- |
| Easy   | 70-100      | Good for first-timers   |
| Medium | 50-69       | Some experience needed  |
| Hard   | 30-49       | Complex issue           |
| Expert | 0-29        | Deep knowledge required |

---

> **Note on Security Scanner**: This project previously included a secret detection feature inspired by [Gitleaks](https://github.com/gitleaks/gitleaks) and [TruffleHog](https://github.com/trufflesecurity/trufflehog). While it was a great learning experience exploring regex patterns and Shannon entropy, it didn't align with the core mission of helping open source contributors. The feature has been removed to keep the project focused.

---

## Activity Monitor

Detect suspicious commit patterns using statistical anomaly detection.

### Detection Methods

| Method            | Description                      | Threshold        |
| ----------------- | -------------------------------- | ---------------- |
| Z-Score Analysis  | Statistical outlier detection    | \|Z\| > 2.5      |
| Sensitive Files   | .env, .pem, secrets, credentials | Pattern match    |
| Off-Hours Commits | Activity between 12am-6am        | Time check       |
| Burst Detection   | Many commits in short window     | 5+ in 10 minutes |
| Churn Analysis    | High deletion ratio per commit   | >80% deletions   |

### Z-Score Formula

```
Z = (value - mean) / standardDeviation
```

| Z-Score | Interpretation     |
| ------- | ------------------ |
| < 2.0   | Normal             |
| 2.0-3.0 | Unusual (warning)  |
| > 3.0   | Anomaly (critical) |

### Anomaly Types

| Type     | Severity | Example                            |
| -------- | -------- | ---------------------------------- |
| Churn    | Critical | Deleted 90% of code (12,453 lines) |
| File     | Critical | .env.production modified           |
| Velocity | Warning  | 23 commits in 1 hour               |
| Time     | Warning  | Commit at 3:42 AM                  |
| Pattern  | Info     | 40% weekend activity               |

### Risk Score Calculation

```
Score = Σ(severityWeight × eventCount)
```

| Severity | Weight |
| -------- | ------ |
| Critical | +20    |
| Warning  | +8     |
| Info     | +2     |

### Risk Grades

| Grade | Score  | Meaning            |
| ----- | ------ | ------------------ |
| A     | 0-10   | Normal activity    |
| B     | 11-30  | Minor anomalies    |
| C     | 31-50  | Review recommended |
| D     | 51-70  | Suspicious         |
| F     | 71-100 | Critical review    |

---

## Project Overview

AI-powered codebase visualization with file-issue mapping.

### Features

| Feature              | Description                                            |
| -------------------- | ------------------------------------------------------ |
| Architecture Diagram | D3.js tree visualization of repository structure       |
| File-Issue Mapping   | Links GitHub issues to specific files using regex + AI |
| Visual Indicators    | Red badges showing issue counts per file               |
| AI Descriptions      | Auto-generated file purpose summaries                  |
| Click-to-View        | Click files to see related issues in side panel        |

### How It Works

| Pass | Method           | Purpose                                              |
| ---- | ---------------- | ---------------------------------------------------- |
| 1    | Regex            | Extract file paths from issue titles/bodies          |
| 2    | Reverse Map      | Build file → issues lookup                           |
| 3    | AI (gpt-4o-mini) | Infer unmapped relationships + generate descriptions |

### Next Steps

| Feature             | Description                                          |
| ------------------- | ---------------------------------------------------- |
| Estimated Solutions | AI-powered fix suggestions by analyzing file context |
| Scope Narrowing     | Identify minimal code changes needed for each issue  |

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

# Build the project
npm run build

# See linting errors if exists
npm run lint

# format code
npm run format

```

Required environment variables:

- `DATABASE_URL` - MySQL connection string
- `REDIS_URL` - Redis connection string
- `NEXTAUTH_SECRET` - Auth secret
- `GITHUB_ID` - GitHub OAuth app ID
- `GITHUB_SECRET` - GitHub OAuth app secret
