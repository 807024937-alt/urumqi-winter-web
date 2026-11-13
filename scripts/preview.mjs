import {createServer} from 'node:http';
import {createHandler} from '../server.mjs';
// Preview reads only the already public sharing endpoint. No upstream credential is embedded.
const handler=createHandler({origin:'https://urumqi-winter-web.onrender.com',token:'public-preview',manageUrl:'https://urumqi-winter-chen-2026.petiteflag9.chatgpt.site'});
const portIndex=process.argv.indexOf('--port');
const port=Number(process.env.PORT||(portIndex>=0?process.argv[portIndex+1]:3000));
createServer(handler).listen(port,'0.0.0.0',()=>console.log('Travel preview ready'));
