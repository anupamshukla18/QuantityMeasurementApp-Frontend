# Quantity Measurement Frontend (Angular 18)

A fully connected Angular frontend for the Spring Boot Quantity Measurement backend.

## Features
- ✅ Real JWT Login & Register (calls `/auth/login`, `/auth/register`)
- ✅ Google OAuth2 login support
- ✅ JWT attached automatically on all requests via HTTP interceptor
- ✅ Compare, Add, Convert operations hitting real backend endpoints
- ✅ History tab fetches all records from the H2 database via backend
- ✅ Auth guard protects the dashboard route

## Setup

### Prerequisites
- Node.js 18+
- Angular CLI 18: `npm install -g @angular/cli@18`

### Install & Run
```bash
npm install
ng serve
```

App runs at: http://localhost:4200

### Backend must be running at: http://localhost:8080

## API Endpoints Used

| Method | URL | Purpose |
|--------|-----|---------|
| POST | `/auth/register` | Create account |
| POST | `/auth/login` | Login, receive JWT |
| POST | `/api/v1/quantities/compare` | Compare two quantities |
| POST | `/api/v1/quantities/add` | Add two quantities |
| POST | `/api/v1/quantities/convert` | Convert a quantity |
| GET  | `/api/v1/quantities/history/operation/{op}` | Fetch history |

## Project Structure
```
src/app/
├── components/
│   ├── auth/           # Login & Register UI
│   └── dashboard/      # Calculator, History, Profile tabs
├── services/
│   ├── auth.service.ts     # JWT login/register/logout
│   └── quantity.service.ts # All measurement API calls
├── interceptors/
│   └── auth.interceptor.ts # Adds Bearer token to requests
├── guards/
│   └── auth.guard.ts       # Protects /dashboard route
└── models/
    └── quantity.model.ts   # TypeScript interfaces
```
