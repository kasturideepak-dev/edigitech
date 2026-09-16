"use client";

import { useState } from "react";
import { EditorContent, useEditor, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import {
  Bold,
  Italic,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Link2,
  Link2Off,
  ImagePlus,
  Undo2,
  Redo2,
  Minus,
  Code,
} from "lucide-react";
import { Modal, cx } from "./ui";
import { MediaBrowser } from "./MediaBrowser";

function Tool({
  onClick,
  active,
  disabled,
  title,
  children,
}: {
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      aria-pressed={active}
      disabled={disabled}
      onClick={onClick}
      className={cx(
        "rounded-md p-1.5 transition-colors disabled:opacity-30",
        active ? "bg-zinc-900 text-white" : "text-zinc-600 hover:bg-zinc-200",
      )}
    >
      {children}
    </button>
  );
}

function Toolbar({ editor, onImage }: { editor: Editor; onImage: () => void }) {
  const setLink = () => {
    const previous = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("Link URL (leave empty to remove)", previous ?? "https://");
    if (url === null) return;
    if (!url.trim()) return editor.chain().focus().extendMarkRange("link").unsetLink().run();
    editor.chain().focus().extendMarkRange("link").setLink({ href: url.trim() }).run();
  };
  return (
    <div className="flex flex-wrap items-center gap-0.5 border-b border-zinc-200 bg-zinc-50 px-2 py-1.5">
      <Tool title="Bold" active={editor.isActive("bold")} onClick={() => editor.chain().focus().toggleBold().run()}>
        <Bold className="size-4" />
      </Tool>
      <Tool title="Italic" active={editor.isActive("italic")} onClick={() => editor.chain().focus().toggleItalic().run()}>
        <Italic className="size-4" />
      </Tool>
      <span className="mx-1 h-5 w-px bg-zinc-300" />
      <Tool title="Heading" active={editor.isActive("heading", { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>
        <Heading2 className="size-4" />
      </Tool>
      <Tool title="Sub-heading" active={editor.isActive("heading", { level: 3 })} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}>
        <Heading3 className="size-4" />
      </Tool>
      <span className="mx-1 h-5 w-px bg-zinc-300" />
      <Tool title="Bullet list" active={editor.isActive("bulletList")} onClick={() => editor.chain().focus().toggleBulletList().run()}>
        <List className="size-4" />
      </Tool>
      <Tool title="Numbered list" active={editor.isActive("orderedList")} onClick={() => editor.chain().focus().toggleOrderedList().run()}>
        <ListOrdered className="size-4" />
      </Tool>
      <Tool title="Quote" active={editor.isActive("blockquote")} onClick={() => editor.chain().focus().toggleBlockquote().run()}>
        <Quote className="size-4" />
      </Tool>
      <Tool title="Code block" active={editor.isActive("codeBlock")} onClick={() => editor.chain().focus().toggleCodeBlock().run()}>
        <Code className="size-4" />
      </Tool>
      <Tool title="Divider" onClick={() => editor.chain().focus().setHorizontalRule().run()}>
        <Minus className="size-4" />
      </Tool>
      <span className="mx-1 h-5 w-px bg-zinc-300" />
      <Tool title="Link" active={editor.isActive("link")} onClick={setLink}>
        <Link2 className="size-4" />
      </Tool>
      <Tool title="Remove link" disabled={!editor.isActive("link")} onClick={() => editor.chain().focus().unsetLink().run()}>
        <Link2Off className="size-4" />
      </Tool>
      <Tool title="Insert image" onClick={onImage}>
        <ImagePlus className="size-4" />
      </Tool>
      <span className="ml-auto flex gap-0.5">
        <Tool title="Undo" disabled={!editor.can().undo()} onClick={() => editor.chain().focus().undo().run()}>
          <Undo2 className="size-4" />
        </Tool>
        <Tool title="Redo" disabled={!editor.can().redo()} onClick={() => editor.chain().focus().redo().run()}>
          <Redo2 className="size-4" />
        </Tool>
      </span>
    </div>
  );
}

export function RichText({ value, onChange }: { value: string; onChange: (html: string) => void }) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({ heading: { levels: [2, 3, 4] } }),
      Link.configure({ openOnClick: false, autolink: true, HTMLAttributes: { rel: "noopener", target: "_blank" } }),
      Image.configure({ HTMLAttributes: { class: "w-100" } }),
    ],
    content: value || "<p></p>",
    editorProps: {
      attributes: {
        class: "prose-editor min-h-[420px] px-4 py-3 focus:outline-none",
      },
    },
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
  });

  if (!editor) return <div className="h-96 animate-pulse rounded-lg bg-zinc-100" />;

  return (
    <div className="overflow-hidden rounded-lg border border-zinc-300 bg-white">
      <Toolbar editor={editor} onImage={() => setPickerOpen(true)} />
      <EditorContent editor={editor} />
      <div className="flex justify-between border-t border-zinc-100 px-3 py-1.5 text-xs text-zinc-500">
        <span>{editor.storage.characterCount?.words?.() ?? editor.getText().split(/\s+/).filter(Boolean).length} words</span>
        <span>Select text to link it. Images come from the Media Library.</span>
      </div>
      <Modal open={pickerOpen} onClose={() => setPickerOpen(false)} title="Insert image" size="xl">
        <MediaBrowser
          imagesOnly
          onSelect={(m) => {
            editor.chain().focus().setImage({ src: m.url, alt: m.alt }).run();
            setPickerOpen(false);
          }}
        />
      </Modal>
    </div>
  );
}
