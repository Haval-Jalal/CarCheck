# CarCheck

Swedish used-car analysis SaaS — monorepo.

## Structure

```
CarCheck/
├── backend/    # .NET 9 Clean Architecture API
│   ├── src/
│   │   ├── CarCheck.API/
│   │   ├── CarCheck.Application/
│   │   ├── CarCheck.Domain/
│   │   └── CarCheck.Infrastructure/
│   ├── db/migrations/
│   ├── scripts/
│   ├── CarCheck.sln
│   └── Dockerfile
├── frontend/   # React 19 + TypeScript + Vite + TailwindCSS v4
│   └── src/
└── docs/       # Architecture docs, runbooks, API specs
```

## Quick start

**Backend** (port 5171)
```bash
cd backend
dotnet run --project src/CarCheck.API
```

**Frontend** (port 5173)
```bash
cd frontend
npm install
npm run dev
```
