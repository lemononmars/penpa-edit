<script lang="ts">
  import { onMount } from "svelte";
  import { supabase, battleConfigurationError } from "./battle/supabase";
  import { ensureBattleProfile } from "./battle/profile";
  import { battleLocale, setBattleLocale, t as i18nT, type BattleLocale } from "./battle/i18n";

  export let mode: "login" | "register" | "reset" = "login";

  let email = "";
  let password = "";
  let confirmPassword = "";
  let displayName = "";
  let loading = false;
  let message = battleConfigurationError();
  let success = false;
  let recovery = false;
  $: locale = $battleLocale;
  $: t = (key: string, options: Record<string, unknown> = {}) => (locale, i18nT(key, options));
  $: title = mode === "login" ? t("loginTitle") : mode === "register" ? t("registerTitle") : t("resetTitle");

  function nextPath() {
    const requested = new URLSearchParams(location.search).get("next") || "/battle/";
    return requested.startsWith("/") && !requested.startsWith("//") ? requested : "/battle/";
  }

  async function submitLogin() {
    if (!supabase) return;
    loading = true; message = "";
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      if (data.user) await ensureBattleProfile(data.user);
      location.href = nextPath();
    } catch (cause: any) { message = cause?.message || "Could not log in."; }
    finally { loading = false; }
  }

  async function submitRegister() {
    if (!supabase) return;
    loading = true; message = "";
    try {
      const { data, error } = await supabase.auth.signUp({
        email, password,
        options: { data: { display_name: displayName }, emailRedirectTo: `${location.origin}${nextPath()}` },
      });
      if (error) throw error;
      if (data.user && data.session) {
        await ensureBattleProfile(data.user, displayName);
        location.href = nextPath();
      } else {
        success = true; message = t("checkEmail");
      }
    } catch (cause: any) { message = cause?.message || "Could not create the account."; }
    finally { loading = false; }
  }

  async function submitReset() {
    if (!supabase) return;
    loading = true; message = "";
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${location.origin}/reset-password/` });
      if (error) throw error;
      success = true; message = t("resetEmailSent");
    } catch (cause: any) { message = cause?.message || "Could not send the reset link."; }
    finally { loading = false; }
  }

  async function updatePassword() {
    if (!supabase) return;
    if (password !== confirmPassword) { message = "Passwords do not match."; return; }
    loading = true; message = "";
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      success = true; message = t("passwordUpdated");
    } catch (cause: any) { message = cause?.message || "Could not update the password."; }
    finally { loading = false; }
  }

  async function oauth(provider: "google" | "facebook") {
    if (!supabase) return;
    message = "";
    const { error } = await supabase.auth.signInWithOAuth({ provider, options: { redirectTo: `${location.origin}${nextPath()}` } });
    if (error) message = error.message;
  }

  onMount(() => {
    if (!supabase || mode !== "reset") return;
    supabase.auth.getSession().then(({ data }) => { recovery = Boolean(data.session) && (location.hash.includes("type=recovery") || location.search.includes("type=recovery")); });
    const { data } = supabase.auth.onAuthStateChange((event) => { if (event === "PASSWORD_RECOVERY") recovery = true; });
    return () => data.subscription.unsubscribe();
  });
</script>

<svelte:head><title>{title} · Sudotoku</title></svelte:head>
<main lang={locale}>
  <header><a href="/battle/">← {t("battleTitle")}</a><select aria-label={t("language")} value={locale} on:change={(event) => setBattleLocale(event.currentTarget.value as BattleLocale)}><option value="en" lang="en">🌐 English</option><option value="th" lang="th">🌐 ไทย</option></select></header>
  <section class="card">
    <h1>{title}</h1>
    {#if mode === "register"}<label><span>{t("displayName")}</span><input maxlength="24" autocomplete="nickname" bind:value={displayName} /></label>{/if}
    {#if mode !== "reset" || !recovery}<label><span>{t("email")}</span><input type="email" autocomplete="email" placeholder="email@example.com" bind:value={email} /></label>{/if}
    {#if mode !== "reset" || recovery}<label><span>{recovery ? t("newPassword") : t("password")}</span><input type="password" minlength="6" autocomplete={recovery ? "new-password" : mode === "login" ? "current-password" : "new-password"} bind:value={password} /></label>{/if}
    {#if recovery}<label><span>{t("confirmPassword")}</span><input type="password" minlength="6" autocomplete="new-password" bind:value={confirmPassword} /></label>{/if}
    {#if mode === "reset" && !recovery}<p class="help">{t("resetHelp")}</p>{/if}
    {#if message}<p class:success class="message" role="status">{message}</p>{/if}
    {#if mode === "login"}<button class="primary wide" disabled={loading || !email || !password} on:click={submitLogin}>{t("login")}</button>
    {:else if mode === "register"}<button class="primary wide" disabled={loading || !email || !password || !displayName} on:click={submitRegister}>{t("register")}</button>
    {:else if recovery}<button class="primary wide" disabled={loading || !password || !confirmPassword} on:click={updatePassword}>{t("updatePassword")}</button>
    {:else}<button class="primary wide" disabled={loading || !email || success} on:click={submitReset}>{t("sendResetLink")}</button>{/if}

    {#if mode !== "reset"}
      <div class="divider"><span>{t("or")}</span></div>
      <button class="wide oauth-button" title={t("googleLogin")} on:click={() => oauth("google")}><i class="fa fa-google" aria-hidden="true"></i><span>{t("googleLogin")}</span></button>
      <button class="wide oauth-button" title={t("facebookLogin")} on:click={() => oauth("facebook")}><i class="fa fa-facebook" aria-hidden="true"></i><span>{t("facebookLogin")}</span></button>
    {/if}
    <footer>
      {#if mode === "login"}<a href="/reset-password/">{t("forgotPassword")}</a><span>{t("noAccount")} <a href="/register/">{t("register")}</a></span>
      {:else if mode === "register"}<span>{t("haveAccount")} <a href="/login/">{t("login")}</a></span>
      {:else if success && recovery}<a href="/battle/">{t("continueBattle")}</a>{:else}<a href="/login/">{t("login")}</a>{/if}
    </footer>
  </section>
</main>

<style>
  :global(*){box-sizing:border-box}:global(body){margin:0;background:#edf2f5;color:#243642;font-family:Inter,system-ui,sans-serif}main{min-height:100vh;padding:18px}header{display:flex;justify-content:space-between;align-items:center;max-width:440px;margin:0 auto 14px}a{color:#1178b5;text-decoration:none}.card{width:min(440px,100%);margin:auto;border:1px solid #d4dde4;border-radius:16px;background:#fff;padding:26px;box-shadow:0 12px 40px #1b344518}h1{margin:0 0 22px;text-align:center;color:#1178b5}.card label{display:block;margin:14px 0}.card label span{display:block;margin-bottom:6px;font-size:13px;font-weight:700}.card input,header select,button{width:100%;min-height:42px;border:1px solid #bac7d0;border-radius:9px;padding:8px 11px;background:#f9fbfc;color:inherit;font:inherit}header select{width:auto}.primary{border-color:#1688ca;background:#1688ca;color:#fff}.wide{margin-top:9px}button{cursor:pointer}button:disabled{cursor:not-allowed;opacity:.5}.oauth-button{position:relative;display:flex;align-items:center;justify-content:center;gap:10px}.oauth-button i{position:absolute;left:14px;font-size:18px}.help{color:#657682;line-height:1.5}.message{border-radius:8px;background:#fff1f0;color:#a52820;padding:10px}.message.success{background:#ecf9ef;color:#176c2d}.divider{display:flex;align-items:center;gap:10px;margin:18px 0 8px;color:#81909a}.divider:before,.divider:after{content:"";height:1px;flex:1;background:#d8e0e5}footer{display:flex;justify-content:space-between;gap:12px;flex-wrap:wrap;margin-top:18px;font-size:13px}@media(max-width:500px){main{padding:10px}.card{padding:20px}footer{flex-direction:column}}
</style>
