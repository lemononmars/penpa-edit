import { mount } from "svelte";
import TournamentApp from "./TournamentApp.svelte";

mount(TournamentApp, {
  target: document.getElementById("tournament-app")!,
  props: { hostMode: document.body.dataset.tournamentMode === "host" },
});
