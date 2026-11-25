import {db,json,requireAdmin,methodNotAllowed} from './_lib.js';
export default async function handler(req,res){
 if(req.method!=='GET')return methodNotAllowed(res,['GET']);
 if(!await requireAdmin(req,res))return;
 try{
  const orderId=String(req.query?.order_id||'');
  const ids=String(req.query?.ids||'').split(',').filter(Boolean).slice(0,1000);
  const productIds=String(req.query?.product_ids||'').split(',').filter(Boolean).slice(0,500);
  const sql=db();
  if(orderId){const rows=await sql`SELECT * FROM public.order_items WHERE order_id=${orderId}::uuid ORDER BY created_at`;return json(res,200,rows);}
  if(ids.length){const rows=await sql.query('SELECT * FROM public.order_items WHERE order_id = ANY($1::uuid[]) ORDER BY created_at',[ids]);return json(res,200,rows);}
  if(productIds.length){const rows=await sql.query('SELECT id,images,colors,color_images FROM public.products WHERE id = ANY($1::uuid[])',[productIds]);return json(res,200,rows);}
  return json(res,200,await sql`SELECT * FROM public.order_items ORDER BY created_at DESC LIMIT 1000`);
 }catch(e){console.error('Order items API error',e?.message);return json(res,500,{error:'Order items request failed'});}
}