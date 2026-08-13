import 'dotenv/config';
import express from 'express'; import cors from 'cors'; import path from 'node:path'; import { fileURLToPath } from 'node:url';
import { store } from './store.ts'; import { embed, extractPreferences, resolvePreferences, respond } from './ai.ts';
const app=express(); app.use(cors()); app.use(express.json({limit:'2mb'}));
let mongoConnected=false; store.connect().then(v=>mongoConnected=v).catch(e=>console.warn('Mongo unavailable, using demo store:',e.message));
app.get('/api/status',(_q,r)=>r.json({mongo:mongoConnected,openai:!!process.env.OPENAI_API_KEY,elevenlabs:!!(process.env.ELEVENLABS_API_KEY&&process.env.ELEVENLABS_AGENT_ID)}));
app.get('/api/preferences',async(_q,r)=>r.json(await store.listPreferences()));
app.post('/api/preferences',async(q,r)=>r.status(201).json(await store.addPreference(q.body)));
app.delete('/api/preferences/:id',async(q,r)=>{await store.deletePreference(q.params.id);r.status(204).end()});
app.get('/api/memories',async(q,r)=>r.json(await store.listMemories(String(q.query.projectId||'orbit'))));
app.post('/api/memories',async(q,r)=>{const embedding=await embed(q.body.text);r.status(201).json(await store.addMemory({...q.body,embedding}))});
app.get('/api/messages',async(_q,r)=>r.json(await store.listMessages()));
app.post('/api/chat',async(q,r)=>{try{const {prompt,projectId='orbit',instructions=''}=q.body;const all=await store.listPreferences();const {resolved}=resolvePreferences(all,projectId,instructions);const embedding=await embed(prompt);const memory=await store.vectorSearch(embedding,projectId);const content=await respond(prompt,resolved,memory,instructions);const user={id:crypto.randomUUID(),role:'user' as const,content:prompt,createdAt:new Date().toISOString()};const assistant={id:crypto.randomUUID(),role:'assistant' as const,content,createdAt:new Date().toISOString(),preferences:resolved.map(p=>p.id)};await store.addMessage(user);await store.addMessage(assistant);const extracted=await extractPreferences(prompt);for(const p of extracted) await store.addPreference({...p,projectId:p.scope==='project'?projectId:undefined});r.json({message:assistant,applied:resolved,memories:memory});}catch(e){r.status(500).json({error:e instanceof Error?e.message:'Chat failed'})}});
app.get('/api/voice/session',(_q,r)=>{if(!process.env.ELEVENLABS_AGENT_ID)return r.json({demo:true,agentId:null});r.json({demo:false,agentId:process.env.ELEVENLABS_AGENT_ID})});
if(process.env.NODE_ENV==='production'){const here=path.dirname(fileURLToPath(import.meta.url));const dist=path.resolve(here,'../dist');app.use(express.static(dist));app.use((_q,r)=>r.sendFile(path.join(dist,'index.html')))}
app.listen(Number(process.env.PORT||8787),()=>console.log(`DevPersona API on http://localhost:${process.env.PORT||8787}`));
