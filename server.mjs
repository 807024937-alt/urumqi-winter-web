import {createServer} from 'node:http';
import {readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';

const directory=fileURLToPath(new URL('./public/',import.meta.url));
const assets=new Map([['/',['index.html','text/html; charset=utf-8']],['/index.html',['index.html','text/html; charset=utf-8']],['/app.js',['app.js','text/javascript; charset=utf-8']],['/style.css',['style.css','text/css; charset=utf-8']],['/wenzhou-map.html',['wenzhou-map.html','text/html; charset=utf-8']],['/wenzhou-map.css',['wenzhou-map.css','text/css; charset=utf-8']],['/wenzhou-map.js',['wenzhou-map.js','text/javascript; charset=utf-8']],['/vendor-d3.js',['vendor-d3.js','text/javascript; charset=utf-8']]]);
const common={'X-Content-Type-Options':'nosniff','X-Frame-Options':'DENY','Referrer-Policy':'no-referrer','X-Robots-Tag':'noindex, nofollow','Content-Security-Policy':"default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self'; object-src 'none'; frame-ancestors 'none'; base-uri 'none'",'Permissions-Policy':'camera=(), microphone=(), geolocation=()'};
function json(res,status,value){res.writeHead(status,{...common,'Cache-Control':'no-store','Content-Type':'application/json; charset=utf-8'});res.end(JSON.stringify(value));}
function validateSource(origin){const u=new URL(origin);if(u.protocol!=='https:'||u.username||u.password||u.search||u.hash||u.pathname!=='/')throw Error('SOURCE_ORIGIN must be an HTTPS origin without credentials or path');return u.origin;}
function publicRecord(raw){if(!raw||!raw.data?.trip||!Number.isInteger(raw.revision))throw Error('Invalid planner response');for(const key of ['days','flights','stays','transport','budget','tasks','facts','cold'])if(!Array.isArray(raw.data[key]))throw Error('Invalid planner response');return {data:raw.data,revision:raw.revision,history:Array.isArray(raw.history)?raw.history.map(h=>({id:String(h.id),at:String(h.at),summary:String(h.summary),revision:Number(h.revision)})):[]};}
export function createHandler({origin,token,manageUrl,fetcher=fetch,now=Date.now}={}){
 let source;try{source=validateSource(origin);if(!token)throw Error('Missing credential');}catch{source=undefined}
 const manage=(()=>{try{const u=new URL(manageUrl||origin);return u.protocol==='https:'&&!u.username&&!u.password?u.href:undefined}catch{return undefined}})();
 let cache,pending;
 async function refresh(){
  if(pending)return pending;
  pending=(async()=>{const r=await fetcher(source+'/api/planner',{method:'GET',headers:{'OAI-Sites-Authorization':'Bearer '+token,'Accept':'application/json'},redirect:'error',signal:AbortSignal.timeout(10000)});if(!r.ok)throw Error('Upstream unavailable');const body=await r.text();if(body.length>2000000)throw Error('Planner response too large');const value=publicRecord(JSON.parse(body));cache={value,at:now()};return cache;})().finally(()=>{pending=undefined});
  return pending;
 }
 return async function handler(req,res){
  let pathname;try{pathname=new URL(req.url,'http://local').pathname}catch{return json(res,400,{error:'无效请求'})}
  if(!['GET','HEAD'].includes(req.method)){res.setHeader('Allow','GET, HEAD');return json(res,405,{error:'这是只读分享页，请在原管理页编辑。'})}
  if(pathname==='/healthz')return json(res,source?200:503,{status:source?'ready':'configuration_required'});
  if(pathname==='/robots.txt'){res.writeHead(200,{...common,'Content-Type':'text/plain'});return res.end('User-agent: *\nDisallow: /\n')}
  if(pathname==='/api/planner'){
   if(!source)return json(res,503,{error:'分享服务尚未完成配置，请稍后再试。'});
   try{let entry=cache,stale=false;if(!entry||now()-entry.at>=10000){try{entry=await refresh()}catch{if(!cache||now()-cache.at>86400000)throw Error('No recent cache');entry=cache;stale=true;}}
    return json(res,200,{...entry.value,meta:{readOnly:true,stale,fetchedAt:new Date(entry.at).toISOString(),manageUrl:manage}});
   }catch{return json(res,503,{error:'暂时无法读取行程，请稍后刷新。'})}
  }
  const asset=assets.get(pathname);if(!asset)return json(res,404,{error:'页面不存在'});
  try{const bytes=await readFile(directory+asset[0]);const headers={...common,'Content-Type':asset[1],'Cache-Control':'no-cache'};if(pathname==='/wenzhou-map.html'){headers['X-Frame-Options']='SAMEORIGIN';headers['Content-Security-Policy']=common['Content-Security-Policy'].replace("frame-ancestors 'none'","frame-ancestors 'self'");}res.writeHead(200,headers);res.end(req.method==='HEAD'?undefined:bytes);}catch{return json(res,503,{error:'页面正在更新，请稍后再试。'})}
 };
}
if(process.argv[1]&&fileURLToPath(import.meta.url)===process.argv[1]){
 const server=createServer(createHandler({origin:process.env.SOURCE_ORIGIN,token:process.env.SOURCE_READ_TOKEN,manageUrl:process.env.MANAGE_URL}));
 server.listen(Number(process.env.PORT)||10000,'0.0.0.0',()=>console.log('Travel sharing service ready'));
 process.on('SIGTERM',()=>{server.close(()=>process.exit(0));setTimeout(()=>process.exit(1),20000).unref()});
}
