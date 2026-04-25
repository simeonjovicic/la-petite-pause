"use client";

import { useState, useEffect, CSSProperties } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

/* ══════════════════════════════════════════════════════════════
   DATA
   ══════════════════════════════════════════════════════════════ */

type Base = { id: string; name: string; cal: number; color: string; desc: string };
type Protein = { id: string; name: string; cal: number; color: string; dot: string };
type Topping = { id: string; name: string; color: string; light: string };
type Sauce = { id: string; name: string; color: string; desc: string };
type Combo = { id: string; name: string; base: string; protein: string; toppings: string[]; sauce: string; emoji: string };

const BASES: Base[] = [
  { id: "rice", name: "Weißer Reis", cal: 200, color: "#f0ebe0", desc: "Gedämpfter Jasminreis" },
  { id: "quinoa", name: "Quinoa", cal: 180, color: "#d9cab3", desc: "Proteinreiches Korn" },
  { id: "salad", name: "Blattsalat", cal: 40, color: "#a8c89e", desc: "Frisch & knackig" },
];

const PROTEINS: Protein[] = [
  { id: "salmon", name: "Lachs", cal: 180, color: "#f4856a", dot: "#e06048" },
  { id: "tuna", name: "Thunfisch", cal: 160, color: "#e85d6a", dot: "#c43a50" },
  { id: "tofu", name: "Tofu", cal: 100, color: "#f0dfa8", dot: "#c8b07a" },
  { id: "chicken", name: "Hühnchen", cal: 140, color: "#e8c46a", dot: "#c09040" },
];

const TOPPINGS: Topping[] = [
  { id: "avocado", name: "Avocado", color: "#5a8c5a", light: "#c5ddb4" },
  { id: "edamame", name: "Edamame", color: "#6a9c38", light: "#c8e0a0" },
  { id: "cucumber", name: "Gurke", color: "#4a9e78", light: "#aadfc8" },
  { id: "mango", name: "Mango", color: "#e09040", light: "#ffd98a" },
  { id: "seaweed", name: "Seetang", color: "#2d5c40", light: "#8abea0" },
  { id: "sesame", name: "Sesam", color: "#9a8060", light: "#e8dcc8" },
  { id: "greens", name: "Greens", color: "#5c9060", light: "#b8d8b0" },
  { id: "corn", name: "Mais", color: "#c8a020", light: "#fce88a" },
];

const SAUCES: Sauce[] = [
  { id: "teriyaki", name: "Teriyaki", color: "#8b4513", desc: "Süß & herzhaft" },
  { id: "sesame", name: "Sesam", color: "#c8924a", desc: "Nussig & reichhaltig" },
  { id: "spicymayo", name: "Spicy Mayo", color: "#e05030", desc: "Cremig-scharf" },
  { id: "ponzu", name: "Ponzu", color: "#607080", desc: "Zitrus & leicht" },
];

const POPULAR_COMBOS: Combo[] = [
  { id: "c1", name: "La Classique", base: "rice", protein: "salmon", toppings: ["avocado", "edamame", "cucumber"], sauce: "ponzu", emoji: "⭐" },
  { id: "c2", name: "Spicy Tuna", base: "rice", protein: "tuna", toppings: ["seaweed", "cucumber", "sesame"], sauce: "spicymayo", emoji: "🔥" },
  { id: "c3", name: "Garden Bowl", base: "salad", protein: "tofu", toppings: ["avocado", "mango", "greens"], sauce: "sesame", emoji: "🌿" },
];

const BASE_PRICE = 12.9;
const TOPPING_PRICE = 0.8;
const STEPS = ["Basis", "Protein", "Toppings", "Sauce"];
const ACCENT = "#2d6a4f";

/* ══════════════════════════════════════════════════════════════
   SMALL COMPONENTS
   ══════════════════════════════════════════════════════════════ */

function Tag({ label, color }: { label: string; color: string }) {
  return (
    <span
      style={{
        display: "inline-block", padding: "3px 10px", borderRadius: 20,
        fontSize: 11, fontWeight: 500,
        background: color + "15", color, border: `1px solid ${color}30`,
        margin: "2px",
      }}
    >
      {label}
    </span>
  );
}

/* ── Bowl SVG Preview ── */
function BowlPreview({ base, protein, toppings, sauce }: {
  base: string | null; protein: string | null; toppings: string[]; sauce: string | null;
}) {
  const baseObj = BASES.find((b) => b.id === base);
  const proteinObj = PROTEINS.find((p) => p.id === protein);
  const toppingObjs = toppings.map((t) => TOPPINGS.find((x) => x.id === t)).filter(Boolean) as Topping[];
  const sauceObj = SAUCES.find((s) => s.id === sauce);

  const toppingPositions = [
    { cx: 105, cy: 115 }, { cx: 145, cy: 95 }, { cx: 170, cy: 130 }, { cx: 120, cy: 150 },
    { cx: 155, cy: 160 }, { cx: 90, cy: 140 }, { cx: 175, cy: 105 }, { cx: 110, cy: 80 },
  ];
  const proteinPositions = [
    { x: 92, y: 108, w: 44, h: 24 },
    { x: 138, y: 98, w: 40, h: 22 },
    { x: 115, y: 138, w: 46, h: 22 },
  ];

  const isEmpty = !base && !protein && toppings.length === 0;

  return (
    <div style={{ padding: "16px 0 8px", textAlign: "center" }}>
      <svg viewBox="0 0 270 270" style={{ width: "100%", maxWidth: 260, display: "block", margin: "0 auto" }}>
        <ellipse cx="135" cy="240" rx="90" ry="12" fill="rgba(0,0,0,0.08)" />
        <circle cx="135" cy="130" r="105" fill="#e8e2d8" />
        <circle cx="135" cy="130" r="100" fill="#f0ebe2" />
        <clipPath id="bowlClip"><circle cx="135" cy="130" r="94" /></clipPath>
        <circle cx="135" cy="130" r="94" fill={baseObj ? baseObj.color : "#f8f4ee"} style={{ transition: "fill 0.5s" }} />

        {base === "rice" && [0, 1, 2, 3, 4].map((i) => (
          <ellipse key={i} cx={100 + i * 14} cy={130} rx="5" ry="3" fill="rgba(255,255,255,0.5)" clipPath="url(#bowlClip)" />
        ))}
        {base === "salad" && [0, 1, 2, 3, 4, 5].map((i) => (
          <path key={i} d={`M${88 + i * 13},${118 + (i % 2) * 16} q6,-8 12,0 q6,8 12,0`} stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" fill="none" clipPath="url(#bowlClip)" />
        ))}

        <g clipPath="url(#bowlClip)">
          {proteinObj && proteinPositions.map((pos, i) => (
            <g key={i} style={{ animation: `fadeIn 0.4s ${i * 0.1}s both` }}>
              <ellipse cx={pos.x + pos.w / 2} cy={pos.y + pos.h / 2} rx={pos.w / 2} ry={pos.h / 2} fill={proteinObj.color} />
              <ellipse cx={pos.x + pos.w / 2 - 4} cy={pos.y + pos.h / 2 - 3} rx={pos.w / 4} ry={pos.h / 4} fill="rgba(255,255,255,0.25)" />
            </g>
          ))}
        </g>

        <g clipPath="url(#bowlClip)">
          {toppingObjs.map((t, i) => {
            const pos = toppingPositions[i % toppingPositions.length];
            return (
              <g key={t.id} style={{ animation: "popIn 0.35s ease both" }}>
                <circle cx={pos.cx} cy={pos.cy} r="14" fill={t.light} />
                <circle cx={pos.cx} cy={pos.cy} r="9" fill={t.color} />
                <circle cx={pos.cx - 3} cy={pos.cy - 3} r="3" fill="rgba(255,255,255,0.4)" />
              </g>
            );
          })}
        </g>

        {sauceObj && (
          <path
            d="M80,110 q20,-15 35,5 q15,20 35,0 q20,-20 35,5"
            stroke={sauceObj.color} strokeWidth="3.5" fill="none" strokeLinecap="round"
            clipPath="url(#bowlClip)" opacity="0.85"
            style={{ animation: "dashIn 0.6s ease forwards", strokeDasharray: 200, strokeDashoffset: 0 }}
          />
        )}

        <path d="M55,100 q80,-60 160,0" stroke="rgba(255,255,255,0.5)" strokeWidth="6" fill="none" strokeLinecap="round" />

        {isEmpty && (
          <text x="135" y="138" textAnchor="middle" fontSize="13" fill="#a09080" fontFamily="DM Sans, sans-serif">
            Wähle unten aus ↓
          </text>
        )}
      </svg>

      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 2, padding: "8px 12px 0", minHeight: 32 }}>
        {baseObj && <Tag label={baseObj.name} color="#2d6a4f" />}
        {proteinObj && <Tag label={proteinObj.name} color="#8b4513" />}
        {toppingObjs.slice(0, 3).map((t) => <Tag key={t.id} label={t.name} color="#607060" />)}
        {toppingObjs.length > 3 && <Tag label={`+${toppingObjs.length - 3} mehr`} color="#909090" />}
        {sauceObj && <Tag label={sauceObj.name} color="#4a6080" />}
      </div>
    </div>
  );
}

/* ── Step Nav ── */
function StepNav({ step, onStep }: { step: number; onStep: (s: number) => void }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
      <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
        {STEPS.map((s, i) => (
          <button
            key={i}
            className={`step-dot ${i === step ? "active" : i < step ? "done" : ""}`}
            onClick={() => i <= step && onStep(i)}
            title={s}
          />
        ))}
      </div>
      <span style={{ fontSize: 12, color: "#a09070", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase" }}>
        {STEPS[step]} &nbsp;<span style={{ color: "#c0b898" }}>{step + 1}/{STEPS.length}</span>
      </span>
    </div>
  );
}

/* ── Step Controls ── */
function StepControls({ step, setStep, base, protein }: {
  step: number; setStep: (fn: (s: number) => number) => void; base: string | null; protein: string | null;
}) {
  const canNext = step < STEPS.length - 1;
  const canBack = step > 0;
  const isBlocked = (step === 0 && !base) || (step === 1 && !protein);

  const btnStyle = (bg: string, color: string, border: string): CSSProperties => ({
    padding: "10px 24px", borderRadius: 12, border: `1.5px solid ${border}`,
    background: bg, color, fontWeight: 600, fontSize: 14, cursor: "pointer",
    transition: "all 0.2s",
  });

  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 20 }}>
      {canBack ? (
        <button onClick={() => setStep((s) => s - 1)} style={btnStyle("#fff", "#2a2a22", "#d8d0c0")}>
          ← Zurück
        </button>
      ) : <div />}
      {canNext && (
        <button
          onClick={() => !isBlocked && setStep((s) => s + 1)}
          style={{
            ...btnStyle(ACCENT, "#fff", ACCENT),
            opacity: isBlocked ? 0.4 : 1,
            cursor: isBlocked ? "not-allowed" : "pointer",
          }}
        >
          Weiter →
        </button>
      )}
    </div>
  );
}

/* ── Step: Base ── */
function BaseStep({ base, setBase }: { base: string | null; setBase: (b: string) => void }) {
  return (
    <div style={slideStyle}>
      <h3 style={titleStyle}>Wähle deine Basis</h3>
      <p style={subStyle}>Das Fundament deiner Bowl</p>
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center" }}>
        {BASES.map((b) => (
          <button key={b.id} onClick={() => setBase(b.id)} style={{
            ...cardStyle,
            background: base === b.id ? "#2d6a4f" : "#ffffff",
            color: base === b.id ? "#ffffff" : "#2a2a22",
            transform: "scale(1)",
            boxShadow: base === b.id ? "0 6px 20px rgba(45,106,79,0.3)" : "0 2px 12px rgba(0,0,0,0.07)",
          }}>
            <div style={{
              width: 64, height: 64, borderRadius: "50%", margin: "0 auto 10px",
              background: b.color, border: `3px solid ${base === b.id ? "rgba(255,255,255,0.4)" : b.color}`,
            }} />
            <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 3 }}>{b.name}</div>
            <div style={{ fontSize: 11, opacity: 0.7 }}>{b.desc}</div>
            <div style={{ fontSize: 11, marginTop: 6, opacity: 0.6 }}>{b.cal} kcal</div>
          </button>
        ))}
      </div>
    </div>
  );
}

/* ── Step: Protein ── */
function ProteinStep({ protein, setProtein }: { protein: string | null; setProtein: (p: string) => void }) {
  return (
    <div style={slideStyle}>
      <h3 style={titleStyle}>Wähle dein Protein</h3>
      <p style={subStyle}>Frisch &amp; verantwortungsvoll bezogen</p>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        {PROTEINS.map((p) => (
          <button key={p.id} onClick={() => setProtein(p.id)} style={{
            ...cardStyle,
            background: protein === p.id ? "#2d6a4f" : "#ffffff",
            color: protein === p.id ? "#ffffff" : "#2a2a22",
            transform: "scale(1)",
            boxShadow: protein === p.id ? "0 6px 20px rgba(45,106,79,0.3)" : "0 2px 12px rgba(0,0,0,0.07)",
            display: "flex", alignItems: "center", gap: 12, padding: "14px 16px",
          }}>
            <div style={{
              width: 44, height: 44, borderRadius: "50%", flexShrink: 0,
              background: p.color, border: `3px solid ${protein === p.id ? "rgba(255,255,255,0.4)" : "transparent"}`,
            }} />
            <div style={{ textAlign: "left" }}>
              <div style={{ fontWeight: 600, fontSize: 15 }}>{p.name}</div>
              <div style={{ fontSize: 11, opacity: 0.7, marginTop: 2 }}>{p.cal} kcal</div>
            </div>
            {protein === p.id && <div style={{ marginLeft: "auto", fontSize: 16 }}>✓</div>}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ── Step: Toppings ── */
function ToppingsStep({ toppings, setToppings }: { toppings: string[]; setToppings: (fn: (prev: string[]) => string[]) => void }) {
  const toggle = (id: string) =>
    setToppings((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  return (
    <div style={slideStyle}>
      <h3 style={titleStyle}>Wähle deine Toppings</h3>
      <p style={subStyle}>Kombiniere frei — je +€0,80</p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
        {TOPPINGS.map((t) => {
          const sel = toppings.includes(t.id);
          return (
            <button key={t.id} onClick={() => toggle(t.id)} style={{
              ...toppingCardStyle,
              background: sel ? t.light : "#ffffff",
              border: `2px solid ${sel ? t.color : "#ede8e0"}`,
              transform: "scale(1)",
            }}>
              <div style={{ width: 36, height: 36, borderRadius: "50%", margin: "0 auto 6px", background: t.color, position: "relative" }}>
                {sel && (
                  <div style={{
                    position: "absolute", top: -6, right: -6, width: 16, height: 16,
                    background: "#2d6a4f", borderRadius: "50%", display: "flex",
                    alignItems: "center", justifyContent: "center", fontSize: 9, color: "#fff", fontWeight: 700,
                  }}>✓</div>
                )}
              </div>
              <div style={{ fontSize: 11, fontWeight: 600, color: sel ? t.color : "#3a3a30" }}>{t.name}</div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ── Step: Sauce ── */
function SauceStep({ sauce, setSauce }: { sauce: string | null; setSauce: (s: string) => void }) {
  return (
    <div style={slideStyle}>
      <h3 style={titleStyle}>Wähle deine Sauce</h3>
      <p style={subStyle}>Der letzte Schliff</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {SAUCES.map((s) => (
          <button key={s.id} onClick={() => setSauce(s.id)} style={{
            display: "flex", alignItems: "center", gap: 14, padding: "14px 18px",
            borderRadius: 16, border: `2px solid ${sauce === s.id ? s.color : "#ede8e0"}`,
            background: sauce === s.id ? s.color + "18" : "#ffffff",
            cursor: "pointer", transition: "all 0.2s", textAlign: "left" as const,
            transform: "scale(1)",
          }}>
            <div style={{ width: 20, height: 20, borderRadius: "50%", background: s.color, flexShrink: 0 }} />
            <div>
              <div style={{ fontWeight: 600, fontSize: 15, color: "#2a2a22" }}>{s.name}</div>
              <div style={{ fontSize: 12, color: "#807860", marginTop: 2 }}>{s.desc}</div>
            </div>
            <div style={{
              marginLeft: "auto", width: 20, height: 20, borderRadius: "50%",
              border: `2px solid ${sauce === s.id ? s.color : "#ccc"}`,
              background: sauce === s.id ? s.color : "transparent",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              {sauce === s.id && <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#fff" }} />}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

/* ── Popular Combos ── */
function PopularCombos({ onApply }: { onApply: (c: Combo) => void }) {
  return (
    <div style={{ padding: "20px 0 0" }}>
      <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.08em", color: "#a09070", textTransform: "uppercase", marginBottom: 10 }}>
        Beliebte Kombos
      </div>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        {POPULAR_COMBOS.map((c) => (
          <button key={c.id} onClick={() => onApply(c)} style={{
            padding: "8px 14px", borderRadius: 20, border: "1.5px solid #d8d0c0",
            background: "#ffffff", cursor: "pointer", fontSize: 13, fontWeight: 500,
            color: "#3a3a2a", display: "flex", alignItems: "center", gap: 6,
            transition: "all 0.18s",
          }}>
            <span>{c.emoji}</span> {c.name}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ── Cart Summary ── */
function CartSummary({ base, protein, toppings, sauce, qty, setQty, onAdd, added }: {
  base: string | null; protein: string | null; toppings: string[]; sauce: string | null;
  qty: number; setQty: (fn: (q: number) => number) => void; onAdd: () => void; added: boolean;
}) {
  const baseObj = BASES.find((b) => b.id === base);
  const proteinObj = PROTEINS.find((p) => p.id === protein);
  const toppingObjs = toppings.map((t) => TOPPINGS.find((x) => x.id === t)).filter(Boolean) as Topping[];
  const sauceObj = SAUCES.find((s) => s.id === sauce);
  const total = ((BASE_PRICE + toppingObjs.length * TOPPING_PRICE) * qty).toFixed(2);

  const [saved, setSaved] = useState(false);
  const saveFav = () => { setSaved(true); setTimeout(() => setSaved(false), 1800); };
  const share = () => {
    const text = `Meine La petite pause Bowl: ${baseObj?.name || "—"}, ${proteinObj?.name || "—"}, ${toppingObjs.map((t) => t.name).join(", ")}, ${sauceObj?.name || "—"}`;
    navigator.clipboard?.writeText(text).catch(() => {});
    alert("Bowl in die Zwischenablage kopiert!");
  };

  const items = [
    baseObj && { label: "Basis", name: baseObj.name },
    proteinObj && { label: "Protein", name: proteinObj.name },
    toppingObjs.length > 0 && { label: "Toppings", name: toppingObjs.map((t) => t.name).join(", ") },
    sauceObj && { label: "Sauce", name: sauceObj.name },
  ].filter(Boolean) as { label: string; name: string }[];

  return (
    <div style={{ padding: "16px 18px", background: "#ffffff", borderRadius: 20, boxShadow: "0 4px 24px rgba(0,0,0,0.07)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <span style={{ fontFamily: "var(--font-playfair), 'Playfair Display', serif", fontWeight: 700, fontSize: 17 }}>Deine Bowl</span>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={saveFav} title="Als Favorit speichern" style={iconBtnStyle}>{saved ? "❤️" : "🤍"}</button>
          <button onClick={share} title="Teilen" style={iconBtnStyle}>🔗</button>
        </div>
      </div>

      <div style={{ minHeight: 60, marginBottom: 8 }}>
        {items.map((item, i) => (
          <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "5px 0", borderBottom: "1px solid #f2ece0" }}>
            <span style={{ fontSize: 12, color: "#a09070", fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase" }}>{item.label}</span>
            <span style={{ fontSize: 13, color: "#2a2a22", textAlign: "right", maxWidth: "60%" }}>{item.name}</span>
          </div>
        ))}
        {items.length === 0 && (
          <div style={{ color: "#b0a890", fontSize: 13, textAlign: "center", padding: "12px 0" }}>Stelle deine Bowl oben zusammen ↑</div>
        )}
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderTop: "1px solid #eee8dc" }}>
        <div style={{ fontSize: 13, color: "#908070" }}>
          Basis €{BASE_PRICE.toFixed(2)}{toppingObjs.length > 0 && ` + €${(toppingObjs.length * TOPPING_PRICE).toFixed(2)}`}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <button onClick={() => setQty((q) => Math.max(1, q - 1))} style={qtyBtnStyle}>−</button>
          <span style={{ fontWeight: 700, fontSize: 15, minWidth: 20, textAlign: "center" }}>{qty}</span>
          <button onClick={() => setQty((q) => q + 1)} style={qtyBtnStyle}>+</button>
        </div>
      </div>

      <button onClick={onAdd} disabled={!base} style={{
        width: "100%", padding: 14, borderRadius: 14, border: "none",
        color: "#ffffff", fontWeight: 700, fontSize: 15, letterSpacing: "0.02em",
        transition: "all 0.2s",
        background: base ? ACCENT : "#ccc",
        cursor: base ? "pointer" : "not-allowed",
        transform: added ? "scale(0.97)" : "scale(1)",
      }}>
        {added ? "✓ Zum Warenkorb hinzugefügt!" : `In den Warenkorb · €${total}`}
      </button>
    </div>
  );
}

/* ── Shared styles ── */
const slideStyle: CSSProperties = { padding: "0 4px" };
const titleStyle: CSSProperties = { fontFamily: "var(--font-playfair), 'Playfair Display', serif", fontSize: 22, fontWeight: 700, color: "#1c1c18", margin: "0 0 4px", textAlign: "center" };
const subStyle: CSSProperties = { fontSize: 13, color: "#908070", textAlign: "center", marginBottom: 20, marginTop: 0 };
const cardStyle: CSSProperties = { padding: "18px 14px", borderRadius: 18, border: "none", cursor: "pointer", transition: "all 0.22s", minWidth: 110, flex: 1, textAlign: "center" };
const toppingCardStyle: CSSProperties = { padding: "12px 6px", borderRadius: 14, border: "2px solid #ede8e0", background: "#fff", cursor: "pointer", transition: "all 0.2s", textAlign: "center" };
const iconBtnStyle: CSSProperties = { width: 34, height: 34, borderRadius: "50%", border: "1.5px solid #e0d8c8", background: "#faf8f4", cursor: "pointer", fontSize: 15, display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s" };
const qtyBtnStyle: CSSProperties = { width: 30, height: 30, borderRadius: "50%", border: "1.5px solid #d8d0c0", background: "#faf8f4", cursor: "pointer", fontSize: 16, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" };

/* ══════════════════════════════════════════════════════════════
   MAIN PAGE
   ══════════════════════════════════════════════════════════════ */

export default function CustomizePage() {
  const [step, setStep] = useState(0);
  const [base, setBase] = useState<string | null>(null);
  const [protein, setProtein] = useState<string | null>(null);
  const [toppings, setToppings] = useState<string[]>([]);
  const [sauce, setSauce] = useState<string | null>(null);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const [isDesktop, setIsDesktop] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const check = () => setIsDesktop(window.innerWidth >= 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const handleAdd = () => {
    const toppingObjs = toppings.map((t) => TOPPINGS.find((x) => x.id === t)).filter(Boolean) as Topping[];
    const item = {
      id: Date.now().toString(),
      base, protein, toppings, sauce, qty,
      price: BASE_PRICE + toppingObjs.length * TOPPING_PRICE,
    };
    const existing = JSON.parse(localStorage.getItem("cart") || "[]");
    existing.push(item);
    localStorage.setItem("cart", JSON.stringify(existing));
    setAdded(true);
    setTimeout(() => {
      setAdded(false);
      router.push("/cart");
    }, 600);
  };

  const handleCombo = (combo: Combo) => {
    setBase(combo.base);
    setProtein(combo.protein);
    setToppings(combo.toppings);
    setSauce(combo.sauce);
    setStep(3);
  };

  const toppingObjs = toppings.map((t) => TOPPINGS.find((x) => x.id === t)).filter(Boolean) as Topping[];
  const total = ((BASE_PRICE + toppingObjs.length * TOPPING_PRICE) * qty).toFixed(2);

  const toggleTopping = (id: string) =>
    setToppings((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  /* ── MOBILE LAYOUT ── */
  if (!isDesktop) {
    return (
      <div style={{ background: "#f7f4ef", minHeight: "100vh", paddingBottom: 100 }}>
        {/* Header */}
        <header className="mob-header">
          <Link href="/" className="mob-back" aria-label="Zurück zur Startseite">←</Link>
          <div>
            <Link href="/" className="mob-logo">La petite pause</Link>
            <div className="mob-subtitle">Bowl zusammenstellen</div>
          </div>
        </header>

        <div className="mob-content">
          {/* Title */}
          <h1 className="mob-title">Stelle deine Bowl zusammen</h1>
          <p className="mob-desc">Wähle deine Zutaten und wir machen den Rest.</p>

          {/* Basis */}
          <div className="mob-section">
            <h3 className="mob-section-title">Basis</h3>
            <div className="mob-pills">
              {BASES.map((b) => (
                <button key={b.id} onClick={() => setBase(b.id)}
                  className={`mob-pill${base === b.id ? " selected" : ""}`}>
                  {b.name}
                </button>
              ))}
            </div>
          </div>

          {/* Protein */}
          <div className="mob-section">
            <h3 className="mob-section-title">Protein</h3>
            <div className="mob-pills">
              {PROTEINS.map((p) => (
                <button key={p.id} onClick={() => setProtein(p.id)}
                  className={`mob-pill${protein === p.id ? " selected" : ""}`}>
                  {p.name}
                </button>
              ))}
            </div>
          </div>

          {/* Toppings */}
          <div className="mob-section">
            <h3 className="mob-section-title">Toppings <span className="mob-section-hint">je +€0,80</span></h3>
            <div className="mob-topping-grid">
              {TOPPINGS.map((t) => {
                const sel = toppings.includes(t.id);
                return (
                  <button key={t.id} onClick={() => toggleTopping(t.id)} className={`mob-topping${sel ? " selected" : ""}`}>
                    <div className="mob-topping-circle" style={{ background: sel ? t.color : t.light, borderColor: sel ? t.color : "#ede8e0" }}>
                      {sel && <span className="mob-topping-check">✓</span>}
                    </div>
                    <span className="mob-topping-name" style={{ color: sel ? t.color : "#3a3a30" }}>{t.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Sauce */}
          <div className="mob-section">
            <h3 className="mob-section-title">Sauce</h3>
            <div className="mob-pills">
              {SAUCES.map((s) => (
                <button key={s.id} onClick={() => setSauce(s.id)}
                  className={`mob-pill${sauce === s.id ? " selected" : ""}`}>
                  <span className="mob-pill-dot" style={{ background: s.color }} />
                  {s.name}
                </button>
              ))}
            </div>
          </div>

          {/* Popular Combos */}
          <div className="mob-section">
            <h3 className="mob-section-title" style={{ fontSize: 11, letterSpacing: "0.08em", color: "#a09070" }}>Beliebte Kombos</h3>
            <div className="mob-pills">
              {POPULAR_COMBOS.map((c) => (
                <button key={c.id} onClick={() => handleCombo(c)} className="mob-pill" style={{ borderColor: "#d8d0c0" }}>
                  <span>{c.emoji}</span> {c.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Sticky bottom bar */}
        <div className="mob-sticky-bar">
          <div className="mob-sticky-qty">
            <button aria-label="Menge verringern" onClick={() => setQty((q) => Math.max(1, q - 1))} className="mob-qty-btn">−</button>
            <span className="mob-qty-num">{qty}</span>
            <button aria-label="Menge erhöhen" onClick={() => setQty((q) => q + 1)} className="mob-qty-btn">+</button>
          </div>
          <button onClick={handleAdd} disabled={!base} className={`mob-add-btn${added ? " added" : ""}`}>
            {added ? "✓ Hinzugefügt!" : `In den Warenkorb · €${total}`}
          </button>
        </div>
      </div>
    );
  }

  /* ── DESKTOP LAYOUT ── */
  return (
    <div style={{ background: "#f7f4ef", minHeight: "100vh" }}>
     <div style={{ maxWidth: 960, margin: "0 auto", padding: "0 24px" }}>
      {/* Header */}
      <header style={{ paddingTop: 20, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <Link href="/" aria-label="Zurück zur Startseite" style={{
            width: 36, height: 36, borderRadius: 10, border: "1.5px solid #d8d0c0",
            background: "#fff", display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 16, color: "#6a6458", textDecoration: "none", transition: "all 0.2s", flexShrink: 0,
          }}>
            ←
          </Link>
          <div>
            <Link href="/" style={{ fontFamily: "var(--font-playfair), 'Playfair Display', serif", fontSize: 22, fontWeight: 700, color: "#1c1c18", letterSpacing: "-0.01em", textDecoration: "none" }}>
              La petite pause
            </Link>
            <div style={{ fontSize: 12, color: "#a09070", marginTop: 1, letterSpacing: "0.05em", textTransform: "uppercase", fontWeight: 500 }}>
              Bowl zusammenstellen
            </div>
          </div>
        </div>
        <div style={{ background: ACCENT + "15", borderRadius: 12, padding: "6px 14px", fontSize: 13, fontWeight: 600, color: ACCENT }}>
          Täglich frisch
        </div>
      </header>

      <div style={{
        display: "grid",
        gridTemplateColumns: "minmax(0, 640px) 300px",
        gap: 24, padding: "20px 0 32px",
        alignItems: "start",
        justifyContent: "center",
      }}>
        {/* LEFT: Customizer */}
        <div>
          <div style={{ background: "#ffffff", borderRadius: 20, boxShadow: "0 4px 24px rgba(0,0,0,0.07)", padding: "22px 20px", overflow: "hidden" }}>
            <StepNav step={step} onStep={setStep} />

            {/* Slides with swipe animation */}
            <div className="slides-outer">
              <div className="slides-track" style={{ transform: `translateX(-${step * 100}%)` }}>
                <div><BaseStep base={base} setBase={setBase} /></div>
                <div><ProteinStep protein={protein} setProtein={setProtein} /></div>
                <div><ToppingsStep toppings={toppings} setToppings={setToppings} /></div>
                <div><SauceStep sauce={sauce} setSauce={setSauce} /></div>
              </div>
            </div>

            <StepControls step={step} setStep={setStep} base={base} protein={protein} />
          </div>

          {/* Popular Combos */}
          <div style={{ marginTop: 16, background: "#fff", borderRadius: 20, padding: "16px 20px", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
            <PopularCombos onApply={handleCombo} />
          </div>
        </div>

        {/* RIGHT: Preview + Cart */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16, position: "sticky", top: 20 }}>
          <div style={{ background: "#ffffff", borderRadius: 20, boxShadow: "0 4px 20px rgba(0,0,0,0.07)", padding: "8px 0 12px" }}>
            <BowlPreview base={base} protein={protein} toppings={toppings} sauce={sauce} />
          </div>

          <CartSummary
            base={base} protein={protein} toppings={toppings} sauce={sauce}
            qty={qty} setQty={setQty} onAdd={handleAdd} added={added}
          />
        </div>
      </div>
     </div>
    </div>
  );
}
