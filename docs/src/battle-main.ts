import { mount } from "svelte";
import BattleApp from "./BattleApp.svelte";

mount(BattleApp, { target: document.getElementById("battle-app")! });

if ("serviceWorker" in navigator) {
  navigator.serviceWorker
    .register("/battle/sw.js", { scope: "/battle/" })
    .catch(() => {});
}
