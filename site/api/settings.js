import {db,json,readBody,requireAdmin,methodNotAllowed} from './_lib.js';
export default async function handler(req,res){
 try{const sql=db();
 if(req.method==='GET'){const rows=await sql`SELECT key,value FROM public.site_settings ORDER BY key`;return json(res,200,Object.fromEntries(rows.map(r=>[r.key,r.value])));}
 if(!await requireAdmin(req,res))return;
 if(req.method==='PUT'){const b=await readBody(req);if(!b||typeof b!=='object'||Array.isArray(b))return json(res,400,{error:'Settings object required'});const entries=Object.entries(b).slice(0,100);
 for(const [key,value] of entries)await sql`INSERT INTO public.site_settings(key,value) VALUES(${String(key)},${String(value??'')}) ON CONFLICT(key) DO UPDATE SET value=EXCLUDED.value`;
 return json(res,200,{saved:entries.length});}
 return methodNotAllowed(res,['GET','PUT']);
 }catch(e){console.error('Settings API error',e?.message);return json(res,500,{error:'Settings request failed'});}
}