import { mount } from "svelte";
import VariantCatalogApp from "./VariantCatalogApp.svelte";

const page = (document.body.dataset.catalogPage === "detail" || new URLSearchParams(window.location.search).has("id")) ? "detail" : "variants";

mount(VariantCatalogApp, {
    target: document.getElementById("catalog-app")!,
    props: { page }
});
