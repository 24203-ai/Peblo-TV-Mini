# Peblo TV Mini

A robust streaming platform content management system and viewer.

## How to Run

1. **Copy Environment config:** `cp .env.example .env`
2. **Start Docker:** `docker compose up --build -d`
3. **Seed Database:** `docker exec -it peblo_mini-backend-1 python scripts/seed.py` (Wait for Postgres to initialize first)
4. **Access the apps:**
   - Backend API: `http://localhost:8000`
   - CMS (Editor/Admin): `http://localhost:3000`
   - Viewer: `http://localhost:4000`

## Demo Credentials

The Peblo TV Mini CMS is designed for internal company use and does not provide public registration. Instead, demo accounts are automatically created by the database seed script for evaluation purposes.

**Admin**
- Username: `admin`
- Password: `admin123`
- Permissions: CRUD + publish

**Editor**
- Username: `editor`
- Password: `editor123`
- Permissions: CRUD, cannot publish

## Architecture & Design Decisions

### Why a Published Catalogue?
The viewer needs to be highly available, cacheable, and incredibly fast. Instead of the viewer hitting the PostgreSQL database (which handles complex relations and validation rules), we generate a static `catalogue.json`. This decouples the public streaming site from the internal CMS, ensuring that sudden traffic spikes on the viewer won't affect editors, and complex DB schema updates won't break the frontend.

### Atomic Publishing & Crash Behavior
When publishing, the backend creates a temporary `.tmp` file, writes the JSON, and then uses `os.replace()` to atomically swap the file to `catalogue.json`.
- **Failure before promotion:** The `.tmp` file is discarded or overwritten next time; the public catalogue remains perfectly intact on the previous version.
- **Failure after promotion:** It succeeds. `os.replace` guarantees that the viewer never reads a partially written file, even under heavy concurrency.

### Search Implementation & Scaling Limitation
The `GET /catalog/search` endpoint reads `catalogue.json` into memory and performs an iterative `AND` filter over the data structure.
**Limitation:** Loading the entire JSON into Python memory for every request will not scale to tens of thousands of shows/episodes.
**Trade-offs:** We skipped Elasticsearch or PostgreSQL Full-Text Search to reduce infrastructure complexity for this MVP, optimizing for development speed.

### Storage Abstraction & R2 Migration
Artwork uploads utilize a `BaseStorage` abstraction (`LocalDiskStorage`). If we migrate to Cloudflare R2 or AWS S3, we simply write an `S3Storage` class inheriting the base abstraction, inject it into the router, and zero application logic needs to change.

## Project Scope

### Skipped Features
To prioritize core functionality under a strict time limit, we intentionally skipped:
- Elasticsearch / Redis caching
- Kubernetes / Cloudflare deployment
- Complex UI animations
- Viewer recommendations
- Catalogue versioning / rollbacks / audit logs

### AI Tools Used
- Google DeepMind Gemini (Advanced Agentic Coding Tooling)
- **Output Accepted:** Core boilerplate generation, FastAPI structural setup, Docker configuration, complex React form state management.
- **Output Rejected/Corrected:** Several instances of overly complex global state management (Redux) were rejected in favor of simpler TanStack Query integrations.

### Approximate Time Spent
- Backend & Validation: 2 hours
- Frontend (CMS & Viewer): 1.5 hours
- CI/Docker/Documentation: 30 minutes
