const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

const root = path.resolve(__dirname, "..");
const battle = fs.readFileSync(path.join(root, "docs/src/BattleApp.svelte"), "utf8");
const keypad = fs.readFileSync(path.join(root, "docs/src/SudokuKeypad.svelte"), "utf8");
const tournament = fs.readFileSync(path.join(root, "docs/src/TournamentApp.svelte"), "utf8");
const leaderboard = fs.readFileSync(path.join(root, "docs/src/BattleLeaderboardApp.svelte"), "utf8");
const general = fs.readFileSync(path.join(root, "docs/js/general.js"), "utf8");
const auth = fs.readFileSync(path.join(root, "docs/src/AuthApp.svelte"), "utf8");
const settings = fs.readFileSync(path.join(root, "docs/src/BattleSettingsModal.svelte"), "utf8");
const battleI18n = fs.readFileSync(path.join(root, "docs/src/battle/i18n.ts"), "utf8");
const profile = fs.readFileSync(path.join(root, "docs/src/battle/profile.ts"), "utf8");
const client = fs.readFileSync(path.join(root, "docs/src/battle/supabase.ts"), "utf8");
const solver = fs.readFileSync(path.join(root, "docs/js/sudoku_solver.js"), "utf8");
const app = fs.readFileSync(path.join(root, "docs/src/App.svelte"), "utf8");
const migration = fs.readFileSync(path.join(root, "supabase/migrations/20260809000000_create_sudoku_battle.sql"), "utf8");
const extensionMigration = fs.readFileSync(path.join(root, "supabase/migrations/20260809010000_extend_sudoku_battle.sql"), "utf8");
const presenceMigration = fs.readFileSync(path.join(root, "supabase/migrations/20260809020000_battle_presence_and_timeout.sql"), "utf8");
const abortMigration = fs.readFileSync(path.join(root, "supabase/migrations/20260809030000_abort_sudoku_battle.sql"), "utf8");
const finishAbortMigration = fs.readFileSync(path.join(root, "supabase/migrations/20260812020000_finish_aborted_battle.sql"), "utf8");
const preparingJoinMigration = fs.readFileSync(path.join(root, "supabase/migrations/20260809040000_allow_preparing_room_join.sql"), "utf8");
const rankedMigration = fs.readFileSync(path.join(root, "supabase/migrations/20260812000000_ranked_leaderboard_and_tournaments.sql"), "utf8");
const profileMigration = fs.readFileSync(path.join(root, "supabase/migrations/20260812010000_initialize_profile_on_login.sql"), "utf8");
const names = fs.readFileSync(path.join(root, "docs/src/battle/names.ts"), "utf8");
const vite = fs.readFileSync(path.join(root, "vite.config.js"), "utf8");
const generator = fs.readFileSync(path.join(root, "docs/js/sudoku_generator.js"), "utf8");

test("battle is a production page backed by the existing Penpa board", () => {
  assert.match(vite, /envDir:\s*resolve\(process\.cwd\(\)\)/);
  assert.match(vite, /battle:\s*resolve\(process\.cwd\(\),\s*"docs\/battle\/index\.html"\)/);
  assert.match(app, /class="battle-action"[\s\S]*?\.\/battle/);
  assert.match(battle, /index\.html\?embed=1&hideSidebar=1&battle=1|boardFrameSource/);
  assert.match(solver, /prepareBattleGrid:\s*prepareBattleGrid/);
  assert.match(solver, /setBattleDigit:\s*setBattleDigit/);
  assert.match(solver, /CustomEvent\("sudoku-generated"/);
});

test("battle creation supports 6x6, 9x9, and the explicit generated variant lists", () => {
  assert.match(battle, /gridSize:\s*6\s*\|\s*9/);
  assert.match(battle, /battleVariantIdsBySize\[gridSize\][\s\S]*?\.map/);
  assert.match(battle, /6:\s*\[[^\]]*"classic"/);
  assert.match(battle, /9:\s*\[[^\]]*"windoku"/);
  assert.match(battle, /selectedVariant = "classic"/);
  assert.match(battle, /SudokuTools\.generatePuzzle/);
});

test("battle generation normalizes a serialized 6x6 room size before creating the grid", () => {
  assert.match(solver, /function prepareBattleGrid\(size[\s\S]*?Number\(size\) === 6/);
  assert.match(generator, /var size = Number\(options\.size\) === 6 \? 6 : 9/);
  assert.match(battle, /resetSessionTimers\(\);\s*preparingBoard = true/);
  assert.doesNotMatch(battle, /preparingBoard = true;[^\n]*resetSessionTimers\(\)/);
});

test("Supabase owns authoritative scoring and does not expose solutions", () => {
  assert.match(migration, /create table if not exists public\.battle_room_secrets/);
  assert.match(migration, /revoke all on public\.battle_room_secrets from anon, authenticated/);
  assert.match(migration, /delta := case when is_correct then 1 else -2 end/);
  assert.match(migration, /create unique index if not exists battle_one_correct_move_per_cell/);
  assert.match(client, /createClient/);
  assert.match(battle, /postgres_changes[\s\S]*?battle_moves/);
});

test("battle keyboard events cross the iframe boundary with note modifiers", () => {
  assert.match(battle, /forwardBattleKeyboard/);
  assert.match(battle, /shiftKey:\s*event\.shiftKey/);
  assert.match(battle, /ctrlKey:\s*event\.ctrlKey/);
  assert.match(battle, /ArrowUp[\s\S]*ArrowDown[\s\S]*ArrowLeft[\s\S]*ArrowRight/);
});

test("confirmed digits retain the submitting player's Penpa color", () => {
  assert.match(solver, /setBattleDigit\(row, col, digit, color, shadingColor\)/);
  assert.match(solver, /pu\.pu_a_col\.number\[key\]\s*=\s*color/);
  assert.match(solver, /typeof UserSettings !== "undefined"[\s\S]*?UserSettings\.custom_colors_on = true/);
  assert.match(battle, /setBattleDigit\(move\.row_index, move\.col_index, move\.digit, color/);
});

test("difficulty maps to minimal, plus eight, and plus twelve clues", () => {
  assert.match(battle, /hard[\s\S]*normal[\s\S]*easy/);
  assert.match(generator, /options\.extraClues/);
  assert.match(generator, /extraClues/);
});

test("battle-specific embedded controls use a square right-side layout", () => {
  assert.match(app, /let isBattle\s*=\s*checkUrlFlag\("battle"\)/);
  assert.match(app, /class:battle=\{isBattle\}/);
  assert.match(app, /isBattle \|\| mobilePanelPosition/);
  assert.match(app, /aspect-ratio:\s*1/);
});

test("rooms prepare before lobby, countdown on the server, and support rematches", () => {
  assert.match(extensionMigration, /create_battle_room_v2/);
  assert.match(extensionMigration, /status='preparing'/);
  assert.match(extensionMigration, /prepare_battle_room/);
  assert.match(extensionMigration, /now\(\)\+interval '3 seconds'/);
  assert.match(extensionMigration, /begin_battle_rematch/);
  assert.match(extensionMigration, /now\(\)<target_room\.started_at/);
});

test("a missing local player name receives a Sudoku adjective and noun", () => {
  assert.match(names, /const adjectives = \[[\s\S]*Logical/);
  assert.match(names, /const nouns = \[[\s\S]*Digit/);
  assert.match(names, /window\.localStorage\.setItem\(battleNameKey, name\)/);
  assert.match(battle, /update_battle_player_name/);
});

test("battle uses one dedicated digit and note panel with responsive ordering", () => {
  assert.match(battle, /class="battle-input-panel"/);
  assert.match(battle, /<SudokuKeypad[\s\S]*size=\{room\.grid_size\}/);
  assert.match(keypad, /mode-normal[\s\S]*mode-center[\s\S]*mode-corner/);
  assert.match(keypad, /digit <= size/);
  assert.match(keypad, /\.sudoku-keypad\{display:grid;grid-template-columns:repeat\(3,1fr\);grid-template-rows:repeat\(4,1fr\)/);
  assert.match(keypad, /@media\(max-width:700px\)[\s\S]*grid-template-columns:repeat\(4,52px\);grid-template-rows:repeat\(3,52px\)/);
  assert.match(app, /\{#if !isBattle\}[\s\S]*class="mobile-input-deck"/);
  assert.match(app, /\{#if !isBattle\}[\s\S]*class="column controls"/);
});

test("battle room chrome is responsive and exposes host, abort, and presence feedback", () => {
  assert.match(battle, /class="mobile-room-summary"/);
  assert.match(battle, /roomInfoOpen = !roomInfoOpen/);
  assert.match(battle, /player\.id === room\.host_player_id \? " ★" : ""/);
  assert.match(battle, /disabled=\{busy \|\| !boardLoaded \|\| \(room\.ranked && players\.length !== 2\)\}[\s\S]*?▶ \{t\("startBattle"\)\}/);
  assert.match(battle, /abort_battle_room/);
  assert.match(battle, /showBattleToast\(`\$\{joined\.name\} joined the room\.`\)/);
  assert.match(battle, /showBattleToast\(`\$\{left\[1\]\} left the room\.`\)/);
  assert.match(abortMigration, /create or replace function public\.abort_battle_room/);
  assert.match(abortMigration, /status='preparing'/);
});

test("the main lobby retains active rooms and room controls are visually grouped", () => {
  assert.match(battle, /<div class="card active-list">/);
  assert.doesNotMatch(battle, /\{#if landingMode === "join"\}<div class="card active-list">/);
  assert.match(battle, /class="sidebar-section room-summary"/);
  assert.match(battle, /class="sidebar-section personal-settings"/);
  assert.match(battle, /class="sidebar-section player-section"/);
  assert.match(battle, /t\("copyInvite"\)/);
  assert.match(battle, /t\("backToLobby"\)/);
});

test("Windoku generation supplies four extra regions and cache-busts failed worker assets", () => {
  assert.match(generator, /variants\.indexOf\("windoku"\)[\s\S]*?constraints\.regionAllDifferent/);
  assert.match(generator, /\[\[1, 1\], \[1, 5\], \[5, 1\], \[5, 5\]\]/);
  assert.match(solver, /sudokuWorkerUrl\("sudoku_generator_worker_bundle\.js", workerRetry\)/);
  assert.match(solver, /SudokuWorkerPageNonce/);
  assert.match(solver, /"&page=" \+ encodeURIComponent\(SudokuWorkerPageNonce\)/);
});

test("battle variants are explicit per grid size", () => {
  assert.match(battle, /const battleVariantIdsBySize:\s*Record<6 \| 9, string\[]>/);
  assert.match(battle, /6:\s*\[[^\]]*"classic"[^\]]*"battenburg"/);
  assert.match(battle, /9:\s*\[[^\]]*"windoku"/);
});

test("joining and mobile room chrome use the compact battle flow", () => {
  assert.doesNotMatch(battle, />Join room<\/button>/);
  assert.match(battle, /<h2>\{t\("activeRooms"\)\}<\/h2>/);
  assert.match(battle, /roomInfoOpen = false/);
  assert.match(battle, /focusBattleCell\?\.\(0, 0\)/);
  assert.match(battle, /\.room-sidebar\.open\{[\s\S]*?background:#fff/);
  assert.match(battle, /\.room-sidebar \.battle-actions\{display:none!important\}/);
  assert.match(preparingJoinMigration, /target_room\.status not in \('preparing','lobby'\)/);
});

test("generated Windoku boards render their shaded windows", () => {
  assert.match(solver, /generatedVariants\.indexOf\("windoku"\)[\s\S]*?ensureWindokuCages\(\)/);
});

test("presence cleanup, explicit leave, and the 20 minute limit are server authoritative", () => {
  assert.match(presenceMigration, /touch_battle_player/);
  assert.match(presenceMigration, /leave_battle_room/);
  assert.match(presenceMigration, /interval '20 minutes'/);
  assert.match(presenceMigration, /finish_reason='time_limit'/);
  assert.match(presenceMigration, /delete from public\.battle_rooms/);
  assert.match(battle, /beforeunload/);
  assert.match(battle, /touch_battle_player/);
});

test("spectators join by URL without creating a player and receive a read-only synchronized board", () => {
  assert.match(battle, /get\("watch"\) === "1"/);
  assert.match(battle, /async function watchRoom/);
  assert.match(battle, /select\("\*"\)\.eq\("code", roomCode\)\.single\(\)/);
  assert.match(battle, /watching \? "&watch=1" : ""/);
  assert.match(battle, /spectatorMode \? watchRoom\(roomCode\) : joinRoom\(roomCode\)/);
  assert.match(battle, /\{#if !spectatorMode\}[\s\S]*class="battle-input-panel"/);
  assert.match(battle, /play-area\.spectator \.board\{pointer-events:none\}/);
  assert.match(battle, />\{t\("join"\)\}<\/button><button on:click=\{\(\) => watchRoom\(active\.code\)\}>\{t\("watch"\)\}<\/button>/);
});

test("confirmed battle digits store a custom font color and a translucent player-colored surface", () => {
  assert.match(solver, /function setBattleDigit\(row, col, digit, color, shadingColor\)/);
  assert.match(solver, /pu\.pu_a_col\.number\[key\] = color/);
  assert.match(solver, /pu\.pu_a_col\.surface\[key\] = shadingColor/);
  assert.match(battle, /penpaShades\[colorName\]/);
  assert.match(battle, /penpaShades\[myColor\]/);
});

test("mobile room information avoids duplicate scores and fits its content", () => {
  assert.match(battle, /\.room-sidebar \.player-section\{display:none;flex:none\}/);
  assert.match(battle, /inset:48px 6px auto/);
  assert.match(battle, /<h2>\{t\("activeRooms"\)\}<\/h2>/);
  assert.match(battle, /<BattleSettingsModal/);
});

test("aborting ends the current board and only rematch starts preparation", () => {
  assert.match(finishAbortMigration, /status='finished'/);
  assert.match(finishAbortMigration, /finish_reason='aborted'/);
  assert.doesNotMatch(finishAbortMigration, /puzzle_hash=null/);
  assert.match(battle, /room\.status === "finished"[\s\S]*answerCheckUrl/);
  assert.match(battle, /class:board-complete=\{room\?\.status === "finished"\}/);
  assert.match(battle, /class:finished-cover=\{room\.status === "finished"\}/);
  assert.match(extensionMigration, /begin_battle_rematch[\s\S]*status='preparing'[\s\S]*puzzle_hash=null/);
});

test("battle input is answer-layer only and preserves native note shortcuts", () => {
  assert.match(battle, /\["z", "x", "c"\]\.includes\(event\.key\.toLowerCase\(\)\)/);
  assert.match(battle, /setBattleInputMode\?\.\(noteMode\)/);
  assert.match(battle, /shiftKey: event\.shiftKey/);
  assert.match(battle, /ctrlKey: event\.ctrlKey/);
  assert.match(solver, /function setBattleInputMode\(mode\)/);
  assert.match(solver, /board\.mode_qa\("pu_a"\)/);
  assert.match(solver, /board\.mode\.pu_a\.edit_mode = "sudoku"/);
  assert.match(solver, /typeof window !== "undefined" \? window\.pu/);
  assert.match(solver, /function battleAnswerCheckLink\(\)/);
  assert.match(battle, /t\("openPuzzleCheck"\)/);
});

test("generated battle marks survive the serialized room handoff", () => {
  assert.match(battle, /generatedMarksPayload\(result, frame\.pu\)/);
  assert.match(battle, /questionLayers:[\s\S]*pu_q:[\s\S]*pu_q_col:/);
  assert.match(battle, /snapshotPenpaLayer/);
  assert.match(battle, /generatedMarks=\$\{encodeURIComponent\(JSON\.stringify/);
  assert.match(battle, /generatedMarksFromHash\(room\.puzzle_hash\)/);
  assert.match(battle, /restoreGeneratedMarks\?\.\(generatedMarks\)/);
  assert.match(solver, /ensureOutsideClueSpace\(outsideList\)/);
  assert.match(solver, /\["pu_q", "pu_q_col"\]/);
  assert.match(solver, /pu\[layerName\]\[mode\] = JSON\.parse\(JSON\.stringify\(snapshot\[mode\]\)\)/);
  assert.match(battle, /penpaBoardReadyPromise/);
  assert.doesNotMatch(battle, /frame\?\.penpaBoardReady && frame\?\.pu/);
  assert.match(general, /window\.penpaBoardReadyPromise = new Promise/);
  assert.match(general, /resolvePenpaBoardReady\?\.\(window\.pu\)/);
  assert.match(general, /window\.penpaBoardReady = typeof window\.pu/);
  assert.match(general, /CustomEvent\("penpa-board-ready"\)/);
  assert.match(battle, /await loadConfirmedMoves\(\);[\s\S]*restoreGeneratedMarks\?\.\(generatedMarks\)/);
  assert.match(battle, /boardLoaded = false;[\s\S]*const frame = await waitForBoard\(\)[\s\S]*boardLoaded = true/);
});

test("battle generation uses one 20-second deadline", () => {
  assert.match(solver, /GENERATOR_RUN_LIMIT_MS = 20000/);
  assert.match(solver, /20-second safety limit/);
  assert.match(battle, /generationSeconds \/ 20/);
  assert.match(battle, /setTimeout\(\(\) => reject\(new Error\("Puzzle generation timed out\."\)\), 25000\)/);
});

test("battle identity, settings, bots, and leaderboard use the compact lobby and room flow", () => {
  assert.match(battle, /authUser \? t\("loggedIn"\) : t\("guest"\)/);
  assert.doesNotMatch(battle, /class="card leaderboard-card"/);
  assert.match(battle, /href="\.\/leaderboard\/"/);
  assert.match(settings, /class="language-buttons"/);
  assert.match(settings, /showIdentity/);
  assert.match(settings, /showAccount/);
  assert.match(battle, /showIdentity=\{!room\}/);
  assert.match(battle, /showAccount=\{!room\}/);
  assert.match(battle, /!botTokens\.length[\s\S]*class="bot-buttons-row"/);
  assert.match(vite, /docs\/battle\/leaderboard\/index\.html/);
  assert.match(auth, /fa fa-google/);
  assert.match(auth, /fa fa-facebook/);
  assert.match(auth, /button\{cursor:pointer\}/);
  assert.match(settings, />English<\/button>/);
  assert.match(settings, />ไทย<\/button>/);
  assert.match(keypad, /\.dark\) button:hover:not\(:disabled\)/);
  assert.match(battle, /title=\{t\("sharedBoard"\)\}/);
});

test("ranked battles use Supabase auth, server-side Glicko-2, and an account leaderboard", () => {
  assert.match(auth, /signInWithPassword/);
  assert.match(battle, /create_battle_room_v3/);
  assert.match(battle, /t\("createRanked"\)/);
  assert.match(battle, /Leaderboard/);
  assert.match(rankedMigration, /create table if not exists public\.battle_profiles/);
  assert.match(rankedMigration, /create or replace function public\.glicko2_update/);
  assert.match(rankedMigration, /apply_ranked_battle_result_after_finish/);
  assert.match(rankedMigration, /target\.ranked[\s\S]*exactly two signed-in players/);
});

test("classic Swiss tournaments create paired battle rooms and redirect players", () => {
  assert.match(tournament, /start_battle_tournament_round/);
  assert.match(tournament, /t\("standings"\)/);
  assert.match(tournament, /maybeEnterMatch/);
  assert.match(rankedMigration, /check\(variant='classic'\)/);
  assert.match(rankedMigration, /battle_tournament_players/);
  assert.match(rankedMigration, /battle_tournament_matches/);
  assert.match(rankedMigration, /not exists\([\s\S]*battle_tournament_matches[\s\S]*player_one=p1/);
  assert.match(rankedMigration, /count\(\*\)[\s\S]*>=64[\s\S]*Tournament is full/);
  assert.match(tournament, /mockAvailable = import\.meta\.env\.DEV/);
  assert.match(tournament, /pairMockRound/);
  assert.match(tournament, /finishMockRound/);
  assert.match(leaderboard, /main\.dark header>a/);
  assert.match(battle, /main\.dark \.button-link:hover/);
});

test("battle variant chooser is grouped, randomizable, bilingual, and can reveal rules", () => {
  assert.match(battle, /selectedVariantGroup:\s*"classic"\s*\|\s*"basic"\s*\|\s*"advanced"/);
  assert.match(battle, /function chooseRandomVariant\(\)/);
  assert.match(battle, /class="variant-dropdown-row"/);
  assert.match(battle, /bind:checked=\{showSelectedVariantRule\}/);
  assert.match(battleI18n, /new I18n\(messages\)/);
  assert.match(battleI18n, /battleLocale = writable/);
  assert.match(battleI18n, /"sudotoku-battle-language"/);
  assert.match(battle, /start-in-grid[\s\S]*?▶ \{t\("startBattle"\)\}/);
  assert.match(battle, /\.bot-buttons-row\{[^}]*width:190px/);
});

test("dedicated auth routes, shared settings, and login-time profile recovery are wired", () => {
  assert.match(vite, /docs\/login\/index\.html/);
  assert.match(vite, /docs\/register\/index\.html/);
  assert.match(vite, /docs\/reset-password\/index\.html/);
  assert.match(auth, /resetPasswordForEmail/);
  assert.match(auth, /updateUser\(\{ password \}\)/);
  assert.match(settings, /onLocaleChange/);
  assert.match(profile, /ensure_battle_profile/);
  assert.match(profileMigration, /insert into public\.battle_profiles/);
  assert.match(profileMigration, /grant execute on function public\.ensure_battle_profile\(text\) to authenticated/);
});

test("tournament hosting has its own route and Battle no longer links to tournaments", () => {
  assert.match(vite, /docs\/battle\/tournament\/host\/index\.html/);
  assert.match(tournament, /export let hostMode = false/);
  assert.match(tournament, /href="\.\/host\/"/);
  assert.doesNotMatch(battle, /href="\.\/tournament\/"/);
});
