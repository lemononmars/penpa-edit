import { mount } from 'svelte';
import GeometrySolverApp from './GeometrySolverApp.svelte';
const target=document.getElementById('geometry-app')!;
mount(GeometrySolverApp,{target,props:{kind:target.dataset.kind as 'star'|'hex'|'isodoku'|'parquet'}});
