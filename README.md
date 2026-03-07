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
│   ├── tests/
│   ├── db/migrations/
│   ├── docs/
│   ├── scripts/
│   ├── CarCheck.sln
│   └── Dockerfile
└── frontend/   # React 19 + TypeScript + Vite + TailwindCSS v4
    └── src/
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
