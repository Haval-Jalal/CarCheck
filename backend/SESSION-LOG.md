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
  backend/                       # .NET 9 Clean Architecture API
    src/CarCheck.Domain/         # Entiteter, Value Objects, interfaces
    src/CarCheck.Application/    # Use cases, services, DTOs
    src/CarCheck.Infrastructure/ # EF Core, repositories, externa tjänster
    src/CarCheck.API/            # Endpoints, middleware, Program.cs
    db/migrations/               # Raw SQL-migrationsfiler
    scripts/                     # smoke-test.sh, create-issue.sh
    CarCheck.sln
    Dockerfile
  frontend/                      # React 19 + Vite + TypeScript
    src/api/                     # Axios-klient + API-moduler (auth, cars, history, favorites, billing, gdpr)
    src/types/                   # TypeScript-typer som speglar backend DTOs
    src/hooks/                   # useAuth, useCarSearch, useHistory, useFavorites, useBilling
    src/features/                # 10 sidor (landing, auth, dashboard, car, history, favorites, billing, settings)
    src/components/              # layout (AppShell, Header), common, ui (shadcn)
    src/stores/                  # Zustand (quota)
    src/routes/                  # React Router v7 med skyddade/publika routes
    src/lib/                     # utils, format, validators, token, constants
  docs/                          # Arkitekturdokument, runbooks, API-specs
  README.md                      # Monorepo-översikt med quick start
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
cd backend
dotnet run --project src/CarCheck.API

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

## Session 2026-02-20 — Frontend redesign & kodkvalitet

### Redesign & temabyte (PR:ar utan issues)
| Vad | Resultat |
|-----|---------|
| `index.css` — dark mode via `@custom-variant`, ny `--color-primary` (blå), `.dark {}` variabler | Klart |
| `use-theme.ts` (ny) — hook med localStorage, standard mörkt tema | Klart |
| `App.tsx` — tema appliceras före första render (ingen blixt) | Klart |
| `landing-page.tsx` — full redesign: single-screen, mörk, stor regnummer-input, professionell text | Klart |
| `header.tsx` — mörk navy, tema-toggle (Sol/Måne), vita nav-knappar | Klart |
| `app-shell.tsx` — `bg-slate-50 dark:bg-slate-900` | Klart |
| `login-page.tsx` / `register-page.tsx` — navy gradient-bakgrund, dark card-stöd | Klart |
| `dashboard-page.tsx` — blå gradient hero-sektion ovanför sökkortet | Klart |
| `protected-route.tsx` — utloggning omdirigerar till `/` (landing) istället för `/login` | Klart |

### Kodkvalitet & prestanda (PR #82–#93)
| Issue | Branch | PR | Åtgärd |
|-------|--------|----|--------|
| #82 | refactor/cleanup-unused-components | #88 ✅ | Raderade skeleton.tsx, tabs.tsx, select.tsx, form.tsx |
| #83 | perf/code-splitting | #91 ✅ | React.lazy + Suspense för alla 10 sidrouter |
| #84 (axios timeout) | perf/axios-timeout | #89 ✅ | `timeout: 10_000` i Axios-klienten |
| #85 | feat/error-boundary | #90 ✅ | React ErrorBoundary ("Något gick fel / Ladda om") |
| #86 | refactor/query-key-factory | #92 ✅ | `src/lib/query-keys.ts` — centrala typade query-nycklar |
| #87 | refactor/usememo-sorting | #93 ✅ | `useMemo` för miltalssortering i `factor-detail-content.tsx` |

### Nuvarande status
- **Alla 6 issues (#82-#87) stängda**, alla PR:ar mergade till main
- main är på commit `899f517` (SESSION-LOG uppdaterad)
- GitHub project board "CarCheck Development" uppdaterat med alla tasks
- Repot är rent — inga lokala ändringar, synkad med `origin/main`

### Att göra vid klon på ny dator
```bash
git clone https://github.com/Haval-Jalal/CarCheck.git
cd CarCheck

# Backend
# Skapa src/CarCheck.API/appsettings.Development.json med Supabase-credentials
# (se befintlig dator — filen är gitignored)

# Frontend
cd frontend
npm install
npm run dev
```

---

## Session 2026-02-22 — Tre differentierande features

### Bakgrund
Nya features för att särskilja CarCheck från biluppgifter.se och car.info (som bara visar rådata, ingen analys eller rekommendation).

### Implementerade features

#### #95 → PR #98 ✅ — Förhandlingstips (`feat/negotiation-tips`)
- Ny komponent `features/car/components/negotiation-tips.tsx`
- Genererar handlingsbara svenska tips automatiskt baserade på analysdata
- Täcker: köpspärr, skulder, underkänd besiktning, återkallelser, kilometertamper, allvarliga skador, många ägare, servicehistorik, marknadspris, kända modellproblem, stöldrisk, bonus-malus
- Tips färgkodas: röd (kritiskt) / gul (observera) / blå (notera)
- Visas direkt under rekommendationskortet på `/car/:carId/analysis`

#### #96 → PR #99 ✅ — Dela analys (`feat/share-analysis`)
- Backend: ny `PublicEndpoints.cs` med `GET /api/public/cars/{carId}/analysis` (AllowAnonymous, ingen DB-migration)
- Frontend: "Dela analys"-knapp kopierar share-URL till urklipp med "Kopierad!"-feedback
- Ny publik sida `/share/:carId` — öppnas utan inloggning
- Share-sidan visar: poäng, rekommendation, förhandlingstips, 12-faktors breakdown (read-only)
- CTA-kort på share-sidan driver nya registreringar ("Kom igång gratis")
- Ny hook `usePublicCarAnalysis` + `publicAnalysis` query key

#### #97 → PR #100 ✅ — Jämför bilar (`feat/compare-cars`)
- Ny sida `/compare` med två oberoende sökrutor
- Visar poängcirklar, rekommendationsbadges och 12 faktorer som parallella progressbars
- Vinnande bil per faktor markeras med kontrast (förloraren dimmas)
- Verdict-kort visar klart vinnaren och poängskillnaden i poäng
- Länkar till fullständig analys för varje bil
- "Jämför"-länk tillagd i desktop-navigationen i headern

### Nuvarande status
- main är på commit `abdba2d`
- Alla 3 issues stängda, alla PR:ar mergade

---

## Session 2026-02-22 (del 2) — Mobilanpassning, PWA och snabbsök

### #101 → PR #104 ✅ — Mobilnavigation (`feat/mobile-navigation`)
- Hamburgermeny (☰/✕) på mobil öppnar en drawer med alla nav-länkar
- Drawer innehåller: Sök, Historik, Favoriter, Jämför, Abonnemang, Inställningar, Logga ut
- Aktiv route markeras i både desktop och mobilvy
- Drawer stängs automatiskt vid navigering

### #102 → PR #105 ✅ — PWA-stöd (`feat/pwa`)
- `public/manifest.json`: appnamn, temafärg, SVG-ikoner, genvägar (Sök + Jämför)
- `public/sw.js`: service worker med network-first för navigation, cache-first för statiska resurser, alltid network för `/api`
- `public/favicon.svg`: eget CarCheck-favicon (ersätter Vite-standard)
- `public/icons/icon-192.svg`: hemskärmsikon
- Service worker registreras i `main.tsx`
- `index.html` uppdaterad med svensk titel, beskrivning, theme-color och manifest-länk

### #103 → PR #106 ✅ — Sökinput i headern (`feat/header-search`)
- Inline sökinput alltid synlig i headern på alla inloggade sidor (desktop)
- Skriv regnummer → Enter/Sök-knapp → navigeras direkt till bilresultatet
- Spinner visas under sökning, fält töms och fokus försvinner efter lyckad sökning
- Mobil: sökinput dold, Sök-länk finns kvar i mobildrawnern

### Nuvarande status
- main är på commit `34b75c5`
- Alla 3 issues (#101–#103) stängda, alla PR:ar (#104–#106) mergade

---

## Session 2026-02-22 (del 3) — 5 unika differentierande features + återställningspunkt

### Återställningspunkt
- Git-tagg `v1.0-stable` skapad och pushad till origin
- Kan återställas med: `git checkout v1.0-stable` (läs-läge) eller kontakta för hard reset

### #107 → PR #112 ✅ — Blocket/Bytbil URL-klistring (`feat/blocket-url-parsing`)
- Sökinputfältet på dashboard accepterar nu annons-URL:er (Blocket, Bytbil etc.)
- Länkikon visas automatiskt när en URL detekteras
- Regnummer extraheras med regex ur URL-slug och visas som hint
- Felmeddelande om regnummer inte kan hittas i URL:en
- `frontend/src/lib/parse-reg-from-url.ts` (ny)
- Fixar preexisterande TypeScript-fel i `NegotiationTips`, `ProtectedRoute`

### #108 → PR #113 ✅ — Framtidskostnader (`feat/future-costs`)
- Ny sektion på analyssidan under Förhandlingstips
- 12-månaders kostnadsprognos baserat på analysdata
- Täcker: fordonsskatt (faktisk), kontrollbesiktning, service/oljebyte, däckbyte, kända modellproblem, drivlineproblem
- Visar kostnadsintervall per post och total uppskattning
- `frontend/src/features/car/components/future-costs.tsx` (ny)

### #109 → PR #114 ✅ — Deal Score (`feat/deal-score`)
- Nytt kort på analyssidan: användaren matar in annonsens pris
- Deal Score = kvalitetspoäng × 60% + prispoäng × 40%
- Prispoäng: 100 = >30% under marknadspris, 0 = >30% över
- Badge: Bra deal (grön), Okej deal (gul), Dåligt deal (röd)
- Visar kronorskillnad vs. marknadsvärde
- `frontend/src/features/car/components/deal-score.tsx` (ny)

### #110 → PR #115 ✅ — Besiktningschecklista (`feat/inspection-checklist`)
- Bil-specifik checklista genereras baserat på bilens svaga faktorer
- 6 kategorier: Motor & Drivlina, Kaross & Exteriör, Däck & Bromsar, Interiör, Papper & Historik, Provkörning
- Checkboxar, hopfällbara kategorier, Kopiera-knapp
- `frontend/src/features/car/components/inspection-checklist.tsx` (ny)

### #111 → PR #116 ✅ — Sökintressemätare (`feat/search-counter`)
- Backend: ny metod `GetSearchCountByCarIdAsync` i `ISearchHistoryRepository` + `SearchHistoryRepository`
- `CarAnalysisResponse` DTO utökad med `SearchCount: int`
- Frontend: blå badge "X person(er) har sökt på denna bil" på analyssidan
- `frontend/src/types/car.types.ts` uppdaterad

### Nuvarande status
- main är på commit `0351a20`
- Alla 5 issues (#107–#111) stängda, alla PR:ar (#112–#116) mergade
- Git-tagg `v1.0-stable` pekar på commit `34b75c5` (stabil bas)

---

## Session 2026-03-07 — Credits-system & billing-renovering

### #117 → PR #117 ✅ — Credits-system och billing-renovering (`feat/credits-billing-system`)

#### Backend
- `User.cs` — ny `Credits: int`-egenskap med getter/setter
- `UserConfiguration.cs` — EF-mappning av `credits`-kolumn
- `20260307120000_AddUserCredits.cs` — migration som lägger till `credits INTEGER DEFAULT 0` i `users`-tabellen
- `TierConfiguration.cs` — ny prissättning: 19 kr/1 kredit, 99 kr/7, 249 kr/20, 499 kr/mån obegränsat
- `SubscriptionService.cs` — stöd för kreditpaket-köp
- `BillingDTOs.cs` — nya DTOs: `CreditPackageDto`, `BuyCreditsRequest`
- `BillingEndpoints.cs` — `GET /api/billing/credit-packages` + `POST /api/billing/buy-credits`
- `DailyQuotaMiddleware.cs` — credits > 0 → dra av 1 per lyckad sökning (prioriteras över gratis 3/dag-kvoten)

#### Frontend — Nya komponenter & bibliotek
- `src/lib/warranty-data.ts` — garantistatus per varumärke (fabriksgaranti, utökad garanti)
- `src/lib/timing-data.ts` — kamrem vs. kamkedja per modell
- `src/lib/known-problems-data.ts` — besiktningsunderkännandefrekvens per modell
- `src/lib/new-price-data.ts` — nyprisdata för modeller från 2020+
- `src/features/car/components/warranties.tsx` — garantiinfo på analyssidan
- `src/features/car/components/timing-belt.tsx` — kamrem/kamkedja-sektion
- `src/features/car/components/known-problems-stats.tsx` — besiktningsstatistik
- `src/features/car/components/new-price-spec.tsx` — nypris och värdeutveckling

#### Frontend — Uppdateringar
- `billing-page.tsx` — helt omdesignad: kreditpaket-kort + abonnemangskort med priser
- `header.tsx` — credits-chip (Zap-ikon + antal) länkad till /billing
- `quota-indicator.tsx` — visar credits-saldo vid sidan av dagkvoten
- `car-analysis-page.tsx` — stor utvidgning med garantier, kamrem, kända problem, nypris-sektioner
- `login-page.tsx` / `register-page.tsx` — premium split-panel design (55% mörk / 45% formulär)
- `use-billing.ts` — nya hooks: `useCreditPackages()`, `useBuyCredits()`
- `billing.types.ts` — `CreditPackage`, `BuyCreditsRequest`-typer
- `vite.config.ts` — `host: true` för nätverks-/mobilåtkomst
- Mobilfixar: billing (1-kol grid), historik (wrappande header), favoriter (44px touch targets), landing (mindre rubrik)

### Nuvarande status
- main är på commit `c42aae3`
- PR #117 mergad, feature-branch raderad
- DB-migration behöver appliceras på Supabase (se nedan)

### Applicera DB-migration
```sql
-- Kör direkt i Supabase SQL-editor:
ALTER TABLE users ADD COLUMN IF NOT EXISTS credits INTEGER NOT NULL DEFAULT 0;
```

---

## Session 2026-03-07 — Monorepo-omstrukturering (`refactor/repo-structure` → PR #119 ✅)

### Vad gjordes
Repot hade tidigare all backend-kod direkt i roten (`src/`, `db/`, `scripts/`, `Dockerfile`, `CarCheck.sln`). Frontend låg redan i `frontend/`. Målet var en tydlig monorepo-struktur där varje del har sin egen toppdirektory.

### Ändringar
- Alla 99 backend-filer (`src/`, `db/`, `scripts/`, `Dockerfile`, `CarCheck.sln`) flyttades till `backend/` via `git mv` (rent rename-commit — ingen kod ändrades)
- `README.md` skapad i roten med monorepo-översikt och quick start för båda delar
- SESSION-LOG uppdaterad: repostruktur-diagram och startkommandon korrigerade

### Resultat
- Branch `refactor/repo-structure` skapad, commitad, pushad
- PR #119 skapad och mergad till `main` (commit `55cb655`)
- Feature-branch raderad efter merge
- Inga kodändringar — bara filflyttar, säkert att göra utan att bryta något

### Nuvarande status
- main är på commit `55cb655`
- Repot är rent och synkat med `origin/main`

---

## Kända problem & noteringar
- Supabase använder IPv6 för direktanslutningar; måste använda session pooler för IPv4
- Gamla Vite-processer kan blockera port 5173+; kan behöva `taskkill /f /im node.exe`
- shadcn/ui kräver `class-variance-authority` explicit installerat
- sonner.tsx från shadcn importerar next-themes (Next.js) — omskriven för vanlig React
