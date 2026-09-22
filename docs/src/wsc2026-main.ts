import { mount } from 'svelte';
import Wsc2026App from './Wsc2026App.svelte';
const query=new URLSearchParams(location.search);
if(query.get('tab')==='solver'&&query.get('variant')==='star')location.replace('/solver/star/');
else mount(Wsc2026App,{target:document.getElementById('wsc-app')!});
