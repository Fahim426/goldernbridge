import { readFileSync } from "node:fs";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "../generated/prisma/client";

function mysqlAdapter() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) throw new Error("DATABASE_URL is required to access MySQL.");
  const url = new URL(databaseUrl);
  if (url.protocol !== "mysql:") throw new Error("DATABASE_URL must use the mysql scheme.");

  const local = ["127.0.0.1", "localhost", "[::1]"].includes(url.hostname);
  const certificate = url.searchParams.get("sslcert");
  const tls = !local || Boolean(certificate) || url.searchParams.has("sslaccept");
  if (url.searchParams.get("sslaccept") === "accept_invalid_certs") {
    throw new Error("Configure a trusted MySQL certificate.");
  }
  const poolSize = Number(url.searchParams.get("connection_limit") ?? "3");
  if (!Number.isInteger(poolSize) || poolSize < 1 || poolSize > 100) {
    throw new Error("connection_limit must be between 1 and 100.");
  }
  return new PrismaMariaDb({
    host: url.hostname.replace(/^\[|\]$/g, ""),
    port: Number(url.port || 3306),
    user: decodeURIComponent(url.username),
    password: decodeURIComponent(url.password),
    database: decodeURIComponent(url.pathname.slice(1)),
    connectionLimit: poolSize,
    allowPublicKeyRetrieval: local && !tls,
    timezone: "Z",
    ssl: tls ? { rejectUnauthorized: true, ca: certificate ? readFileSync(certificate, "utf8") : undefined } : undefined,
  });
}

// Resolve secrets only when a query opens a connection. Static public pages and
// Prisma client generation can build independently of a running database.
function createClient() {
  return new PrismaClient({
    adapter: {
      provider: "mysql",
      adapterName: "@prisma/adapter-mariadb",
      connect: () => mysqlAdapter().connect(),
    },
  });
}

const runtime = globalThis as typeof globalThis & { lioraDb?: PrismaClient };
export const prisma = runtime.lioraDb ?? createClient();
if (process.env.NODE_ENV !== "production") runtime.lioraDb = prisma;
