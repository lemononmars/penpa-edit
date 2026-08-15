import { I18n } from "i18n-js";
import { writable } from "svelte/store";

export type BattleLocale = "en" | "th";

const messages = {
  en: {
    settings: "Settings", displayName: "Display name", save: "Save", cancel: "Cancel",
    language: "Language", english: "English", thai: "Thai", appearance: "Appearance",
    light: "Light", dark: "Dark", account: "Account", login: "Log in", register: "Register", switchEnglish: "Switch to English", switchThai: "Switch to Thai",
    signOut: "Sign out", signedInAs: "Signed in as %{email}", close: "Close",
    createRoom: "Create room", createARoom: "Create a room", back: "Back", grid: "Grid",
    difficulty: "Difficulty", easy: "Easy", normal: "Normal", hard: "Hard", variants: "Variants",
    classic: "Classic", basicVariant: "Basic variant", advancedVariant: "Advanced variant",
    random: "Random", showRule: "Show rule", activeRooms: "Active rooms", refresh: "Refresh",
    join: "Join", watch: "Watch", noRooms: "No rooms are active yet.", youAre: "You are",
    rules: "Rules", players: "Players", startBattle: "Start battle", retryBoard: "Retry board",
    lobby: "Lobby", invite: "Invite", copied: "Copied", preparing: "Preparing a unique puzzle",
    backToLobby: "Back to lobby", readyLobby: "Ready in the lobby",
    boardHidden: "The board is loaded and hidden until battle starts.", loadingBoard: "Loading the board",
    getReady: "Get ready!", copyInvite: "Copy invite", classicSudoku: "Classic Sudoku",
    classicRule: "Place each digit once in every row, column, and box.", preparingStatus: "Preparing",
    playing: "Playing", finished: "Finished", abort: "Abort", abortBattle: "Abort battle",
    rematch: "Rematch", roomInfo: "Room information", removePlayer: "Remove player", points: "pts",
    timeLimit: "Time limit reached", battleComplete: "Battle complete", finalScores: "Final scores recorded.",
    winsWith: "wins with", tieWith: "tie with", tournament: "Back to tournament",
    leaderboard: "Leaderboard", viewLeaderboard: "View leaderboard", player: "Player", rating: "Rating", guest: "Guest", loggedIn: "Logged in", ranked: "Ranked", createCasual: "Create casual",
    createRanked: "Create ranked", rankedLogin: "Log in to play ranked", rankedDescription: "Ranked rooms are authenticated 1v1 games. Bots and extra players are disabled.",
    waitingRankedOpponent: "Waiting for one ranked opponent…", ratedBattle: "Rated 1v1 battle", sudokuGenerator: "Sudoku generator", sharedBoard: "Shared Sudoku board", battleInput: "Battle number input", battleTitle: "Sudoku Battle",
    tournamentTitle: "Sudoku Tournament", hostTournament: "Host tournament", joinTournament: "Join tournament",
    tournamentIntro: "Classic 9×9 · Swiss pairings · up to 64 players", rounds: "Rounds",
    createTournament: "Create tournament", tournamentCode: "Tournament code", standings: "Standings",
    results: "Results", format: "Format", status: "Status", round: "Round", table: "Table",
    noRounds: "No rounds yet. The host starts each round.", startRound: "Start round %{round}",
    mockTournament: "Development simulator", dummyPlayers: "Dummy players", tryMockTournament: "Try mock tournament",
    randomResults: "Random results", drawAll: "Draw all",
    pointsShort: "Pts", buchholzShort: "BH", inProgress: "In progress", draw: "Draw",
    receivesBye: "%{player} receives a bye", won: "%{player} won", bye: "Bye", host: "Host",
    loginToPlay: "Log in to join or host a tournament.", hostPage: "Host a tournament",
    loginTitle: "Log in", registerTitle: "Create account", resetTitle: "Reset password",
    email: "Email", password: "Password", confirmPassword: "Confirm password",
    forgotPassword: "Forgot password?", noAccount: "Don't have an account?", haveAccount: "Already have an account?",
    sendResetLink: "Send reset link", resetHelp: "Enter your email and we'll send you a password reset link.",
    checkEmail: "Check your email for the confirmation link.", resetEmailSent: "Check your email for the password reset link.",
    newPassword: "New password", updatePassword: "Update password", passwordUpdated: "Password updated.",
    continueBattle: "Continue to Battle", or: "OR", googleLogin: "Continue with Google",
    facebookLogin: "Continue with Facebook", sudokuKeypad: "Sudoku keypad", normalDigits: "Normal digits",
    centerNotes: "Center notes", cornerNotes: "Corner notes", clearSelectedCell: "Clear selected cell", clear: "Clear", openPuzzleCheck: "Open puzzle with answer check",
    notifyMeWhenJoins: "Notify me when someone joins",
    notificationPermissionDenied: "Notification permission denied.",
    playerJoinedNotification: "A player joined your room!",
    notifyActive: "Watching for new players…",
    resetTournament: "Reset tournament",
    resetTournamentConfirm: "Are you sure you want to reset the tournament? All rounds and match progress will be cleared.",
    abortTournament: "Abort tournament",
    abortTournamentConfirm: "Are you sure you want to abort this tournament?",
    detailedResults: "Detailed results",
  },
  th: {
    settings: "การตั้งค่า", displayName: "ชื่อที่แสดง", save: "บันทึก", cancel: "ยกเลิก",
    language: "ภาษา", english: "อังกฤษ", thai: "ไทย", appearance: "การแสดงผล",
    light: "สว่าง", dark: "มืด", account: "บัญชี", login: "เข้าสู่ระบบ", register: "สมัครสมาชิก", switchEnglish: "เปลี่ยนเป็นภาษาอังกฤษ", switchThai: "เปลี่ยนเป็นภาษาไทย",
    signOut: "ออกจากระบบ", signedInAs: "เข้าสู่ระบบเป็น %{email}", close: "ปิด",
    createRoom: "สร้างห้อง", createARoom: "สร้างห้องใหม่", back: "กลับ", grid: "ตาราง",
    difficulty: "ความยาก", easy: "ง่าย", normal: "ปกติ", hard: "ยาก", variants: "รูปแบบ",
    classic: "คลาสสิก", basicVariant: "รูปแบบพื้นฐาน", advancedVariant: "รูปแบบขั้นสูง",
    random: "สุ่ม", showRule: "แสดงกติกา", activeRooms: "ห้องที่เปิดอยู่", refresh: "รีเฟรช",
    join: "เข้าร่วม", watch: "ชม", noRooms: "ยังไม่มีห้องที่เปิดอยู่", youAre: "คุณคือ",
    rules: "กติกา", players: "ผู้เล่น", startBattle: "เริ่มแข่งขัน", retryBoard: "สร้างกระดานใหม่",
    lobby: "ล็อบบี้", invite: "เชิญ", copied: "คัดลอกแล้ว", preparing: "กำลังสร้างปริศนาเฉพาะ",
    backToLobby: "กลับล็อบบี้", readyLobby: "พร้อมในล็อบบี้",
    boardHidden: "โหลดกระดานแล้วและจะซ่อนไว้จนเริ่มแข่งขัน", loadingBoard: "กำลังโหลดกระดาน",
    getReady: "เตรียมตัว!", copyInvite: "คัดลอกคำเชิญ", classicSudoku: "ซูโดกุคลาสสิก",
    classicRule: "ใส่ตัวเลขแต่ละตัวหนึ่งครั้งในทุกแถว ทุกคอลัมน์ และทุกกล่อง", preparingStatus: "กำลังเตรียม",
    playing: "กำลังแข่งขัน", finished: "จบแล้ว", abort: "ยุติ", abortBattle: "ยุติการแข่งขัน",
    rematch: "แข่งอีกครั้ง", roomInfo: "ข้อมูลห้อง", removePlayer: "นำผู้เล่นออก", points: "คะแนน",
    timeLimit: "หมดเวลา", battleComplete: "การแข่งขันจบแล้ว", finalScores: "บันทึกคะแนนสุดท้ายแล้ว",
    winsWith: "ชนะด้วย", tieWith: "เสมอกันด้วย", tournament: "กลับการแข่งขัน",
    leaderboard: "กระดานผู้นำ", viewLeaderboard: "ดูกระดานผู้นำ", player: "ผู้เล่น", rating: "เรตติ้ง", guest: "ผู้เล่นรับเชิญ", loggedIn: "ผู้ใช้ที่เข้าสู่ระบบ", ranked: "จัดอันดับ", createCasual: "สร้างห้องทั่วไป",
    createRanked: "สร้างห้องจัดอันดับ", rankedLogin: "เข้าสู่ระบบเพื่อเล่นจัดอันดับ", rankedDescription: "ห้องจัดอันดับเป็นเกม 1 ต่อ 1 สำหรับผู้ใช้ที่เข้าสู่ระบบ และไม่อนุญาตบอทหรือผู้เล่นเพิ่มเติม",
    waitingRankedOpponent: "กำลังรอคู่แข่งจัดอันดับหนึ่งคน…", ratedBattle: "การแข่งขันจัดอันดับ 1 ต่อ 1", sudokuGenerator: "เครื่องมือสร้างซูโดกุ", sharedBoard: "กระดานซูโดกุร่วม", battleInput: "แป้นตัวเลขการแข่งขัน", battleTitle: "ซูโดกุแบทเทิล",
    tournamentTitle: "การแข่งขันซูโดกุ", hostTournament: "จัดการแข่งขัน", joinTournament: "เข้าร่วมการแข่งขัน",
    tournamentIntro: "คลาสสิก 9×9 · ระบบสวิส · สูงสุด 64 คน", rounds: "จำนวนรอบ",
    createTournament: "สร้างการแข่งขัน", tournamentCode: "รหัสการแข่งขัน", standings: "อันดับ",
    results: "ผลการแข่งขัน", format: "รูปแบบ", status: "สถานะ", round: "รอบ", table: "โต๊ะ",
    noRounds: "ยังไม่มีรอบ ผู้จัดเริ่มแต่ละรอบ", startRound: "เริ่มรอบ %{round}",
    mockTournament: "เครื่องจำลองสำหรับพัฒนา", dummyPlayers: "ผู้เล่นจำลอง", tryMockTournament: "ทดลองการแข่งขันจำลอง",
    randomResults: "สุ่มผลการแข่งขัน", drawAll: "เสมอทุกคู่",
    pointsShort: "แต้ม", buchholzShort: "BH", inProgress: "กำลังแข่ง", draw: "เสมอ",
    receivesBye: "%{player} ได้บาย", won: "%{player} ชนะ", bye: "บาย", host: "ผู้จัด",
    loginToPlay: "เข้าสู่ระบบเพื่อเข้าร่วมหรือจัดการแข่งขัน", hostPage: "จัดการแข่งขัน",
    loginTitle: "เข้าสู่ระบบ", registerTitle: "สร้างบัญชี", resetTitle: "รีเซ็ตรหัสผ่าน",
    email: "อีเมล", password: "รหัสผ่าน", confirmPassword: "ยืนยันรหัสผ่าน",
    forgotPassword: "ลืมรหัสผ่าน?", noAccount: "ยังไม่มีบัญชี?", haveAccount: "มีบัญชีแล้ว?",
    sendResetLink: "ส่งลิงก์รีเซ็ต", resetHelp: "กรอกอีเมลเพื่อรับลิงก์รีเซ็ตรหัสผ่าน",
    checkEmail: "ตรวจสอบอีเมลเพื่อยืนยันบัญชี", resetEmailSent: "ตรวจสอบอีเมลสำหรับลิงก์รีเซ็ตรหัสผ่าน",
    newPassword: "รหัสผ่านใหม่", updatePassword: "เปลี่ยนรหัสผ่าน", passwordUpdated: "เปลี่ยนรหัสผ่านแล้ว",
    continueBattle: "ไปยัง Battle", or: "หรือ", googleLogin: "ดำเนินการต่อด้วย Google",
    facebookLogin: "ดำเนินการต่อด้วย Facebook", sudokuKeypad: "แป้นตัวเลขซูโดกุ", normalDigits: "ตัวเลขปกติ",
    centerNotes: "โน้ตตรงกลาง", cornerNotes: "โน้ตมุม", clearSelectedCell: "ล้างช่องที่เลือก", clear: "ล้าง", openPuzzleCheck: "เปิดปริศนาพร้อมตรวจคำตอบ",
    notifyMeWhenJoins: "แจ้งเตือนเมื่อมีผู้เล่นเข้าร่วม",
    notificationPermissionDenied: "ถูกปฏิเสธการแจ้งเตือนจากเบราว์เซอร์",
    playerJoinedNotification: "มีผู้เล่นเข้าร่วมห้องของคุณ!",
    notifyActive: "กำลังรอผู้เล่นใหม่…",
    resetTournament: "รีเซ็ตการแข่งขัน",
    resetTournamentConfirm: "คุณแน่ใจหรือไม่ที่จะรีเซ็ตการแข่งขัน? รอบและผลการแข่งขันทั้งหมดจะถูกล้าง",
    abortTournament: "ยุติการแข่งขัน",
    abortTournamentConfirm: "คุณแน่ใจหรือไม่ที่จะยุติการแข่งขันนี้?",
    detailedResults: "ผลการแข่งขันแบบละเอียด",
  },
};

export const i18n = new I18n(messages);
i18n.enableFallback = true;

const stored = typeof window !== "undefined" && window.localStorage.getItem("sudotoku-battle-language") === "th" ? "th" : "en";
i18n.locale = stored;
export const battleLocale = writable<BattleLocale>(stored);

export function setBattleLocale(locale: BattleLocale) {
  i18n.locale = locale;
  if (typeof window !== "undefined") window.localStorage.setItem("sudotoku-battle-language", locale);
  battleLocale.set(locale);
}

export function t(key: string, options: Record<string, unknown> = {}) {
  return String(i18n.t(key, options));
}
