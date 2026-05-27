# Perform AI — Fullstack Assessment

This is a small full-stack prototype built for the Perform AI technical assessment. The backend is a NestJS API with a single async `POST /analysis` endpoint that mocks a biomechanics processing pipeline. The frontend is an Ionic + Angular app where you enter an athlete name, submit, and watch the result come back via polling.

## What's in here

```
backend/   NestJS API (TypeScript, Node 20)
frontend/  Ionic + Angular app
docs/      Architecture note (one page, four questions)
postman/   Postman collection with five requests
```

## Prerequisites

- Node 20 — if you use nvm, `nvm use` at the repo root picks it up from `.nvmrc`
- npm 10+

## Getting started

```bash
cd backend && npm install
cd ../frontend && npm install
```

Then open two terminals:

```bash
# terminal 1
cd backend && npm start        # http://localhost:3000
```

```bash
# terminal 2
cd frontend && npm start       # http://localhost:4200
```

Open `http://localhost:4200`, enter an athlete name, and hit **Run Analysis**. Results come back in roughly 800–1500 ms. Using `"Demo Athlete"` as the name always returns the same fixed metrics so you can verify the display easily.

## Trying the API directly

Swagger UI is at `http://localhost:3000/api/docs` if you prefer a browser.

For curl:

```bash
# health check
curl http://localhost:3000/health

# submit a job
curl -s -X POST http://localhost:3000/analysis \
  -H 'Content-Type: application/json' \
  -d '{"athlete": "Demo Athlete"}' | jq .
# → 202 { "id": "...", "status": "PENDING" }

# poll until done (replace <id>)
curl -s http://localhost:3000/analysis/<id> | jq .
# → { "id": "...", "status": "COMPLETED", "foot_contact": 0.32, "foot_off": 1.08, "turning_point": 1.22 }
```

Any athlete name other than `"Demo Athlete"` returns random values within realistic biomechanics ranges.

## Running the tests

```bash
# backend
cd backend
npm test            # unit tests
npm run test:e2e    # end-to-end (supertest against a live NestJS app)

# frontend
cd frontend
npx ng test --watch=false --browsers=ChromeHeadless
```

## Postman

Import `postman/perform-ai.postman_collection.json`. The collection has a pre-request script that saves the returned `id` into `{{analysisId}}` so the poll request works without any manual copy-paste.

## Architecture note

See [docs/architecture.md](docs/architecture.md). Four questions covering production scaling, real biomechanics processing, the path to prod, and reliability/security.


