"use client";

import { useState } from "react";
import { submitEnquiryAction } from "@/app/admin/actions/enquiries";

type Props = {
  title?: string;
  note?: string;
  buttonLabel?: string;
  successMessage?: string;
};

const EMPTY = { name: "", email: "", phone: "", message: "", website: "" };

/**
 * Compact four-field quote form for the service banner.
 *
 * Posts through the same server action as the contact page, so enquiries from
 * here land in the same inbox with the originating path recorded — no second
 * pipeline to keep in step.
 */
export default function QuoteForm({ title, note, buttonLabel, successMessage }: Props) {
  const [v, setV] = useState(EMPTY);
  const [state, setState] = useState<"idle" | "sending" | "sent">("idle");
  const [error, setError] = useState("");

  const set = (k: keyof typeof EMPTY) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setV((cur) => ({ ...cur, [k]: e.target.value }));

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setState("sending");
    const res = await submitEnquiryAction({
      ...v,
      subject: "Website development quote",
      source: typeof window !== "undefined" ? window.location.pathname : "",
    });
    if (res.ok) {
      setState("sent");
      setV(EMPTY);
    } else {
      setState("idle");
      setError(res.error);
    }
  }

  if (state === "sent") {
    return (
      <div className="ed-quote-card ed-quote-done">
        <h3 className="ed-quote-title">Thank you</h3>
        <p className="ed-quote-note">{successMessage || "We've got your details and will come back within one working day."}</p>
        <button type="button" className="ed-quote-again" onClick={() => setState("idle")}>
          Send another
        </button>
      </div>
    );
  }

  return (
    <div className="ed-quote-card">
      {title && <h3 className="ed-quote-title">{title}</h3>}
      {note && <p className="ed-quote-note">{note}</p>}
      <form onSubmit={onSubmit} noValidate>
        <div className="ed-quote-field">
          <label htmlFor="q-name">Name</label>
          <input id="q-name" type="text" required autoComplete="name" value={v.name} onChange={set("name")} />
        </div>
        <div className="ed-quote-field">
          <label htmlFor="q-email">Work email</label>
          <input id="q-email" type="email" required autoComplete="email" value={v.email} onChange={set("email")} />
        </div>
        <div className="ed-quote-field">
          <label htmlFor="q-phone">Phone / WhatsApp</label>
          <input id="q-phone" type="tel" autoComplete="tel" value={v.phone} onChange={set("phone")} />
        </div>
        <div className="ed-quote-field">
          <label htmlFor="q-msg">What do you need?</label>
          <textarea id="q-msg" rows={3} required value={v.message} onChange={set("message")} />
        </div>

        {/* Honeypot — hidden from people, irresistible to bots. */}
        <div aria-hidden="true" style={{ position: "absolute", left: "-9999px", opacity: 0 }}>
          <label>
            Website
            <input type="text" tabIndex={-1} autoComplete="off" value={v.website} onChange={set("website")} />
          </label>
        </div>

        {error && (
          <p className="ed-quote-error" role="alert">
            {error}
          </p>
        )}

        <button type="submit" className="ed-quote-submit" disabled={state === "sending"}>
          {state === "sending" ? "Sending…" : buttonLabel || "Get my free quote"}
        </button>
      </form>
    </div>
  );
}
