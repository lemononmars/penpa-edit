const assert = require("node:assert/strict");
const test = require("node:test");

test("mock Swiss tournament pairs all players, avoids rematches, and scores results", async () => {
  const { createMockStandings, pairMockRound, completeMockRound } = await import("../docs/src/battle/mockTournament.js");
  let standings = createMockStandings(8);
  let matches = pairMockRound(standings, [], 1);
  assert.equal(matches.length, 4);
  assert.equal(new Set(matches.flatMap((match) => [match.player_one, match.player_two])).size, 8);
  ({ standings, matches } = completeMockRound(standings, matches, 1, "draw"));
  assert.ok(standings.every((player) => player.match_points === 0.5));
  const roundTwo = pairMockRound(standings, matches, 2);
  for (const match of roundTwo) {
    assert.equal(matches.some((old) => new Set([old.player_one, old.player_two]).has(match.player_one) && new Set([old.player_one, old.player_two]).has(match.player_two)), false);
  }
});
