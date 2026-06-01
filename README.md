# Roleplay Hub (Frontend)

Roleplay Hub Frontend is the React client for the Roleplay Hub application. It provides the user interface for creating and browsing universes, worlds, characters, families, factions, and family trees used in roleplaying, collaborative storytelling, and worldbuilding.

This repository contains only the frontend. The Rails API lives in the separate `RPH` backend project.

## Overview of my project

Roleplay Hub is meant for users who want to keep their roleplaying and worldbuilding material organized in one place. The application focuses on the characters a user creates, the universes they belong to, the worlds where the story is set, their relationships, families, factions, images, and family tree layouts.

The frontend is responsible for turning the API data into a usable wiki-style experience (insipred by fandom.wikia and wikipedia). It handles the public and authenticated screens, resource creation and editing flows, image cropping/saving, article(character sheet and other profiles like worlds and universes) previews, universe tabs (tab like use for navigating description and resources like characters contained witin it), relationship editing, and the interactive family tree canvas.

The current focus is making the worldbuilding workflow clear and pleasant to use. Future work will include more storytelling tools, timeline features, richer resource navigation, and larger interface updates as the product direction evolves.

## Main Features (WIP)

- Public landing page for Roleplay Hub (WIP)
- Signup and login screens connected to the Rails API
- Authenticated app shell with resource navigation
- Public/private visibility controls for resources
- Wiki-style show pages for universes, worlds, characters, families, and factions
- Resource create and edit forms shared across multiple resource types
- Universe tabs for description, worlds, factions, and characters
- Character relationship editing and linked-character creation flow
- Family tree viewing and editing with draggable nodes and relation edges (WIP but already usable)
- Portrait, crest, cover, banner, and gallery image upload support (with cropping, extensively tested but i consider it still WIP)
- In-browser image cropping before upload
- Article editing with a friendly section editor, raw HTML mode, and live preview
- Responsive layouts for desktop and smaller screens

## Technology Stack

### Frontend

- React 19
- Vite
- JavaScript
- CSS
- ESLint
- Docker
- Docker Compose

### API Integration

- RESTful JSON API under `/api/v1`
- JWT token stored in local storage after login
- Multipart form uploads for resource images
- `VITE_API_URL` environment variable for pointing the client at the backend

The frontend intentionally keeps its stack simple. React for the UI, Vite handles local development and builds, and the backend remains responsible for authentication, persistence, serialization, attachment handling, and business rules.

## Application Areas

The frontend currently includes screens for:

- Landing page
- Login
- Registration
- User home
- Public and owned resource indexes
- Universe show/edit/create
- World show/edit/create
- Character show/edit/create
- Family show/edit/create
- Faction show/edit/create
- Family tree show/edit

## Running the Project

Install dependencies:

```bash
npm install
```

Start the Vite development server:

```bash
npm run dev
```

The frontend runs on:

```text
http://localhost:5173
```

By default, API requests point to:

```text
http://localhost:3001
```

You can override this with:

```bash
VITE_API_URL=http://localhost:3001 npm run dev
```

## Running with Docker Compose

This repository includes a Docker Compose setup that can run the frontend together with the backend, PostgreSQL, Redis, and Sidekiq.

From this project, run:

```bash
docker compose up
```

*IMPORTANT!*
The compose file expects the backend project to exist next to this repository:

```text
../RPH
../RPH_frontend
```

As it also ups the backend part. i made it like this for it to be easier for me but that will change in the future

## Useful Commands

Run the development server:

```bash
npm run dev
```

Run ESLint:

```bash
npm run lint
```

Build for production:

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

## Node Version

The Dockerfile uses Node 22. If running locally, use a recent Node version compatible with the installed Vite version. Vite currently expects Node `20.19+` or `22.12+`.

## Development Notes

This frontend is intended to be used with the `RPH` Rails API. The backend owns the database, authentication, API responses, image attachments, and permissions. The frontend owns the user workflow, presentation, resource forms, navigation, editing experience, and client-side image preparation before upload.

The app currently uses a lightweight route switch in `App.jsx` instead of a routing library. Shared resource pages and configuration are used heavily so that universes, worlds, characters, families, and factions can reuse the same create, edit, show, and index behavior where possible.

## Project Status

RPH Frontend is under active development. The current application already supports the main worldbuilding workflow, but the interface and feature set are still evolving alongside the backend.
