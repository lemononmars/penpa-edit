import { next } from '@vercel/functions';
import { wscAccess } from './scripts/wsc-access.mjs';

export const config = { matcher: ['/wsc2026/:path*'] };
export default async function middleware(request: Request) {
 const response=await wscAccess(request);
 if(response)return response;
 return next({headers:{'Cache-Control':'private, no-store'}});
}
