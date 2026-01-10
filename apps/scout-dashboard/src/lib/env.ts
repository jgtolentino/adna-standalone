type Env = {
  NEXT_PUBLIC_SUPABASE_URL?: string;
  NEXT_PUBLIC_SUPABASE_ANON_KEY?: string;
};

function must(name: string, value: string | undefined): string {
  if (!value || value.trim().length === 0) throw new Error(`Missing ${name}`);
  return value;
}

export function getClientEnv(): Env {
  // Support BOTH prefixes (NEXT_PUBLIC_ from Supabase integration, VITE_ for local dev compatibility)
  const SUPABASE_URL =
    import.meta.env.NEXT_PUBLIC_SUPABASE_URL ?? import.meta.env.VITE_SUPABASE_URL;

  const SUPABASE_ANON_KEY =
    import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? import.meta.env.VITE_SUPABASE_ANON_KEY;

  const missing: string[] = [];
  if (!SUPABASE_URL) missing.push("NEXT_PUBLIC_SUPABASE_URL/VITE_SUPABASE_URL");
  if (!SUPABASE_ANON_KEY) missing.push("NEXT_PUBLIC_SUPABASE_ANON_KEY/VITE_SUPABASE_ANON_KEY");

  if (missing.length) {
    console.error("❌ Client environment validation failed:");
    missing.forEach((m) => console.error(`  ${m}: Required`));
    throw new Error(`Missing or invalid environment variables: ${missing.join(", ")}`);
  }

  return {
    SUPABASE_URL: must("SUPABASE_URL", SUPABASE_URL),
    SUPABASE_ANON_KEY: must("SUPABASE_ANON_KEY", SUPABASE_ANON_KEY),
  };
}

// Create and export the env object for backward compatibility with supabaseClient.ts
export const env: Env = {
  NEXT_PUBLIC_SUPABASE_URL:
    import.meta.env.NEXT_PUBLIC_SUPABASE_URL ?? import.meta.env.VITE_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY:
    import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? import.meta.env.VITE_SUPABASE_ANON_KEY,
};
