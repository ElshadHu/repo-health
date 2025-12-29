# Contributing to repo-health

Thank you for your interest in contributing! This guide will help you get started.

## Getting Started

### Prerequisites

- Node.js 24+
- MySQL database
- Redis instance
- GitHub OAuth App (for authentication)
- OpenAI API key (for AI features)

### Setup

```bash
# 1. Fork the repository on GitHub (click the Fork button)

# 2. Clone your fork
git clone https://github.com/YOUR_USERNAME/repo-health.git
cd repo-health

# 3. Add upstream remote (to sync with original repo)
git remote add upstream https://github.com/ElshadHu/repo-health.git

# 4. Install dependencies
npm install

# 5. Run database migrations
npx prisma db push

# 6. Start development server
npm run dev
```

### Environment Variables

| Variable          | Description                    | Required |
| ----------------- | ------------------------------ | -------- |
| `DATABASE_URL`    | MySQL connection string        | Yes      |
| `REDIS_URL`       | Redis connection string        | Yes      |
| `NEXTAUTH_SECRET` | Auth secret (generate random)  | Yes      |
| `GITHUB_ID`       | GitHub OAuth App ID            | Yes      |
| `GITHUB_SECRET`   | GitHub OAuth App Secret        | Yes      |
| `OPENAI_API_KEY`  | OpenAI API key for AI features | Yes      |

---

## Commands

| Command          | Description               |
| ---------------- | ------------------------- |
| `npm run dev`    | Start development server  |
| `npm run build`  | Build for production      |
| `npm run start`  | Start production server   |
| `npm run lint`   | Run ESLint                |
| `npm run format` | Format code with Prettier |

---

## Code Style

### General Rules

- Use **TypeScript** for all code
- Use **Prettier** for formatting (run `npm run format` before committing)
- Use **ESLint** for linting (run `npm run lint` to check)
- Prefer explicit return types over implicit

### File Naming

| Type       | Convention        | Example                   |
| ---------- | ----------------- | ------------------------- |
| Components | PascalCase        | `PitfallsTable.tsx`       |
| Services   | camelCase         | `healthScore.ts`          |
| Types      | camelCase         | `contributor.ts`          |
| Routes     | lowercase folders | `app/prs/[owner]/[repo]/` |

### Variable Naming

- Use **camelCase** for all variables and function names
- Use **UPPER_SNAKE_CASE** for constants
- Use **PascalCase** for types, interfaces, and components

```typescript
// Good
const userName = "admin";
const CACHE_TTL = 3600;
type UserProfile = { name: string };

// Bad
const user_name = "admin";
const cacheTtl = 3600;
```

### Testing

Comprehensive tests are recommended to ensure your feature or bug fix doesn't break anything:

- Write tests for new features when possible
- Verify existing tests pass with `npm run lint`
- Test edge cases and error handling
- Document test scenarios in PR description

### AI / Coding Agents Policy

Using AI coding assistants (GitHub Copilot, Cursor, Claude, etc.) is acceptable **only if**:

1. **You understand the code** - Don't blindly accept AI suggestions
2. **You can explain it** - Be ready to describe what the code does in your PR
3. **You verify it works** - Test AI-generated code thoroughly
4. **You take responsibility** - The code is yours once you commit it

AI is a tool, not a replacement for understanding. Take time to reason through the code before committing.

---

## Project Structure

```
src/
├── app/                  # Next.js pages
├── components/           # React components
├── server/
│   ├── routers/          # tRPC routers
│   ├── services/         # Business logic
│   └── types/            # TypeScript types
├── trpc/                 # tRPC setup
└── lib/                  # Utilities (Redis, Prisma, Auth)
```

---

## Pull Request Guidelines

1. **Branch naming**: `feature/description` or `fix/description`
2. **Commit messages**: Use clear, descriptive messages
3. **Tests**: Ensure `npm run lint` passes
4. **Format**: Run `npm run format` before committing
5. **Description**: Explain what changed and why

6. **Sync**: Always pull before push. Use `git rebase` if you know it, otherwise `git merge` is fine

---

## Questions?

Open an issue or reach out on GitHub Discussions.
