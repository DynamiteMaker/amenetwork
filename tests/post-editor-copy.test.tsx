import { describe, it, expect, vi, beforeEach } from "vitest";
import type { ComponentProps } from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { PostEditor } from "@/components/admin/post-editor";

// Throwaway verification for the "copy all fields from <locale>" control.
// Loads a post with vi fully filled + en title-only, then checks the
// one-click copy replaces every field of the active tab at once.

const maybeSingle = vi.fn();

vi.mock("@/hooks/use-supabase-browser", () => ({
  useSupabaseBrowser: () => ({
    from: () => ({ select: () => ({ eq: () => ({ maybeSingle }) }) }),
  }),
}));

vi.mock("@/i18n/routing", () => ({
  Link: (p: ComponentProps<"a">) => <a {...p} />,
}));
vi.mock("@/app/[locale]/admin/(dashboard)/actions", () => ({ savePost: vi.fn() }));

const post = {
  id: "p1",
  slug: "hello-world",
  featured_image: null,
  is_featured: false,
  category: null,
  tags: [],
  translations: [
    {
      locale: "vi",
      title: "Xin chào",
      excerpt: "Tóm tắt VI",
      content: "<p>Nội dung VI</p>",
      meta_title: "Meta VI",
      meta_description: "Mô tả VI",
    },
    {
      locale: "en",
      title: "Old EN title",
      excerpt: null,
      content: null,
      meta_title: null,
      meta_description: null,
    },
  ],
};

async function mount() {
  maybeSingle.mockResolvedValue({ data: post, error: null });
  const utils = render(<PostEditor type="post" id="p1" />);
  await waitFor(() =>
    expect((screen.getByLabelText(/title \(tiếng việt\)/i) as HTMLInputElement).value).toBe(
      "Xin chào",
    ),
  );
  return utils;
}

describe("PostEditor one-click locale copy", () => {
  beforeEach(() => {
    maybeSingle.mockReset();
    vi.restoreAllMocks();
  });

  it("copies title, excerpt, meta and content from vi to en in one click", async () => {
    window.confirm = vi.fn(() => true);
    await mount();

    fireEvent.click(screen.getByRole("button", { name: /english/i }));

    // Copy control visible, offering the filled locale as source.
    const select = screen.getByLabelText(/source language to copy from/i) as HTMLSelectElement;
    expect(select.value).toBe("vi");

    fireEvent.click(screen.getByRole("button", { name: /copy/i }));

    // All five fields arrive at once — the whole TranslationForm structure.
    expect((screen.getByLabelText(/title \(english\)/i) as HTMLInputElement).value).toBe(
      "Xin chào",
    );
    expect((screen.getByLabelText(/excerpt \(english\)/i) as HTMLTextAreaElement).value).toBe(
      "Tóm tắt VI",
    );
    expect((screen.getByLabelText(/meta title/i) as HTMLInputElement).value).toBe("Meta VI");
    expect(
      (screen.getByLabelText(/meta description/i) as HTMLTextAreaElement).value,
    ).toBe("Mô tả VI");

    // TipTap receives the copied content via its value-sync effect.
    const prose = document.querySelector(".ProseMirror") as HTMLElement;
    await waitFor(() => expect(prose.innerHTML).toContain("Nội dung VI"));
  });

  it("keeps the target fields when the overwrite confirm is declined", async () => {
    window.confirm = vi.fn(() => false);
    await mount();

    fireEvent.click(screen.getByRole("button", { name: /english/i }));
    fireEvent.click(screen.getByRole("button", { name: /copy/i }));

    expect(window.confirm).toHaveBeenCalled();
    expect((screen.getByLabelText(/title \(english\)/i) as HTMLInputElement).value).toBe(
      "Old EN title",
    );
  });
});
