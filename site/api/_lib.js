import { neon } from '@neondatabase/serverless';
const AUTH_URL = 'https://ep-mute-forest-bbxkar8p.neonauth.c-15.us-east-1.aws.neon.tech/neondb/auth';
export function db(){ if(!process.env.NEON_DATABASE_URL) throw new Error('Database is not configured'); return neon(process.env.NEON_DATABASE_URL); }
export function json(res,status,body){res.setHeader('Cache-Control','no-store');res.setHeader('Content-Type','application/json; charset=utf-8');return res.status(status).json(body);}
export async function readBody(req){if(req.body&&typeof req.body==='object')return req.body;if(typeof req.body==='string'){try{return JSON.parse(req.body)}catch{return null}}return null;}
export async function requireAdmin(req,res){
 const cookie=req.headers.cookie||'';
 if(!cookie){json(res,401,{error:'Authentication required'});return null;}
 try{
  const response=await fetch(AUTH_URL+'/get-session',{headers:{cookie,origin:'https://www.moustapha.shop'},cache:'no-store'});
  if(!response.ok){json(res,401,{error:'Session expired'});return null;}
  const data=await response.json(),userId=data?.user?.id;
  if(!userId){json(res,401,{error:'Authentication required'});return null;}
  const rows=await db().query('SELECT user_id FROM public.admin_users WHERE user_id=$1::uuid LIMIT 1',[userId]);
  if(!rows.length){json(res,403,{error:'Administrator access required'});return null;}
  return data.user;
 }catch(e){console.error('Admin auth check failed',e?.message);json(res,503,{error:'Authentication service unavailable'});return null;}
}
export function methodNotAllowed(res,methods){res.setHeader('Allow',methods.join(', '));return json(res,405,{error:'Method not allowed'});}
