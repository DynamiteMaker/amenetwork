import { describe, it, expect, vi, beforeEach } from "vitest";
import type { ComponentProps } from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { PostEditor } from "@/components/admin/post-editor";

// Throwaway verification for the scheduling flow: the SCHEDULE button sends
// status="scheduled" plus a future ISO publish_at; validation blocks missing
// or past times; PUBLISH sends status="published".

const maybeSingle = vi.fn();
const savePost = vi.fn();

vi.mock("@/hooks/use-supabase-browser", () => ({
  useSupabaseBrowser: () => ({
    from: () => ({ select: () => ({ eq: () => ({ maybeSingle }) }) }),
  }),
}));

vi.mock("@/app/[locale]/admin/(dashboard)/actions", () => ({
  savePost: (fd: FormData) => savePost(fd),
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
      excerpt: null,
      content: "<p>Nội dung</p>",
      meta_title: null,
      meta_description: null,
    },
  ],
};

async function mount(overrides: Record<string, unknown> = {}) {
  maybeSingle.mockResolvedValue({ data: { ...post, ...overrides }, error: null });
  render(<PostEditor type="post" id="p1" />);
  await waitFor(() =>
    expect((screen.getByLabelText(/title \(tiếng việt\)/i) as HTMLInputElement).value).toBe(
      "Xin chào",
    ),
  );
}

const scheduleInput = () => screen.getByLabelText(/schedule time/i) as HTMLInputElement;

describe("PostEditor scheduling", () => {
  beforeEach(() => {
    maybeSingle.mockReset();
    savePost.mockReset();
  });

  it("sends status scheduled with a future ISO publish_at", async () => {
    await mount();

    fireEvent.change(scheduleInput(), { target: { value: "2030-06-01T09:30" } });
    fireEvent.click(screen.getByRole("button", { name: /schedule/i }));

    await waitFor(() => expect(savePost).toHaveBeenCalledOnce());
    const fd = savePost.mock.calls[0][0] as FormData;
    expect(fd.get("status")).toBe("scheduled");
    const sent = new Date(String(fd.get("publish_at")));
    // Interpreted in the admin's local timezone, stored as UTC ISO.
    expect(sent.toISOString()).toBe(new Date("2030-06-01T09:30").toISOString());
  });

  it("blocks scheduling without a time and shows an error", async () => {
    await mount();

    fireEvent.click(screen.getByRole("button", { name: /schedule/i }));

    expect(savePost).not.toHaveBeenCalled();
    expect(await screen.findByText(/pick a date and time/i)).toBeTruthy();
  });

  it("publishing sends status published", async () => {
    await mount();

    fireEvent.click(screen.getByRole("button", { name: /^publish$/i }));

    await waitFor(() => expect(savePost).toHaveBeenCalledOnce());
    const fd = savePost.mock.calls[0][0] as FormData;
    expect(fd.get("status")).toBe("published");
    expect(fd.get("publish_at")).toBeNull();
  });

  it("shows the scheduled time chip when editing a scheduled post", async () => {
    await mount({ status: "scheduled", published_at: "2030-01-01T02:00:00Z" });

    expect(
      await screen.findByText(
        (_, el) =>
          el?.tagName === "SPAN" &&
          /scheduled/i.test(el.textContent ?? "") &&
          (el.textContent ?? "").includes("2030"),
      ),
    ).toBeTruthy();
  });
});
