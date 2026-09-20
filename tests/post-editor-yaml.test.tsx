import { describe, it, expect, vi, beforeEach } from "vitest";
import type { ComponentProps } from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { PostEditor } from "@/components/admin/post-editor";

// Throwaway verification for the YAML view: serialize the active tab, paste
// translated YAML (as ChatGPT would return it, fence included), apply.

const maybeSingle = vi.fn();

vi.mock("@/hooks/use-supabase-browser", () => ({
  useSupabaseBrowser: () => ({
    from: () => ({ select: () => ({ eq: () => ({ maybeSingle }) }) }),
  }),
}));

vi.mock("@/app/[locale]/admin/(dashboard)/actions", () => ({
  savePost: vi.fn(),
}));

vi.mock("@/i18n/routing", () => ({
  Link: (p: ComponentProps<"a">) => <a {...p} />,
}));

const post = {
  id: "p1",
  slug: "hello-world",
  featured_image: null,
  is_featured: false,
  category: null,
  tags: [],
  status: "draft",
  published_at: null,
  translations: [
    {
      locale: "vi",
      title: "Xin chào",
      excerpt: "Tóm tắt VI",
      content: "<p>Nội dung VI</p>\n<p>Dòng thứ hai</p>",
      meta_title: "Meta VI",
      meta_description: "Mô tả VI",
    },
  ],
};
const translatedYaml = [
  "```yaml",
  "title: こんにちは",
  "excerpt: |-",
  "  日本語の要約",
  "content: |-",
  "  <p>日本語の内容</p>",
  "meta_title: メタ VI",
  "meta_description: メタ説明",
  "```",
].join("\n");

async function mount() {
  maybeSingle.mockResolvedValue({ data: post, error: null });
  render(<PostEditor type="post" id="p1" />);
  await waitFor(() =>
    expect((screen.getByLabelText(/title \(tiếng việt\)/i) as HTMLInputElement).value).toBe(
      "Xin chào",
    ),
  );
}

describe("PostEditor YAML view", () => {
  beforeEach(() => {
    maybeSingle.mockReset();
    window.confirm = vi.fn(() => true);
  });

  it("serializes the active tab as YAML", async () => {
    await mount();

    fireEvent.click(screen.getByRole("button", { name: /^yaml$/i }));

    const area = (await screen.findByLabelText(/yaml fields/i)) as HTMLTextAreaElement;
    expect(area.value).toContain("title: Xin chào");
    expect(area.value).toContain("meta_description: Mô tả VI");
    // Multiline HTML stays a literal block, not an escaped one-liner.
    expect(area.value).toContain("content: |-");
  });

  it("applies pasted translated YAML to another tab in one action", async () => {
    await mount();

    fireEvent.click(screen.getByRole("button", { name: /english/i }));
    fireEvent.click(screen.getByRole("button", { name: /^yaml$/i }));
    fireEvent.change(await screen.findByLabelText(/yaml fields/i), {
      target: { value: translatedYaml },
    });
    fireEvent.click(screen.getByRole("button", { name: /apply yaml/i }));

    expect(await screen.findByText(/applied yaml to english/i)).toBeTruthy();
    // Back in form view with every field filled from the YAML.
    expect((screen.getByLabelText(/title \(english\)/i) as HTMLInputElement).value).toBe(
      "こんにちは",
    );
    expect((screen.getByLabelText(/excerpt \(english\)/i) as HTMLTextAreaElement).value).toBe(
      "日本語の要約",
    );
    expect((screen.getByLabelText(/meta title/i) as HTMLInputElement).value).toBe("メタ VI");
    const prose = document.querySelector(".ProseMirror") as HTMLElement;
    await waitFor(() => expect(prose.innerHTML).toContain("日本語の内容"));
  });

  it("rejects invalid YAML without touching the fields", async () => {
    await mount();

    fireEvent.click(screen.getByRole("button", { name: /^yaml$/i }));
    fireEvent.change(await screen.findByLabelText(/yaml fields/i), {
      target: { value: "title: [unclosed" },
    });
    fireEvent.click(screen.getByRole("button", { name: /apply yaml/i }));
    expect(await screen.findByText(/invalid yaml/i)).toBeTruthy();

    // Still in YAML view; switch back and confirm the fields are untouched.
    fireEvent.click(screen.getByRole("button", { name: /^form$/i }));
    expect((screen.getByLabelText(/title \(tiếng việt\)/i) as HTMLInputElement).value).toBe(
      "Xin chào",
    );
  });
});
