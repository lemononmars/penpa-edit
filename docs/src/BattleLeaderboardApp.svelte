<script lang="ts">
  import { onMount } from "svelte";
  import type { User } from "@supabase/supabase-js";
  import BattleSettingsModal from "./BattleSettingsModal.svelte";
  import { loadBattleName, saveBattleName } from "./battle/names";
  import { battleLocale, setBattleLocale, t as i18nT, type BattleLocale } from "./battle/i18n";
  import { ensureBattleProfile } from "./battle/profile";
  import { battleConfigurationError, supabase, type BattleProfile } from "./battle/supabase";

  let profiles: BattleProfile[] = [];
  let user: User | null = null;
  let displayName = loadBattleName();
  let settingsOpen = false;
  let darkMode = window.localStorage.getItem("sudotoku-battle-theme") === "dark";
  let error = battleConfigurationError();
  $: locale = $battleLocale;
  $: t = (key: string, options: Record<string, unknown> = {}) => (locale, i18nT(key, options));
  function changeLocale(value: BattleLocale) { setBattleLocale(value); }
  function toggleTheme() { darkMode = !darkMode; window.localStorage.setItem("sudotoku-battle-theme", darkMode ? "dark" : "light"); }
  async function loadLeaderboard() {
    if (!supabase) return;
    const { data, error: loadError } = await supabase.from("battle_profiles").select("id,display_name,rating,rating_deviation,rated_games,wins,losses,draws").order("rating", { ascending: false }).limit(100);
    if (loadError) error = loadError.message; else profiles = (data || []) as BattleProfile[];
  }
  async function saveName(name: string) {
    const clean = name.trim().slice(0, 24); if (!clean) return;
    displayName = saveBattleName(clean);
    if (supabase && user) await supabase.from("battle_profiles").update({ display_name: displayName }).eq("id", user.id);
    settingsOpen = false; await loadLeaderboard();
  }
  async function signOut() { if (supabase) await supabase.auth.signOut(); user = null; }
  onMount(() => {
    if (!supabase) return;
    supabase.auth.getSession().then(async ({ data }) => {
      user = data.session?.user || null;
      if (user) { const profile = await ensureBattleProfile(user, displayName); if (profile?.display_name) displayName = saveBattleName(profile.display_name); }
    });
    const { data } = supabase.auth.onAuthStateChange((_event, session) => { user = session?.user || null; });
    loadLeaderboard();
    return () => data.subscription.unsubscribe();
  });
</script>

<svelte:head><title>{t("leaderboard")} · Sudotoku</title></svelte:head>
<main class:dark={darkMode} lang={locale}>
  <header><a href="../">← {t("battleTitle")}</a><h1>{t("leaderboard")}</h1><div class="user-menu"><span><strong>{displayName}</strong><small>{user ? t("loggedIn") : t("guest")}</small></span><button aria-label={t("settings")} title={t("settings")} on:click={() => settingsOpen = true}>⚙</button></div></header>
  <section class="card"><div class="toolbar"><span>{profiles.length} {t("players")}</span><button on:click={loadLeaderboard}>{t("refresh")}</button></div><div class="table"><b>#</b><b>{t("player")}</b><b>{t("rating")}</b><b>W–L–D</b>{#each profiles as profile, index}<span>{index + 1}</span><strong>{profile.display_name}</strong><span>{Math.round(profile.rating)} <small>±{Math.round(profile.rating_deviation)}</small></span><span>{profile.wins}–{profile.losses}–{profile.draws}</span>{/each}</div>{#if error}<p class="error">{error}</p>{/if}</section>
  <BattleSettingsModal open={settingsOpen} {displayName} {user} {darkMode} {locale} onClose={() => settingsOpen = false} onSaveName={saveName} onToggleTheme={toggleTheme} onLocaleChange={changeLocale} onSignOut={signOut}/>
</main>

<style>
  :global(*){box-sizing:border-box}:global(body){margin:0;font-family:Inter,system-ui,sans-serif;background:#f3f6f8;color:#1d2a35}main{min-height:100vh;padding:20px}header{display:grid;grid-template-columns:1fr auto 1fr;align-items:center;gap:14px;max-width:900px;margin:0 auto 18px}header>a{color:#1679b4;text-decoration:none}h1{margin:0;text-align:center}.user-menu{justify-self:end;display:flex;align-items:center;gap:8px}.user-menu>span{display:flex;align-items:flex-end;flex-direction:column}.user-menu small{color:#71808c;font-size:11px}button{min-height:38px;border:1px solid #bdc9d2;border-radius:8px;background:#fff;color:inherit;padding:7px 11px;font:inherit;cursor:pointer}.card{max-width:760px;margin:auto;border:1px solid #d6dee4;border-radius:14px;background:#fff;padding:18px;box-shadow:0 5px 24px #1b344511}.toolbar{display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;color:#71808c}.table{display:grid;grid-template-columns:40px minmax(130px,1fr) 130px 100px;gap:10px 14px;align-items:center}.table span small{color:#71808c}.error{color:#b42318}main.dark{background:#17212a;color:#e1e8ed}main.dark header>a{color:#67c7ff}main.dark .card,main.dark button{border-color:#435360;background:#24313c;color:#e1e8ed}main.dark .toolbar,main.dark .user-menu small,main.dark .table span small{color:#a9b7c2}main.dark button:hover{border-color:#4fb8f5;background:#304b5c}@media(max-width:600px){main{padding:10px}header{grid-template-columns:auto 1fr auto}header h1{font-size:22px}.user-menu strong{max-width:100px;overflow:hidden;text-overflow:ellipsis}.table{grid-template-columns:28px minmax(90px,1fr) 84px 70px;gap:8px;font-size:13px}}
</style>
