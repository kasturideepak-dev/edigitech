"use client";

import { useState } from "react";
import { submitEnquiryAction } from "@/app/admin/actions/enquiries";
import { BtnArrow } from "./BtnArrow";

type Props = {
  title?: string;
  subjects?: string[];
  buttonLabel?: string;
  successMessage?: string;
};

const EMPTY = { name: "", email: "", phone: "", subject: "", message: "", website: "" };

export default function ContactForm({ title, subjects = [], buttonLabel, successMessage }: Props) {
  const [v, setV] = useState(EMPTY);
  const [state, setState] = useState<"idle" | "sending" | "sent">("idle");
  const [error, setError] = useState("");

  const set = (k: keyof typeof EMPTY) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setV((cur) => ({ ...cur, [k]: e.target.value }));

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setState("sending");
    const res = await submitEnquiryAction({
      ...v,
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
      <div className="tp-contact-us-wrap">
        <h4 className="tp-contact-us-title mb-25">Thank you</h4>
        <p className="fs-18 lh-28">
          {successMessage || "Thanks for getting in touch — we’ve received your message and will reply within one working day."}
        </p>
        <button type="button" className="tp-contact-us-link mt-20" onClick={() => setState("idle")}>
          Send another message
        </button>
      </div>
    );
  }

  return (
    <div className="tp-contact-us-wrap">
      <h4 className="tp-contact-us-title mb-55">{title || "Send a Message"}</h4>
      <form onSubmit={onSubmit} noValidate>
        <div className="row">
          <div className="col-lg-6">
            <div className="tp-postbox-details-input mb-20">
              <label className="fs-18 tp-ff-p tp-text-common-black mb-10">Full name*</label>
              <input className="tp-input" type="text" required value={v.name} onChange={set("name")} autoComplete="name" />
            </div>
          </div>
          <div className="col-lg-6">
            <div className="tp-postbox-details-input mb-20">
              <label className="fs-18 tp-ff-p tp-text-common-black mb-10">Email address*</label>
              <input className="tp-input" type="email" required value={v.email} onChange={set("email")} autoComplete="email" />
            </div>
          </div>
          <div className="col-lg-6">
            <div className="tp-postbox-details-input mb-20">
              <label className="fs-18 tp-ff-p tp-text-common-black mb-10">Phone</label>
              <input className="tp-input" type="tel" value={v.phone} onChange={set("phone")} autoComplete="tel" />
            </div>
          </div>
          <div className="col-lg-6">
            <div className="tp-postbox-details-input mb-20">
              <label className="fs-18 tp-ff-p tp-text-common-black mb-10">Subject</label>
              {subjects.length ? (
                <select className="tp-input" value={v.subject} onChange={set("subject")}>
                  <option value="">Select a service</option>
                  {subjects.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              ) : (
                <input className="tp-input" type="text" value={v.subject} onChange={set("subject")} />
              )}
            </div>
          </div>
          <div className="col-lg-12">
            <div className="tp-postbox-details-input mb-20">
              <label className="fs-18 tp-ff-p tp-text-common-black mb-10">How Can We Help You*</label>
              <textarea className="tp-input tp-textarea" required rows={5} value={v.message} onChange={set("message")} />
            </div>

            {/* Honeypot — hidden from people, irresistible to bots. */}
            <div aria-hidden="true" style={{ position: "absolute", left: "-9999px", opacity: 0 }}>
              <label>
                Website
                <input type="text" tabIndex={-1} autoComplete="off" value={v.website} onChange={set("website")} />
              </label>
            </div>

            {error && (
              <p className="fs-16 mb-20" role="alert" style={{ color: "#c0392b" }}>
                {error}
              </p>
            )}

            <div className="tp-contact-form-btn">
              <button
                type="submit"
                disabled={state === "sending"}
                className="tp-btn-xl w-100 d-inline-block lh-0 tp-round-26 fs-15 tp-bg-common-black text-uppercase ls-0 tp-btn-switch-animation tp-text-common-white hover-text-white tp-ff-heading fw-500"
              >
                <span className="d-flex align-items-center justify-content-center">
                  <span className="btn-text">{state === "sending" ? "Sending…" : buttonLabel || "Send Message"}</span>
                  <BtnArrow />
                  <BtnArrow />
                </span>
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
