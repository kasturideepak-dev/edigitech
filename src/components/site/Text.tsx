import { Fragment } from "react";

/**
 * Renders editor text: new lines become <br>, **text** becomes <b>text</b>.
 * Keeps content plain (no raw HTML from the CMS reaches the page).
 */
export function Text({ value, boldClassName }: { value?: string | null; boldClassName?: string }) {
  if (!value) return null;
  const lines = value.split(/\r?\n/);
  return (
    <>
      {lines.map((line, i) => (
        <Fragment key={i}>
          {i > 0 && <br />}
          {line.split(/(\*\*[^*]+\*\*)/g).map((part, j) =>
            part.startsWith("**") && part.endsWith("**") ? (
              <b key={j} className={boldClassName}>
                {part.slice(2, -2)}
              </b>
            ) : (
              <Fragment key={j}>{part}</Fragment>
            ),
          )}
        </Fragment>
      ))}
    </>
  );
}

export function plain(value?: string | null) {
  return (value ?? "").replace(/\*\*/g, "").replace(/\s*\n\s*/g, " ").trim();
}
