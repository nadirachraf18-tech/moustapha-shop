import {db,json,readBody,requireAdmin,methodNotAllowed} from './_lib.js';
export default async function handler(req,res){
 try{const sql=db();
 if(req.method==='GET'){if(req.query?.admin==='1'){if(!await requireAdmin(req,res))return;return json(res,200,await sql`SELECT * FROM public.categories ORDER BY sort_order,name`);}return json(res,200,await sql`SELECT * FROM public.categories WHERE is_active=true ORDER BY sort_order,name`);}
 if(!await requireAdmin(req,res))return;
 if(req.method==='POST'||req.method==='PATCH'){const b=await readBody(req);if(!b||!String(b.name||'').trim())return json(res,400,{error:'Category name required'});
 const rows=req.method==='POST'?await sql`INSERT INTO public.categories(name,sort_order,is_active) VALUES(${String(b.name).trim()},${Number(b.sort_order||0)},true) RETURNING *`:await sql`UPDATE public.categories SET name=${String(b.name).trim()},sort_order=${Number(b.sort_order||0)},is_active=${b.is_active!==false} WHERE id=${b.id}::uuid RETURNING *`;
 return rows.length?json(res,req.method==='POST'?201:200,rows[0]):json(res,404,{error:'Category not found'});}
 if(req.method==='DELETE'){const id=String(req.query?.id||'');const rows=await sql`DELETE FROM public.categories WHERE id=${id}::uuid RETURNING id`;return rows.length?json(res,200,{deleted:true}):json(res,404,{error:'Category not found'});}
 return methodNotAllowed(res,['GET','POST','PATCH','DELETE']);
 }catch(e){console.error('Categories API error',e?.message);return json(res,500,{error:'Categories request failed'});}
}