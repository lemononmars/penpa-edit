import { mount } from "svelte";
import AuthApp from "./AuthApp.svelte";

const target = document.getElementById("auth-app")!;
mount(AuthApp, { target, props: { mode: (document.body.dataset.authMode || "login") as "login" | "register" | "reset" } });
