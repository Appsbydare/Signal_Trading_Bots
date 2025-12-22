# 🤖 Signal Trading Bots

A Next.js-based trading bot platform with license management and payment integration.

## 🚀 Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 📁 Project Structure

```
STB-19.12/
├── src/                    # Source code (components, pages, utilities)
├── public/                 # Static assets (images, SVGs, sitemaps)
├── docs/                   # 📚 All project documentation
│   ├── specs/             # Technical specifications
│   ├── planning/          # Project planning & requirements
│   └── notes/             # Development notes & references
├── database/              # Database schemas and migrations
├── assets/                # Project assets (images, icons)
├── migrations/            # Database migration files
├── data/                  # Data files
├── fonts/                 # Custom fonts
└── signal_trading_bots/   # Legacy/additional bot code
```

## 📚 Documentation

All project documentation is now organized in the `/docs` directory:

- **Technical Specs**: `/docs/specs/` - API endpoints, backend implementation, license specs
- **Planning**: `/docs/planning/` - Project plans, requirements, improvements
- **Notes**: `/docs/notes/` - Development notes, chat logs, error tracking

See [docs/README.md](./docs/README.md) for detailed documentation navigation.

## 🛠️ Tech Stack

- **Framework**: Next.js 14+ with App Router
- **Language**: TypeScript
- **Styling**: CSS (custom)
- **Database**: SQL-based (see `/database` for schemas)

## 📖 Learn More

To learn more about Next.js:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial

## 🚢 Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme).

Check out the [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## 📝 Recent Changes

- **Codebase Reorganization** (Dec 2025): All documentation moved to `/docs`, assets to `/assets`, database files to `/database`
- Removed duplicate files
- Improved project structure for better maintainability
