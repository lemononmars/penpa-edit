import { mount } from "svelte";
import VariantCatalogApp from "./VariantCatalogApp.svelte";

const page = document.body.dataset.catalogPage === "marks" ? "marks" :
    document.body.dataset.catalogPage === "detail" ? "detail" : "variants";

mount(VariantCatalogApp, {
    target: document.getElementById("catalog-app")!,
    props: { page }
});
