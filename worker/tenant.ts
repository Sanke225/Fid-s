import pg from "pg";

// Bases des espaces (une par démo / espace client), sur l'instance Postgres séparée (tenant-db).
// Les noms viennent de nous (sp_ + hexadécimal), jamais d'une saisie : ils peuvent être placés dans le SQL.

const SAFE_NAME = /^sp_[0-9a-f]{12}$/;

async function withAdmin<T>(fn: (c: pg.Client) => Promise<T>) {
  const client = new pg.Client({ connectionString: process.env.TENANT_DATABASE_ADMIN_URL });
  await client.connect();
  try {
    return await fn(client);
  } finally {
    await client.end();
  }
}

// Idempotent : rejouer la tâche ne recrée rien et ne change pas le mot de passe d'une base existante.
export async function ensureTenantDatabase(name: string, password: string) {
  if (!SAFE_NAME.test(name)) throw new Error(`Nom de base refusé : ${name}`);
  await withAdmin(async (c) => {
    const role = await c.query("SELECT 1 FROM pg_roles WHERE rolname = $1", [name]);
    if (role.rowCount === 0) {
      const literal = (await c.query("SELECT quote_literal($1) AS q", [password])).rows[0].q as string;
      await c.query(`CREATE ROLE ${name} LOGIN PASSWORD ${literal} CONNECTION LIMIT 20`);
    }
    const db = await c.query("SELECT 1 FROM pg_database WHERE datname = $1", [name]);
    if (db.rowCount === 0) {
      await c.query(`CREATE DATABASE ${name} OWNER ${name}`);
      // Personne d'autre ne s'y connecte (les bases des autres espaces non plus).
      await c.query(`REVOKE ALL ON DATABASE ${name} FROM PUBLIC`);
    }
  });
}

// « Réinitialiser la démo » : base vidée puis recréée (le seed est relancé ensuite).
export async function resetTenantDatabase(name: string) {
  if (!SAFE_NAME.test(name)) throw new Error(`Nom de base refusé : ${name}`);
  await withAdmin(async (c) => {
    await c.query(`DROP DATABASE IF EXISTS ${name} WITH (FORCE)`);
    await c.query(`CREATE DATABASE ${name} OWNER ${name}`);
    await c.query(`REVOKE ALL ON DATABASE ${name} FROM PUBLIC`);
  });
}
