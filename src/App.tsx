import { useEffect, useMemo, useRef, useState } from "react";
import {
  Activity,
  Archive,
  ArrowRight,
  ArrowUp,
  AudioLines,
  BookOpen,
  BrainCircuit,
  ChevronDown,
  Check,
  Code2,
  Database,
  Download,
  FolderGit2,
  Gauge,
  GitPullRequest,
  HeartPulse,
  History,
  LayoutDashboard,
  LockKeyhole,
  Mic,
  MoreHorizontal,
  Palette,
  PawPrint,
  Plus,
  Search,
  SlidersHorizontal,
  Settings2,
  ShieldCheck,
  Server,
  CalendarDays,
  PackageCheck,
  Terminal,
  Sparkles,
  ChartNoAxesCombined,
  Trash2,
  UserRound,
  Volume2,
  Copy,
  X,
} from "lucide-react";
import { api, type Memory, type Message, type Preference } from "./api";
import { Mascot } from "./Mascot";
import {
  useConversationControls,
  useConversationStatus,
} from "@elevenlabs/react";

type Page = "Overview" | "Workspace" | "Creator" | "Voice Creator" | "Personality" | "Memory" | "History" | "Privacy";
type AgentId = "frontend" | "backend" | "data" | "animal";
const agents = [
  {id:"frontend" as const,name:"Frontend Artist",tag:"UI & EXPERIENCE",icon:Palette,color:"lime",description:"Crafts polished interfaces, design systems, responsive layouts, and delightful interactions.",skills:["React","TypeScript","Motion","Accessibility"]},
  {id:"backend" as const,name:"Backend Architect",tag:"SYSTEMS & APIS",icon:Server,color:"purple",description:"Designs reliable APIs, services, authentication, databases, and production infrastructure.",skills:["Node.js","Express","MongoDB","Security"]},
  {id:"data" as const,name:"Data Specialist",tag:"DATA & INTELLIGENCE",icon:ChartNoAxesCombined,color:"blue",description:"Builds data models, analytics, vector search, pipelines, and AI retrieval systems.",skills:["Atlas","Vector Search","Analytics","AI"]},
  {id:"animal" as const,name:"Animal Management",tag:"CARE & OPERATIONS",icon:PawPrint,color:"orange",description:"Builds workflows for animal records, care schedules, inventory, teams, and reporting.",skills:["Care records","Scheduling","Inventory","Reports"]},
];
const nav = [
  ["Overview", LayoutDashboard],
  ["Workspace", AudioLines],
  ["Creator", SlidersHorizontal],
  ["Voice Creator", Volume2],
  ["Personality", BrainCircuit],
  ["Memory", FolderGit2],
  ["History", History],
  ["Privacy", ShieldCheck],
] as const;
const demoStatus = { mongo: false, openai: false, claude: false, elevenlabs: false };

type Screen = "boot" | "landing" | "login" | "app";

export default function App() {
  const [screen, setScreen] = useState<Screen>("boot");
  useEffect(() => { api.auth.me().then(() => setScreen("app")).catch(() => setScreen("landing")) }, []);
  if (screen === "boot") return <div className="auth-boot"><BrainCircuit/><span>Restoring your workspace…</span></div>;
  if (screen === "landing") return <Landing onLogin={() => setScreen("login")} onStart={() => setScreen("login")} />;
  if (screen === "login") return <Login onBack={() => setScreen("landing")} onLogin={() => setScreen("app")} />;
  return <Dashboard onLogout={async () => { await api.auth.logout(); setScreen("landing") }} />;
}

function Dashboard({ onLogout }: { onLogout: () => void }) {
  const [agent,setAgent]=useState<AgentId|null>(()=>(sessionStorage.getItem('devpersona-agent') as AgentId|null));
  const [page, setPage] = useState<Page>("Overview"),
    [prefs, setPrefs] = useState<Preference[]>([]),
    [memories, setMemories] = useState<Memory[]>([]),
    [messages, setMessages] = useState<Message[]>([]),
    [status, setStatus] = useState(demoStatus),
    [loading, setLoading] = useState(true);
  const refresh = async () => {
    const [p, m, c, s] = await Promise.all([
      api.preferences(),
      api.memories(),
      api.messages(),
      api.status(),
    ]);
    setPrefs(p);
    setMemories(m);
    setMessages(c);
    setStatus(s);
    setLoading(false);
  };
  useEffect(() => {
    refresh().catch(() => setLoading(false));
  }, []);
  if(!agent)return <AgentSelector select={id=>{sessionStorage.setItem('devpersona-agent',id);setAgent(id)}} onLogout={onLogout}/>;
  const activeAgent=agents.find(a=>a.id===agent)!;
  return (
    <div className="shell">
      <Sidebar page={page} setPage={setPage} onLogout={onLogout} agent={activeAgent} switchAgent={()=>setAgent(null)} />
      <main>
        <Topbar page={page} status={status} />
        {loading ? (
          <div className="loader">
            <Mascot size={64} />
            <span>Loading your coding personality…</span>
          </div>
        ) : page === "Overview" ? (
          <AgentDashboard agent={activeAgent}/>
        ) : page === "Workspace" ? (
          <Workspace
            prefs={prefs}
            messages={messages}
            agent={activeAgent}
            onMessage={(m) => setMessages((x) => [...x, m])}
          />
        ) : page === "Creator" ? (
          <PersonalityCreator agent={activeAgent}/>
        ) : page === "Voice Creator" ? (
          <VoiceCreator agent={activeAgent}/>
        ) : page === "Personality" ? (
          <Personality prefs={prefs} setPrefs={setPrefs} />
        ) : page === "Memory" ? (
          <MemoryPage memories={memories} setMemories={setMemories} />
        ) : page === "History" ? (
          <HistoryPage messages={messages} />
        ) : (
          <Privacy />
        )}
      </main>
    </div>
  );
}

function AgentSelector({select,onLogout}:{select:(id:AgentId)=>void;onLogout:()=>void}){return <div className="agent-select"><div className="agent-select-top"><PublicBrand/><button onClick={onLogout}>Sign out</button></div><div className="agent-select-copy"><span className="eyebrow">CHOOSE YOUR SPECIALIST</span><h1>Who are you building with?</h1><p>Each agent brings a different craft. Your coding personality and project memory travel with you.</p></div><div className="agent-cards">{agents.map((a,i)=><button className={'agent-card '+a.color} onClick={()=>select(a.id)} key={a.id}><div className="agent-number">0{i+1}</div><div className="agent-card-icon"><a.icon/></div><small>{a.tag}</small><h2>{a.name}</h2><p>{a.description}</p><div className="agent-skills">{a.skills.map(s=><span key={s}>{s}</span>)}</div><div className="agent-enter">Select agent <ArrowRight/></div></button>)}</div><small className="agent-select-note"><ShieldCheck/> You can switch specialists at any time without losing context.</small></div>}

const dashboardData={
  frontend:{kicker:'DESIGN WORKBENCH',title:'Make the interface feel inevitable.',subtitle:'Shape the visual system, inspect component quality, and turn product intent into polished UI.',metrics:[['Components','48','12 need review'],['Accessibility','94%','AA target'],['Design tokens','36','Synced'],['Bundle','186 KB','−8% this week']],tasks:[['Profile settings','Responsive layout ready'],['Voice composer','Polish focus states'],['Empty states','Create illustration system']],activity:['Button variants aligned to tokens','Mobile navigation breakpoint fixed','Contrast audit completed']},
  backend:{kicker:'SYSTEM CONTROL ROOM',title:'Reliable systems, visible at a glance.',subtitle:'Watch services, design clean boundaries, and keep the product secure under load.',metrics:[['Services','6','All healthy'],['API latency','84 ms','p95'],['Test coverage','87%','+3%'],['Open issues','4','1 critical']],tasks:[['Auth hardening','Rotate session secrets'],['Chat API','Add streaming responses'],['Rate limits','Define provider budgets']],activity:['MongoDB user index created','Authentication middleware enabled','Provider fallback verified']},
  data:{kicker:'INTELLIGENCE STUDIO',title:'Turn project context into signal.',subtitle:'Explore memory quality, vector retrieval, preference confidence, and data freshness.',metrics:[['Memories','128','Indexed'],['Retrieval','92%','Precision@5'],['Preferences','24','18 confident'],['Pipelines','3','All current']],tasks:[['Vector index','Tune candidate count'],['Preference model','Review low-confidence signals'],['Evaluation set','Add architecture queries']],activity:['12 new embeddings stored','Project filter applied','Preference confidence recalculated']},
  animal:{kicker:'CARE OPERATIONS',title:'Every animal, cared for on time.',subtitle:'Coordinate health records, care schedules, supplies, and the people responsible.',metrics:[['Animals','42','All accounted'],['Care tasks','18','6 due today'],['Health alerts','3','Needs review'],['Inventory','91%','Stocked']],tasks:[['Morning rounds','6 animals remaining'],['Vaccinations','3 appointments today'],['Feed inventory','Reorder senior formula']],activity:['Luna health record updated','Kennel 4 care task completed','Medication reminder acknowledged']},
} as const;

function AgentDashboard({agent}:{agent:typeof agents[number]}){const data=dashboardData[agent.id];const Icon=agent.icon;return <div className={'agent-dashboard '+agent.color}><section className="agent-hero"><div><span className="eyebrow">{data.kicker}</span><h2>{data.title}</h2><p>{data.subtitle}</p><button><AudioLines/> Start a voice session</button></div><div className="hero-agent-icon"><Icon/></div></section><section className="agent-metrics">{data.metrics.map(([label,value,note])=><article key={label}><span>{label}</span><b>{value}</b><small>{note}</small></article>)}</section><div className="agent-dashboard-grid"><section className="focus-panel"><div className="dash-section-title"><div><span>TODAY'S FOCUS</span><h3>Recommended by {agent.name}</h3></div><Sparkles/></div>{data.tasks.map(([task,note],i)=><div className="focus-task" key={task}><b>0{i+1}</b><div><strong>{task}</strong><span>{note}</span></div><ArrowRight/></div>)}</section><section className="activity-panel"><div className="dash-section-title"><div><span>RECENT ACTIVITY</span><h3>Project pulse</h3></div><Activity/></div>{data.activity.map((item,i)=><div className="activity-item" key={item}><i/><div><b>{item}</b><span>{i===0?'Just now':`${i+1}h ago`}</span></div></div>)}</section></div><section className="agent-tool-row">{agent.id==='frontend'?<><Tool icon={Palette} title="Component gallery" text="Review 48 interface components"/><Tool icon={Gauge} title="Quality audit" text="Accessibility and performance"/><Tool icon={GitPullRequest} title="Visual changes" text="4 pull requests to review"/></>:agent.id==='backend'?<><Tool icon={Server} title="Service map" text="6 healthy services"/><Tool icon={ShieldCheck} title="Security review" text="Session and API policies"/><Tool icon={GitPullRequest} title="Deploy queue" text="3 changes ready"/></>:agent.id==='data'?<><Tool icon={Database} title="Atlas explorer" text="Inspect memories and vectors"/><Tool icon={ChartNoAxesCombined} title="Retrieval evaluation" text="Track relevance quality"/><Tool icon={BrainCircuit} title="Preference signals" text="Review learned behavior"/></>:<><Tool icon={HeartPulse} title="Health records" text="3 alerts need review"/><Tool icon={CalendarDays} title="Care schedule" text="18 tasks across the team"/><Tool icon={PackageCheck} title="Supply inventory" text="2 items running low"/></>}</section></div>}
function Tool({icon:Icon,title,text}:{icon:any;title:string;text:string}){return <button className="agent-tool"><Icon/><div><b>{title}</b><span>{text}</span></div><ArrowRight/></button>}

function PublicBrand() {
  return <div className="public-brand"><div className="mark"><Code2 size={19}/></div><b>DevPersona</b></div>;
}

function Landing({ onLogin, onStart }: { onLogin: () => void; onStart: () => void }) {
  return <div className="landing">
    <div className="landing-glow" />
    <nav className="public-nav"><PublicBrand/><div className="public-links"><a href="#how">How it works</a><a href="#personality">Personality</a><a href="#privacy">Privacy</a></div><div className="public-actions"><button onClick={onLogin}>Sign in</button><button className="landing-cta" onClick={onStart}>Start building <ArrowRight size={15}/></button></div></nav>
    <section className="hero"><div className="hero-pill"><Sparkles size={13}/> THE CODING AGENT THAT LEARNS YOU</div><h1>Your code.<br/><em>In your voice.</em></h1><p>DevPersona learns how you build—the stack you reach for, the patterns you trust, and how you like answers delivered. Then it codes with you, not at you.</p><div className="hero-actions"><button className="landing-cta big" onClick={onStart}>Meet your coding agent <ArrowRight size={17}/></button><button className="watch" onClick={onLogin}><span><Mic size={15}/></span> Try the voice workspace</button></div><div className="hero-proof"><span><Check/> No credit card</span><span><Check/> Works in demo mode</span><span><ShieldCheck/> Private by design</span></div></section>
    <section className="product-stage" id="how"><div className="stage-window"><div className="stage-top"><div><i/><i/><i/></div><span>devpersona / orbit-mobile</span><span className="stage-live"><i/> PERSONALITY ACTIVE</span></div><div className="stage-body"><div className="stage-sidebar"><PublicBrand/><span className="selected"><AudioLines/> Voice workspace</span><span><BrainCircuit/> Personality</span><span><FolderGit2/> Project memory</span><span><History/> History</span></div><div className="stage-chat"><small>YOU</small><p>Build the profile settings flow. Keep it in my usual style.</p><div className="stage-answer"><div className="mini-mark"><Code2/></div><div><small>DEVPERSONA</small><p>Based on your coding personality, I’ll use <b>Expo, TypeScript, Expo Router, Zustand, Firebase</b>, feature-based architecture, and include tests.</p><div className="code-preview"><span>features/profile/</span><code>├── screens/ProfileSettings.tsx<br/>├── store/profile.store.ts<br/>└── __tests__/profile.test.ts</code></div></div></div><div className="stage-composer"><span>Ask DevPersona to build, debug, or explain…</span><Mic/><ArrowUp/></div></div><div className="stage-persona"><div className="mini-orb"><AudioLines/></div><b>Voice ready</b><small>Personality signals</small>{['TypeScript 98%','Expo + RN 94%','Zustand 89%','Code first 96%'].map(x=><span>{x}</span>)}</div></div></div></section>
    <section className="landing-features" id="personality"><div className="feature-intro"><span className="eyebrow">A MEMORY THAT EARNS YOUR TRUST</span><h2>It gets more <em>you</em> every time.</h2><p>Every preference stays inspectable. See what was learned, why it was learned, and change it whenever you want.</p></div><div className="feature-grid"><article><BrainCircuit/><span>01</span><h3>Learns your coding DNA</h3><p>Languages, frameworks, architecture, testing style, response length, and refactoring boundaries.</p></article><article><Database/><span>02</span><h3>Remembers each project</h3><p>Atlas Vector Search retrieves the right decisions and conventions before every response.</p></article><article id="privacy"><ShieldCheck/><span>03</span><h3>You stay in control</h3><p>Confidence, sources, evidence, scope, retention, and deletion are always visible to you.</p></article></div></section>
    <section className="landing-final"><div className="final-orb"><AudioLines/></div><h2>Ready to meet the agent<br/>that codes like you?</h2><button className="landing-cta big" onClick={onStart}>Start building for free <ArrowRight/></button></section>
    <footer><PublicBrand/><span>© 2026 DevPersona</span><div><a>Privacy</a><a>Terms</a><a>GitHub</a></div></footer>
  </div>;
}

function Login({ onBack, onLogin }: { onBack: () => void; onLogin: () => void }) {
  const [email,setEmail]=useState(''),[password,setPassword]=useState(''),[name,setName]=useState(''),[show,setShow]=useState(false),[registering,setRegistering]=useState(false),[busy,setBusy]=useState(false),[error,setError]=useState('');
  const submit=async(e:React.FormEvent)=>{e.preventDefault();setBusy(true);setError('');try{registering?await api.auth.register(name,email,password):await api.auth.login(email,password);onLogin()}catch(e){setError(e instanceof Error?e.message:'Authentication failed')}finally{setBusy(false)}};
  return <div className="login-page"><div className="login-art"><button className="back-brand" onClick={onBack}><PublicBrand/></button><div className="login-quote"><div className="quote-orb"><AudioLines/></div><blockquote>“It remembers that I hate default exports, prefer Zustand, and want the code before the explanation.”</blockquote><p><b>Marcus Chen</b><span>Staff Engineer at Vercel</span></p></div><div className="login-grid"/></div><div className="login-panel"><div className="login-card"><div className="mobile-brand"><PublicBrand/></div><span className="eyebrow">{registering?'CREATE YOUR PERSONA':'WELCOME BACK'}</span><h1>{registering?'Start building.':'Continue building.'}</h1><p>{registering?'Create an account stored securely in MongoDB.':'Sign in to your developer personality.'}</p><button className="oauth" disabled title="Configure Google OAuth to enable"><span>G</span> Continue with Google</button><button className="oauth" disabled title="Configure GitHub OAuth to enable"><span className="github-mark">◈</span> Continue with GitHub</button><div className="divider"><span>or continue with email</span></div><form onSubmit={submit}>{registering&&<label>Your name<input required value={name} onChange={e=>setName(e.target.value)} placeholder="Ada Lovelace"/></label>}<label>Email address<input required type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@company.com"/></label><label>Password<div className="password"><input required minLength={8} type={show?'text':'password'} value={password} onChange={e=>setPassword(e.target.value)} placeholder="At least 8 characters"/><button type="button" onClick={()=>setShow(!show)}>{show?'Hide':'Show'}</button></div></label>{error&&<div className="auth-error">{error}</div>}<div className="form-meta"><label><input type="checkbox" defaultChecked/> Keep me signed in</label>{!registering&&<button type="button">Forgot password?</button>}</div><button className="login-submit" disabled={busy}>{busy?'Please wait…':registering?'Create account':'Sign in'} <ArrowRight/></button></form><p className="signup">{registering?'Already have an account?':'New to DevPersona?'} <button onClick={()=>{setRegistering(!registering);setError('')}}>{registering?'Sign in':'Create an account'}</button></p><button className="dev-access" onClick={async()=>{setBusy(true);setError('');try{await api.auth.dev();onLogin()}catch(e){setError(e instanceof Error?e.message:'Dev access failed')}finally{setBusy(false)}}}><Terminal size={15}/> Enter with dev access</button><small className="auth-note"><ShieldCheck/> Passwords are hashed before they are stored in MongoDB.</small></div></div></div>;
}
function Sidebar({
  page,
  setPage,
  onLogout,
  agent,
  switchAgent,
}: {
  page: Page;
  setPage: (p: Page) => void;
  onLogout: () => void;
  agent: typeof agents[number];
  switchAgent: () => void;
}) {
  return (
    <aside>
      <div className="brand">
        <div className="mark">
          <Mascot size={30} />
        </div>
        <div>
          <b>DevPersona</b>
          <small>Adaptive coding agent</small>
        </div>
      </div>
      <nav>
        {nav.map(([n, I]) => (
          <button
            key={n}
            className={page === n ? "active" : ""}
            onClick={() => setPage(n)}
          >
            <I size={18} />
            {n}
            {n === "Personality" && <span className="dot" />}
          </button>
        ))}
      </nav>
      <div className="project">
        <small>ACTIVE AGENT</small>
        <button className="active-agent" onClick={switchAgent}><agent.icon size={15}/><div><b>{agent.name}</b><span>Switch specialist</span></div><ChevronDown size={14}/></button>
      </div>
      <div className="project">
        <small>CURRENT PROJECT</small>
        <div className="project-card">
          <div className="project-icon">O</div>
          <div>
            <b>Orbit Mobile</b>
            <span>Expo · TypeScript</span>
          </div>
          <ChevronDown size={15} />
        </div>
      </div>
      <div className="aside-bottom">
        <div className="learning">
          <Sparkles size={16} />
          <div>
            <b>Learning is on</b>
            <span>12 signals this week</span>
          </div>
        </div>
        <div className="profile">
          <div className="avatar">AR</div>
          <div>
            <b>Aaron Ramirez</b>
            <span>Personal workspace</span>
          </div>
          <button className="logout-icon" onClick={onLogout} title="Sign out"><ArrowRight size={17} /></button>
        </div>
      </div>
    </aside>
  );
}
function Topbar({ page, status }: { page: Page; status: typeof demoStatus }) {
  return (
    <header>
      <div>
        <h1>
          {page === "Workspace"
            ? "Voice workspace"
            : page === "Overview"
            ? "Specialist dashboard"
            : page === "Creator"
            ? "Personality creator"
            : page === "Voice Creator"
            ? "Voice creator"
            : page === "Personality"
            ? "Developer personality"
            : page === "Memory"
            ? "Project memory"
            : page === "History"
            ? "Conversation history"
            : "Privacy & data"}
        </h1>
        <p>
          {page === "Workspace"
            ? "Talk through code. DevPersona adapts as you work."
            : page === "Overview"
            ? "A focused command center for the specialist you selected."
            : page === "Creator"
            ? "Design an agent personality and export it as Markdown."
            : page === "Voice Creator"
            ? "Design its voice behavior and export an ElevenLabs-ready profile."
            : page === "Personality"
            ? "The preferences that shape every response."
            : page === "Memory"
            ? "Decisions and context remembered for Orbit Mobile."
            : page === "History"
            ? "Review what you built and what DevPersona learned."
            : "Control what is learned, retained, and shared."}
        </p>
      </div>
      <div className="top-actions">
        <div className="status">
          <span className={status.mongo ? "online" : "demo"} />
          {status.mongo ? "Atlas connected" : "Demo mode"}
        </div>
        <button className="icon-btn">
          <Search size={18} />
        </button>
        <button className="icon-btn">
          <Settings2 size={18} />
        </button>
      </div>
    </header>
  );
}
function Workspace({
  prefs,
  messages,
  agent,
  onMessage,
}: {
  prefs: Preference[];
  messages: Message[];
  agent: typeof agents[number];
  onMessage: (m: Message) => void;
}) {
  const [text, setText] = useState(""),
    [instructions, setInstructions] = useState(""),
    [busy, setBusy] = useState(false),
    [demoListening, setDemoListening] = useState(false),
    [interviewing, setInterviewing] = useState(false),
    [interviewHistory, setInterviewHistory] = useState<{role:'user'|'assistant';content:string}[]>([]);
  const end = useRef<HTMLDivElement>(null);
  const { startSession, endSession } = useConversationControls();
  const { status: voiceStatus } = useConversationStatus();
  const listening = voiceStatus === "connected" || demoListening;
  const workspacePrompts={frontend:["Design a polished responsive screen","Audit this UI for accessibility","Create a reusable component","Improve the interaction and motion"],backend:["Design a secure API endpoint","Review the service architecture","Debug this server issue","Add tests and observability"],data:["Design an Atlas vector index","Evaluate retrieval quality","Model this dataset","Build an analytics pipeline"],animal:["Create an animal care workflow","Review today's health alerts","Build a scheduling feature","Design an inventory tracker"]};
  const suggestedQuestions = interviewing
    ? ["Ask me about my preferred stack", "Ask about architecture and state", "Ask about testing and debugging", "Ask how I want answers formatted"]
    : workspacePrompts[agent.id];
  useEffect(() => {
    end.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, busy]);
  const send = async () => {
    if (!text.trim() || busy) return;
    const prompt = text.trim();
    const u = {
      id: crypto.randomUUID(),
      role: "user" as const,
      content: prompt,
      createdAt: new Date().toISOString(),
    };
    onMessage(u);
    setText("");
    setBusy(true);
    try {
      if(interviewing){
        const history=[...interviewHistory,{role:'user' as const,content:prompt}];
        const r=await api.interview(history);
        const assistant={id:crypto.randomUUID(),role:'assistant' as const,content:r.reply,createdAt:new Date().toISOString(),preferences:r.preferences.map(p=>p.id)};
        onMessage(assistant); setInterviewHistory([...history,{role:'assistant',content:r.reply}]);
        if(r.complete)setInterviewing(false);
      }else{
        const r = await api.chat(prompt, `${instructions}\nActive specialist: ${agent.name}. ${agent.description}`);
        onMessage(r.message);
      }
    } catch {
      onMessage({
        id: crypto.randomUUID(),
        role: "assistant",
        content:
          "I hit a connection problem. Your message is still here—start the API and try again.",
        createdAt: new Date().toISOString(),
      });
    } finally {
      setBusy(false);
    }
  };
  const startInterview=async()=>{if(busy)return;setBusy(true);try{const r=await api.interview([]);const first={role:'assistant' as const,content:r.reply};setInterviewHistory([first]);setInterviewing(true);onMessage({id:crypto.randomUUID(),role:'assistant',content:r.reply,createdAt:new Date().toISOString()})}finally{setBusy(false)}};
  const toggleVoice = async () => {
    if (voiceStatus === "connected") {
      await endSession();
      return;
    }
    if (demoListening) {
      setDemoListening(false);
      return;
    }
    const session = await fetch("/api/voice/session").then((r) => r.json());
    if (session.agentId) {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      await startSession({ agentId: session.agentId });
    } else setDemoListening(true);
  };
  return (
    <div className={'workspace agent-workspace '+agent.color}>
      <section className="chat">
        <div className="context-strip">
          <Sparkles size={15} />
          <span>
            <b>{interviewing?'Claude personality interview':agent.name}</b> · {interviewing?'Answer one question at a time':`${prefs.length} preferences applied`}
          </span>
          <button className={interviewing?'interview-live':''} onClick={interviewing?()=>setInterviewing(false):startInterview}>{interviewing?'End interview':'Build my personality'}</button>
        </div>
        <div className="messages">
          {messages.map((m) => (
            <div className={"message " + m.role} key={m.id}>
              {m.role === "assistant" && (
                <div className="ai-avatar">
                  <Mascot pose="front" size={22} />
                </div>
              )}
              <div>
                <small>{m.role === "assistant" ? "DEVPERSONA" : "YOU"}</small>
                <div className="bubble">{m.content}</div>
                {m.preferences?.length ? (
                  <span className="used">
                    <BrainCircuit size={12} /> Used {m.preferences.length}{" "}
                    personality signals
                  </span>
                ) : null}
              </div>
            </div>
          ))}
          {busy && (
            <div className="message assistant">
              <div className="ai-avatar">
                <Mascot pose="front" size={22} />
              </div>
              <div className="typing">
                <i />
                <i />
                <i />
              </div>
            </div>
          )}
          <div ref={end} />
        </div>
        <div className="suggested-questions">
          {suggestedQuestions.map(question=><button key={question} onClick={()=>setText(question)}><Sparkles size={11}/>{question}</button>)}
        </div>
        <div className="composer">
          <div className="instruction">
            <LockKeyhole size={13} />
            <input
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder="Current instruction (highest priority), e.g. no refactoring"
            />
          </div>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send();
              }
            }}
            placeholder={agent.id==='frontend'?'Describe the interface you want to create…':agent.id==='backend'?'Describe the system, API, or bug…':agent.id==='data'?'Ask about your data, retrieval, or models…':'Ask about care, records, scheduling, or operations…'}
          />
          <div className="compose-row">
            <button
              className={"voice " + (listening ? "live" : "")}
              onClick={toggleVoice}
            >
              <Mic size={18} />
              {listening ? "End conversation" : `Talk to ${agent.name}`}
            </button>
            <div>
              <span>⌘ ↵ to send</span>
              <button className="send" onClick={send}>
                <ArrowUp size={18} />
              </button>
            </div>
          </div>
        </div>
      </section>
      <RightPanel prefs={prefs} listening={listening} agent={agent} />
    </div>
  );
}
function RightPanel({
  prefs,
  listening,
  agent,
}: {
  prefs: Preference[];
  listening: boolean;
  agent: typeof agents[number];
}) {
  return (
    <section className="right-panel">
      <div className={"voice-orb " + (listening ? "listening" : "")}>
        <div className="orb-core">
          <Mascot pose={listening ? "talking" : "idle"} size={48} />
        </div>
        <span />
        <span />
        <span />
      </div>
      <span className="workspace-agent-tag">{agent.tag}</span>
      <h3>{listening ? `${agent.name} is listening` : agent.name}</h3>
      <p>
        {listening
          ? "Describe what you need."
          : agent.description}
      </p>
      <button className="outline">
        <Volume2 size={16} /> Avery · Conversational
      </button>
      <div className="panel-rule" />
      <div className="panel-title">
        <span>Active personality</span>
        <button>
          <MoreHorizontal size={17} />
        </button>
      </div>
      {prefs.slice(0, 5).map((p) => (
        <div className="signal" key={p.id}>
          <div>
            <small>{p.label}</small>
            <b>{p.value}</b>
          </div>
          <span>{Math.round(p.confidence * 100)}%</span>
        </div>
      ))}
      <div className="precedence">
        <small>RESPONSE PRECEDENCE</small>
        <div>
          <b>1</b> Current instruction
        </div>
        <div>
          <b>2</b> Project preferences
        </div>
        <div>
          <b>3</b> Global personality
        </div>
      </div>
    </section>
  );
}
const personalityTemplates=[
  {name:'UI Craftsperson',icon:Palette,mission:'Create refined, accessible interfaces with deliberate visual hierarchy.',tone:'Playful & creative',length:'Balanced',output:'Code first, then explanation',refactor:'Related modules',testing:'Include tests by default',stack:['TypeScript','React','Tailwind','Playwright'],custom:'Prioritize accessibility, responsive behavior, design tokens, and polished states.'},
  {name:'API Guardian',icon:ShieldCheck,mission:'Build secure, observable APIs with explicit contracts and failure modes.',tone:'Precise & technical',length:'Concise',output:'Plan, code, verification',refactor:'Touched files only',testing:'Include tests by default',stack:['TypeScript','Node.js','Express','MongoDB','Vitest'],custom:'Validate every boundary. Include authorization, structured errors, rate limits, and observability.'},
  {name:'Data Detective',icon:ChartNoAxesCombined,mission:'Turn ambiguous data questions into reproducible, trustworthy conclusions.',tone:'Direct & collaborative',length:'Detailed',output:'Explanation first, then code',refactor:'Related modules',testing:'Tests for risky changes',stack:['Python','MongoDB','Atlas Vector Search'],custom:'State assumptions, check data quality, quantify uncertainty, and make transformations reproducible.'},
  {name:'Rapid Founder',icon:Sparkles,mission:'Ship the smallest quality increment that validates the next assumption.',tone:'Direct & collaborative',length:'Very concise',output:'Code first, then explanation',refactor:'Touched files only',testing:'Tests for risky changes',stack:['TypeScript','React','Node.js','MongoDB'],custom:'Optimize for learning speed, avoid scope creep, and choose reversible decisions.'},
  {name:'Test Pilot',icon:Check,mission:'Make software behavior explicit through focused tests and reproducible debugging.',tone:'Precise & technical',length:'Balanced',output:'Plan, code, verification',refactor:'Related modules',testing:'Include tests by default',stack:['TypeScript','Vitest','Playwright'],custom:'Reproduce, isolate, add a failing test, apply the smallest fix, then verify.'},
  {name:'Patient Mentor',icon:BookOpen,mission:'Teach engineering clearly while helping the developer produce working code.',tone:'Warm & encouraging',length:'Detailed',output:'Explanation first, then code',refactor:'No refactoring',testing:'Ask before adding tests',stack:['TypeScript','React','Node.js'],custom:'Define unfamiliar terms, use small examples, and explain why each step matters.'},
  {name:'Mobile Specialist',icon:AudioLines,mission:'Build reliable, native-feeling mobile experiences.',tone:'Direct & collaborative',length:'Concise',output:'Code first, then explanation',refactor:'Related modules',testing:'Include tests by default',stack:['TypeScript','React','Expo','Zustand'],custom:'Preserve Expo compatibility and consider navigation, keyboard, safe areas, offline, and permissions.'},
  {name:'Care Operations Lead',icon:HeartPulse,mission:'Create safe, auditable animal-care workflows that help teams act on time.',tone:'Warm & encouraging',length:'Balanced',output:'Plan, code, verification',refactor:'Touched files only',testing:'Include tests by default',stack:['TypeScript','React','Node.js','MongoDB'],custom:'Prioritize identity, medication safety, schedules, inventory, audit history, and urgent alerts.'},
] as const;
function PersonalityCreator({agent}:{agent:typeof agents[number]}){
  const [name,setName]=useState(`${agent.name} Persona`),[mission,setMission]=useState(agent.description),[tone,setTone]=useState('Direct & collaborative'),[length,setLength]=useState('Concise'),[output,setOutput]=useState('Code first, then explanation'),[refactor,setRefactor]=useState('Touched files only'),[testing,setTesting]=useState('Include tests by default'),[stack,setStack]=useState<string[]>(agent.skills),[custom,setCustom]=useState(''),[copied,setCopied]=useState(false);
  const stackOptions=['TypeScript','React','Expo','Node.js','Express','MongoDB','Atlas Vector Search','Zustand','Python','Tailwind','Vitest','Playwright'];
  const applyTemplate=(t:typeof personalityTemplates[number])=>{setName(t.name);setMission(t.mission);setTone(t.tone);setLength(t.length);setOutput(t.output);setRefactor(t.refactor);setTesting(t.testing);setStack([...t.stack]);setCustom(t.custom)};
  const toggle=(item:string)=>setStack(x=>x.includes(item)?x.filter(v=>v!==item):[...x,item]);
  const jsonData=useMemo(()=>({schemaVersion:'1.0',personality:{name,mission,specialist:{id:agent.id,name:agent.name,domain:agent.tag},communication:{tone,responseLength:length,outputOrder:output},engineering:{preferredStack:stack,refactoringPermission:refactor,testingBehavior:testing},precedence:['current_instructions','project_preferences','global_preferences'],additionalInstructions:custom||null},metadata:{format:'devpersona/personality',generatedAt:new Date().toISOString().slice(0,10)}}),[name,mission,agent,tone,length,output,stack,refactor,testing,custom]);
  const markdown=useMemo(()=>`# ${name}\n\n> ${mission}\n\n## Role\n\nYou are a ${agent.name} specializing in ${agent.tag.toLowerCase()}. Adapt to the developer's stored preferences while keeping this role's expertise.\n\n## Communication style\n\n- Tone: ${tone}\n- Response length: ${length}\n- Output order: ${output}\n- Ask a clarifying question only when the answer materially changes the implementation.\n\n## Preferred stack\n\n${stack.map(x=>`- ${x}`).join('\n')||'- Follow the project stack'}\n\n## Engineering behavior\n\n- Refactoring permission: ${refactor}\n- Testing: ${testing}\n- Explain important tradeoffs and surface uncertainty.\n- Current user instructions override project preferences.\n- Project preferences override global preferences.\n\n## Boundaries\n\n- Never expose credentials or private project data.\n- Preserve unrelated user changes.\n- Confirm before destructive operations.\n\n## Additional instructions\n\n${custom||'No additional instructions.'}\n`,[name,mission,tone,length,output,refactor,testing,stack,custom,agent]);
  const markdownWithJson=useMemo(()=>`${markdown}\n## Machine-readable configuration\n\n\`\`\`json\n${JSON.stringify(jsonData,null,2)}\n\`\`\`\n`,[markdown,jsonData]);
  const download=()=>{const url=URL.createObjectURL(new Blob([markdownWithJson],{type:'text/markdown'}));const a=document.createElement('a');a.href=url;a.download=`${name.toLowerCase().replace(/[^a-z0-9]+/g,'-')||'personality'}.md`;a.click();URL.revokeObjectURL(url)};
  const copy=async()=>{await navigator.clipboard.writeText(markdownWithJson);setCopied(true);setTimeout(()=>setCopied(false),1400)};
  return <div className={'creator-page '+agent.color}>
    <section className="template-gallery">
      <div><span className="eyebrow">START FROM A PERSONALITY</span><h2>Markdown templates</h2><p>Every preset includes readable instructions and structured JSON data.</p></div>
      <div className="template-scroll">{personalityTemplates.map(t=><button onClick={()=>applyTemplate(t)} key={t.name}><t.icon/><div><b>{t.name}</b><span>{t.mission}</span></div><ArrowRight/></button>)}</div>
    </section>
    <div className="creator-layout">
      <section className="creator-form">
        <div className="creator-intro"><div className="creator-agent"><agent.icon/></div><div><span className="eyebrow">VISUAL BUILDER</span><h2>Shape how your agent thinks.</h2><p>Every control updates the Markdown and JSON in real time.</p></div></div>
        <div className="creator-fields">
          <label>Personality name<input value={name} onChange={e=>setName(e.target.value)}/></label>
          <label>Mission<textarea value={mission} onChange={e=>setMission(e.target.value)}/></label>
          <Choice title="Tone" value={tone} set={setTone} options={['Direct & collaborative','Warm & encouraging','Precise & technical','Playful & creative']}/>
          <Choice title="Response length" value={length} set={setLength} options={['Very concise','Concise','Balanced','Detailed']}/>
          <Choice title="Answer format" value={output} set={setOutput} options={['Code first, then explanation','Explanation first, then code','Code only','Plan, code, verification']}/>
          <Choice title="Refactoring permission" value={refactor} set={setRefactor} options={['No refactoring','Touched files only','Related modules','Broad improvements allowed']}/>
          <Choice title="Testing behavior" value={testing} set={setTesting} options={['Include tests by default','Tests for risky changes','Ask before adding tests','No tests unless requested']}/>
          <div className="creator-field"><b>Preferred tools</b><div className="tool-picker">{stackOptions.map(x=><button className={stack.includes(x)?'selected':''} onClick={()=>toggle(x)} key={x}>{stack.includes(x)&&<Check/>}{x}</button>)}</div></div>
          <label>Additional instructions<textarea value={custom} onChange={e=>setCustom(e.target.value)} placeholder="Add conventions, constraints, or non-negotiables…"/></label>
        </div>
      </section>
      <section className="markdown-panel"><div className="markdown-head"><div><span>PERSONALITY.MD + JSON</span><small>Live preview</small></div><div><button onClick={copy}><Copy/>{copied?'Copied':'Copy'}</button><button className="download-md" onClick={download}><Download/>Download</button></div></div><pre>{markdownWithJson}</pre><div className="markdown-status"><i/><span>Valid Markdown + JSON · {markdownWithJson.split(/\s+/).length} words</span></div></section>
    </div>
  </div>
}
function Choice({title,value,set,options}:{title:string;value:string;set:(v:string)=>void;options:string[]}){return <div className="creator-field"><b>{title}</b><div className="choice-grid">{options.map(x=><button className={value===x?'selected':''} onClick={()=>set(x)} key={x}>{value===x&&<Check/>}{x}</button>)}</div></div>}
const voiceTemplates=[
  {name:'Calm Pair Programmer',style:'Calm & grounded',pace:'Measured',energy:'Low',detail:'Short spoken answers',interruptions:'Welcome interruptions',greeting:'Ready when you are. What are we building?',rules:'Use short sentences. Pause after decisions. Read code only when asked.'},
  {name:'Energetic Builder',style:'Upbeat & motivating',pace:'Fast',energy:'High',detail:'Concise with momentum',interruptions:'Welcome interruptions',greeting:'Let’s ship something great. Where should we start?',rules:'Keep momentum high, celebrate progress briefly, and always end with the next action.'},
  {name:'Technical Navigator',style:'Precise & neutral',pace:'Measured',energy:'Medium',detail:'Detailed when needed',interruptions:'Pause at checkpoints',greeting:'I have your project context. What should we inspect?',rules:'State assumptions, name tradeoffs, and summarize complex code instead of reading it verbatim.'},
  {name:'Patient Voice Mentor',style:'Warm & patient',pace:'Slow',energy:'Low',detail:'Explain concepts aloud',interruptions:'Welcome interruptions',greeting:'Take your time. Tell me what you’d like to understand.',rules:'Avoid jargon, introduce one idea at a time, and check understanding before continuing.'},
  {name:'Design Critic',style:'Expressive & thoughtful',pace:'Measured',energy:'Medium',detail:'Visual descriptions',interruptions:'Pause at checkpoints',greeting:'Show me the experience you want to improve.',rules:'Describe hierarchy, spacing, motion, and accessibility in visual language.'},
  {name:'Incident Commander',style:'Direct & composed',pace:'Fast',energy:'Medium',detail:'Only critical information',interruptions:'Hold until complete',greeting:'I’m ready. What is failing and what changed?',rules:'Prioritize containment, evidence, and reversible steps. Never speculate without labeling it.'},
  {name:'Data Storyteller',style:'Curious & analytical',pace:'Measured',energy:'Medium',detail:'Narrative summaries',interruptions:'Pause at checkpoints',greeting:'What question should the data answer?',rules:'Lead with the conclusion, quantify uncertainty, then explain the evidence.'},
  {name:'Care Coordinator',style:'Warm & reassuring',pace:'Slow',energy:'Medium',detail:'Clear action lists',interruptions:'Welcome interruptions',greeting:'I’m here. Which animal or care task needs attention?',rules:'Repeat critical animal identity and medication details. Clearly distinguish urgent from routine actions.'},
] as const;
function VoiceCreator({agent}:{agent:typeof agents[number]}){
  const [name,setName]=useState('Calm Pair Programmer'),[style,setStyle]=useState('Calm & grounded'),[pace,setPace]=useState('Measured'),[energy,setEnergy]=useState('Low'),[detail,setDetail]=useState('Short spoken answers'),[interruptions,setInterruptions]=useState('Welcome interruptions'),[greeting,setGreeting]=useState('Ready when you are. What are we building?'),[rules,setRules]=useState('Use short sentences. Pause after decisions. Read code only when asked.'),[copied,setCopied]=useState(false);
  const apply=(v:typeof voiceTemplates[number])=>{setName(v.name);setStyle(v.style);setPace(v.pace);setEnergy(v.energy);setDetail(v.detail);setInterruptions(v.interruptions);setGreeting(v.greeting);setRules(v.rules)};
  const data=useMemo(()=>({schemaVersion:'1.0',voice:{name,provider:'elevenlabs',specialist:agent.id,style,delivery:{pace,energy,detail,interruptionPolicy:interruptions},conversation:{firstMessage:greeting,additionalRules:rules},audio:{stability:style.includes('Expressive')?.35:.65,similarityBoost:.75,speakerBoost:true}},metadata:{format:'devpersona/voice',generatedAt:new Date().toISOString().slice(0,10)}}),[name,agent,style,pace,energy,detail,interruptions,greeting,rules]);
  const md=useMemo(()=>`# ${name}\n\n> Voice profile for the ${agent.name}.\n\n## Delivery\n\n- Style: ${style}\n- Pace: ${pace}\n- Energy: ${energy}\n- Detail: ${detail}\n- Interruptions: ${interruptions}\n\n## First message\n\n“${greeting}”\n\n## Voice behavior\n\n${rules}\n\n## ElevenLabs configuration\n\n\`\`\`json\n${JSON.stringify(data,null,2)}\n\`\`\`\n`,[name,agent,style,pace,energy,detail,interruptions,greeting,rules,data]);
  const copy=async()=>{await navigator.clipboard.writeText(md);setCopied(true);setTimeout(()=>setCopied(false),1400)};const download=()=>{const url=URL.createObjectURL(new Blob([md],{type:'text/markdown'}));const a=document.createElement('a');a.href=url;a.download=`${name.toLowerCase().replace(/[^a-z0-9]+/g,'-')}-voice.md`;a.click();URL.revokeObjectURL(url)};
  return <div className={'creator-page voice-creator '+agent.color}><section className="template-gallery"><div><span className="eyebrow">CHOOSE A VOICE PERSONALITY</span><h2>Voice templates</h2><p>Speaking behavior, conversation rules, and ElevenLabs JSON in one file.</p></div><div className="template-scroll">{voiceTemplates.map(v=><button onClick={()=>apply(v)} key={v.name}><Volume2/><div><b>{v.name}</b><span>{v.style} · {v.pace}</span></div><ArrowRight/></button>)}</div></section><div className="creator-layout"><section className="creator-form"><div className="creator-intro"><div className="creator-agent voice-preview-orb"><AudioLines/></div><div><span className="eyebrow">VOICE BEHAVIOR</span><h2>Make the agent sound human.</h2><p>Shape delivery without changing its technical personality.</p></div></div><div className="creator-fields"><label>Voice profile name<input value={name} onChange={e=>setName(e.target.value)}/></label><Choice title="Speaking style" value={style} set={setStyle} options={['Calm & grounded','Upbeat & motivating','Precise & neutral','Warm & patient','Expressive & thoughtful','Direct & composed','Curious & analytical','Warm & reassuring']}/><Choice title="Pace" value={pace} set={setPace} options={['Slow','Measured','Fast']}/><Choice title="Energy" value={energy} set={setEnergy} options={['Low','Medium','High']}/><Choice title="Spoken detail" value={detail} set={setDetail} options={['Only critical information','Short spoken answers','Concise with momentum','Detailed when needed','Explain concepts aloud','Narrative summaries','Clear action lists','Visual descriptions']}/><Choice title="Interruption behavior" value={interruptions} set={setInterruptions} options={['Welcome interruptions','Pause at checkpoints','Hold until complete']}/><label>First message<textarea value={greeting} onChange={e=>setGreeting(e.target.value)}/></label><label>Voice rules<textarea value={rules} onChange={e=>setRules(e.target.value)}/></label></div></section><section className="markdown-panel"><div className="markdown-head"><div><span>VOICE.MD + JSON</span><small>ElevenLabs-ready preview</small></div><div><button onClick={copy}><Copy/>{copied?'Copied':'Copy'}</button><button className="download-md" onClick={download}><Download/>Download</button></div></div><div className="voice-demo"><div className="mini-orb"><AudioLines/></div><div><small>FIRST MESSAGE</small><p>{greeting}</p></div></div><pre>{md}</pre><div className="markdown-status"><i/><span>Valid voice Markdown + JSON</span></div></section></div></div>
}
function Personality({
  prefs,
  setPrefs,
}: {
  prefs: Preference[];
  setPrefs: (p: Preference[]) => void;
}) {
  const [filter, setFilter] = useState<"all" | "global" | "project">("all"),
    [adding, setAdding] = useState(false);
  const shown = prefs.filter((p) => filter === "all" || p.scope === filter);
  const avg = Math.round(
    (prefs.reduce((a, p) => a + p.confidence, 0) / Math.max(1, prefs.length)) *
      100
  );
  return (
    <div className="page personality">
      <div className="stat-grid">
        <Stat
          icon={BrainCircuit}
          value={`${avg}%`}
          label="Personality confidence"
          note="+4% this month"
        />
        <Stat
          icon={Activity}
          value={String(prefs.length)}
          label="Active preferences"
          note="3 recently updated"
        />
        <Stat
          icon={FolderGit2}
          value="4"
          label="Known projects"
          note="Orbit is active"
        />
        <Stat
          icon={Sparkles}
          value="128"
          label="Signals learned"
          note="Across 31 sessions"
        />
      </div>
      <div className="section-head">
        <div>
          <h2>Your coding DNA</h2>
          <p>
            Edit anything. Explicit choices always beat inferred preferences.
          </p>
        </div>
        <button className="primary" onClick={() => setAdding(true)}>
          <Plus size={17} /> Add preference
        </button>
      </div>
      <div className="tabs">
        {(["all", "global", "project"] as const).map((x) => (
          <button
            className={filter === x ? "active" : ""}
            onClick={() => setFilter(x)}
          >
            {x[0].toUpperCase() + x.slice(1)}
          </button>
        ))}
      </div>
      <div className="pref-list">
        {shown.map((p) => (
          <div className="pref-card" key={p.id}>
            <div className="pref-icon">
              {p.category === "Stack" ? (
                <Code2 />
              ) : p.category === "State" ? (
                <Database />
              ) : p.category === "Responses" ? (
                <BookOpen />
              ) : (
                <BrainCircuit />
              )}
            </div>
            <div className="pref-main">
              <div>
                <small>
                  {p.category} · {p.label}
                </small>
                <h3>{p.value}</h3>
              </div>
              <div className="scope">
                <span className={p.scope}>{p.scope}</span>
                <span className={"source " + p.source}>{p.source}</span>
              </div>
              <p>“{p.evidence.replace(/[“”]/g, "")}”</p>
            </div>
            <div className="confidence">
              <b>{Math.round(p.confidence * 100)}%</b>
              <span>confidence</span>
              <div>
                <i style={{ width: `${p.confidence * 100}%` }} />
              </div>
            </div>
            <button
              className="delete"
              onClick={async () => {
                await api.deletePreference(p.id);
                setPrefs(prefs.filter((x) => x.id !== p.id));
              }}
            >
              <Trash2 size={16} />
            </button>
          </div>
        ))}
      </div>
      {adding && (
        <AddPreference
          close={() => setAdding(false)}
          add={(p) => setPrefs([p, ...prefs])}
        />
      )}
    </div>
  );
}
function Stat({
  icon: I,
  value,
  label,
  note,
}: {
  icon: any;
  value: string;
  label: string;
  note: string;
}) {
  return (
    <div className="stat">
      <I size={20} />
      <b>{value}</b>
      <span>{label}</span>
      <small>{note}</small>
    </div>
  );
}
function AddPreference({
  close,
  add,
}: {
  close: () => void;
  add: (p: Preference) => void;
}) {
  const [value, setValue] = useState(""),
    [evidence, setEvidence] = useState("");
  const save = async () => {
    if (!value) return;
    add(
      await api.addPreference({
        category: "Custom",
        label: "Explicit preference",
        value,
        confidence: 1,
        scope: "global",
        source: "explicit",
        evidence: evidence || "Added manually in preference controls.",
      })
    );
    close();
  };
  return (
    <div className="modal-bg">
      <div className="modal">
        <button className="close" onClick={close}>
          <X />
        </button>
        <div className="modal-icon">
          <Sparkles />
        </div>
        <h2>Add a preference</h2>
        <p>Manual preferences start at 100% confidence.</p>
        <label>
          What should DevPersona know?
          <input
            autoFocus
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="e.g. Prefer named exports"
          />
        </label>
        <label>
          Supporting evidence
          <textarea
            value={evidence}
            onChange={(e) => setEvidence(e.target.value)}
            placeholder="Why or when should this apply?"
          />
        </label>
        <button className="primary full" onClick={save}>
          Save preference
        </button>
      </div>
    </div>
  );
}
function MemoryPage({
  memories,
  setMemories,
}: {
  memories: Memory[];
  setMemories: (m: Memory[]) => void;
}) {
  const [text, setText] = useState("");
  const add = async () => {
    if (!text) return;
    const m = await api.addMemory(text, "decision");
    setMemories([m, ...memories]);
    setText("");
  };
  return (
    <div className="page">
      <div className="memory-hero">
        <div>
          <span className="eyebrow">ORBIT MOBILE</span>
          <h2>A shared brain for your project.</h2>
          <p>
            Decisions, constraints, and patterns are embedded and retrieved
            before every answer.
          </p>
        </div>
        <div className="memory-count">
          <Database />
          <b>{memories.length}</b>
          <span>memories indexed</span>
        </div>
      </div>
      <div className="add-memory">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && add()}
          placeholder="Add a decision, constraint, or project convention…"
        />
        <button className="primary" onClick={add}>
          <Plus size={17} /> Remember
        </button>
      </div>
      <div className="memory-grid">
        {memories.map((m) => (
          <article key={m.id}>
            <div className="memory-top">
              <span>{m.kind}</span>
              <MoreHorizontal />
            </div>
            <p>{m.text}</p>
            <small>Stored in Atlas · Retrieved semantically</small>
          </article>
        ))}
      </div>
    </div>
  );
}
function HistoryPage({ messages }: { messages: Message[] }) {
  const groups = useMemo(
    () =>
      messages.reduce((a, m, i) => {
        if (m.role === "user")
          a.push({
            title: m.content,
            reply:
              messages[i + 1]?.role === "assistant"
                ? messages[i + 1].content
                : "",
          });
        return a;
      }, [] as { title: string; reply: string }[]),
    [messages]
  );
  return (
    <div className="page">
      <div className="history-search">
        <Search />
        <input placeholder="Search conversations, code, and decisions…" />
      </div>
      <div className="section-head">
        <div>
          <h2>Recent conversations</h2>
          <p>Your working history, searchable and private.</p>
        </div>
        <button className="outline">
          <Archive size={16} /> Archive
        </button>
      </div>
      <div className="history-list">
        {groups.map((g, i) => (
          <article>
            <div className="history-icon">
              <Code2 />
            </div>
            <div>
              <small>ORBIT MOBILE · {i === 0 ? "TODAY" : "RECENTLY"}</small>
              <h3>{g.title}</h3>
              <p>{g.reply}</p>
              <span>
                <BrainCircuit size={13} /> Personality applied
              </span>
            </div>
            <MoreHorizontal />
          </article>
        ))}
      </div>
    </div>
  );
}
function Privacy() {
  const [learning, setLearning] = useState(true),
    [voice, setVoice] = useState(false),
    [retention, setRetention] = useState("Forever");
  return (
    <div className="page">
      <div className="privacy-banner">
        <ShieldCheck />
        <div>
          <h2>Your code stays yours.</h2>
          <p>
            DevPersona only learns what you allow. Manage collection and
            retention at any time.
          </p>
        </div>
      </div>
      <div className="settings-card">
        <h3>Learning & personalization</h3>
        <Setting
          title="Learn from conversations"
          text="Extract coding preferences from what you say and write."
          on={learning}
          toggle={() => setLearning(!learning)}
        />
        <Setting
          title="Store voice recordings"
          text="Off by default. Transcripts can still be retained as conversation history."
          on={voice}
          toggle={() => setVoice(!voice)}
        />
        <div className="setting">
          <div>
            <b>Conversation retention</b>
            <p>Choose how long encrypted transcripts remain available.</p>
          </div>
          <select
            value={retention}
            onChange={(e) => setRetention(e.target.value)}
          >
            <option>30 days</option>
            <option>1 year</option>
            <option>Forever</option>
          </select>
        </div>
      </div>
      <div className="settings-card">
        <h3>Data controls</h3>
        <button className="data-action">
          <Database />
          <div>
            <b>Export my data</b>
            <span>Preferences, memories, and conversations</span>
          </div>
          <ArrowUp />
        </button>
        <button className="data-action danger">
          <Trash2 />
          <div>
            <b>Delete all learned data</b>
            <span>Permanently remove your personality and project memory</span>
          </div>
          <ArrowUp />
        </button>
      </div>
    </div>
  );
}
function Setting({
  title,
  text,
  on,
  toggle,
}: {
  title: string;
  text: string;
  on: boolean;
  toggle: () => void;
}) {
  return (
    <div className="setting">
      <div>
        <b>{title}</b>
        <p>{text}</p>
      </div>
      <button className={"toggle " + (on ? "on" : "")} onClick={toggle}>
        <i />
      </button>
    </div>
  );
}
