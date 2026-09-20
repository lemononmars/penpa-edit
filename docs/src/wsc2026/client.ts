import { supabase } from '../battle/supabase';
export { safeUrl, playerUrl } from './url.mjs';
export const SESSION_KEY = 'wsc2026-device-key';
export async function request(action: string, token: string, payload: object = {}) {
 const password=localStorage.getItem('wsc2026-password');
 if(password!=='กู้ชาติ') throw new Error('Enter the WSC password to continue.');
 if (!supabase) throw new Error('Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
 const { data, error } = await supabase.rpc('wsc2026_api', { p_action: action, p_token: token, p_payload: {...payload,password} });
 if (error) throw new Error(error.code === 'PGRST202' ? 'Apply the WSC2026 Supabase migration to enable shared practice.' : error.message);
 return data;
}
export function duration(seconds: number) { return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2,'0')}`; }
export function parseTime(value: string) {
 const match = /^(\d{1,4}):([0-5]\d)$/.exec(value.trim());
 if (!match) throw new Error('Enter time as minutes:seconds, for example 12:34.');
 const seconds = Number(match[1])*60 + Number(match[2]);
 if (seconds < 1 || seconds > 86400) throw new Error('Time must be between 0:01 and 1440:00.');
 return seconds;
}
export async function readImage(file: File | undefined) {
 if (!file) return '';
 if (!['image/png','image/jpeg','image/webp'].includes(file.type) || file.size>3*1024*1024) throw new Error('Use a PNG, JPEG or WebP up to 3 MB.');
 return await new Promise<string>((resolve,reject)=> { const r=new FileReader(); r.onload=()=>resolve(String(r.result)); r.onerror=()=>reject(new Error('Could not read image.')); r.readAsDataURL(file); });
}
