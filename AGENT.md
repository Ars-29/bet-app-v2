# AGENT.md - Betting App Development Guide

## Build/Test Commands
- **Client**: `npm run dev` (dev), `npm run build` (build), `npm run lint` (lint)
- **Server**: `npm run dev` (nodemon), `npm run start` (production)
- **Server Tests**: `npm test` (run all Jest tests) - Single test: `npx jest path/to/test.js`

## Architecture
- **Frontend**: Next.js 15 with React 19, TailwindCSS, Radix UI components
- **Backend**: Express.js with MongoDB (Mongoose), JWT auth, Node-cron for scheduling
- **Database**: MongoDB with models: User, Bet, League, Transaction, MatchOdds
- **State**: Redux Toolkit (@reduxjs/toolkit) for client state management

## Code Style
- **Imports**: Use `@/` path alias for client components (configured in jsconfig.json)
- **Components**: Functional components with hooks, 'use client' directive for client components
- **Files**: camelCase for JS files, PascalCase for React components (.jsx extension)
- **Backend**: ES modules (type: "module"), async/await patterns, Mongoose schemas
- **Styling**: TailwindCSS utility classes, consistent spacing with gap-* classes
- **Props**: Destructure props in function parameters, use proper JSX event handlers
- **Testing**: Jest with node environment for backend, test files in `server/src/tests/`
