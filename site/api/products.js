import { db, json, readBody, requireAdmin, methodNotAllowed } from './_lib.js';
export default async function handler(req,res){
 try{
  const sql=db();
  if(req.method==='GET'){if(req.query?.admin==='1'){if(!await requireAdmin(req,res))return;return json(res,200,await sql`SELECT * FROM public.products ORDER BY created_at DESC`);}return json(res,200,await sql`SELECT * FROM public.products WHERE is_active=true AND is_demo=false ORDER BY created_at DESC`);}
  const admin=await requireAdmin(req,res);if(!admin)return;
  if(req.method==='POST'){
   const b=await readBody(req);if(!b||!String(b.name||'').trim()||!(Number(b.price)>=0))return json(res,400,{error:'Invalid product data'});
   const rows=await sql.query('INSERT INTO public.products(name,description,price,old_price,category_id,stock,images,video_url,colors,sizes,variant_stock,videos,color_images,is_active,is_new,is_featured) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11::jsonb,$12,$13::jsonb,$14,$15,$16) RETURNING *',[String(b.name).trim(),b.description||'',Number(b.price),b.old_price??null,b.category_id||null,Number(b.stock||0),b.images||[],b.video_url||null,b.colors||[],b.sizes||[],JSON.stringify(b.variant_stock||{}),b.videos||[],JSON.stringify(b.color_images||{}),b.is_active!==false,!!b.is_new,!!b.is_featured]);
   return json(res,201,rows[0]);
  }
  if(req.method==='PATCH'){
   const b=await readBody(req);if(!b?.id)return json(res,400,{error:'Product id required'});
   const allowed=['name','description','price','old_price','category_id','stock','images','video_url','colors','sizes','variant_stock','videos','color_images','is_active','is_new','is_featured'];
   const keys=Object.keys(b).filter(k=>allowed.includes(k));if(!keys.length)return json(res,400,{error:'No supported fields'});
   const vals=keys.map(k=>k==='variant_stock'||k==='color_images'?JSON.stringify(b[k]??{}):b[k]);const sets=keys.map((k,i)=>k+'=$'+(i+1)+(k==='variant_stock'||k==='color_images'?'::jsonb':''));
   vals.push(b.id);const rows=await sql.query('UPDATE public.products SET '+sets.join(',')+',updated_at=now() WHERE id=$'+vals.length+'::uuid RETURNING *',vals);
   return rows.length?json(res,200,rows[0]):json(res,404,{error:'Product not found'});
  }
  if(req.method==='DELETE'){
   const id=String(req.query?.id||'');if(!id)return json(res,400,{error:'Product id required'});
   const rows=await sql`DELETE FROM public.products WHERE id=${id}::uuid RETURNING id`;return rows.length?json(res,200,{deleted:true}):json(res,404,{error:'Product not found'});
  }
  return methodNotAllowed(res,['GET','POST','PATCH','DELETE']);
 }catch(e){console.error('Products API error',e?.message);return json(res,500,{error:'Products request failed'});}
}
