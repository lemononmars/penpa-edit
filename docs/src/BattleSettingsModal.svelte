<script lang="ts">
  import type { User } from "@supabase/supabase-js";
  import type { BattleLocale } from "./battle/i18n";
  import { t as i18nT } from "./battle/i18n";

  export let open = false;
  export let displayName = "";
  export let user: User | null = null;
  export let darkMode = false;
  export let locale: BattleLocale = "en";
  export let showIdentity = true;
  export let showAccount = true;
  export let onClose: () => void;
  export let onSaveName: (name: string) => void | Promise<void>;
  export let onToggleTheme: () => void;
  export let onLocaleChange: (locale: BattleLocale) => void;
  export let onSignOut: () => void | Promise<void>;

  let draft = displayName;
  $: if (open) draft = displayName;
  $: loginHref = `/login/?next=${encodeURIComponent(location.pathname + location.search)}`;
  $: t = (key: string, options: Record<string, unknown> = {}) => (locale, i18nT(key, options));
</script>

{#if open}
  <div class="backdrop">
    <button class="dismiss" aria-label={t("close")} on:click={onClose}></button>
    <div class:dark={darkMode} class="modal" role="dialog" aria-modal="true" aria-labelledby="battle-settings-title">
      <header><h2 id="battle-settings-title">{t("settings")}</h2><button class="icon" aria-label={t("close")} on:click={onClose}>×</button></header>
      {#if showIdentity}<label><span>{t("displayName")}</span><div class="name-row"><input maxlength="24" bind:value={draft} /><button class="primary" on:click={() => onSaveName(draft)}>{t("save")}</button></div></label>{/if}
      <div class="language-setting"><span><span aria-hidden="true">🌐</span> {t("language")}</span><div class="language-buttons" role="group" aria-label={t("language")}><button lang="en" title={t("switchEnglish")} class:active={locale === "en"} on:click={() => onLocaleChange("en")}>English</button><button lang="th" title={t("switchThai")} class:active={locale === "th"} on:click={() => onLocaleChange("th")}>ไทย</button></div></div>
      <div class="setting-row"><span>{t("appearance")}</span><button on:click={onToggleTheme}>{darkMode ? `☀ ${t("light")}` : `☾ ${t("dark")}`}</button></div>
      {#if showAccount}<div class="account"><strong>{t("account")}</strong>{#if user}<small>{t("signedInAs", { email: user.email || "" })}</small><button on:click={onSignOut}>{t("signOut")}</button>{:else}<a class="primary link" href={loginHref}>{t("login")}</a><a class="link" href="/register/">{t("register")}</a>{/if}</div>{/if}
    </div>
  </div>
{/if}

<style>
  .backdrop{position:fixed;inset:0;z-index:2000;display:grid;place-items:center;padding:16px;background:#13253699}.dismiss{position:absolute;inset:0;width:100%;height:100%;border:0;background:transparent}.modal{position:relative;width:min(430px,100%);border:1px solid #cad5dd;border-radius:14px;background:#fff;color:#23313d;padding:18px;box-shadow:0 20px 60px #0005}.modal.dark{border-color:#435360;background:#24313c;color:#e1e8ed}header,.setting-row,.name-row,.account{display:flex;align-items:center;gap:8px}header{justify-content:space-between;margin-bottom:16px}h2{margin:0}.icon{border:0;background:transparent;font-size:24px;padding:2px 8px}.modal label{display:block;margin:12px 0}.modal label>span,.setting-row>span,.language-setting>span{display:block;margin-bottom:5px;color:#687985;font-size:13px}.name-row input{min-width:0;flex:1}.modal input,.modal button,.link{min-height:38px;border:1px solid #bac7d0;border-radius:8px;padding:7px 10px;background:#f9fbfc;color:inherit;font:inherit}.modal.dark input,.modal.dark button,.modal.dark .link{border-color:#526471;background:#1c2832;color:#e1e8ed}.language-setting{margin:12px 0}.language-buttons{display:grid;grid-template-columns:1fr 1fr}.language-buttons button{border-radius:0}.language-buttons button:first-child{border-radius:8px 0 0 8px}.language-buttons button:last-child{border-radius:0 8px 8px 0;border-left:0}.language-buttons button.active{border-color:#1688ca;background:#e6f4fc;color:#096698;font-weight:700}.modal.dark .language-buttons button.active{background:#164b68;color:#fff}.setting-row{justify-content:space-between;margin:14px 0}.setting-row>span{margin:0}.account{align-items:stretch;flex-direction:column;margin-top:18px;padding-top:14px;border-top:1px solid #d9e1e6}.account small{color:#687985}.link{display:flex;align-items:center;justify-content:center;text-decoration:none}.primary{border-color:#1688ca!important;background:#1688ca!important;color:#fff!important}
</style>
