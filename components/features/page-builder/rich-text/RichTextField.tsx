"use client";

import { useCallback, useRef, useState, type ReactNode } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import ImageExtension from "@tiptap/extension-image";
import {
  Bold,
  Heading2,
  Heading3,
  ImagePlus,
  Italic,
  Link as LinkIcon,
  List,
  ListOrdered,
  Unlink,
} from "lucide-react";
import { RICH_TEXT_PROSE } from "./prose";

const btnBase =
  "flex h-8 w-8 items-center justify-center rounded-lg text-[#475569] transition-colors hover:bg-slate-200/70 disabled:opacity-40";
const btnActive = "bg-[#2dbe8f]/15 text-[#162040]";

/**
 * The official image extension renders whatever size the file happens to be,
 * with no way to change it. Adding a `width` attribute — the plain HTML one, so
 * it survives sanitising without inline styles — lets the toolbar offer sizes
 * while a picture is selected.
 */
const ResizableImage = ImageExtension.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      width: {
        default: null,
        parseHTML: (element) => element.getAttribute("width"),
        renderHTML: (attributes) =>
          attributes.width ? { width: attributes.width } : {},
      },
    };
  },
});

const IMAGE_WIDTHS: { label: string; title: string; width: number | null }[] = [
  { label: "S", title: "Imagine mică", width: 160 },
  { label: "M", title: "Imagine medie", width: 280 },
  { label: "L", title: "Imagine mare", width: 480 },
  { label: "100%", title: "Lățime completă", width: null },
];

function ToolbarButton({
  label,
  active,
  onClick,
  children,
}: {
  label: string;
  active?: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={active}
      onClick={onClick}
      className={`${btnBase} ${active ? btnActive : ""}`}
    >
      {children}
    </button>
  );
}

/**
 * Shared TipTap rich-text surface for page-builder block editors. Emits an HTML
 * string on every change; the document is constrained to the StarterKit schema
 * below (paragraphs, bold, italic, H2/H3, bullet + ordered lists, links), so
 * pasted markup is filtered down to that known set.
 */
export function RichTextField({
  value,
  onChange,
  invalid,
  allowImages = false,
  onUploadImage,
}: {
  value: string;
  onChange: (html: string) => void;
  invalid?: boolean;
  /**
   * Off by default: the page-builder's `sanitizeRichText` strips `<img>`, so a
   * surface that allows images must also be rendered through a sanitiser that
   * keeps them.
   */
  allowImages?: boolean;
  /** Returns the stored file's URL, or null when the upload failed. */
  onUploadImage?: (file: File) => Promise<string | null>;
}) {
  const [linkOpen, setLinkOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const imageInput = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    immediatelyRender: false,
    shouldRerenderOnTransaction: true,
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
        blockquote: false,
        code: false,
        codeBlock: false,
        horizontalRule: false,
        strike: false,
        underline: false,
        link: {
          openOnClick: false,
          autolink: true,
          HTMLAttributes: {
            rel: "noopener noreferrer nofollow",
            target: "_blank",
          },
        },
      }),
      ...(allowImages
        ? [ResizableImage.configure({ inline: false, allowBase64: false })]
        : []),
    ],
    content: value,
    editorProps: {
      attributes: {
        class: `min-h-[180px] px-4 py-3 focus:outline-none ${RICH_TEXT_PROSE}${
          allowImages
            ? " [&_img]:my-3 [&_img]:h-auto [&_img]:max-w-full [&_img]:rounded-lg [&_img.ProseMirror-selectednode]:outline [&_img.ProseMirror-selectednode]:outline-2 [&_img.ProseMirror-selectednode]:outline-offset-2 [&_img.ProseMirror-selectednode]:outline-[#2dbe8f]"
            : ""
        }`,
      },
    },
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
  });

  const openLink = useCallback(() => {
    if (!editor) return;
    setLinkUrl((editor.getAttributes("link").href as string) ?? "");
    setLinkOpen(true);
  }, [editor]);

  const insertImage = useCallback(
    async (file: File) => {
      if (!editor || !onUploadImage) return;
      setUploading(true);
      const url = await onUploadImage(file);
      setUploading(false);
      if (!url) return;
      editor.chain().focus().setImage({ src: url, alt: file.name }).run();
    },
    [editor, onUploadImage],
  );

  const applyLink = useCallback(() => {
    if (!editor) return;
    const href = linkUrl.trim();
    const chain = editor.chain().focus().extendMarkRange("link");
    if (href) chain.setLink({ href }).run();
    else chain.unsetLink().run();
    setLinkOpen(false);
  }, [editor, linkUrl]);

  if (!editor) {
    return (
      <div className="min-h-[232px] rounded-xl border border-border bg-slate-50" />
    );
  }

  return (
    <div
      className={`overflow-hidden rounded-xl border transition-colors focus-within:ring-2 focus-within:ring-[#2dbe8f]/30 ${
        invalid
          ? "border-[#ef4444]"
          : "border-border focus-within:border-[#2dbe8f]"
      }`}
    >
      <div className="flex flex-wrap items-center gap-0.5 border-b border-border bg-slate-50/70 p-1.5">
        <ToolbarButton
          label="Bold"
          active={editor.isActive("bold")}
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          <Bold size={16} />
        </ToolbarButton>
        <ToolbarButton
          label="Cursiv"
          active={editor.isActive("italic")}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          <Italic size={16} />
        </ToolbarButton>

        <span className="mx-1 h-5 w-px bg-border" />

        <ToolbarButton
          label="Titlu 2"
          active={editor.isActive("heading", { level: 2 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        >
          <Heading2 size={16} />
        </ToolbarButton>
        <ToolbarButton
          label="Titlu 3"
          active={editor.isActive("heading", { level: 3 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        >
          <Heading3 size={16} />
        </ToolbarButton>

        <span className="mx-1 h-5 w-px bg-border" />

        <ToolbarButton
          label="Listă cu puncte"
          active={editor.isActive("bulletList")}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          <List size={16} />
        </ToolbarButton>
        <ToolbarButton
          label="Listă numerotată"
          active={editor.isActive("orderedList")}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        >
          <ListOrdered size={16} />
        </ToolbarButton>

        <span className="mx-1 h-5 w-px bg-border" />

        <ToolbarButton
          label="Link"
          active={editor.isActive("link")}
          onClick={openLink}
        >
          <LinkIcon size={16} />
        </ToolbarButton>
        {editor.isActive("link") ? (
          <ToolbarButton
            label="Elimină link"
            onClick={() => editor.chain().focus().unsetLink().run()}
          >
            <Unlink size={16} />
          </ToolbarButton>
        ) : null}

        {allowImages && onUploadImage ? (
          <>
            <span className="mx-1 h-5 w-px bg-border" />
            <ToolbarButton
              label={uploading ? "Se încarcă imaginea" : "Adaugă imagine"}
              onClick={() => imageInput.current?.click()}
            >
              <ImagePlus size={16} className={uploading ? "animate-pulse" : undefined} />
            </ToolbarButton>
            <input
              ref={imageInput}
              type="file"
              accept="image/*"
              hidden
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) void insertImage(file);
                event.target.value = "";
              }}
            />

            {/* Sizes appear only with a picture selected — click it in the
                editor first. */}
            {editor.isActive("image")
              ? IMAGE_WIDTHS.map((size) => (
                  <button
                    key={size.label}
                    type="button"
                    aria-label={size.title}
                    title={size.title}
                    aria-pressed={
                      (editor.getAttributes("image").width ?? null) ===
                      (size.width === null ? null : String(size.width))
                    }
                    onClick={() =>
                      editor
                        .chain()
                        .focus()
                        .updateAttributes("image", {
                          width: size.width === null ? null : String(size.width),
                        })
                        .run()
                    }
                    className={`flex h-8 min-w-8 items-center justify-center rounded-lg px-1.5 text-xs font-semibold text-[#475569] transition-colors hover:bg-slate-200/70 ${
                      (editor.getAttributes("image").width ?? null) ===
                      (size.width === null ? null : String(size.width))
                        ? btnActive
                        : ""
                    }`}
                  >
                    {size.label}
                  </button>
                ))
              : null}
          </>
        ) : null}
      </div>

      {linkOpen ? (
        <div className="flex items-center gap-2 border-b border-border bg-white p-2">
          <input
            autoFocus
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                applyLink();
              }
              if (e.key === "Escape") setLinkOpen(false);
            }}
            placeholder="https://exemplu.ro"
            className="flex-1 rounded-lg border border-border px-3 py-1.5 text-sm focus:border-[#2dbe8f] focus:outline-none"
          />
          <button
            type="button"
            onClick={applyLink}
            className="rounded-lg bg-[#2563eb] px-3 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-[#1d4ed8]"
          >
            Aplică
          </button>
          <button
            type="button"
            onClick={() => setLinkOpen(false)}
            className="rounded-lg px-2 py-1.5 text-sm text-[#475569] transition-colors hover:bg-slate-100"
          >
            Anulează
          </button>
        </div>
      ) : null}

      <EditorContent editor={editor} />
    </div>
  );
}
