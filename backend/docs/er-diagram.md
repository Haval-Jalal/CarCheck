# CarCheck — ER Diagram

## Entity Relationship Diagram

```
┌──────────────┐       ┌──────────────────┐
│    users     │       │      cars        │
├──────────────┤       ├──────────────────┤
│ id (PK)      │       │ id (PK)          │
│ email (UQ)   │       │ reg_number (UQ)  │
│ password_hash│       │ brand            │
│ email_verified│      │ model            │
│ two_factor   │       │ year             │
│ created_at   │       │ mileage          │
└──────┬───────┘       └────┬─────┬───────┘
       │                    │     │
       │  ┌─────────────────┘     │
       │  │                       │
┌──────┴──┴────────┐   ┌─────────┴────────┐
│ search_history   │   │ analysis_results │
├──────────────────┤   ├──────────────────┤
│ id (PK)          │   │ id (PK)          │
│ user_id (FK)     │   │ car_id (FK)      │
│ car_id (FK)      │   │ score            │
│ searched_at      │   │ recommendation   │
└──────────────────┘   │ created_at       │
                       └──────────────────┘
┌──────────────────┐   ┌──────────────────┐
│   favorites      │   │ password_resets  │
├──────────────────┤   ├──────────────────┤
│ id (PK)          │   │ id (PK)          │
│ user_id (FK)     │   │ user_id (FK)     │
│ car_id (FK)      │   │ token            │
│ created_at       │   │ expires_at       │
└──────────────────┘   │ used             │
                       └──────────────────┘
┌──────────────────┐
│ security_events  │
├──────────────────┤
│ id (PK)          │
│ user_id (FK)     │
│ type             │
│ metadata (JSON)  │
│ created_at       │
└──────────────────┘
```

## Relationships

| From | To | Type | Constraint |
|---|---|---|---|
| search_history.user_id | users.id | Many-to-One | ON DELETE CASCADE |
| search_history.car_id | cars.id | Many-to-One | ON DELETE CASCADE |
| analysis_results.car_id | cars.id | Many-to-One | ON DELETE CASCADE |
| favorites.user_id | users.id | Many-to-One | ON DELETE CASCADE |
| favorites.car_id | cars.id | Many-to-One | ON DELETE CASCADE |
| password_resets.user_id | users.id | Many-to-One | ON DELETE CASCADE |
| security_events.user_id | users.id | Many-to-One | ON DELETE CASCADE |

## Indexes

- `users.email` — UNIQUE
- `cars.registration_number` — UNIQUE
- `search_history.user_id` — INDEX
- `search_history.searched_at` — INDEX
- `favorites(user_id, car_id)` — UNIQUE
- `security_events.user_id` — INDEX
- `security_events.created_at` — INDEX
