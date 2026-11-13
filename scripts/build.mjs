import {build} from 'esbuild';
await build({entryPoints:['src/entry.tsx'],bundle:true,minify:true,jsx:'automatic',format:'iife',platform:'browser',target:'es2022',define:{'process.env.NODE_ENV':'"production"'},legalComments:'none',outfile:'public/app.js'});
console.log('Built travel plans; Urumqi remains synced at runtime.');
