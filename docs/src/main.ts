import { mount } from "svelte";
import App from "./App.svelte";

document.documentElement.classList.add("svelte-home");
mount(App, { target: document.getElementById("svelte-app")! });
window.requestAnimationFrame(() => {
    document.documentElement.classList.add("svelte-mounted");
});
