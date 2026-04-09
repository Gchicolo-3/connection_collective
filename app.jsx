// ─────────────────────────────────────────────────────────────────────────────
// CONNECTION COLLECTIVE — Supabase Connected
// ─────────────────────────────────────────────────────────────────────────────
// Before deploying to Vercel, fill in the two lines below.
// Get these from: Supabase Dashboard → Your Project → Settings → API
// ─────────────────────────────────────────────────────────────────────────────

const SUPABASE_URL = "https://ctnbaykaqbsauwcbvxdx.supabase.co"; // already set from your project ID
const SUPABASE_ANON_KEY = "YOUR_ANON_KEY_HERE"; // 🔑 paste your eyJ... key here locally

// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect, useCallback } from "react";

// ── Supabase client (no package needed — raw fetch) ───────────────────────────
const sb = {
  from: (table) => ({
    _table: table,
    _filters: [],
    _order: null,
    eq(col, val) { this._filters.push(`${col}=eq.${val}`); return this; },
    order(col, { ascending = true } = {}) { this._order = `${col}.${ascending ? "asc" : "desc"}`; return this; },
    async select(cols = "*") {
      const params = new URLSearchParams();
      if (cols !== "*") params.set("select", cols);
      this._filters.forEach(f => { const [k, v] = f.split("="); params.append(k, v.replace(/^eq\./, "")); });
      if (this._order) params.set("order", this._order);
      const res = await fetch(`${SUPABASE_URL}/rest/v1/${this._table}?${params}`, {
        headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}`, "Content-Type": "application/json" }
      });
      const data = await res.json();
      return { data: Array.isArray(data) ? data : [], error: res.ok ? null : data };
    },
    async insert(rows) {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/${this._table}`, {
        method: "POST",
        headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}`, "Content-Type": "application/json", Prefer: "return=representation" },
        body: JSON.stringify(Array.isArray(rows) ? rows : [rows])
      });
      const data = await res.json();
      return { data: Array.isArray(data) ? data : [data], error: res.ok ? null : data };
    },
    async update(vals) {
      const params = new URLSearchParams();
      this._filters.forEach(f => { const [k, v] = f.split("="); params.append(k, v.replace(/^eq\./, "")); });
      const res = await fetch(`${SUPABASE_URL}/rest/v1/${this._table}?${params}`, {
        method: "PATCH",
        headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}`, "Content-Type": "application/json", Prefer: "return=representation" },
        body: JSON.stringify(vals)
      });
      const data = await res.json();
      return { data: Array.isArray(data) ? data : [data], error: res.ok ? null : data };
    },
    async delete() {
      const params = new URLSearchParams();
      this._filters.forEach(f => { const [k, v] = f.split("="); params.append(k, v.replace(/^eq\./, "")); });
      const res = await fetch(`${SUPABASE_URL}/rest/v1/${this._table}?${params}`, {
        method: "DELETE",
        headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}` }
      });
      return { error: res.ok ? null : await res.json() };
    }
  })
};

// ── Styles ────────────────────────────────────────────────────────────────────
const fontLink = document.createElement("link");
fontLink.rel = "stylesheet";
fontLink.href = "https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500;600&display=swap";
document.head.appendChild(fontLink);

const css = `
  *{box-sizing:border-box;margin:0;padding:0}
  body{background:#0f1117}
  :root{--bg:#0f1117;--sur:#181c27;--sur2:#1f2436;--bdr:rgba(255,255,255,0.07);--gold:#c8a96e;--gdim:rgba(200,169,110,0.15);--txt:#e8e4dc;--mut:#8a8fa8;--red:#e05c5c;--grn:#4caf7a;--blu:#5b8dee}
  .wrap{display:flex;min-height:100vh;font-family:'DM Sans',sans-serif;background:var(--bg);color:var(--txt)}
  .sidebar{width:224px;min-height:100vh;background:var(--sur);border-right:1px solid var(--bdr);display:flex;flex-direction:column;position:fixed;top:0;left:0;bottom:0;z-index:10;overflow-y:auto}
  .logo{padding:22px 20px 18px;border-bottom:1px solid var(--bdr)}
  .logo h1{font-family:'Syne',sans-serif;font-size:12px;font-weight:800;letter-spacing:.14em;text-transform:uppercase;color:var(--gold)}
  .logo p{font-size:11px;color:var(--mut);margin-top:2px}
  .nav{display:flex;flex-direction:column;gap:2px;padding:14px 10px;flex:1}
  .nb{display:flex;align-items:center;gap:9px;padding:8px 12px;border-radius:8px;background:none;border:none;color:var(--mut);font-family:'DM Sans',sans-serif;font-size:13px;font-weight:500;cursor:pointer;transition:all .13s;text-align:left;width:100%}
  .nb:hover{background:var(--sur2);color:var(--txt)}
  .nb.active{background:var(--gdim);color:var(--gold)}
  .nb-ic{font-size:14px;width:18px;text-align:center}
  .bdg{margin-left:auto;background:var(--gold);color:#0f1117;font-size:10px;font-weight:700;border-radius:10px;padding:1px 6px;font-family:'Syne',sans-serif;min-width:18px;text-align:center}
  .bdg-r{background:var(--red);color:#fff}
  .ustrip{padding:14px 14px 18px;border-top:1px solid var(--bdr)}
  .ulbl{font-size:10px;font-weight:700;letter-spacing:.09em;text-transform:uppercase;color:var(--mut);margin-bottom:7px;font-family:'Syne',sans-serif}
  .mpill{display:flex;align-items:center;gap:8px;padding:6px 8px;border-radius:8px;cursor:pointer;transition:background .12s;border:1px solid transparent;width:100%;background:none;text-align:left}
  .mpill:hover{background:var(--sur2)}
  .mpill.sel{background:var(--gdim);border-color:rgba(200,169,110,.3)}
  .pname{font-size:12px;font-weight:600;color:var(--txt)}
  .prole{font-size:10px;color:var(--mut)}
  .main{margin-left:224px;flex:1;padding:28px 32px;max-width:calc(100vw - 224px)}
  .pghd{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:22px}
  .pghd h2{font-family:'Syne',sans-serif;font-size:20px;font-weight:700}
  .pghd p{font-size:13px;color:var(--mut);margin-top:3px}
  .card{background:var(--sur);border:1px solid var(--bdr);border-radius:12px;padding:18px;margin-bottom:12px}
  .card-sm{padding:13px 16px}
  .card-hi{border-color:rgba(200,169,110,.4)}
  .grid2{display:grid;grid-template-columns:1fr 1fr;gap:13px}
  .btn{display:inline-flex;align-items:center;gap:6px;padding:7px 14px;border-radius:8px;border:none;font-family:'DM Sans',sans-serif;font-size:12.5px;font-weight:500;cursor:pointer;transition:all .13s;white-space:nowrap}
  .btn:disabled{opacity:.5;cursor:default}
  .btn-gold{background:var(--gold);color:#0f1117}.btn-gold:hover{background:#d4b57a}
  .btn-ghost{background:var(--sur2);color:var(--txt);border:1px solid var(--bdr)}.btn-ghost:hover:not(:disabled){border-color:var(--gold);color:var(--gold)}
  .btn-ol{background:transparent;color:var(--gold);border:1px solid var(--gold)}.btn-ol:hover{background:var(--gdim)}
  .btn-gr{background:rgba(76,175,122,.18);color:var(--grn);border:1px solid rgba(76,175,122,.3)}.btn-gr:hover{background:rgba(76,175,122,.28)}
  .input{width:100%;background:var(--sur2);border:1px solid var(--bdr);border-radius:8px;padding:9px 13px;font-family:'DM Sans',sans-serif;font-size:13px;color:var(--txt);outline:none;transition:border .13s}
  .input:focus{border-color:var(--gold)}.input::placeholder{color:var(--mut)}
  textarea.input{resize:vertical;min-height:70px}
  select.input option{background:#1f2436}
  .av{display:inline-flex;align-items:center;justify-content:center;border-radius:50%;font-family:'Syne',sans-serif;font-weight:700;flex-shrink:0}
  .av-lg{width:36px;height:36px;font-size:11px}.av-sm{width:28px;height:28px;font-size:10px}.av-xs{width:22px;height:22px;font-size:8px}
  .c1{background:var(--gold);color:#0f1117}.c2{background:#5b8dee;color:#fff}.c3{background:#e05c8a;color:#fff}.c4{background:#4caf7a;color:#fff}.c5{background:#9c6ee0;color:#fff}.c6{background:#e07a5c;color:#fff}
  .tag{display:inline-block;padding:2px 9px;border-radius:20px;font-size:11px;font-weight:500}
  .tg{background:var(--gdim);color:var(--gold);border:1px solid rgba(200,169,110,.3)}
  .tb{background:rgba(91,141,238,.15);color:#5b8dee;border:1px solid rgba(91,141,238,.3)}
  .tgr{background:rgba(76,175,122,.15);color:#4caf7a;border:1px solid rgba(76,175,122,.3)}
  .tr{background:rgba(224,92,92,.15);color:#e05c5c;border:1px solid rgba(224,92,92,.3)}
  .tp{background:rgba(156,110,224,.15);color:#9c6ee0;border:1px solid rgba(156,110,224,.3)}
  .row{display:flex;align-items:flex-start;gap:10px}
  .rowc{display:flex;align-items:center;gap:9px}
  .meta{font-size:11.5px;color:var(--mut)}
  .lbl{font-size:10.5px;font-weight:700;text-transform:uppercase;letter-spacing:.09em;color:var(--mut);margin-bottom:7px;font-family:'Syne',sans-serif}
  .stitle{font-family:'Syne',sans-serif;font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:.12em;color:var(--gold);margin-bottom:13px}
  .divider{border:none;border-top:1px solid var(--bdr);margin:13px 0}
  .vw{background:var(--sur2);border-radius:6px;height:5px;overflow:hidden;margin-top:5px}
  .vb{height:100%;background:var(--gold);border-radius:6px;transition:width .4s}
  .modal-bg{position:fixed;inset:0;background:rgba(0,0,0,.75);z-index:100;display:flex;align-items:center;justify-content:center;padding:20px}
  .modal{background:var(--sur);border:1px solid var(--bdr);border-radius:16px;padding:26px;width:460px;max-width:100%;max-height:85vh;overflow-y:auto}
  .modal h3{font-family:'Syne',sans-serif;font-size:16px;font-weight:700;margin-bottom:4px}
  .ni{display:flex;gap:10px;padding:12px 0;border-bottom:1px solid var(--bdr);cursor:pointer}
  .ni:last-child{border-bottom:none}.ni:hover{opacity:.8}
  .nd{width:7px;height:7px;border-radius:50%;background:var(--gold);margin-top:5px;flex-shrink:0}
  .nd.read{background:transparent;border:1px solid var(--bdr)}
  .ypill{display:inline-block;background:var(--gdim);color:var(--gold);border:1px solid rgba(200,169,110,.3);padding:0 6px;border-radius:10px;font-size:10px;font-weight:600;margin-left:4px;vertical-align:middle}
  .info-box{background:var(--sur2);border-radius:10px;border:1px solid var(--bdr);padding:14px 16px;font-size:12px;color:var(--mut);line-height:1.7}
  .spinner{display:inline-block;width:16px;height:16px;border:2px solid rgba(200,169,110,.3);border-top-color:var(--gold);border-radius:50%;animation:spin .6s linear infinite}
  @keyframes spin{to{transform:rotate(360deg)}}
  .loading-state{display:flex;align-items:center;gap:10px;padding:20px;color:var(--mut);font-size:13px}
  .error-banner{background:rgba(224,92,92,.15);border:1px solid rgba(224,92,92,.3);border-radius:8px;padding:12px 16px;color:var(--red);font-size:13px;margin-bottom:14px}
`;
const styleEl = document.createElement("style");
styleEl.textContent = css;
document.head.appendChild(styleEl);

// ── Static member data (auth/profiles would replace this in a full build) ─────
const MEMBERS = [
  { id: "m1", name: "You", short: "Focus Studio", role: "Workplace Design & Furniture", av: "YO", c: "c1", groups: ["NAIOP", "CoreNet Global", "BNI Downtown", "ULI Young Leaders"], contacts: ["Hines Real Estate", "CBRE Project Mgmt", "WeWork Facilities", "Ware Malcomb"] },
  { id: "m2", name: "Jake Torres", short: "Torres Construction", role: "General Contractor", av: "JT", c: "c2", groups: ["AGC", "NAIOP", "Rotary Club", "ABC SoCal"], contacts: ["Brookfield Properties", "Lincoln Property", "Transwestern", "Greystar"] },
  { id: "m3", name: "Maria Chen", short: "Pacific Risk Partners", role: "Commercial Insurance", av: "MC", c: "c3", groups: ["RIMS", "Ind. Insurance Agents", "WEConnect", "BOMA"], contacts: ["Lockton", "Gallagher", "AmTrust", "Zurich NA"] },
  { id: "m4", name: "Derek Sullivan", short: "Sullivan Financial", role: "Financial Planner", av: "DS", c: "c4", groups: ["NAPFA", "FPA", "YPO", "Chamber of Commerce"], contacts: ["BofA Merrill Lynch", "Raymond James", "Edward Jones"] },
  { id: "m5", name: "Priya Nair", short: "Nair Structural", role: "Structural Engineer", av: "PN", c: "c5", groups: ["ASCE", "SEAOC", "WTS International"], contacts: ["Gensler", "HKS Architects", "Perkins & Will", "HOK"] },
  { id: "m6", name: "Tom Buckley", short: "Buckley Electric", role: "Electrician", av: "TB", c: "c6", groups: ["IBEW", "NECA", "ABC SoCal"], contacts: ["JLL", "Cushman & Wakefield", "Colliers"] },
];
const gm = (id) => MEMBERS.find(m => m.id === id) || MEMBERS[0];
const fmtTime = (ts) => { if (!ts) return ""; const d = new Date(ts); const diff = Date.now() - d; if (diff < 60000) return "Just now"; if (diff < 3600000) return `${Math.floor(diff/60000)}m ago`; if (diff < 86400000) return `${Math.floor(diff/3600000)}h ago`; return `${Math.floor(diff/86400000)}d ago`; };

function Av({ id, sz = "av-lg" }) {
  const m = gm(id);
  return <span className={`av ${sz} ${m.c}`}>{m.av}</span>;
}

function Loading() { return <div className="loading-state"><span className="spinner" /><span>Loading…</span></div>; }
function ErrBanner({ msg }) { return msg ? <div className="error-banner">⚠ {msg}</div> : null; }

// ── FEED ──────────────────────────────────────────────────────────────────────
function FeedTab({ me }) {
  const [posts, setPosts] = useState([]);
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    setLoading(true);
    sb.from("posts").order("created_at", { ascending: false }).select()
      .then(({ data, error }) => { if (!error) setPosts(data); else setErr("Couldn't load posts."); setLoading(false); });
  }, []);

  const post = async () => {
    if (!draft.trim()) return;
    setSaving(true);
    const { data, error } = await sb.from("posts").insert({ author_id: me.id, content: draft });
    if (!error && data[0]) { setPosts(p => [data[0], ...p]); setDraft(""); }
    else setErr("Couldn't save post.");
    setSaving(false);
  };

  return (
    <div>
      <div className="card card-hi" style={{ marginBottom: 14 }}>
        <p className="lbl">Post an Update</p>
        <textarea className="input" placeholder="Share intel, a win, a resource, a heads up…" value={draft} onChange={e => setDraft(e.target.value)} rows={3} />
        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 9 }}>
          <button className="btn btn-gold" onClick={post} disabled={saving}>{saving ? <span className="spinner" /> : "Post ↑"}</button>
        </div>
      </div>
      <ErrBanner msg={err} />
      {loading ? <Loading /> : posts.map(p => {
        const m = gm(p.author_id); const isMe = p.author_id === me.id;
        return (
          <div className="card" key={p.id}>
            <div className="rowc" style={{ marginBottom: 10 }}>
              <Av id={p.author_id} />
              <div style={{ flex: 1 }}>
                <span style={{ fontSize: 13.5, fontWeight: 600 }}>{isMe ? "You" : m.name}</span>
                {isMe && <span className="ypill">you</span>}
                <span className="meta" style={{ marginLeft: 6 }}>· {m.role}</span>
                <div className="meta">{fmtTime(p.created_at)}</div>
              </div>
            </div>
            <p style={{ fontSize: 13.5, lineHeight: 1.65 }}>{p.content}</p>
          </div>
        );
      })}
    </div>
  );
}

// ── MEETINGS ──────────────────────────────────────────────────────────────────
function MeetingTab({ me }) {
  const [options, setOptions] = useState([]);
  const [votes, setVotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    Promise.all([
      sb.from("meeting_options").order("created_at", { ascending: true }).select(),
      sb.from("votes").select()
    ]).then(([opts, vs]) => {
      if (!opts.error) setOptions(opts.data);
      if (!vs.error) setVotes(vs.data);
      if (opts.error || vs.error) setErr("Couldn't load meeting data.");
      setLoading(false);
    });
  }, []);

  const myVotes = votes.filter(v => v.member_id === me.id).map(v => v.option_id);
  const maxV = Math.max(...options.map(o => votes.filter(v => v.option_id === o.id).length), 0);

  const toggle = async (optId) => {
    const has = myVotes.includes(optId);
    if (has) {
      const existing = votes.find(v => v.option_id === optId && v.member_id === me.id);
      if (existing) {
        await sb.from("votes").eq("id", existing.id).delete();
        setVotes(p => p.filter(v => !(v.option_id === optId && v.member_id === me.id)));
      }
    } else {
      const { data } = await sb.from("votes").insert({ option_id: optId, member_id: me.id });
      if (data[0]) setVotes(p => [...p, data[0]]);
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="card">
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14 }}>
        <div><p className="stitle" style={{ marginBottom: 2 }}>Active Vote</p>
          <h3 style={{ fontFamily: "'Syne',sans-serif", fontSize: 16, fontWeight: 700 }}>Q2 Connection Collective Meetup</h3>
          <p className="meta">Vote for your top dates — multiple picks ok</p></div>
        <span className="tag tgr">Open</span>
      </div>
      <div style={{ borderTop: "1px solid var(--bdr)", paddingTop: 14, display: "flex", flexDirection: "column", gap: 10 }}>
        <ErrBanner msg={err} />
        {options.length === 0 && <p className="meta">No meeting dates posted yet.</p>}
        {options.map(opt => {
          const optVotes = votes.filter(v => v.option_id === opt.id);
          const pct = maxV > 0 ? Math.round((optVotes.length / maxV) * 100) : 0;
          const mine = myVotes.includes(opt.id);
          const winning = optVotes.length === maxV && maxV > 0;
          return (
            <div key={opt.id} style={{ background: "var(--sur2)", borderRadius: 10, padding: "12px 14px", border: winning ? "1px solid rgba(200,169,110,.4)" : "1px solid var(--bdr)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <div className="rowc">
                  <span style={{ fontSize: 13.5, fontWeight: 600 }}>{opt.label}</span>
                  <span className="meta">{opt.sub}</span>
                  {winning && <span className="tag tg" style={{ fontSize: 10 }}>Leading</span>}
                </div>
                <div className="rowc">
                  <span className="meta">{optVotes.length} vote{optVotes.length !== 1 ? "s" : ""}</span>
                  <button className={`btn ${mine ? "btn-gold" : "btn-ghost"}`} style={{ padding: "4px 12px" }} onClick={() => toggle(opt.id)}>{mine ? "✓ In" : "Vote"}</button>
                </div>
              </div>
              <div className="vw"><div className="vb" style={{ width: `${pct}%` }} /></div>
              <div style={{ marginTop: 6, display: "flex", gap: 4 }}>
                {optVotes.map(v => <Av key={v.id} id={v.member_id} sz="av-xs" />)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── MEMBERS ───────────────────────────────────────────────────────────────────
function MembersTab({ me, onAskIntro }) {
  const [sel, setSel] = useState(null);
  if (sel) return (
    <div>
      <button className="btn btn-ghost" style={{ marginBottom: 16 }} onClick={() => setSel(null)}>← Back</button>
      <div className="card">
        <div className="rowc" style={{ marginBottom: 14 }}>
          <Av id={sel.id} />
          <div><div style={{ fontSize: 16, fontWeight: 700, fontFamily: "'Syne',sans-serif" }}>{sel.id === me.id ? "You" : sel.name}{sel.id === me.id && <span className="ypill">you</span>}</div><div className="meta">{sel.short} · {sel.role}</div></div>
        </div>
        <div style={{ borderTop: "1px solid var(--bdr)", paddingTop: 14, marginBottom: 16 }}>
          <p className="lbl">Networking Groups</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>{sel.groups.map(g => <span key={g} className="tag tb">{g}</span>)}</div>
        </div>
        <div>
          <p className="lbl">Outside Contacts — Request an Intro</p>
          <p style={{ fontSize: 12, color: "var(--mut)", marginBottom: 10 }}>{sel.id === me.id ? "Your connections that others can request intros to." : `Ask ${sel.name} to introduce you to one of their outside contacts.`}</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
            {sel.contacts.map(c => (
              <div key={c} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "var(--sur2)", borderRadius: 8, padding: "9px 13px" }}>
                <span style={{ fontSize: 13.5 }}>{c}</span>
                {sel.id !== me.id && <button className="btn btn-ol" style={{ padding: "4px 11px", fontSize: 11.5 }} onClick={() => onAskIntro(sel, c)}>Request Intro</button>}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
  return (
    <div>
      <p style={{ fontSize: 13, color: "var(--mut)", marginBottom: 16, lineHeight: 1.6 }}>Click any member to see their networking groups and request an introduction to one of their outside contacts.</p>
      <div className="grid2">
        {MEMBERS.map(m => (
          <div key={m.id} className="card" style={{ cursor: "pointer" }} onClick={() => setSel(m)}
            onMouseEnter={e => e.currentTarget.style.borderColor = "rgba(200,169,110,.35)"}
            onMouseLeave={e => e.currentTarget.style.borderColor = "rgba(255,255,255,.07)"}>
            <div className="rowc" style={{ marginBottom: 9 }}><Av id={m.id} /><div><div style={{ fontSize: 13.5, fontWeight: 600 }}>{m.id === me.id ? "You" : m.name}{m.id === me.id && <span className="ypill">you</span>}</div><div className="meta">{m.role}</div></div></div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 8 }}>
              {m.groups.slice(0, 2).map(g => <span key={g} className="tag tb" style={{ fontSize: 10 }}>{g}</span>)}
              {m.groups.length > 2 && <span className="tag tg" style={{ fontSize: 10 }}>+{m.groups.length - 2}</span>}
            </div>
            <div style={{ fontSize: 11.5, color: "var(--mut)" }}>{m.contacts.length} outside contacts · <span style={{ color: "var(--gold)" }}>View →</span></div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── INTROS ────────────────────────────────────────────────────────────────────
function IntrosTab({ me, onCountChange }) {
  const [intros, setIntros] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const load = useCallback(() => {
    sb.from("intro_requests").order("created_at", { ascending: false }).select()
      .then(({ data, error }) => { if (!error) { setIntros(data); onCountChange(data.filter(i => i.via_member_id === me.id && i.status === "Pending").length); } else setErr("Couldn't load intros."); setLoading(false); });
  }, [me.id]);

  useEffect(() => { load(); }, [load]);

  const update = async (id, status) => {
    const { error } = await sb.from("intro_requests").eq("id", id).update({ status });
    if (!error) { setIntros(p => p.map(i => i.id === id ? { ...i, status } : i)); onCountChange(intros.filter(i => i.via_member_id === me.id && i.status === "Pending" && i.id !== id).length); }
    else setErr("Couldn't update.");
  };

  const SC = { Pending: "tg", Connected: "tgr", Declined: "tr" };
  const myPending = intros.filter(i => i.via_member_id === me.id && i.status === "Pending");
  const myRequests = intros.filter(i => i.requester_id === me.id);
  const other = intros.filter(i => i.requester_id !== me.id && i.via_member_id !== me.id);

  const Card = ({ req }) => {
    const requester = gm(req.requester_id); const via = gm(req.via_member_id);
    const isRid = req.requester_id === me.id; const isTid = req.via_member_id === me.id;
    return (
      <div className={`card ${isTid && req.status === "Pending" ? "card-hi" : ""}`}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 9 }}>
          <div style={{ fontSize: 13 }}>
            <strong>{isRid ? "You" : requester.name}</strong><span className="meta"> → asking </span><strong>{isTid ? "You" : via.name}</strong><span className="meta"> for an outside intro</span>
          </div>
          <span className={`tag ${SC[req.status] || "tg"}`}>{req.status}</span>
        </div>
        <div style={{ background: "var(--sur2)", borderRadius: 8, padding: "10px 13px", marginBottom: 9 }}>
          <div className="meta" style={{ marginBottom: 3 }}>Contact: <strong style={{ color: "var(--txt)" }}>{req.outside_contact}</strong></div>
          <p style={{ fontSize: 13, color: "var(--mut)", lineHeight: 1.6 }}>{req.reason}</p>
        </div>
        <div className="meta">{fmtTime(req.created_at)}</div>
        {isTid && req.status === "Pending" && (
          <div style={{ display: "flex", gap: 7, marginTop: 10 }}>
            <button className="btn btn-gr" onClick={() => update(req.id, "Connected")}>✓ Make the Intro</button>
            <button className="btn btn-ghost" onClick={() => update(req.id, "Declined")}>Decline</button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div>
      <div className="info-box" style={{ marginBottom: 18 }}>
        <strong style={{ color: "var(--txt)" }}>How this works:</strong> Browse a member's profile → click "Request Intro" on any of their outside contacts → they get notified and can make the introduction. Everything is tracked here so nothing falls through the cracks.
      </div>
      <ErrBanner msg={err} />
      {loading ? <Loading /> : <>
        {myPending.length > 0 && <div style={{ marginBottom: 18 }}><p className="stitle">Needs Your Action ({myPending.length})</p>{myPending.map(r => <Card key={r.id} req={r} />)}</div>}
        {myRequests.length > 0 && <div style={{ marginBottom: 18 }}><p className="stitle">Your Requests</p>{myRequests.map(r => <Card key={r.id} req={r} />)}</div>}
        {other.length > 0 && <div><p className="stitle">All Activity</p>{other.map(r => <Card key={r.id} req={r} />)}</div>}
        {intros.length === 0 && <div style={{ textAlign: "center", padding: "40px", color: "var(--mut)", fontSize: 13 }}>No intro requests yet. Browse Members to get started.</div>}
      </>}
    </div>
  );
}

// ── CONNECT BOARD ─────────────────────────────────────────────────────────────
function ConnectTab({ me }) {
  const [items, setItems] = useState([]);
  const [helpers, setHelpers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [composing, setComposing] = useState(false);
  const [draft, setDraft] = useState({ target: "", industry: "", note: "" });
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    Promise.all([
      sb.from("connect_targets").order("created_at", { ascending: false }).select(),
      sb.from("connect_helpers").select()
    ]).then(([its, hs]) => {
      if (!its.error) setItems(its.data);
      if (!hs.error) setHelpers(hs.data);
      if (its.error || hs.error) setErr("Couldn't load connect board.");
      setLoading(false);
    });
  }, []);

  const post = async () => {
    if (!draft.target.trim()) return;
    setSaving(true);
    const { data, error } = await sb.from("connect_targets").insert({ author_id: me.id, target: draft.target, industry: draft.industry, note: draft.note });
    if (!error && data[0]) { setItems(p => [data[0], ...p]); setDraft({ target: "", industry: "", note: "" }); setComposing(false); }
    else setErr("Couldn't save.");
    setSaving(false);
  };

  const helpWith = async (targetId) => {
    const { data, error } = await sb.from("connect_helpers").insert({ target_id: targetId, member_id: me.id });
    if (!error && data[0]) setHelpers(p => [...p, data[0]]);
    else setErr("Couldn't save.");
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
        <p style={{ fontSize: 13, color: "var(--mut)", maxWidth: 460, lineHeight: 1.65 }}>Post
