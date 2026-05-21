export type RuntimeEnv = {
  supabaseUrl: string;
  supabaseAnonKey: string;
  teamPins: string;
  adminPassword: string;
  appBaseUrl: string;
};

export type RawRuntimeEnv = Partial<
  Record<
    | "NEXT_PUBLIC_SUPABASE_URL"
    | "NEXT_PUBLIC_SUPABASE_ANON_KEY"
    | "TEAM_PINS"
    | "ADMIN_PASSWORD"
    | "APP_BASE_URL",
    string
  >
>;

const variableMap = {
  NEXT_PUBLIC_SUPABASE_URL: "supabaseUrl",
  NEXT_PUBLIC_SUPABASE_ANON_KEY: "supabaseAnonKey",
  TEAM_PINS: "teamPins",
  ADMIN_PASSWORD: "adminPassword",
  APP_BASE_URL: "appBaseUrl"
} as const;

export function readRuntimeEnv(source: RawRuntimeEnv): RuntimeEnv {
  const values = Object.entries(variableMap).map(([environmentName, configName]) => {
    const value = source[environmentName as keyof RawRuntimeEnv]?.trim();

    if (!value) {
      throw new Error(`Missing required environment variable: ${environmentName}`);
    }

    return [configName, value] as const;
  });

  return Object.fromEntries(values) as RuntimeEnv;
}
