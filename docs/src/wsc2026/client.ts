import { supabase } from '../battle/supabase';
export { safeUrl, playerUrl } from './url.mjs';
export async function loadPracticeLinks() {
 const password=localStorage.getItem('wsc2026-password');
 if (!supabase) return [];
 const {data,error}=await supabase.rpc('wsc2026_api',{p_action:'links',p_token:null,p_payload:{password}});
 if(error)throw new Error(error.message);
 return data?.puzzles||[];
}
