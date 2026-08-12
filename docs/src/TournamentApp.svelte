<script lang="ts">
  import { onMount } from "svelte";
  import type { RealtimeChannel, User } from "@supabase/supabase-js";
  import BattleSettingsModal from "./BattleSettingsModal.svelte";
  import { battleConfigurationError, normalizeRoomCode, playerToken, supabase } from "./battle/supabase";
  import { ensureBattleProfile } from "./battle/profile";
  import { battleLocale, setBattleLocale, t as i18nT, type BattleLocale } from "./battle/i18n";
  import { completeMockRound, createMockStandings, pairMockRound } from "./battle/mockTournament";

  export let hostMode = false;
  type Tournament = { id:string;code:string;host_user_id:string;status:"lobby"|"playing"|"finished";rounds:number;current_round:number;variant:"classic";created_at:string };
  type Standing = { tournament_id:string;user_id:string;display_name:string;match_points:number;buchholz:number;joined_at:string };
  type Match = { id:string;round_number:number;table_number:number;player_one:string;player_two:string|null;battle_room_id:string|null;result:string|null;status:"running"|"finished";roomCode?:string;roomStatus?:string };

  let user: User | null = null;
  const mockAvailable = import.meta.env.DEV;
  let mockMode = mockAvailable && new URLSearchParams(location.search).get("mock") === "1";
  let mockPlayerCount = 8;
  let displayName = "Player";
  let settingsOpen = false;
  let darkMode = window.localStorage.getItem("sudotoku-battle-theme") === "dark";
  let code = normalizeRoomCode(new URLSearchParams(location.search).get("tournament") || "");
  let joinCode = ""; let rounds = 5; let tournament:Tournament|null=null; let standings:Standing[]=[]; let matches:Match[]=[];
  let busy=false; let error=mockMode ? "" : battleConfigurationError(); let channel:RealtimeChannel|null=null;
  $: locale = $battleLocale;
  $: t = (key: string, options: Record<string, unknown> = {}) => (locale, i18nT(key, options));
  $: isHost=mockMode||Boolean(user&&tournament?.host_user_id===user.id);
  $: currentRoundDone=Boolean(tournament&&matches.filter(m=>m.round_number===tournament.current_round).every(m=>m.status==="finished"));
  $: canStart=Boolean(isHost&&tournament?.status!=="finished"&&tournament&&tournament.current_round<tournament.rounds&&(tournament.current_round===0||currentRoundDone));

  async function acceptUser(next: User | null) {
    user = next;
    if (!next) return;
    const profile = await ensureBattleProfile(next);
    displayName = profile?.display_name || next.email?.split("@")[0] || "Player";
  }
  async function signOut(){if(!supabase)return;await supabase.auth.signOut();user=null}
  async function saveDisplayName(name:string){if(!supabase)return;const clean=name.trim().slice(0,24);if(!clean)return;displayName=clean;const{error:updateError}=await supabase.from("battle_profiles").update({display_name:clean}).eq("id",user?.id);if(updateError)error=updateError.message;else settingsOpen=false}
  function toggleTheme(){darkMode=!darkMode;window.localStorage.setItem("sudotoku-battle-theme",darkMode?"dark":"light")}
  function changeLocale(next:BattleLocale){setBattleLocale(next)}
  function activateMockTournament(){
    mockMode=true;error="";matches=[];standings=createMockStandings(mockPlayerCount) as Standing[];
    tournament={id:"mock-tournament",code:"MOCK",host_user_id:"mock-1",status:"lobby",rounds,current_round:0,variant:"classic",created_at:new Date().toISOString()};
    history.replaceState(null,"",`${location.pathname}?mock=1`);
  }
  async function createTournament(){if(!supabase||!user)return;busy=true;error="";try{await ensureBattleProfile(user,displayName);const{data,error:rpcError}=await supabase.rpc("create_battle_tournament",{p_rounds:rounds,p_player_token:playerToken()});if(rpcError)throw rpcError;acceptTournament(data)}catch(c:any){error=c?.message||"Could not create tournament."}finally{busy=false}}
  async function joinTournament(){if(!supabase||!user)return;busy=true;error="";try{await ensureBattleProfile(user,displayName);joinCode=normalizeRoomCode(joinCode);const{data,error:rpcError}=await supabase.rpc("join_battle_tournament",{p_code:joinCode,p_player_token:playerToken()});if(rpcError)throw rpcError;acceptTournament(data)}catch(c:any){error=c?.message||"Could not join tournament."}finally{busy=false}}
  function acceptTournament(value:any){tournament=value as Tournament;code=tournament.code;history.replaceState(null,"",`${location.pathname}?tournament=${code}`);subscribe()}
  async function loadTournament(){if(!supabase||!code)return;const{data,error:loadError}=await supabase.from("battle_tournaments").select("*").eq("code",code).single();if(loadError){error=loadError.message;return}tournament=data as Tournament;await subscribe()}
  async function refresh(){if(!supabase||!tournament)return;const[{data:p},{data:m}]=await Promise.all([supabase.from("battle_tournament_players").select("*").eq("tournament_id",tournament.id).order("match_points",{ascending:false}).order("buchholz",{ascending:false}),supabase.from("battle_tournament_matches").select("*").eq("tournament_id",tournament.id).order("round_number",{ascending:false}).order("table_number")]);standings=(p||[]) as Standing[];const raw=(m||[]) as Match[];const roomIds=raw.map(x=>x.battle_room_id).filter(Boolean) as string[];const roomMap=new Map<string,any>();if(roomIds.length){const{data:rooms}=await supabase.from("battle_rooms").select("id,code,status").in("id",roomIds);for(const room of rooms||[])roomMap.set(room.id,room)}matches=raw.map(match=>({...match,roomCode:match.battle_room_id?roomMap.get(match.battle_room_id)?.code:undefined,roomStatus:match.battle_room_id?roomMap.get(match.battle_room_id)?.status:undefined}));await maybeEnterMatch()}
  async function maybeEnterMatch(){if(!user||!tournament)return;const active=matches.find(match=>match.status==="running"&&(match.player_one===user?.id||match.player_two===user?.id)&&match.roomCode);if(active)location.href=`/battle/?room=${active.roomCode}&tournament=${tournament.code}`}
  async function subscribe(){if(!supabase||!tournament)return;if(channel)await supabase.removeChannel(channel);channel=supabase.channel(`tournament:${tournament.id}`).on("postgres_changes",{event:"*",schema:"public",table:"battle_tournaments",filter:`id=eq.${tournament.id}`},async payload=>{tournament=payload.new as Tournament;await refresh()}).on("postgres_changes",{event:"*",schema:"public",table:"battle_tournament_players",filter:`tournament_id=eq.${tournament.id}`},refresh).on("postgres_changes",{event:"*",schema:"public",table:"battle_tournament_matches",filter:`tournament_id=eq.${tournament.id}`},refresh).subscribe();await refresh()}
  async function startRound(){if(!tournament)return;if(mockMode){const nextRound=tournament.current_round+1;matches=[...matches,...pairMockRound(standings,matches,nextRound) as Match[]];tournament={...tournament,status:"playing",current_round:nextRound};return}if(!supabase)return;busy=true;error="";try{const{error:rpcError}=await supabase.rpc("start_battle_tournament_round",{p_tournament_id:tournament.id});if(rpcError)throw rpcError;await loadTournament()}catch(c:any){error=c?.message||"Could not start round."}finally{busy=false}}
  function finishMockRound(mode:"random"|"draw"){
    if(!mockMode||!tournament)return;
    const completed=completeMockRound(standings,matches,tournament.current_round,mode);
    standings=completed.standings as Standing[];matches=completed.matches as Match[];
    if(tournament.current_round>=tournament.rounds)tournament={...tournament,status:"finished"};
  }
  function playerName(id:string|null){return standings.find(p=>p.user_id===id)?.display_name||t("bye")}
  function resultText(match:Match){if(match.result==="bye")return t("receivesBye",{player:playerName(match.player_one)});if(!match.result)return t("inProgress");if(match.result==="draw")return t("draw");return t("won",{player:playerName(match.result==="player_one"?match.player_one:match.player_two)})}
  onMount(()=>{if(mockMode){activateMockTournament();return}if(!supabase)return;supabase.auth.getSession().then(({data})=>acceptUser(data.session?.user||null));const{data:listener}=supabase.auth.onAuthStateChange((_event,session)=>{acceptUser(session?.user||null);maybeEnterMatch()});if(code)loadTournament();return()=>{listener.subscription.unsubscribe();if(channel)supabase.removeChannel(channel)}});
</script>

<svelte:head><title>{t("tournamentTitle")} · Sudotoku</title><meta name="description" content="Classic Sudoku Swiss tournament." /></svelte:head>
<main class:dark={darkMode} lang={locale}>
  <header><a href={hostMode ? "../" : "/battle/"}>← {hostMode ? t("tournamentTitle") : t("battleTitle")}</a><h1>{hostMode ? t("hostPage") : t("tournamentTitle")}</h1><div class="user-menu"><span><strong>{displayName}</strong><small>{user ? t("loggedIn") : t("guest")}</small></span><button aria-label={t("settings")} title={t("settings")} on:click={()=>settingsOpen=true}>⚙</button></div></header>
  {#if !user && !mockMode}<p class="card login-notice">{t("loginToPlay")} <a href={`/login/?next=${encodeURIComponent(location.pathname+location.search)}`}>{t("login")}</a></p>{/if}
  {#if !tournament}
    {#if hostMode}<section class="setup single"><div class="card"><h2>{t("hostTournament")}</h2><p>{t("tournamentIntro")}</p><label>{t("rounds")} <input type="number" min="1" max="10" bind:value={rounds}/></label><button class="primary" disabled={!user||busy} on:click={createTournament}>{t("createTournament")}</button></div></section>
    {:else}<section class="setup single"><div class="card"><div class="section-title"><h2>{t("joinTournament")}</h2><a class="button-link" href="./host/">{t("hostTournament")}</a></div><input class="code" aria-label={t("tournamentCode")} maxlength="6" placeholder="CODE" bind:value={joinCode}/><button disabled={!user||busy} on:click={joinTournament}>{t("join")}</button>{#if mockAvailable}<hr/><h3>{t("mockTournament")}</h3><div class="mock-setup"><label>{t("dummyPlayers")} <select bind:value={mockPlayerCount}><option value={8}>8</option><option value={16}>16</option><option value={32}>32</option><option value={64}>64</option></select></label><label>{t("rounds")} <input type="number" min="1" max="10" bind:value={rounds}/></label></div><button class="mock-button" on:click={activateMockTournament}>{t("tryMockTournament")}</button>{/if}</div></section>{/if}
  {:else}<section class="tournament"><div class="card summary"><div><small>{t("tournamentTitle")}</small><strong>{tournament.code}{#if mockMode} <em>DEV MOCK</em>{/if}</strong></div><div><small>{t("format")}</small><strong>{t("classic")} · {tournament.rounds} {t("rounds")}</strong></div><div><small>{t("status")}</small><strong>{t(tournament.status)} · {t("round")} {tournament.current_round}/{tournament.rounds}</strong></div>{#if canStart}<button class="primary" disabled={busy} on:click={startRound}>▶ {t("startRound",{round:tournament.current_round+1})}</button>{/if}{#if mockMode && tournament.current_round>0 && !currentRoundDone}<div class="mock-actions"><button on:click={()=>finishMockRound("random")}>{t("randomResults")}</button><button on:click={()=>finishMockRound("draw")}>{t("drawAll")}</button></div>{/if}</div>
    <div class="columns"><section class="card"><h2>{t("standings")}</h2><div class="standings"><b>#</b><b>{t("player")}</b><b>{t("pointsShort")}</b><b>{t("buchholzShort")}</b>{#each standings as player,index}<span>{index+1}</span><strong>{player.display_name}{player.user_id===tournament.host_user_id?" ★":""}</strong><span>{player.match_points}</span><span>{player.buchholz}</span>{/each}</div></section><section class="card"><h2>{t("results")}</h2>{#each [...new Set(matches.map(m=>m.round_number))] as round}<h3>{t("round")} {round}</h3>{#each matches.filter(m=>m.round_number===round) as match}<div class="match"><span>{t("table")} {match.table_number}</span><strong>{playerName(match.player_one)} vs {playerName(match.player_two)}</strong><small>{resultText(match)}</small></div>{/each}{:else}<p>{t("noRounds")}</p>{/each}</section></div>
  </section>{/if}
  {#if error}<p class="error">{error}</p>{/if}
  <BattleSettingsModal open={settingsOpen} {displayName} {user} {darkMode} locale={locale} onClose={()=>settingsOpen=false} onSaveName={saveDisplayName} onToggleTheme={toggleTheme} onLocaleChange={changeLocale} onSignOut={signOut}/>
</main>

<style>
  :global(*){box-sizing:border-box}:global(body){margin:0;background:#edf2f5;color:#243642;font-family:Inter,system-ui,sans-serif}main{min-height:100vh;padding:18px;background:#edf2f5;color:#243642}main.dark{background:#17212a;color:#e1e8ed}header{display:flex;align-items:center;gap:15px;max-width:1100px;margin:0 auto 16px}header h1{flex:1;margin:0}.user-menu{display:flex;align-items:center;gap:8px}.user-menu strong{max-width:180px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}a{color:#1178b5;text-decoration:none}.card{border:1px solid #d4dde4;border-radius:14px;background:#fff;padding:18px;box-shadow:0 5px 24px #1b344511}main.dark .card,main.dark button,main.dark input{border-color:#435360;background:#24313c;color:#e1e8ed}.login-notice{max-width:700px;margin:0 auto 16px}.setup,.columns{display:grid;grid-template-columns:1fr 1fr;gap:16px;max-width:1100px;margin:auto}.setup.single{grid-template-columns:minmax(300px,620px);justify-content:center}.setup .card{display:flex;flex-direction:column;gap:10px}.section-title{display:flex;align-items:center;justify-content:space-between;gap:12px}.section-title h2{margin:0}.button-link{display:inline-flex;align-items:center;justify-content:center;min-height:38px;border:1px solid #bdc9d2;border-radius:8px;padding:7px 11px;background:#f6f9fa}.summary{display:flex;align-items:center;gap:26px;max-width:1100px;margin:0 auto 16px}.summary>div{display:flex;flex-direction:column}.summary button{margin-left:auto}input,button{min-height:38px;border:1px solid #bac7d0;border-radius:8px;padding:7px 10px;background:#f9fbfc;color:inherit;font:inherit}button{cursor:pointer}button:disabled{opacity:.5;cursor:not-allowed}.primary{border-color:#1688ca;background:#1688ca;color:#fff}.code{text-transform:uppercase;font-size:22px;letter-spacing:.12em}.standings{display:grid;grid-template-columns:35px minmax(120px,1fr) 50px 50px;gap:8px;align-items:center}.match{display:grid;grid-template-columns:70px 1fr auto;gap:8px;padding:8px 0;border-bottom:1px solid #e0e6eb}.match small{color:#697987}.error{position:fixed;right:15px;bottom:15px;max-width:480px;border-radius:9px;background:#b42318;color:#fff;padding:11px 14px}@media(max-width:700px){main{padding:8px}header{gap:8px}header h1{font-size:20px}.user-menu strong{max-width:90px}.setup,.columns{grid-template-columns:1fr}.summary{align-items:stretch;flex-direction:column;gap:8px}.summary button{margin:0}.match{grid-template-columns:60px 1fr}.match small{grid-column:2}}
  .user-menu>span{display:flex;align-items:flex-end;flex-direction:column}.user-menu small{color:#71808c;font-size:11px}.mock-setup{display:grid;grid-template-columns:1fr 1fr;gap:10px}.mock-setup label{display:flex;flex-direction:column;gap:5px}.mock-setup select{min-height:38px;border:1px solid #bac7d0;border-radius:8px;background:#f9fbfc;color:inherit;padding:7px}.mock-button{border-color:#805ad5;background:#f3efff;color:#553c9a}.summary em{font-size:10px;color:#805ad5}.mock-actions{display:flex;gap:6px;margin-left:auto}main.dark .mock-button,main.dark .mock-setup select{border-color:#7251b5;background:#34294a;color:#eee7ff}main.dark .summary em{color:#c4a7ff}@media(max-width:700px){.mock-setup{grid-template-columns:1fr}.mock-actions{margin:0}}
</style>
