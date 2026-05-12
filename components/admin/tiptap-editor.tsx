"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import {
  Bold, Italic, Heading2, Heading3, List, ListOrdered,
  Link as LinkIcon, Image as ImageIcon, Quote, Undo2, Redo2,
} from "lucide-react";
import { useEffect } from "react";

export function TipTapEditor({
  value,
  onChange,
  placeholder = "Write something...",
}: {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
}) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({ openOnClick: false, HTMLAttributes: { class: "text-brand underline" } }),
      Image,
      Placeholder.configure({ placeholder }),
    ],
    content: value || "",
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    editorProps: {
      attributes: {
        class: "prose prose-sm max-w-none min-h-[280px] focus:outline-none px-4 py-3",
      },
    },
  });

  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value || "", { emitUpdate: false });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  if (!editor) return null;

  return (
    <div className="border border-line rounded-xl bg-surface overflow-hidden">
      <div className="flex flex-wrap items-center gap-1 p-2 border-b border-line bg-bg-2">
        <TBtn on={() => editor.chain().focus().toggleBold().run()} active={editor.isActive("bold")} title="Bold">
          <Bold size={15} />
        </TBtn>
        <TBtn on={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive("italic")} title="Italic">
          <Italic size={15} />
        </TBtn>
        <span className="w-px h-5 bg-line mx-1" />
        <TBtn on={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive("heading", { level: 2 })} title="H2">
          <Heading2 size={15} />
        </TBtn>
        <TBtn on={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive("heading", { level: 3 })} title="H3">
          <Heading3 size={15} />
        </TBtn>
        <span className="w-px h-5 bg-line mx-1" />
        <TBtn on={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive("bulletList")} title="Bullets">
          <List size={15} />
        </TBtn>
        <TBtn on={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive("orderedList")} title="Numbers">
          <ListOrdered size={15} />
        </TBtn>
        <TBtn on={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive("blockquote")} title="Quote">
          <Quote size={15} />
        </TBtn>
        <span className="w-px h-5 bg-line mx-1" />
        <TBtn
          on={() => {
            const url = window.prompt("Enter URL");
            if (url) editor.chain().focus().setLink({ href: url }).run();
          }}
          active={editor.isActive("link")}
          title="Link"
        >
          <LinkIcon size={15} />
        </TBtn>
        <TBtn
          on={() => {
            const url = window.prompt("Image URL");
            if (url) editor.chain().focus().setImage({ src: url }).run();
          }}
          title="Image"
        >
          <ImageIcon size={15} />
        </TBtn>
        <span className="w-px h-5 bg-line mx-1" />
        <TBtn on={() => editor.chain().focus().undo().run()} title="Undo"><Undo2 size={15} /></TBtn>
        <TBtn on={() => editor.chain().focus().redo().run()} title="Redo"><Redo2 size={15} /></TBtn>
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}

function TBtn({ on, active, children, title }: { on: () => void; active?: boolean; children: React.ReactNode; title: string }) {
  return (
    <button
      type="button"
      onClick={on}
      title={title}
      className={`p-1.5 rounded hover:bg-bg-2 ${active ? "bg-brand-soft text-brand" : "text-ink-2"}`}
    >
      {children}
    </button>
  );
}
