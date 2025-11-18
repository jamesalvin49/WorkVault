# Project README

Short description
This repository is a Next.js-based web application with Docker and Prisma support. It contains server- and client-side code under `src/`, a Prisma schema in `prisma/`, and containerization configuration at the repo root.

Quick links

- Project manifest: [package.json](package.json)
- Next config: [next.config.ts](next.config.ts)
- TypeScript config: [tsconfig.json](tsconfig.json)
- Dockerfile: [Dockerfile](Dockerfile)
- Docker compose (dev): [docker-compose.yml](docker-compose.yml)
- Docker compose (prod): [docker-compose.prod.yml](docker-compose.prod.yml)
- Nginx config: [nginx.conf](nginx.conf)
- Prisma schema: [prisma/schema.prisma](prisma/schema.prisma)
- Environment: [.env](.env) (not committed — see [.gitignore](.gitignore))
- Next types: [next-env.d.ts](next-env.d.ts)
- Tailwind & PostCSS: [tailwind.config.ts](tailwind.config.ts), [postcss.config.mjs](postcss.config.mjs)
- Public assets: [public/](public/)
- Source code: [src/](src/)
  - App entry & pages: [src/app/](src/app/)
  - Reusable components: [src/components/](src/components/)
  - Hooks: [src/hooks/](src/hooks/)
  - Helpers / libraries: [src/lib/](src/lib/)
- Prisma DB files and migrations: [prisma/](prisma/)
- Tests / quick checks: [test.tsx](test.tsx)
- Zed notes: [zed-README.md](zed-README.md)

Prerequisites

- Node.js (check [package.json](package.json) for supported versions)
- npm or yarn
- Docker & docker-compose (if using containerized workflows)

Local development (recommended)

1. Install dependencies:
   npm install
2. Create a local .env file based on your environment needs. See [.gitignore](.gitignore) which excludes env files by default.
3. Run the app in dev mode:
   npm run dev
   (Confirm actual scripts in [package.json](package.json))

Database (Prisma)

- Schema is at [prisma/schema.prisma](prisma/schema.prisma)
- Typical workflow:
  - Adjust connection settings in your `.env`
  - Run migrations / generate client:
    npx prisma generate
    npx prisma migrate dev

Docker / Production

- Build and run using the Dockerfile: [Dockerfile](Dockerfile)
- Compose-based dev: [docker-compose.yml](docker-compose.yml)
- Compose-based prod: [docker-compose.prod.yml](docker-compose.prod.yml)
- Nginx configuration for reverse proxy: [nginx.conf](nginx.conf)

Build & Start

- Build for production:
  npm run build
- Start production server:
  npm start
  (Confirm actual script names in [package.json](package.json))

Testing & Linting

- See test runner or scripts in [package.json](package.json)
- Linting config: [eslint.config.mjs](eslint.config.mjs)

Project structure overview

- [src/](src/) — application source
  - [src/app/](src/app/) — Next.js app routes and layout
  - [src/components/](src/components/) — UI components
  - [src/hooks/](src/hooks/) — React hooks
  - [src/lib/](src/lib/) — helpers, API clients, utils
- [prisma/](prisma/) — Prisma schema and migrations
- [public/](public/) — static assets
- [Dockerfile](Dockerfile), [docker-compose.yml](docker-compose.yml) — containerization

Notes & troubleshooting

- If environment-specific behavior occurs, verify `.env` and consult [.gitignore](.gitignore) to confirm which files are excluded from VCS.
- For build errors, inspect Next build output and the traces in the `.next/` folder.

Contributing

- Follow existing code style in [src/](src/)
- Add tests where appropriate and ensure linting passes per [eslint.config.mjs](eslint.config.mjs)
