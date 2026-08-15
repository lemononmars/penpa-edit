import { mount } from "svelte";
import App from "./App.svelte";
import BattleApp from "./BattleApp.svelte";

const isBattleDomain = (location.hostname.includes("sudokubattle") || location.hostname.includes("sudoku-battle")) && !location.search.includes("embed=1");

if (isBattleDomain) {
    document.title = "Sudoku Battle";
    document.documentElement.classList.remove("svelte-home");
    document.body.innerHTML = '<div id="battle-app"></div>';
    mount(BattleApp, { target: document.getElementById("battle-app")! });
} else {
    document.documentElement.classList.add("svelte-home");
    mount(App, { target: document.getElementById("svelte-app")! });
    window.requestAnimationFrame(() => {
        document.documentElement.classList.add("svelte-mounted");
    });
}
