const AUTH_URL='https://ep-mute-forest-bbxkar8p.neonauth.c-15.us-east-1.aws.neon.tech/neondb/auth';
export default async function handler(req,res){
 const path=String(req.url||'').replace(/^\/api\/auth/, '')||'/';
 if(path.includes('..'))return res.status(400).end();
 try{
  const headers=new Headers();
  for(const key of ['content-type','cookie','origin','user-agent','accept'])if(req.headers[key])headers.set(key,req.headers[key]);
  const init={method:req.method,headers,redirect:'manual'};
  if(!['GET','HEAD'].includes(req.method))init.body=typeof req.body==='string'?req.body:JSON.stringify(req.body??{});
  const upstream=await fetch(AUTH_URL+'/api/auth'+path,init);
  const body=await upstream.arrayBuffer();
  res.status(upstream.status);
  for(const key of ['content-type','cache-control','location']){const value=upstream.headers.get(key);if(value)res.setHeader(key,value);}const cookies=typeof upstream.headers.getSetCookie==='function'?upstream.headers.getSetCookie():[];if(cookies.length)res.setHeader('Set-Cookie',cookies);else{const cookie=upstream.headers.get('set-cookie');if(cookie)res.setHeader('Set-Cookie',cookie);}
  res.setHeader('Cache-Control','no-store');
  return res.send(Buffer.from(body));
 }catch(error){console.error('Neon Auth proxy failed',error?.message);return res.status(502).json({error:'Authentication service unavailable'});}
}
