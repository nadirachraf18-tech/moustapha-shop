import {json,requireAdmin,methodNotAllowed} from './_lib.js';
export default async function handler(req,res){
 if(req.method!=='GET')return methodNotAllowed(res,['GET']);
 const user=await requireAdmin(req,res);
 if(!user)return;
 return json(res,200,{user:{id:user.id,email:user.email,name:user.name||null},role:'admin'});
}
