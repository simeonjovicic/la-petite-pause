"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

const ACCENT = "#2d6a4f";

const BASES: Record<string, string> = {
  rice: "Weißer Reis", quinoa: "Quinoa", salad: "Blattsalat",
};
const PROTEINS: Record<string, string> = {
  salmon: "Lachs", tuna: "Thunfisch", tofu: "Tofu", chicken: "Hühnchen",
};
const TOPPINGS_MAP: Record<string, string> = {
  avocado: "Avocado", edamame: "Edamame", cucumber: "Gurke",
  mango: "Mango", seaweed: "Seetang", sesame: "Sesam",
  greens: "Greens", corn: "Mais",
};
const SAUCES: Record<string, string> = {
  teriyaki: "Teriyaki", sesame: "Sesam", spicymayo: "Spicy Mayo", ponzu: "Ponzu",
};

type CartItem = {
  id: string;
  base: string | null;
  protein: string | null;
  toppings: string[];
  sauce: string | null;
  qty: number;
  price: number;
};

export default function CartPage() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [orderPlaced, setOrderPlaced] = useState(false);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("cart") || "[]");
    setItems(stored);
  }, []);

  const updateQty = (id: string, delta: number) => {
    setItems((prev) => {
      const next = prev.map((item) =>
        item.id === id ? { ...item, qty: Math.max(1, item.qty + delta) } : item
      );
      localStorage.setItem("cart", JSON.stringify(next));
      return next;
    });
  };

  const removeItem = (id: string) => {
    setItems((prev) => {
      const next = prev.filter((item) => item.id !== id);
      localStorage.setItem("cart", JSON.stringify(next));
      return next;
    });
  };

  const clearCart = () => {
    setItems([]);
    localStorage.setItem("cart", "[]");
  };

  const subtotal = items.reduce((sum, item) => sum + item.price * item.qty, 0);
  const itemCount = items.reduce((sum, item) => sum + item.qty, 0);

  const handleOrder = () => {
    setOrderPlaced(true);
    clearCart();
  };

  return (
    <div style={{ background: "#f7f4ef", minHeight: "100vh" }}>
      <div className="cart-page-inner">
        {/* Header */}
        <header className="cart-page-header">
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <Link href="/customize" className="mob-back" aria-label="Zurück" style={{
              width: 34, height: 34, borderRadius: 10, border: "1.5px solid #d8d0c0",
              background: "#fff", display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 15, color: "#6a6458", textDecoration: "none", flexShrink: 0,
            }}>
              ←
            </Link>
            <div>
              <Link href="/" style={{ fontFamily: "var(--font-playfair), 'Playfair Display', serif", fontSize: 20, fontWeight: 700, color: "#1c1c18", letterSpacing: "-0.01em", textDecoration: "none" }}>
                La petite pause
              </Link>
              <div style={{ fontSize: 11, color: "#a09070", marginTop: 1, letterSpacing: "0.05em", textTransform: "uppercase", fontWeight: 500 }}>
                Warenkorb
              </div>
            </div>
          </div>
          {items.length > 0 && (
            <div style={{ background: ACCENT + "15", borderRadius: 20, padding: "5px 14px", fontSize: 13, fontWeight: 600, color: ACCENT }}>
              {itemCount} Artikel
            </div>
          )}
        </header>

        {/* Order placed confirmation */}
        {orderPlaced && (
          <div style={{
            background: "#fff", borderRadius: 20, padding: 48, textAlign: "center",
            boxShadow: "0 4px 24px rgba(0,0,0,0.07)", marginBottom: 24,
          }}>
            <div style={{ fontSize: 56, marginBottom: 16 }}>🍜</div>
            <h2 style={{ fontFamily: "var(--font-playfair), 'Playfair Display', serif", fontSize: 28, fontWeight: 700, marginBottom: 12 }}>
              Bestellung aufgegeben!
            </h2>
            <p style={{ fontSize: 15, color: "#6a6458", lineHeight: 1.6, marginBottom: 8 }}>
              Deine Bowls werden frisch zubereitet. Abholung in ca. 10 Minuten.
            </p>
            <p style={{ fontSize: 13, color: "#b0a890", marginBottom: 28 }}>
              Bestellbestätigung wurde an deine E-Mail gesendet.
            </p>
            <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
              <Link href="/" style={{
                padding: "12px 24px", borderRadius: 12, border: "1.5px solid #d8d0c0",
                background: "#fff", color: "#1c1c18", fontWeight: 600, fontSize: 14,
                textDecoration: "none", transition: "all 0.2s",
              }}>
                Zur Startseite
              </Link>
              <Link href="/customize" style={{
                padding: "12px 24px", borderRadius: 12, background: ACCENT, color: "#fff",
                fontWeight: 700, fontSize: 14, textDecoration: "none", transition: "all 0.2s",
              }}>
                Weitere Bowl bauen
              </Link>
            </div>
          </div>
        )}

        {/* Empty cart */}
        {!orderPlaced && items.length === 0 && (
          <div style={{
            background: "#fff", borderRadius: 20, padding: 48, textAlign: "center",
            boxShadow: "0 4px 24px rgba(0,0,0,0.07)",
          }}>
            <div style={{ fontSize: 56, marginBottom: 16 }}>🥢</div>
            <h2 style={{ fontFamily: "var(--font-playfair), 'Playfair Display', serif", fontSize: 24, fontWeight: 700, marginBottom: 10 }}>
              Dein Warenkorb ist leer
            </h2>
            <p style={{ fontSize: 15, color: "#6a6458", lineHeight: 1.6, marginBottom: 28 }}>
              Stelle deine perfekte Bowl zusammen und leg sie in den Warenkorb.
            </p>
            <Link href="/customize" style={{
              padding: "14px 28px", borderRadius: 12, background: ACCENT, color: "#fff",
              fontWeight: 700, fontSize: 15, textDecoration: "none", display: "inline-block",
              transition: "all 0.2s",
            }}>
              Jetzt zusammenstellen →
            </Link>
          </div>
        )}

        {/* Cart items */}
        {!orderPlaced && items.length > 0 && (
          <>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {items.map((item, index) => (
                <div key={item.id} style={{
                  background: "#fff", borderRadius: 20, padding: 24,
                  boxShadow: "0 4px 24px rgba(0,0,0,0.07)",
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
                    <h3 style={{ fontFamily: "var(--font-playfair), 'Playfair Display', serif", fontSize: 18, fontWeight: 700 }}>
                      Bowl {index + 1}
                    </h3>
                    <button onClick={() => removeItem(item.id)} style={{
                      background: "none", border: "none", cursor: "pointer",
                      fontSize: 13, color: "#b0a890", padding: "4px 8px", borderRadius: 8,
                      transition: "all 0.2s",
                    }}>
                      Entfernen
                    </button>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {item.base && (
                      <div style={rowStyle}>
                        <span style={labelStyle}>Basis</span>
                        <span style={valueStyle}>{BASES[item.base] || item.base}</span>
                      </div>
                    )}
                    {item.protein && (
                      <div style={rowStyle}>
                        <span style={labelStyle}>Protein</span>
                        <span style={valueStyle}>{PROTEINS[item.protein] || item.protein}</span>
                      </div>
                    )}
                    {item.toppings.length > 0 && (
                      <div style={rowStyle}>
                        <span style={labelStyle}>Toppings</span>
                        <span style={valueStyle}>
                          {item.toppings.map((t) => TOPPINGS_MAP[t] || t).join(", ")}
                        </span>
                      </div>
                    )}
                    {item.sauce && (
                      <div style={rowStyle}>
                        <span style={labelStyle}>Sauce</span>
                        <span style={valueStyle}>{SAUCES[item.sauce] || item.sauce}</span>
                      </div>
                    )}
                  </div>

                  <div style={{
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                    marginTop: 16, paddingTop: 16, borderTop: "1px solid #eee8dc",
                  }}>
                    <div className="cart-qty-pill">
                      <button aria-label="Menge verringern" onClick={() => updateQty(item.id, -1)}>−</button>
                      <span>{item.qty}</span>
                      <button aria-label="Menge erhöhen" onClick={() => updateQty(item.id, 1)}>+</button>
                    </div>
                    <span style={{ fontFamily: "var(--font-playfair), 'Playfair Display', serif", fontSize: 20, fontWeight: 700, color: ACCENT }}>
                      €{(item.price * item.qty).toFixed(2)}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Add another bowl */}
            <Link href="/customize" style={{
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              marginTop: 16, padding: 16, borderRadius: 16,
              border: "1.5px dashed #d8d0c0", background: "transparent",
              fontSize: 14, fontWeight: 600, color: "#6a6458",
              textDecoration: "none", transition: "all 0.2s",
            }}>
              + Weitere Bowl hinzufügen
            </Link>

            {/* Summary & Checkout */}
            <div className="cart-summary-card">
              <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, color: "#6a6458" }}>
                  <span>Zwischensumme ({itemCount} Artikel)</span>
                  <span style={{ fontWeight: 600 }}>€{subtotal.toFixed(2)}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, color: "#6a6458" }}>
                  <span>Abholung</span>
                  <span style={{ fontWeight: 600, color: ACCENT }}>Gratis</span>
                </div>
                <div style={{ height: 1, background: "#eee8dc" }} />
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 16, fontWeight: 700 }}>Gesamt</span>
                  <span style={{ fontFamily: "var(--font-playfair), 'Playfair Display', serif", fontSize: 24, fontWeight: 700, color: ACCENT }}>
                    €{subtotal.toFixed(2)}
                  </span>
                </div>
              </div>

              <p style={{ fontSize: 12, color: "#b0a890", textAlign: "center", marginBottom: 14 }}>
                Zahlung bei Abholung · Mariahilfer Straße 24, 1060 Wien
              </p>
            </div>

            {/* Sticky checkout button */}
            <div className="cart-sticky-checkout">
              <button onClick={handleOrder} className="cart-checkout-btn">
                Bestellen · €{subtotal.toFixed(2)} →
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

const rowStyle = {
  display: "flex" as const, justifyContent: "space-between" as const,
  padding: "6px 0", borderBottom: "1px solid #f2ece0",
};
const labelStyle = {
  fontSize: 12, color: "#a09070", fontWeight: 600 as const,
  letterSpacing: "0.04em", textTransform: "uppercase" as const,
};
const valueStyle = {
  fontSize: 14, color: "#2a2a22", textAlign: "right" as const, maxWidth: "60%",
};
