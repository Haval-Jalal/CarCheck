# CarCheck — Projektlogg

## Projektöversikt
CarCheck är en SaaS-plattform för att utvärdera begagnade bilar i Sverige. Byggt med .NET 9 backend + React 19 frontend (monorepo).

## Nuvarande Status
- **Backend**: 100% klart (Fas 0-9), 231 tester, mergat till main
- **Frontend**: 100% klart (Fas F1-F5), alla 10 sidor byggda, mergat till main
- **Databas**: Supabase PostgreSQL via session pooler, EF Core migration applicerad (9 tabeller)
- **Alla PRs mergade** (#1-#61), alla issues stängda (#1-#67)

---

## Repostruktur
```
CarCheck/
  src/CarCheck.Domain/          # Entiteter, Value Objects, interfaces
  src/CarCheck.Application/     # Use cases, services, DTOs
  src/CarCheck.Infrastructure/  # EF Core, repositories, externa tjänster
  src/CarCheck.API/             # Controllers, middleware, Program.cs
  tests/                        # 231 tester (Domain + Application + Infra + API)
  frontend/                     # React 19 + Vite + TypeScript
    src/api/                    # Axios-klient + API-moduler (auth, cars, history, favorites, billing, gdpr)
    src/types/                  # TypeScript-typer som speglar backend DTOs
    src/hooks/                  # useAuth, useCarSearch, useHistory, useFavorites, useBilling
    src/features/               # 10 sidor (landing, auth, dashboard, car, history, favorites, billing, settings)
    src/components/             # layout (AppShell, Header), common, ui (shadcn)
    src/stores/                 # Zustand (quota)
    src/routes/                 # React Router v7 med skyddade/publika routes
    src/lib/                    # utils, format, validators, token, constants
```

---

## Teknikstack

### Backend
- .NET 9, Clean Architecture, DDD med privata konstruktorer + factory methods
- EF Core 9 + Npgsql för PostgreSQL/Supabase
- JWT-autentisering med refresh token
- Result<T>-mönster för felhantering
- NSubstitute för mocking i tester
- Snake_case databasmappning

### Frontend
- React 19, TypeScript, Vite 7
- Tailwind CSS v4, shadcn/ui
- TanStack Query v5 (serverstate), Zustand (quota), React Context (auth)
- react-hook-form + Zod (svenska felmeddelanden)
- Axios med JWT refresh-interceptor (kö-mönster för samtidiga 401:or)
- date-fns med svenskt locale, lucide-react ikoner

### Databas
- Supabase PostgreSQL (session pooler: aws-1-eu-west-1.pooler.supabase.com)
- 9 tabeller: users, cars, analysis_results, search_history, favorites, password_resets, security_events, refresh_tokens, subscriptions

---

## API-endpoints (19 st)
| Område | Endpoints |
|--------|-----------|
| Auth | register, login, refresh, logout, logout-all, change-password |
| Cars | search (GET /api/cars/{regNr}), analysis (GET /api/cars/{carId}/analysis) |
| History | list med pagination, today count |
| Favorites | list, add, remove, check |
| Billing | tiers, subscription, create-checkout, cancel |
| GDPR | export, delete-account |

---

## Konfiguration
- Backend körs på port **5171** (http-profil i launchSettings.json)
- Vite proxy: `/api` och `/health` -> `http://localhost:5171`
- `appsettings.Development.json` är gitignored (innehåller Supabase-credentials)
- CORS konfigurerad i Program.cs med exponerade rate-limit/quota-headers

---

## Starta projektet
```bash
# Backend (terminal 1)
cd src/CarCheck.API
dotnet run --launch-profile http

# Frontend (terminal 2)
cd frontend
npm run dev
```
Backend: http://localhost:5171
Frontend: http://localhost:5173

---

## Avslutade faser

### Backend
| Fas | Beskrivning | Issues | PR |
|-----|-------------|--------|-----|
| 0 | Projektstruktur & CI | #4-#9 | #1-#3 |
| 1 | Domänmodell | #10-#14 | — |
| 2 | Applikationslager | #15-#20 | — |
| 3 | Infrastruktur & persistence | #21-#27 | — |
| 4 | API-controllers | #28-#34 | — |
| 5 | Autentisering & JWT | #35-#38 | — |
| 6 | Billing & subscriptions | #39-#42 | — |
| 7 | Rate limiting & kvoter | #43-#46 | — |
| 8 | Sökhistorik & favoriter | #47-#50 | — |
| 9 | Production readiness & GDPR | #51-#54 | PR #60 |

### Frontend
| Fas | Beskrivning | Issues | PR |
|-----|-------------|--------|-----|
| F1 | Foundation (Vite, auth, routing) | #62-#63 | PR #61 |
| F2 | Bilsökning & analys | #64 | PR #61 |
| F3 | Historik & favoriter | #65 | PR #61 |
| F4 | Billing & abonnemang | #66 | PR #61 |
| F5 | Inställningar, GDPR & polish | #67 | PR #61 |

---

## Kända problem & noteringar
- Supabase använder IPv6 för direktanslutningar; måste använda session pooler för IPv4
- Gamla Vite-processer kan blockera port 5173+; kan behöva `taskkill /f /im node.exe`
- shadcn/ui kräver `class-variance-authority` explicit installerat
- sonner.tsx från shadcn importerar next-themes (Next.js) — omskriven för vanlig React
