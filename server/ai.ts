import OpenAI from 'openai';
import type { Memory, Preference } from './types.ts';

const client = process.env.OPENAI_API_KEY ? new OpenAI({apiKey:process.env.OPENAI_API_KEY}) : null;
export async function embed(text:string) { if(!client) return []; const r=await client.embeddings.create({model:'text-embedding-3-small',input:text}); return r.data[0].embedding; }
export function resolvePreferences(all:Preference[], projectId:string, instructions:string) {
  const global=all.filter(p=>p.scope==='global'); const project=all.filter(p=>p.scope==='project'&&p.projectId===projectId);
  const map=new Map(global.map(p=>[p.label,p])); project.forEach(p=>map.set(p.label,p));
  return {resolved:[...map.values()].sort((a,b)=>b.confidence-a.confidence),instructions};
}
export async function respond(prompt:string, prefs:Preference[], memories:Memory[], instructions:string) {
  if(!client) return `Based on your coding personality, I’ll use ${prefs.slice(0,6).map(p=>p.value).join(', ')}, and include tests.\n\nI’ve scoped the work to “${prompt}” and will follow your current instruction first, then project preferences, then global defaults.`;
  const context=prefs.map(p=>`- ${p.label}: ${p.value} (${p.scope}, confidence ${p.confidence})`).join('\n');
  const memory=memories.map(m=>`- ${m.text}`).join('\n');
  const r=await client.responses.create({model:process.env.OPENAI_MODEL||'gpt-4.1-mini',instructions:`You are DevPersona, a coding agent. Precedence: CURRENT INSTRUCTIONS > PROJECT PREFERENCES > GLOBAL PREFERENCES. Be transparent about applied preferences.\nCurrent instructions: ${instructions||'none'}\nResolved preferences:\n${context}\nRelevant memory:\n${memory}`,input:prompt});
  return r.output_text;
}
export async function extractPreferences(text:string) {
  if(!client) return [];
  const r=await client.responses.create({model:process.env.OPENAI_MODEL||'gpt-4.1-mini',input:`Extract durable developer preferences from this message. Return JSON array with category,label,value,confidence (0..1), scope (global|project), source (explicit|inferred), evidence. Only include genuinely supported preferences. Message: ${text}`,text:{format:{type:'json_schema',name:'preferences',strict:true,schema:{type:'object',properties:{preferences:{type:'array',items:{type:'object',properties:{category:{type:'string'},label:{type:'string'},value:{type:'string'},confidence:{type:'number'},scope:{type:'string',enum:['global','project']},source:{type:'string',enum:['explicit','inferred']},evidence:{type:'string'}},required:['category','label','value','confidence','scope','source','evidence'],additionalProperties:false}}},required:['preferences'],additionalProperties:false}}}});
  try{return JSON.parse(r.output_text).preferences||[];}catch{return [];}
}
