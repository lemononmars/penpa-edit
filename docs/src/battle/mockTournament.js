const names = [
  "Letian Ming",
  "Tantan Dai",
  "Suzhe QIU",
  "Zihang Liu",
  "Hu Yuxuan Hu",
  "Kota Morinishi",
  "Tiit Vunk",
  "Cheran Sun",
  "Ken Endo",
  "Lucy Epstein",
  "Jakub Ondroušek",
  "Yu Tianxiang",
  "Vincent Bertrand",
  "Jan Vondruška",
  "Seungjae Kwak",
  "Freddie Hand",
  "Rintaro Matsumoto",
  "Martin Merker",
  "Sinchai Jaturangkhajit",
  "Zbigniew Zarzycki",
  "Takuya Sugimoto",
  "Đức Chiến Nguyễn",
  "Khả Lê Minh",
  "Timothy Doyle",
  "Dominik Bezkosty",
  "Candice Solidarios",
  "Weifan Wang",
  "Salih Alan",
  "Prasanna Seshadri",
  "Jelena Balanova",
  "Chiel Beenhakker",
  "Don Wu",
  "Jordyn Hyde",
  "Kishore Sridharan",
  "Hideaki Jo",
  "Tawan Sunathvanichkul",
  "Tomasz Stróżak",
  "黄明睿 Huang",
  "Can Erturan",
  "心 木",
  "Akio Tanabe",
  "Xingjian Cui",
  "David Jones",
  "CJ Tan",
  "James Peter Peter",
  "hyuk sun Kwon",
  "Calum Mailer",
  "Eva Schuckert",
  "Hwangrae Lee",
  "徐晨皓 samuelxu",
  "Gyimesi Zoltán",
  "Nora Borst",
  "Naoki Sekiya",
  "Matteo Fedeli",
  "Christian König",
  "Heyu Wang",
  "Ryusuke Nishiyama",
  "Tyler Chen",
  "zhonghua Huang",
  "Pavel Kadlečík",
  "Seonghwa Hong",
  "Hannes Sidorov",
  "Jiacheng Song",
  "Kevin Sun",
];

export function createMockStandings(count = 8) {
  const total = Math.max(2, Math.min(64, Number(count) || 8));
  return Array.from({ length: total }, (_, index) => ({
    tournament_id: "mock-tournament",
    user_id: `mock-${index + 1}`,
    display_name: names[index] || `Player ${index + 1}`,
    match_points: 0,
    buchholz: 0,
    joined_at: new Date(1700000000000 + index * 1000).toISOString(),
  }));
}

function alreadyPlayed(one, two, matches) {
  return matches.some((match) =>
    (match.player_one === one && match.player_two === two) ||
    (match.player_one === two && match.player_two === one));
}

export function pairMockRound(standings, previous, round) {
  const pool = [...standings].sort((a, b) =>
    b.match_points - a.match_points || b.buchholz - a.buchholz || a.user_id.localeCompare(b.user_id));
  const matches = [];
  while (pool.length) {
    const one = pool.shift();
    if (!pool.length) {
      matches.push({ id: `mock-r${round}-t${matches.length + 1}`, round_number: round, table_number: matches.length + 1, player_one: one.user_id, player_two: null, battle_room_id: null, result: "bye", status: "finished" });
      break;
    }
    let opponentIndex = pool.findIndex((candidate) => !alreadyPlayed(one.user_id, candidate.user_id, previous));
    if (opponentIndex < 0) opponentIndex = 0;
    const two = pool.splice(opponentIndex, 1)[0];
    matches.push({ id: `mock-r${round}-t${matches.length + 1}`, round_number: round, table_number: matches.length + 1, player_one: one.user_id, player_two: two.user_id, battle_room_id: null, result: null, status: "running" });
  }
  return matches;
}

export function completeMockRound(standings, matches, round, mode, random = Math.random) {
  const completed = matches.map((match) => {
    if (match.round_number !== round || match.status === "finished") return match;
    const result = mode === "draw" ? "draw" : random() < 0.5 ? "player_one" : "player_two";
    return { ...match, result, status: "finished" };
  });
  const points = new Map(standings.map((player) => [player.user_id, 0]));
  for (const match of completed.filter((entry) => entry.status === "finished")) {
    if (match.result === "bye") points.set(match.player_one, (points.get(match.player_one) || 0) + 1);
    else if (match.result === "draw") {
      points.set(match.player_one, (points.get(match.player_one) || 0) + 0.5);
      if (match.player_two) points.set(match.player_two, (points.get(match.player_two) || 0) + 0.5);
    } else {
      const winner = match.result === "player_one" ? match.player_one : match.player_two;
      if (winner) points.set(winner, (points.get(winner) || 0) + 1);
    }
  }
  const opponents = new Map();
  for (const match of completed) {
    if (!match.player_two) continue;
    opponents.set(match.player_one, [...(opponents.get(match.player_one) || []), match.player_two]);
    opponents.set(match.player_two, [...(opponents.get(match.player_two) || []), match.player_one]);
  }
  const nextStandings = standings.map((player) => ({
    ...player,
    match_points: points.get(player.user_id) || 0,
    buchholz: (opponents.get(player.user_id) || []).reduce((sum, id) => sum + (points.get(id) || 0), 0),
  })).sort((a, b) => b.match_points - a.match_points || b.buchholz - a.buchholz || a.display_name.localeCompare(b.display_name));
  return { standings: nextStandings, matches: completed };
}
