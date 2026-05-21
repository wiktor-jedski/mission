export type SupabaseBoundary = {
  serverClientModule: "lib/supabase/server";
  browserClientModule: "lib/supabase/browser";
  databaseTypesModule: "lib/supabase/database.types";
};

export const supabaseBoundary: SupabaseBoundary = {
  serverClientModule: "lib/supabase/server",
  browserClientModule: "lib/supabase/browser",
  databaseTypesModule: "lib/supabase/database.types"
};
