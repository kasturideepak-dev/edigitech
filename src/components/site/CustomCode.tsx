"use client";

import { useEffect } from "react";

/** Injects admin-provided HTML (verification tags, chat widgets…) so its <script> tags run. */
function inject(html: string, target: HTMLElement) {
  const tpl = document.createElement("template");
  tpl.innerHTML = html;
  for (const node of Array.from(tpl.content.childNodes)) {
    if (node instanceof HTMLScriptElement) {
      const s = document.createElement("script");
      for (const attr of Array.from(node.attributes)) s.setAttribute(attr.name, attr.value);
      s.text = node.text;
      target.appendChild(s);
    } else {
      target.appendChild(node);
    }
  }
}

export default function CustomCode({ head, body }: { head?: string; body?: string }) {
  useEffect(() => {
    const w = window as unknown as { __customCodeInjected?: boolean };
    if (w.__customCodeInjected) return;
    w.__customCodeInjected = true;
    if (head) inject(head, document.head);
    if (body) inject(body, document.body);
  }, [head, body]);
  return null;
}
