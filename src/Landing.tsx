import { useEffect, useState } from "react";
import "./landing.css";

const lines = [
  "Heard you. Server components, colocated tests — your usual.",
  "You rejected barrel files last Tuesday. Still avoiding them.",
  "Want the diff first, or the reasoning first?",
  "That's the third time this pattern came up. Saving it.",
];

const moods = [
  { tag: "DIRECT", name: "Terse", desc: "Diff first. Explanation only if you ask.", sprite: "/sprites/idle.png" },
  { tag: "PAIRED", name: "Thinking aloud", desc: "Narrates trade-offs before it writes.", sprite: "/sprites/talking.png" },
  { tag: "DRIVER", name: "Momentum", desc: "Keeps moving, flags questions at the end.", sprite: "/sprites/walking.png" },
  { tag: "CAREFUL", name: "Reviewer", desc: "Small steps, tests before code.", sprite: "/sprites/front.png" },
  { tag: "TEACHER", name: "Explainer", desc: "Shows why, links the pattern back.", sprite: "/sprites/front-talk.png" },
  { tag: "PLAYFUL", name: "Rubber duck", desc: "Asks the dumb question that unsticks you.", sprite: "/sprites/front-wave.png" },
];

export default function Landing({ onLogin, onStart }: { onLogin: () => void; onStart: () => void }) {
  const [line, setLine] = useState(0);
  const [mood, setMood] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setLine(i => (i + 1) % lines.length), 3600);
    return () => clearInterval(t);
  }, []);

  return <div className="lp">
    <header className="lp-header">
      <div className="lp-header-in">
        <a href="#lp-top" className="lp-logo"><span className="lp-logo-chip"><img src="/sprites/front.png" alt="DevPersona mascot"/></span><b>DevPersona</b></a>
        <nav className="lp-nav">
          <a href="#lp-how">How it works</a>
          <a href="#lp-personality">Personality</a>
          <a href="#lp-privacy">Privacy</a>
        </nav>
        <div className="lp-header-actions">
          <button className="lp-signin" onClick={onLogin}>Sign in</button>
          <button className="lp-btn sm" onClick={onStart}>Start building <span className="mono">→</span></button>
        </div>
      </div>
    </header>

    <section id="lp-top" className="lp-hero">
      <div>
        <div className="lp-pill"><i/>THE CODING AGENT THAT LEARNS YOU</div>
        <h1>Your code.<br/>In <span>your voice.</span></h1>
        <p className="lp-hero-copy">DevPersona learns how you build — the stack you reach for, the patterns you trust, and how you like answers delivered. Then it codes with you, not at you.</p>
        <div className="lp-hero-actions">
          <button className="lp-btn glow" onClick={onStart}>Meet your coding agent <span className="mono">→</span></button>
          <a href="#lp-workspace" className="lp-btn ghost"><span className="lp-eq"><i/><i/><i/></span> Try the voice workspace</a>
        </div>
        <div className="lp-proof">
          <span><b>✓</b> No credit card</span>
          <span><b>✓</b> Works in demo mode</span>
          <span><b className="amber">●</b> Private by design</span>
        </div>
      </div>
      <div className="lp-stage">
        <div className="lp-stage-top"><span>PERSONA · V4</span><b>LISTENING</b></div>
        <div className="lp-stage-bubble"><div>{lines[line]}</div></div>
        <div className="lp-stage-mascot"><img src={moods[mood].sprite} alt="DevPersona mascot"/></div>
        <div className="lp-stage-glow"/>
      </div>
    </section>

    <section id="lp-workspace" className="lp-window-wrap">
      <div className="lp-window">
        <div className="lp-window-top">
          <span className="lp-dots"><i/><i/><i/></span>
          <span>devpersona / orbit-mobile</span>
          <b>PERSONALITY ACTIVE</b>
        </div>
        <div className="lp-window-body">
          <div className="lp-win-side">
            <div className="active"><img src="/sprites/idle.png" alt=""/> Voice workspace</div>
            <div>Session history</div>
            <div>Style profile</div>
            <div>Repo context</div>
            <small>LOCAL · NOTHING SYNCED</small>
          </div>
          <div className="lp-win-chat">
            <div>
              <div className="lp-chat-label">YOU</div>
              <div className="lp-chat-msg">Build the profile settings flow. Keep it in my usual style.</div>
            </div>
            <div>
              <div className="lp-chat-label ai">DEVPERSONA</div>
              <div className="lp-chat-msg ai">Server components, colocated tests, no barrel files — the way you shipped auth last week. Three files, diff first.</div>
            </div>
            <div className="lp-chips"><span>settings/page.tsx</span><span>profile-form.tsx</span><span>+ 1 test</span></div>
          </div>
          <div className="lp-win-voice">
            <div className="lp-chat-label">SPEAKING</div>
            <img src="/sprites/talking.png" alt=""/>
            <div className="lp-eq-big"><i/><i/><i/><i/><i/></div>
            <p>Talk it through. It answers in the shape you actually read.</p>
          </div>
        </div>
      </div>
    </section>

    <section id="lp-how" className="lp-section">
      <div className="lp-section-head">
        <h2>Three sessions in, it sounds like you</h2>
        <span className="lp-kicker">HOW IT WORKS</span>
      </div>
      <div className="lp-how">
        <article>
          <div className="lp-how-top"><span>01</span><img src="/sprites/walking.png" alt=""/></div>
          <h3>It reads the room</h3>
          <p>Point it at a repo. It maps your conventions from the code you already shipped — no questionnaire.</p>
        </article>
        <article>
          <div className="lp-how-top"><span>02</span><img src="/sprites/talking.png" alt=""/></div>
          <h3>You talk, it drafts</h3>
          <p>Describe the change out loud. You get a diff in your patterns, with the reasoning at the length you asked for.</p>
        </article>
        <article>
          <div className="lp-how-top"><span>03</span><img src="/sprites/front-wave.png" alt=""/></div>
          <h3>Corrections stick</h3>
          <p>Reject something once and it stays rejected. The profile is editable, inspectable, and yours to delete.</p>
        </article>
      </div>
    </section>

    <section id="lp-personality" className="lp-section">
      <div className="lp-moods-panel">
        <div className="lp-section-head">
          <h2>Pick a temperament</h2>
          <span className="lp-kicker">PERSONALITY</span>
        </div>
        <p>Same agent, different delivery. Switch mid-session — the code doesn't change, the conversation does.</p>
        <div className="lp-moods">
          {moods.map((m, i) => (
            <button key={m.tag} className={"lp-mood" + (i === mood ? " on" : "")} onClick={() => setMood(i)}>
              <img src={m.sprite} alt=""/>
              <span><small>{m.tag}</small><b>{m.name}</b><em>{m.desc}</em></span>
            </button>
          ))}
        </div>
      </div>
    </section>

    <section id="lp-privacy" className="lp-section lp-privacy">
      <div><b>LOCAL FIRST</b><p>Your style profile lives on your machine. Nothing leaves it unless you ask.</p></div>
      <div><b>NO TRAINING</b><p>Your code is never used to train models. Not ours, not anyone's.</p></div>
      <div><b>ONE SWITCH</b><p>Wipe the persona whenever you like. It forgets in a single click.</p></div>
    </section>

    <section className="lp-section">
      <div className="lp-cta">
        <img src="/sprites/front-wave.png" alt="DevPersona mascot waving"/>
        <div className="lp-cta-copy">
          <h2>Say the first thing out loud.</h2>
          <p>Demo mode runs on a sample repo — no install, no card. Bring your own when it earns it.</p>
        </div>
        <div className="lp-cta-actions">
          <button className="lp-btn" onClick={onStart}>Start building</button>
          <a href="#lp-workspace" className="lp-btn ghost">Watch a session</a>
        </div>
      </div>
    </section>

    <footer className="lp-footer">
      <span><img src="/sprites/idle.png" alt=""/> DevPersona</span>
      <span className="lp-footer-links">
        <a href="#lp-privacy">Privacy</a>
        <a href="#lp-how">Docs</a>
        <a href="#lp-top">Changelog</a>
      </span>
    </footer>
  </div>;
}
