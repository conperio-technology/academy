#!/bin/sh
# Deterministic sample web/app log for the pipes & text-tools lesson.
awk 'BEGIN {
  srand(42);
  split("10.0.0.5 10.0.0.12 10.0.0.12 192.168.1.20 10.0.0.5 172.16.4.9 10.0.0.12 192.168.1.20 10.0.0.33", ips, " ");
  split("GET /api/orders,GET /api/customers,POST /api/orders,GET /health,DELETE /api/orders/7,GET /api/reports", reqs, ",");
  for (i = 0; i < 400; i++) {
    r = rand();
    level = r < 0.08 ? "ERROR" : (r < 0.22 ? "WARN" : "INFO");
    ip = ips[int(rand() * 9) + 1];
    req = reqs[int(rand() * 6) + 1];
    h = 8 + int(i / 60); m = int(i % 60);
    msg = level == "ERROR" ? "database timeout after 30s" : (level == "WARN" ? "slow response 2400ms" : "ok 200");
    printf "2026-10-08 %02d:%02d:%02d %s %s \"%s\" %s\n", h, m, (i * 7) % 60, level, ip, req, msg;
  }
}'
