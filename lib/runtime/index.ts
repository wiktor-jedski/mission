import { createSupabaseServerClient } from "@/lib/supabase/server";
import { LocalRuntimeRepository } from "./local-adapter";
import type { RuntimeRepository } from "./repository";
import { SupabaseRuntimeRepository } from "./supabase-adapter";

const globalStore = globalThis as typeof globalThis & {
  missionRuntimeRepository?: RuntimeRepository;
};

export const getRuntimeRepository = (): RuntimeRepository => {
  globalStore.missionRuntimeRepository ??= createRuntimeRepository();
  return globalStore.missionRuntimeRepository;
};

export const setRuntimeRepositoryForTests = (
  repository: RuntimeRepository | undefined
): void => {
  globalStore.missionRuntimeRepository = repository;
};

export const createRuntimeRepository = (): RuntimeRepository => {
  if (process.env.MISSION_RUNTIME_REPOSITORY === "local") {
    if (process.env.NODE_ENV === "production") {
      throw new Error("Local runtime repository is not allowed in production.");
    }

    return new LocalRuntimeRepository();
  }

  const hasSupabaseEnv =
    Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL?.trim()) &&
    Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim());

  if (hasSupabaseEnv) {
    return new SupabaseRuntimeRepository(createSupabaseServerClient());
  }

  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "Supabase runtime persistence is required for deployed Phase 3 gameplay."
    );
  }

  return new LocalRuntimeRepository();
};
