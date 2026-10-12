# 0006. Identity from a trusted proxy header, no login in the app

Status: Superseded by [0013](0013-static-only.md) (no server, so no identity; progress is per browser)
Date: 2026-10-11

## Context

Several people should have separate progress, without building authentication. The target
cluster already signs users in at the ingress (a Traefik forward-auth middleware) and passes
the user name on in a header.

## Decision

The server trusts the header named by the `UserHeader` setting (default
`x-ms-client-principal-name`) as the user id, and falls back to a shared `"guest"` when it is
missing or blank. Every progress query is scoped by that id. The app has no login, tokens or
sessions of its own.

## Consequences

- Local and LAN runs all share the `guest` progress.
- The header can only be trusted behind that ingress, so a cluster deployment needs a
  NetworkPolicy that admits traffic from the ingress only. Anything that changes this path is a security change.
