"use client";

import { useEditor, useEditorState, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import {
  Bold, Italic, Heading2, Heading3, List, ListOrdered,
  Link as LinkIcon, Image as ImageIcon, ImageUp, Quote, Undo2, Redo2,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useSupabaseBrowser } from "@/hooks/use-supabase-browser";
import { altFromFileName, uploadMedia } from "@/lib/upload-media";
import { rehostImage } from "@/app/[locale]/admin/(dashboard)/actions";

// Images that already live in our own Supabase project are left alone;
// everything else pasted in has to be copied over.
const MEDIA_HOST = (() => {
  try {
    return new URL(process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").hostname;
  } catch {
    return "";
  }
})();

const INACTIVE = {
  bold: false,
  italic: false,
  h2: false,
  h3: false,
  bulletList: false,
  orderedList: false,
  blockquote: false,
  link: false,
  imageAlt: null as string | null,
};

export function TipTapEditor({
  value,
  onChange,
  placeholder = "Write something...",
}: {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
}) {
  const supabase = useSupabaseBrowser();
  const [uploading, setUploading] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  // ProseMirror registers paste/drop handlers once with the editor, so they
  // reach the upload function through a ref instead of a stale closure.
  const insertFiles = useRef<(files: File[], pos?: number) => void>(() => {});
  const adoptImages = useRef<() => void>(() => {});

  const editor = useEditor({
    extensions: [
      // StarterKit already ships Link; configuring it here avoids registering
      // the extension twice.
      StarterKit.configure({
        link: { openOnClick: false, HTMLAttributes: { class: "text-brand underline" } },
      }),
      // Word and Excel paste their images inline as data: URLs. They have to
      // survive the paste so the adopt pass below can move them to storage —
      // otherwise ProseMirror drops them and the paste silently loses images.
      Image.configure({ allowBase64: true }),
      Placeholder.configure({ placeholder }),
    ],
    content: value || "",
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    editorProps: {
      attributes: {
        class: "prose prose-sm max-w-none min-h-[280px] focus:outline-none px-4 py-3",
      },
      handlePaste: (_view, event) => {
        const files = imageFiles(event.clipboardData?.files);
        if (files.length === 0) {
          // Pasted markup (Google Docs, Word, a web page) keeps foreign image
          // URLs; let ProseMirror insert it, then move the images to our own
          // bucket once the transaction has been applied.
          setTimeout(() => adoptImages.current(), 0);
          return false;
        }
        event.preventDefault();
        insertFiles.current(files);
        return true;
      },
      handleDrop: (view, event, _slice, moved) => {
        if (moved) return false;
        const drag = event as DragEvent;
        const files = imageFiles(drag.dataTransfer?.files);
        if (files.length === 0) {
          setTimeout(() => adoptImages.current(), 0);
          return false;
        }
        drag.preventDefault();
        const dropped = view.posAtCoords({ left: drag.clientX, top: drag.clientY });
        insertFiles.current(files, dropped?.pos);
        return true;
      },
    },
    immediatelyRender: false,
  });

  // TipTap v3 never re-renders on transactions, so every piece of state the
  // toolbar and the alt bar read has to be selected explicitly. The selector
  // only reruns once the view is mounted and emits transactions, hence the
  // all-inactive fallback for the very first render.
  const state =
    useEditorState({
      editor,
      selector: ({ editor }) =>
        editor
          ? {
              bold: editor.isActive("bold"),
              italic: editor.isActive("italic"),
              h2: editor.isActive("heading", { level: 2 }),
              h3: editor.isActive("heading", { level: 3 }),
              bulletList: editor.isActive("bulletList"),
              orderedList: editor.isActive("orderedList"),
              blockquote: editor.isActive("blockquote"),
              link: editor.isActive("link"),
              imageAlt: editor.isActive("image")
                ? ((editor.getAttributes("image").alt as string | null) ?? "")
                : null,
            }
          : INACTIVE,
    }) ?? INACTIVE;

  const upload = useCallback(
    async (files: File[], pos?: number) => {
      if (!editor) return;
      setError(null);
      for (const file of files) {
        setUploading((n) => n + 1);
        try {
          const src = await uploadMedia(supabase, file);
          const node = { type: "image", attrs: { src, alt: altFromFileName(file.name) } };
          if (pos === undefined) editor.chain().focus().insertContent(node).run();
          else editor.chain().focus().insertContentAt(pos, node).run();

          // Select the image just inserted: it puts the alt-text field in
          // reach immediately, and a drop of several files keeps their order.
          let inserted: number | null = null;
          editor.state.doc.descendants((node, at) => {
            if (node.type.name === "image" && node.attrs.src === src) inserted = at;
          });
          if (inserted !== null) {
            editor.commands.setNodeSelection(inserted);
            if (pos !== undefined) pos = inserted + 1;
          }
        } catch (e: unknown) {
          setError(e instanceof Error ? e.message : "Upload failed");
        } finally {
          setUploading((n) => n - 1);
        }
      }
    },
    [editor, supabase],
  );

  // Anything pasted from outside points at someone else's server (or carries
  // the whole file inline as a data: URL). Both are moved into our bucket so a
  // published article never depends on a foreign host that can rot or block us.
  const adopt = useCallback(async () => {
    if (!editor) return;
    const foreign = new Set<string>();
    editor.state.doc.descendants((node) => {
      const src = node.type.name === "image" ? (node.attrs.src as string | null) : null;
      if (src && isForeignImage(src)) foreign.add(src);
    });
    if (foreign.size === 0) return;

    setError(null);
    for (const src of foreign) {
      setUploading((n) => n + 1);
      try {
        const hosted = src.startsWith("data:")
          ? await uploadMedia(supabase, await dataUrlToFile(src))
          : await rehostImage(src);
        const tr = editor.state.tr;
        editor.state.doc.descendants((node, at) => {
          if (node.type.name === "image" && node.attrs.src === src) {
            tr.setNodeMarkup(at, undefined, { ...node.attrs, src: hosted });
          }
        });
        if (tr.docChanged) editor.view.dispatch(tr);
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : "Could not copy a pasted image");
      } finally {
        setUploading((n) => n - 1);
      }
    }
  }, [editor, supabase]);

  useEffect(() => {
    insertFiles.current = (files, pos) => void upload(files, pos);
    adoptImages.current = () => void adopt();
  }, [upload, adopt]);

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
        <TBtn on={() => editor.chain().focus().toggleBold().run()} active={state.bold} title="Bold">
          <Bold size={15} />
        </TBtn>
        <TBtn on={() => editor.chain().focus().toggleItalic().run()} active={state.italic} title="Italic">
          <Italic size={15} />
        </TBtn>
        <span className="w-px h-5 bg-line mx-1" />
        <TBtn on={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={state.h2} title="H2">
          <Heading2 size={15} />
        </TBtn>
        <TBtn on={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={state.h3} title="H3">
          <Heading3 size={15} />
        </TBtn>
        <span className="w-px h-5 bg-line mx-1" />
        <TBtn on={() => editor.chain().focus().toggleBulletList().run()} active={state.bulletList} title="Bullets">
          <List size={15} />
        </TBtn>
        <TBtn on={() => editor.chain().focus().toggleOrderedList().run()} active={state.orderedList} title="Numbers">
          <ListOrdered size={15} />
        </TBtn>
        <TBtn on={() => editor.chain().focus().toggleBlockquote().run()} active={state.blockquote} title="Quote">
          <Quote size={15} />
        </TBtn>
        <span className="w-px h-5 bg-line mx-1" />
        <TBtn
          on={() => {
            const url = window.prompt("Enter URL");
            if (url) editor.chain().focus().setLink({ href: url }).run();
          }}
          active={state.link}
          title="Link"
        >
          <LinkIcon size={15} />
        </TBtn>
        <TBtn
          on={() => fileInput.current?.click()}
          disabled={uploading > 0}
          title="Upload image (max 5MB) — you can also paste or drop images into the text"
        >
          <ImageUp size={15} />
        </TBtn>
        <TBtn
          on={() => {
            const url = window.prompt("Image URL");
            if (!url) return;
            editor.chain().focus().setImage({ src: url, alt: "" }).run();
            void adopt();
          }}
          title="Image from URL"
        >
          <ImageIcon size={15} />
        </TBtn>
        <span className="w-px h-5 bg-line mx-1" />
        <TBtn on={() => editor.chain().focus().undo().run()} title="Undo"><Undo2 size={15} /></TBtn>
        <TBtn on={() => editor.chain().focus().redo().run()} title="Redo"><Redo2 size={15} /></TBtn>

        {uploading > 0 && (
          <span className="ml-2 text-xs text-ink-3">
            Uploading{uploading > 1 ? ` ${uploading} images` : ""}...
          </span>
        )}
        {error && <span className="ml-2 text-xs text-destructive">{error}</span>}
      </div>

      <input
        ref={fileInput}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => {
          const files = imageFiles(e.target.files);
          e.target.value = "";
          if (files.length > 0) void upload(files);
        }}
      />

      <EditorContent editor={editor} />

      {/* Alt text is the one image attribute an editor must be able to fix
          after insertion (SEO + a11y), so it is editable while one is selected. */}
      {state.imageAlt !== null && (
        <div className="flex items-center gap-2 px-4 py-2 border-t border-line bg-bg-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-ink-3">Alt</span>
          <input
            value={state.imageAlt}
            onChange={(e) =>
              editor.chain().focus().updateAttributes("image", { alt: e.target.value }).run()
            }
            placeholder="Describe the image"
            className="flex-1 bg-transparent text-sm text-ink outline-none placeholder:text-ink-3"
            maxLength={200}
          />
        </div>
      )}
    </div>
  );
}

function imageFiles(list: FileList | null | undefined): File[] {
  return Array.from(list ?? []).filter((f) => f.type.startsWith("image/"));
}

function isForeignImage(src: string): boolean {
  if (src.startsWith("data:image/")) return true;
  if (!/^https?:\/\//i.test(src)) return false;
  try {
    return new URL(src).hostname !== MEDIA_HOST;
  } catch {
    return false;
  }
}

async function dataUrlToFile(dataUrl: string): Promise<File> {
  const blob = await (await fetch(dataUrl)).blob();
  const ext = blob.type.split("/")[1]?.split("+")[0] || "png";
  return new File([blob], `pasted-image.${ext}`, { type: blob.type });
}

function TBtn({
  on,
  active,
  disabled,
  children,
  title,
}: {
  on: () => void;
  active?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
  title: string;
}) {
  return (
    <button
      type="button"
      onClick={on}
      title={title}
      disabled={disabled}
      className={`p-1.5 rounded hover:bg-bg-2 disabled:opacity-40 disabled:cursor-not-allowed ${active ? "bg-brand-soft text-brand" : "text-ink-2"}`}
    >
      {children}
    </button>
  );
}
