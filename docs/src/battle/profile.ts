import type { User } from "@supabase/supabase-js";
import { supabase, type BattleProfile } from "./supabase";

function fallbackName(user: User, preferredName = "") {
  return preferredName.trim()
    || String(user.user_metadata?.display_name || user.user_metadata?.username || "").trim()
    || user.email?.split("@")[0]
    || "Player";
}

export async function ensureBattleProfile(user: User, preferredName = "") {
  if (!supabase) return null;
  const { data, error } = await supabase.rpc("ensure_battle_profile", {
    p_display_name: fallbackName(user, preferredName),
  });
  if (!error && data) return data as BattleProfile;

  const fallback = await supabase.from("battle_profiles")
    .select("id,display_name,rating,rating_deviation,rated_games,wins,losses,draws")
    .eq("id", user.id)
    .maybeSingle();
  return fallback.data as BattleProfile | null;
}
