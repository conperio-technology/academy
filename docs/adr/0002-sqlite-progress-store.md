# 0002. Progress in one SQLite file via EF Core, no migrations

Status: Superseded by [0013](0013-static-only.md) (the server and its database were removed; progress lives in the browser)
Date: 2026-10-11 (decided at project start)

## Context

The app remembers per-user progress: attempts, last code, completion and the spaced
repetition schedule. It started as a local, single-user tool and must stay easy to run, with
no database server to install.

## Decision

Store progress in a SQLite file (`server/progress.db`, or the `DbPath` setting) through EF
Core. The schema is created with `EnsureCreated()`, and new columns are added in place by
`server/Data/SchemaUpgrade.cs`. EF Core migrations are not used.

## Consequences

- Nothing to install; the database is one file you can copy or delete.
- Only one process can own the file, so the Kubernetes manifests run one replica with the
  `Recreate` strategy.
- Every schema change needs a matching step in `SchemaUpgrade.cs` so existing databases keep
  working. Revisit migrations if the schema starts changing often.
- `server/progress.db*` is never committed.
