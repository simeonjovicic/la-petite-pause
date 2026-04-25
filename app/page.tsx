"use client";

import { useEffect, useState, useCallback, FormEvent } from "react";
import Link from "next/link";

/* ── Menu data ── */
type MenuItem = {
  name: string;
  desc: string;
  price: string;
  cat: string;
  tags?: { label: string; cls: string }[];
  link?: string;
};

const MENU_ITEMS: MenuItem[] = [
  { name: "La Classique", desc: "Jasminreis · Lachs · Avocado · Edamame · Gurke · Ponzu", price: "€14.90", cat: "signatures", tags: [{ label: "⭐ Beliebt", cls: "tag-popular" }] },
  { name: "Spicy Tuna", desc: "Jasminreis · Thunfisch · Seetang · Gurke · Sesam · Spicy Mayo", price: "€14.50", cat: "signatures", tags: [{ label: "🌶 Scharf", cls: "tag-spicy" }] },
  { name: "Garden Bowl", desc: "Blattsalat · Tofu · Avocado · Mango · Greens · Sesamsauce", price: "€13.90", cat: "signatures", tags: [{ label: "🌿 Vegan", cls: "tag-vegan" }] },
  { name: "Golden Grain", desc: "Quinoa · Hühnchen · Mais · Mango · Edamame · Teriyaki", price: "€14.20", cat: "signatures", tags: [{ label: "⭐ Beliebt", cls: "tag-popular" }] },
  { name: "Ocean Deep", desc: "Reis · Lachs · Thunfisch · Seetang · Gurke · Avocado · Ponzu", price: "€16.50", cat: "signatures" },
  { name: "Eigene Bowl", desc: "Basis + Protein + bis zu 5 Toppings + Sauce nach Wahl", price: "ab €12.90", cat: "signatures", link: "/customize" },
  { name: "Norwegischer Lachs", desc: "Zertifiziert nachhaltig, frisch oder leicht angebraten", price: "+€3.50", cat: "proteins" },
  { name: "Gelbflossen-Thunfisch", desc: "Angelgefangen, Sashimi-Qualität", price: "+€3.80", cat: "proteins" },
  { name: "Bio-Tofu", desc: "Mariniert, leicht gegrillt", price: "+€2.50", cat: "proteins", tags: [{ label: "🌿 Vegan", cls: "tag-vegan" }] },
  { name: "Freiland-Hühnchen", desc: "Langsam gegart, österreichischer Bauernhof", price: "+€3.20", cat: "proteins" },
  { name: "Miso-Suppe", desc: "Traditionelles weißes Miso, Tofu, Wakame", price: "€3.50", cat: "sides", tags: [{ label: "🌿 Vegan", cls: "tag-vegan" }] },
  { name: "Gesalzene Edamame", desc: "Gedämpft, Meersalz, Zitrone", price: "€4.00", cat: "sides", tags: [{ label: "🌿 Vegan", cls: "tag-vegan" }] },
  { name: "Yuzu-Limonade", desc: "Hausgemacht, leicht prickelnd", price: "€4.50", cat: "drinks" },
  { name: "Iced Matcha", desc: "Zeremonielle Qualität, Hafermilch", price: "€5.00", cat: "drinks", tags: [{ label: "🌿 Vegan", cls: "tag-vegan" }] },
  { name: "Still / Prickelnd", desc: "Österreichisches Quellwasser", price: "€2.50", cat: "drinks" },
];

/* ── Spill animation data ── */
const SPILL_TARGETS = [
  { tx: -130, ty: -110, rot: -60 },
  { tx: 110, ty: -140, rot: 40 },
  { tx: 150, ty: -60, rot: 80 },
  { tx: -90, ty: -150, rot: -30 },
  { tx: 70, ty: -170, rot: 60 },
  { tx: -160, ty: -80, rot: -90 },
  { tx: 130, ty: -120, rot: 30 },
  { tx: -40, ty: -180, rot: -50 },
];

function easeInOut(t: number) {
  return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
}

type CartItem = {
  id: string;
  base: string | null;
  protein: string | null;
  toppings: string[];
  sauce: string | null;
  qty: number;
  price: number;
};

const BASES_MAP: Record<string, string> = { rice: "Weißer Reis", quinoa: "Quinoa", salad: "Blattsalat" };
const PROTEINS_MAP: Record<string, string> = { salmon: "Lachs", tuna: "Thunfisch", tofu: "Tofu", chicken: "Hühnchen" };
const TOPPINGS_MAP: Record<string, string> = { avocado: "Avocado", edamame: "Edamame", cucumber: "Gurke", mango: "Mango", seaweed: "Seetang", sesame: "Sesam", greens: "Greens", corn: "Mais" };
const SAUCES_MAP: Record<string, string> = { teriyaki: "Teriyaki", sesame: "Sesam", spicymayo: "Spicy Mayo", ponzu: "Ponzu" };

export default function Home() {
  const [menuCat, setMenuCat] = useState("signatures");
  const [showConfirm, setShowConfirm] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  const cartCount = cartItems.reduce((sum, item) => sum + item.qty, 0);
  const cartTotal = cartItems.reduce((sum, item) => sum + item.price * item.qty, 0);

  const loadCart = () => {
    setCartItems(JSON.parse(localStorage.getItem("cart") || "[]"));
  };

  const updateQty = (id: string, delta: number) => {
    setCartItems((prev) => {
      const next = prev.map((item) =>
        item.id === id ? { ...item, qty: Math.max(1, item.qty + delta) } : item
      );
      localStorage.setItem("cart", JSON.stringify(next));
      return next;
    });
  };

  const removeItem = (id: string) => {
    setCartItems((prev) => {
      const next = prev.filter((item) => item.id !== id);
      localStorage.setItem("cart", JSON.stringify(next));
      return next;
    });
  };

  useEffect(() => {
    loadCart();
    window.addEventListener("storage", loadCart);
    window.addEventListener("focus", loadCart);
    return () => {
      window.removeEventListener("storage", loadCart);
      window.removeEventListener("focus", loadCart);
    };
  }, []);

  /* Nav scroll shadow */
  useEffect(() => {
    const onScroll = () => {
      const nav = document.getElementById("nav");
      if (!nav) return;
      const y = window.scrollY;
      nav.classList.toggle("visible", y > 100);
      nav.classList.toggle("scrolled", y > 140);
    };
    window.addEventListener("scroll", onScroll);
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);


  /* Bowl spill animation */
  useEffect(() => {
    const spillEls = document.querySelectorAll<HTMLElement>(".spill");
    const bowlBody = document.querySelector<SVGGElement>(".bowl-body");

    function onScroll() {
      const scrollY = window.scrollY;
      const triggerEnd = window.innerHeight * 0.65;
      const raw = Math.min(Math.max(scrollY / triggerEnd, 0), 1);
      const p = easeInOut(raw);

      if (bowlBody) {
        bowlBody.style.transform = `rotate(${p * 30}deg) translateY(${p * -10}px)`;
      }

      spillEls.forEach((el, i) => {
        const t = SPILL_TARGETS[i] || SPILL_TARGETS[0];
        const tx = t.tx * p;
        const ty = t.ty * p;
        const scale = 1 - p * 0.55;
        let opacity = 0;
        if (p > 0.05 && p < 0.85) {
          opacity =
            p < 0.25 ? (p - 0.05) / 0.2 : 1 - (p - 0.25) / 0.6;
          opacity = Math.max(0, Math.min(1, opacity));
        }
        el.style.transform = `translate(calc(-50% + ${tx}px), calc(-50% + ${ty}px)) scale(${scale}) rotate(${t.rot * p}deg)`;
        el.style.opacity = String(opacity);
      });
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleReservation = useCallback(
    (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      setShowConfirm(true);
      (e.target as HTMLFormElement).reset();
    },
    []
  );

  return (
    <>
      {/* ── NAV ── */}
      <nav id="nav">
        <div className="nav-logo">
          La <span>petite</span> pause
        </div>
        <div className="nav-links">
          <a href="#story">Unsere Geschichte</a>
          <a href="#owner">Der Koch</a>
          <a href="#menu">Speisekarte</a>
          <a href="#gallery">Galerie</a>
          <a href="#reservations">Reservieren</a>
        </div>
        <button className="nav-cart" aria-label="Warenkorb öffnen" onClick={() => { loadCart(); setCartOpen(true); }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <path d="M16 10a4 4 0 01-8 0" />
          </svg>
          {cartCount > 0 && <span className="nav-cart-badge">{cartCount}</span>}
        </button>
      </nav>

      {/* ── HERO ── */}
      <section
        id="hero"
        style={{ paddingTop: 100, paddingBottom: 80, maxWidth: "none" }}
      >
        <div
          style={{
            maxWidth: 1200,
            margin: "0 auto",
            display: "flex",
            alignItems: "center",
            gap: 60,
            padding: "0 48px",
            flexWrap: "wrap",
          }}
        >
          <div className="hero-text" style={{ flex: 1, minWidth: 280 }}>
            <div className="hero-eyebrow">Wiens frischeste Poke Bowls</div>
            <h1 className="hero-title">
              Essen, das zweimal am Tag
              <br />
              <em>frisch</em> gemacht wird.
            </h1>
            <p className="hero-sub">
              Unsere Zutaten wechseln jeden Morgen und Mittag — weil Frische kein
              Versprechen ist, sondern eine Praxis. Auf Bestellung gebaut, mit
              Sorgfalt bezogen.
            </p>
            <div className="hero-btns">
              <Link href="/customize" className="btn-primary">
                Bowl zusammenstellen →
              </Link>
              <a href="#menu" className="btn-secondary">
                Zur Speisekarte
              </a>
            </div>
            <div className="hero-badge">
              <span>📍</span>
              <span>
                <strong>Mariahilfer Straße 24</strong>, Wien · Heute geöffnet
                10:00 – 21:00
              </span>
            </div>
          </div>

          <div className="hero-visual">
            {/* Spilling ingredient dots */}
            <div className="spill spill-1" style={{ top: "48%", left: "50%" }} />
            <div className="spill spill-2" style={{ top: "50%", left: "50%" }} />
            <div className="spill spill-3" style={{ top: "52%", left: "50%" }} />
            <div className="spill spill-4" style={{ top: "49%", left: "50%" }} />
            <div className="spill spill-5" style={{ top: "51%", left: "50%" }} />
            <div className="spill spill-6" style={{ top: "48%", left: "50%" }} />
            <div className="spill spill-7" style={{ top: "50%", left: "50%" }} />
            <div className="spill spill-8" style={{ top: "51%", left: "50%" }} />

            {/* Bowl SVG */}
            <svg
              id="bowl-svg"
              viewBox="0 0 300 300"
              xmlns="http://www.w3.org/2000/svg"
            >
              <g className="bowl-body">
                <ellipse cx="150" cy="272" rx="88" ry="12" fill="rgba(0,0,0,0.1)" />
                <ellipse cx="150" cy="190" rx="118" ry="18" fill="#d4cbbf" />
                <path d="M32,150 Q32,250 150,260 Q268,250 268,150 Z" fill="#e8e2d8" />
                <path d="M52,148 Q52,238 150,248 Q248,238 248,148 Z" fill="#f0ebe0" />
                <path d="M58,148 Q58,230 150,242 Q242,230 242,148 Z" fill="#a8c89e" />
                <ellipse cx="118" cy="185" rx="8" ry="5" fill="rgba(255,255,255,0.5)" />
                <ellipse cx="145" cy="175" rx="7" ry="4" fill="rgba(255,255,255,0.4)" />
                <ellipse cx="172" cy="182" rx="9" ry="5" fill="rgba(255,255,255,0.5)" />
                <ellipse cx="132" cy="200" rx="6" ry="4" fill="rgba(255,255,255,0.35)" />
                <ellipse cx="162" cy="196" rx="8" ry="4" fill="rgba(255,255,255,0.4)" />
                <ellipse cx="125" cy="175" rx="22" ry="12" fill="#f4856a" />
                <ellipse cx="120" cy="173" rx="8" ry="4" fill="rgba(255,255,255,0.25)" />
                <ellipse cx="168" cy="182" rx="20" ry="11" fill="#f4856a" />
                <ellipse cx="163" cy="180" rx="7" ry="3.5" fill="rgba(255,255,255,0.25)" />
                <circle cx="148" cy="198" r="13" fill="#5a8c5a" />
                <circle cx="148" cy="198" r="7" fill="#8bbf8b" />
                <circle cx="138" cy="188" r="2.5" fill="#e8d8a0" />
                <circle cx="155" cy="192" r="2" fill="#e8d8a0" />
                <circle cx="143" cy="196" r="2" fill="#e8d8a0" />
                <circle cx="160" cy="185" r="2.5" fill="#e8d8a0" />
                <path d="M90,170 q22,-12 38,5 q16,17 38,0 q18,-17 32,4" stroke="#8b4513" strokeWidth="3.5" fill="none" strokeLinecap="round" opacity="0.8" />
                <ellipse cx="150" cy="148" rx="118" ry="18" fill="#e0d8cc" />
                <ellipse cx="150" cy="146" rx="112" ry="14" fill="#ece6da" />
                <path d="M70,140 q80,-22 160,0" stroke="rgba(255,255,255,0.5)" strokeWidth="5" fill="none" strokeLinecap="round" />
              </g>
            </svg>
          </div>
        </div>
      </section>

      {/* ── UNSERE GESCHICHTE ── */}
      <section id="story">
        <div className="section-inner">
          <div className="section-tag">Unsere Geschichte</div>
          <h2 className="section-title">
            Aus einer einfachen Überzeugung geboren:
            <br />
            Frisches Essen verändert alles.
          </h2>
          <div className="story-grid">
            <div className="story-img">
              <span className="story-img-label">
                Restaurant Interieur
                <br />/ Atmosphäre
              </span>
            </div>
            <div className="story-text">
              <h2 style={{ fontSize: 32, marginBottom: 16 }}>
                Zweimal am Tag fangen wir von vorne an.
              </h2>
              <p style={{ fontSize: 15, color: "var(--mid)", lineHeight: 1.7, marginBottom: 14 }}>
                Die meisten Restaurants sind stolz auf Beständigkeit. Wir sind stolz auf etwas Schwierigeres: Frische. Jeden Morgen um 7 Uhr und jeden Mittag um 12 Uhr wird unsere Küche zurückgesetzt. Neue Zutaten kommen rein. Alte gehen raus.
              </p>
              <p style={{ fontSize: 15, color: "var(--mid)", lineHeight: 1.7, marginBottom: 14 }}>
                Das bedeutet, dass unsere Karte nie stillsteht. Es bedeutet, dass unsere Beschaffung nie schläft. Und es bedeutet, dass jede Bowl, die du hier zusammenstellst, aus Zutaten besteht, die heute Morgen noch frisch waren.
              </p>
              <p style={{ fontSize: 15, color: "var(--mid)", lineHeight: 1.7 }}>
                Wir haben La petite pause mit einer Frage gestartet: Was wäre, wenn ein schnelles Mittagessen kein Kompromiss sein müsste? Die Antwort war köstlicher als erwartet.
              </p>
              <div className="freshness-badge">
                <div className="freshness-dot" />
                <span className="freshness-text">
                  Zutaten heute um 12:00 aufgefrischt
                </span>
              </div>
              <div className="story-stat">
                <div>
                  <div className="stat-num">2×</div>
                  <div className="stat-label">tägliche Zutaten-Auffrischung</div>
                </div>
                <div>
                  <div className="stat-num">100%</div>
                  <div className="stat-label">auf Bestellung zubereitet</div>
                </div>
                <div>
                  <div className="stat-num">0</div>
                  <div className="stat-label">vorgefertigte Bowls</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── MEET THE OWNER ── */}
      <section id="owner">
        <div className="section-inner">
          <div className="section-tag">Der Koch &amp; Gründer</div>
          <div className="owner-grid">
            <div>
              <div className="owner-photo">
                <span className="owner-photo-label">
                  Portrait von
                  <br />
                  Patrick Petite
                </span>
              </div>
            </div>
            <div>
              <h2 className="section-title" style={{ marginTop: 0 }}>
                Patrick
                <br />
                Petite
              </h2>
              <blockquote className="owner-quote">
                &bdquo;Ich will nicht, dass sich die Leute nach dem Mittagessen schuldig fühlen. Ich will, dass sie sich gut fühlen — und sich darauf freuen, wiederzukommen.&ldquo;
              </blockquote>
              <p className="owner-bio">
                Patrick wuchs zwischen Wien und der Küste auf, wo frischer Fisch und Marktgemüse einfach zum Alltag gehörten. Nach Jahren in Restaurantküchen quer durch Europa kam er immer wieder auf dieselbe Idee zurück: Gesundes Essen muss weder kompliziert noch langsam sein.
              </p>
              <p className="owner-bio">
                Er eröffnete La petite pause im 6. Wiener Bezirk mit einem kleinen Team und einer klaren Vision — ein Ort, wo die Geschwindigkeit von Fast Food auf die Qualität von Slow Cooking trifft. Alles auf der Karte ist etwas, das er selbst gerne essen würde.
              </p>
              <p className="owner-bio">
                Die zweimal tägliche Zutaten-Rotation war Patricks Idee von Tag eins. &bdquo;Es ist mehr Arbeit&ldquo;, gibt er zu. &bdquo;Aber es ist der einzig ehrliche Weg.&ldquo;
              </p>
              <div className="owner-sig">— Patrick</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── VALUES ── */}
      <section id="values">
        <div className="section-inner">
          <div className="section-tag">Unsere Werte</div>
          <h2 className="section-title" style={{ color: "#fff" }}>
            Richtig bezogen.
            <br />
            Ehrlich gemacht.
          </h2>
          <p className="section-sub">
            Uns geht es nicht nur um Geschmack — uns geht es darum, woher jede einzelne Zutat kommt und an welchem Lebensmittelsystem wir teilhaben.
          </p>
          <div className="values-grid">
            <div className="value-card">
              <div className="value-icon">🐟</div>
              <h4>Nachhaltiger Fisch</h4>
              <p>
                Unser Lachs und Thunfisch stammen aus zertifiziert nachhaltiger Fischerei. Wir wechseln Lieferanten, wenn sich Standards ändern — nicht wenn es gerade passt.
              </p>
            </div>
            <div className="value-card">
              <div className="value-icon">🌱</div>
              <h4>Regional &amp; saisonal</h4>
              <p>
                Gemüse und Salate kommen von österreichischen und regionalen Bauernhöfen. Wir passen unsere Karte der Saison an, statt Produkte einzufliegen.
              </p>
            </div>
            <div className="value-card">
              <div className="value-icon">♻️</div>
              <h4>Zero Waste Küche</h4>
              <p>
                Unsere zweimal tägliche Auffrischung ist kein Abfall — sie wird kompostiert oder gespendet. Wir erfassen jedes Gramm und berichten monatlich öffentlich.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── MENU ── */}
      <section id="menu">
        <div className="section-inner">
          <div className="section-tag">Speisekarte</div>
          <h2 className="section-title">Alles frisch auf Bestellung.</h2>
          <p className="section-sub">
            Jedes Gericht kann mit unserem Bowl Builder individuell angepasst werden.
            Preise gelten für die Signature-Version.
          </p>

          <div className="menu-tabs">
            {[
              { id: "signatures", label: "Signature Bowls" },
              { id: "proteins", label: "Proteine" },
              { id: "sides", label: "Beilagen & Extras" },
              { id: "drinks", label: "Getränke" },
            ].map((tab) => (
              <button
                key={tab.id}
                className={`menu-tab ${menuCat === tab.id ? "active" : ""}`}
                onClick={() => setMenuCat(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="menu-grid">
            {MENU_ITEMS.filter((item) => item.cat === menuCat).map((item) => (
              <div className="menu-card" key={item.name}>
                <div className="menu-card-img">
                  {item.cat === "signatures"
                    ? `signature bowl photo\n${item.name}`
                    : item.name.toLowerCase()}
                </div>
                <h4>{item.name}</h4>
                <p>{item.desc}</p>
                <div className="menu-card-footer">
                  <span className="menu-price">{item.price}</span>
                  <div className="menu-tags">
                    {item.link ? (
                      <Link
                        href={item.link}
                        style={{
                          fontSize: 11,
                          color: "var(--green)",
                          fontWeight: 700,
                        }}
                      >
                        Anpassen →
                      </Link>
                    ) : (
                      item.tags?.map((tag) => (
                        <span
                          key={tag.label}
                          className={`menu-tag-pill ${tag.cls}`}
                        >
                          {tag.label}
                        </span>
                      ))
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── BOWL BUILDER CTA ── */}
      <section id="builder">
        <div className="section-inner">
          <div className="builder-cta-box">
            <div className="builder-cta-text">
              <div className="section-tag">Bowl Builder</div>
              <h2>Ganz nach deinem Geschmack.</h2>
              <p>
                Wähle deine Basis, dein Protein, deine Toppings, deine Sauce — und
                sieh zu, wie alles in Echtzeit zusammenkommt. Keine Kompromisse. Deine
                Bowl, dein Weg.
              </p>
              <Link
                href="/customize"
                className="btn-primary"
                style={{ display: "inline-block" }}
              >
                Jetzt zusammenstellen →
              </Link>
            </div>
            <div className="builder-cta-visual">🍜</div>
          </div>
        </div>
      </section>

      {/* ── GALLERY ── */}
      <section id="gallery">
        <div className="section-inner">
          <div className="section-tag">Galerie</div>
          <h2 className="section-title" style={{ color: "#fff" }}>
            Frisch in jedem Bild.
          </h2>
          <div className="gallery-grid">
            <div className="gallery-item">
              <div className="gallery-label">
                Bowl Hero-Aufnahme
                <br />
                von oben, Hero-Komposition
              </div>
            </div>
            <div className="gallery-item">
              <div className="gallery-label">
                Küchenvorbereitung
                <br />
                Morgenlieferung der Zutaten
              </div>
            </div>
            <div className="gallery-item">
              <div className="gallery-label">
                Restaurant Interieur
                <br />
                Sitzbereich
              </div>
            </div>
            <div className="gallery-item">
              <div className="gallery-label">
                Nahaufnahme:
                <br />
                Lachs-Textur
              </div>
            </div>
            <div className="gallery-item">
              <div className="gallery-label">
                Nahaufnahme:
                <br />
                Avocado + Sesam
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── RESERVATIONS ── */}
      <section id="reservations">
        <div className="section-inner">
          <div className="section-tag">Reservierung</div>
          <h2 className="section-title">Komm vorbei und bleib eine Weile.</h2>
          <div className="res-grid">
            <form className="res-form" onSubmit={handleReservation}>
              <div className="form-row">
                <div className="form-field">
                  <label>Vorname</label>
                  <input type="text" placeholder="Marie" required />
                </div>
                <div className="form-field">
                  <label>Nachname</label>
                  <input type="text" placeholder="Dupont" required />
                </div>
              </div>
              <div className="form-row">
                <div className="form-field">
                  <label>Datum</label>
                  <input type="date" required />
                </div>
                <div className="form-field">
                  <label>Uhrzeit</label>
                  <select required defaultValue="">
                    <option value="" disabled>
                      Uhrzeit wählen
                    </option>
                    {[
                      "10:00","11:00","12:00","13:00","14:00",
                      "15:00","16:00","17:00","18:00","19:00","20:00",
                    ].map((t) => (
                      <option key={t}>{t}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="form-field">
                <label>Gäste</label>
                <select required defaultValue="">
                  <option value="" disabled>
                    Anzahl der Gäste
                  </option>
                  {["1", "2", "3", "4", "5", "6+"].map((n) => (
                    <option key={n}>{n}</option>
                  ))}
                </select>
              </div>
              <div className="form-field">
                <label>E-Mail</label>
                <input
                  type="email"
                  placeholder="marie@example.com"
                  required
                />
              </div>
              <div className="form-field">
                <label>Anmerkungen (optional)</label>
                <textarea placeholder="Allergien, Ernährungswünsche, besondere Anlässe…" />
              </div>
              <button type="submit" className="form-submit">
                Reservierung anfragen
              </button>
            </form>

            <div className="res-info">
              <h3>Öffnungszeiten</h3>
              <ul className="hours-list">
                {[
                  { day: "Montag", time: "10:00 – 20:00", weekday: 1 },
                  { day: "Dienstag", time: "10:00 – 20:00", weekday: 2 },
                  { day: "Mittwoch", time: "10:00 – 20:00", weekday: 3 },
                  { day: "Donnerstag", time: "10:00 – 21:00", weekday: 4 },
                  { day: "Freitag", time: "10:00 – 22:00", weekday: 5 },
                  { day: "Samstag", time: "11:00 – 22:00", weekday: 6 },
                  { day: "Sonntag", time: "11:00 – 18:00", weekday: 0 },
                ].map((h) => {
                  const isToday = new Date().getDay() === h.weekday;
                  return (
                  <li
                    key={h.day}
                    className={`hours-item${isToday ? " today" : ""}`}
                  >
                    <span className="day">
                      {h.day}
                      {isToday && " ← heute"}
                    </span>
                    <span className="time">{h.time}</span>
                  </li>
                  );
                })}
              </ul>
              <div className="address-card">
                <strong style={{ fontSize: 15 }}>La petite pause</strong>
                <p>
                  Mariahilfer Straße 24
                  <br />
                  1060 Wien, Österreich
                  <br />
                  <br />
                  📞 +43 1 234 5678
                  <br />
                  ✉️ hello@lapetitepause.at
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer>
        <div className="footer-logo">La petite pause</div>
        <div className="footer-copy">
          © 2026 La petite pause · Mariahilfer Straße 24, Wien
        </div>
      </footer>

      {/* ── Reservation confirmation overlay ── */}
      {showConfirm && (
        <div
          className="res-overlay open"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowConfirm(false);
          }}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: 24,
              padding: 48,
              maxWidth: 420,
              textAlign: "center",
              margin: 24,
            }}
          >
            <div style={{ fontSize: 48, marginBottom: 16 }}>🍜</div>
            <h3
              style={{
                fontFamily: "var(--font-playfair), 'Playfair Display', serif",
                fontSize: 24,
                marginBottom: 12,
              }}
            >
              Anfrage erhalten!
            </h3>
            <p
              style={{
                color: "var(--mid)",
                lineHeight: 1.6,
                marginBottom: 24,
              }}
            >
              Wir bestätigen deine Reservierung innerhalb von 2 Stunden. Bis bald
              bei La petite pause.
            </p>
            <button
              onClick={() => setShowConfirm(false)}
              style={{
                padding: "12px 28px",
                background: "var(--green)",
                color: "#fff",
                borderRadius: 12,
                fontWeight: 700,
                fontSize: 15,
              }}
            >
              Fertig
            </button>
          </div>
        </div>
      )}

      {/* ── Cart Drawer ── */}
      <div
        className={`cart-overlay${cartOpen ? " open" : ""}`}
        onClick={(e) => { if (e.target === e.currentTarget) setCartOpen(false); }}
      >
        <div className={`cart-drawer${cartOpen ? " open" : ""}`}>
          <div className="cart-drawer-header">
            <h3>Warenkorb</h3>
            {cartCount > 0 && (
              <span className="cart-drawer-count">{cartCount} Artikel</span>
            )}
            <button className="cart-drawer-close" aria-label="Warenkorb schließen" onClick={() => setCartOpen(false)}>✕</button>
          </div>

          <div className="cart-drawer-body">
            {cartItems.length === 0 ? (
              <div className="cart-drawer-empty">
                <div style={{ fontSize: 40, marginBottom: 12 }}>🥢</div>
                <p style={{ fontWeight: 600, marginBottom: 6 }}>Dein Warenkorb ist leer</p>
                <p style={{ fontSize: 13, color: "var(--light)" }}>Stell dir eine Bowl zusammen</p>
              </div>
            ) : (
              cartItems.map((item, i) => (
                <div key={item.id} className="cart-drawer-item">
                  <div className="cart-drawer-item-header">
                    <span className="cart-drawer-item-title">Bowl {i + 1}</span>
                    <button className="cart-drawer-item-remove" onClick={() => removeItem(item.id)}>Entfernen</button>
                  </div>
                  <div className="cart-drawer-item-details">
                    {item.base && <span>{BASES_MAP[item.base]}</span>}
                    {item.protein && <><span className="cart-dot" /> <span>{PROTEINS_MAP[item.protein]}</span></>}
                    {item.toppings.length > 0 && <><span className="cart-dot" /> <span>{item.toppings.map(t => TOPPINGS_MAP[t]).join(", ")}</span></>}
                    {item.sauce && <><span className="cart-dot" /> <span>{SAUCES_MAP[item.sauce]}</span></>}
                  </div>
                  <div className="cart-drawer-item-footer">
                    <div className="cart-drawer-qty">
                      <button aria-label="Menge verringern" onClick={() => updateQty(item.id, -1)}>−</button>
                      <span>{item.qty}</span>
                      <button aria-label="Menge erhöhen" onClick={() => updateQty(item.id, 1)}>+</button>
                    </div>
                    <span className="cart-drawer-item-price">€{(item.price * item.qty).toFixed(2)}</span>
                  </div>
                </div>
              ))
            )}
          </div>

          {cartItems.length > 0 && (
            <div className="cart-drawer-footer">
              <Link
                href="/customize"
                className="cart-drawer-add"
                onClick={() => setCartOpen(false)}
              >
                + Weitere Bowl hinzufügen
              </Link>
              <div className="cart-drawer-total">
                <span>Gesamt</span>
                <span className="cart-drawer-total-price">€{cartTotal.toFixed(2)}</span>
              </div>
              <Link
                href="/cart"
                className="cart-drawer-checkout"
                onClick={() => setCartOpen(false)}
              >
                Zur Kasse · €{cartTotal.toFixed(2)}
              </Link>
            </div>
          )}

          {cartItems.length === 0 && (
            <div className="cart-drawer-footer">
              <Link
                href="/customize"
                className="cart-drawer-checkout"
                onClick={() => setCartOpen(false)}
              >
                Bowl zusammenstellen →
              </Link>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
