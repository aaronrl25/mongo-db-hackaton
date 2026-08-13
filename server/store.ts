import { MongoClient, ObjectId } from 'mongodb';
import type { Memory, Message, Preference } from './types.ts';

const now = new Date().toISOString();
const seedPreferences: Preference[] = [
  { id:'p1', category:'Stack', label:'Primary language', value:'TypeScript', confidence:.98, scope:'global', source:'explicit', evidence:'“Use TypeScript for everything unless I say otherwise.”', updatedAt:now },
  { id:'p2', category:'Frameworks', label:'Mobile framework', value:'Expo + React Native', confidence:.94, scope:'global', source:'inferred', evidence:'Selected Expo in 8 of 9 mobile projects.', updatedAt:now },
  { id:'p3', category:'Architecture', label:'Project structure', value:'Feature-based architecture', confidence:.91, scope:'global', source:'explicit', evidence:'“Keep screens, hooks, and tests grouped by feature.”', updatedAt:now },
  { id:'p4', category:'State', label:'State management', value:'Zustand', confidence:.89, scope:'project', projectId:'orbit', source:'explicit', evidence:'“Use Zustand for Orbit; keep server state separate.”', updatedAt:now },
  { id:'p5', category:'Responses', label:'Response style', value:'Code first, concise explanation', confidence:.96, scope:'global', source:'inferred', evidence:'Consistently asks to shorten explanations after code.', updatedAt:now },
  { id:'p6', category:'Refactoring', label:'Change budget', value:'Moderate — refactor touched modules only', confidence:.86, scope:'global', source:'explicit', evidence:'“Clean up nearby code, but don’t redesign unrelated modules.”', updatedAt:now },
];
let preferences = [...seedPreferences];
let memories: Memory[] = [
  { id:'m1', projectId:'orbit', kind:'decision', text:'Use Firebase Auth with email link and Google sign-in.', createdAt:now },
  { id:'m2', projectId:'orbit', kind:'pattern', text:'All API errors flow through a typed Result<T> boundary.', createdAt:now },
  { id:'m3', projectId:'orbit', kind:'constraint', text:'The app must remain compatible with Expo Go.', createdAt:now },
];
let messages: Message[] = [
  { id:'c1', role:'user', content:'Build the profile settings flow for Orbit.', createdAt:now },
  { id:'c2', role:'assistant', content:'Based on your coding personality, I’ll use Expo, TypeScript, Expo Router, Zustand, Firebase, feature-based architecture, and include tests.', createdAt:now, preferences:['p1','p2','p3','p4'] },
];

class Store {
  client?: MongoClient;
  connected = false;
  dbName = process.env.MONGODB_DB || 'devpersona';
  async connect() {
    if (!process.env.MONGODB_URI) return false;
    const client = new MongoClient(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 7000 });
    try {
      await client.connect();
      await client.db(this.dbName).command({ ping: 1 });
      this.client = client;
      this.connected = true;
      await client.db(this.dbName).collection('users').createIndex({email:1},{unique:true});
      return true;
    } catch (error) {
      this.connected = false;
      this.client = undefined;
      await client.close().catch(() => undefined);
      throw error;
    }
  }
  get db() { return this.connected && this.client ? this.client.db(this.dbName) : undefined; }
  async listPreferences() { return this.db ? (await this.db.collection<Preference>('preferences').find().sort({updatedAt:-1}).toArray()).map(x=>({...x,id:String(x._id||x.id)})) : preferences; }
  async addPreference(p: Omit<Preference,'id'|'updatedAt'>) { const item={...p,id:new ObjectId().toString(),updatedAt:new Date().toISOString()}; if(this.db) await this.db.collection('preferences').insertOne(item); else preferences.unshift(item); return item; }
  async deletePreference(id:string) { if(this.db) await this.db.collection('preferences').deleteOne({$or:[{_id:ObjectId.isValid(id)?new ObjectId(id):undefined},{id}]}); else preferences=preferences.filter(p=>p.id!==id); }
  async listMemories(projectId='orbit') { return this.db ? (await this.db.collection<Memory>('memories').find({projectId}).sort({createdAt:-1}).toArray()).map(x=>({...x,id:String(x._id||x.id)})) : memories.filter(m=>m.projectId===projectId); }
  async addMemory(m:Omit<Memory,'id'|'createdAt'> & {embedding?:number[]}) { const item={...m,id:new ObjectId().toString(),createdAt:new Date().toISOString()}; if(this.db) await this.db.collection('memories').insertOne(item); else memories.unshift(item); return item; }
  async listMessages() { return messages; }
  async addMessage(m:Message) { messages.push(m); if(this.db) await this.db.collection('messages').insertOne(m); return m; }
  async vectorSearch(queryEmbedding:number[], projectId:string) {
    if(!this.db) return this.listMemories(projectId);
    try { return await this.db.collection('memories').aggregate<Memory>([
      {$vectorSearch:{index:'devpersona_vector_index',path:'embedding',queryVector:queryEmbedding,numCandidates:100,limit:8}},
      {$match:{$or:[{projectId},{projectId:'global'}]}}, {$project:{embedding:0,score:{$meta:'vectorSearchScore'}}}
    ]).toArray(); } catch { return this.listMemories(projectId); }
  }
}
export const store = new Store();
