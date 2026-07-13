import { mount } from "svelte";
import App from "./App.svelte";

const legacyMode = new URLSearchParams(window.location.search).get("penpa") === "legacy";

if (!legacyMode) {
    document.documentElement.classList.add("svelte-home");
    mount(App, { target: document.getElementById("svelte-app")! });
    window.requestAnimationFrame(() => {
        document.documentElement.classList.add("svelte-mounted");
    });
}
