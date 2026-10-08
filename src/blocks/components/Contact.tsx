import type { BlockProps } from "./shared";
import ContactForm from "./ContactForm";

type ContactData = {
  mapEmbed?: string;
  formTitle?: string;
  buttonLabel?: string;
  successMessage?: string;
  subjects?: { label?: string }[];
};

/** Extracts the src from a pasted Google Maps <iframe>, or accepts a bare URL. */
function mapSrc(value?: string): string | null {
  const v = (value ?? "").trim();
  if (!v) return null;
  const m = v.match(/src=["']([^"']+)["']/i);
  const url = m ? m[1] : v;
  return /^https:\/\/(www\.)?google\.[a-z.]+\/maps\/embed/i.test(url) ? url : null;
}

/** Map beside a contact form — the template's contact-us-form section. */
export default function Contact({ data, anchor }: BlockProps<ContactData>) {
  const src = mapSrc(data.mapEmbed);
  const subjects = (data.subjects ?? []).map((s) => s.label?.trim()).filter((s): s is string => !!s);

  return (
    <div id={anchor || "down"} className="tp-contact-us-form-ptb pre-header pt-60 pb-120">
      <div className="container container-1750 containers">
        <div className="tp-contact-us-form-wrapper">
          <div className="row">
            {src && (
              <div className="col-lg-6">
                <div className="tp-contact-us-map p-relative">
                  <iframe
                    src={src}
                    width="600"
                    height="450"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="Our location on Google Maps"
                  />
                </div>
              </div>
            )}
            <div className={src ? "col-lg-6" : "col-lg-8 offset-lg-2"}>
              <ContactForm
                title={data.formTitle}
                subjects={subjects}
                buttonLabel={data.buttonLabel}
                successMessage={data.successMessage}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
