import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { fireEvent } from "@testing-library/dom";
import { setTimeout as sleep } from "node:timers/promises";
import { TipTapEditor } from "@/components/admin/tiptap-editor";

const upload = vi.fn(async (): Promise<{ error: { message: string } | null }> => ({ error: null }));

vi.mock("@/hooks/use-supabase-browser", () => ({
  useSupabaseBrowser: () => ({
    storage: {
      from: () => ({
        upload,
        getPublicUrl: (path: string) => ({ data: { publicUrl: `https://cdn.test/media/${path}` } }),
      }),
    },
  }),
}));

const rehostImage = vi.fn(
  async (url: string) =>
    `https://project.test.supabase.co/storage/v1/object/public/media/posts/copied-${url.split("/").pop()}`,
);

vi.mock("@/app/[locale]/admin/(dashboard)/actions", () => ({ rehostImage: (url: string) => rehostImage(url) }));

describe("TipTapEditor image upload", () => {
  beforeEach(() => {
    upload.mockClear();
    upload.mockImplementation(async () => ({ error: null }));
    rehostImage.mockClear();
  });

  const fileInputOf = (container: HTMLElement) =>
    container.querySelector('input[type="file"]') as HTMLInputElement;

  it("uploads a picked file and inserts it into the article HTML", async () => {
    const onChange = vi.fn();
    const { container } = render(<TipTapEditor value="<p>Body</p>" onChange={onChange} />);

    const file = new File([new Uint8Array(8)], "ha-noi-office.png", { type: "image/png" });
    fireEvent.change(fileInputOf(container), { target: { files: [file] } });

    await waitFor(() => expect(onChange).toHaveBeenCalled());
    const html = onChange.mock.calls.at(-1)![0] as string;
    expect(html).toMatch(/<img src="https:\/\/cdn\.test\/media\/posts\/\d+-[a-z0-9]{6}\.png"/);
    expect(html).toContain('alt="ha noi office"');
    expect(upload).toHaveBeenCalledOnce();
  });

  it("reports the storage error instead of inserting a broken image", async () => {
    upload.mockImplementation(async () => ({ error: { message: "row-level security" } }));
    const onChange = vi.fn();
    const { container } = render(<TipTapEditor value="<p>Body</p>" onChange={onChange} />);

    const file = new File([new Uint8Array(8)], "office.png", { type: "image/png" });
    fireEvent.change(fileInputOf(container), { target: { files: [file] } });

    expect(await screen.findByText("row-level security")).toBeInTheDocument();
    expect(onChange.mock.calls.every(([html]) => !String(html).includes("<img"))).toBe(true);
  });

  it("ignores non-image files", async () => {
    const onChange = vi.fn();
    const { container } = render(<TipTapEditor value="<p>Body</p>" onChange={onChange} />);

    const pdf = new File([new Uint8Array(4)], "brief.pdf", { type: "application/pdf" });
    fireEvent.change(fileInputOf(container), { target: { files: [pdf] } });

    // `setTimeout` from node:timers/promises, not Promise.withResolvers: CI runs Node 20.
    await sleep(20);
    expect(upload).not.toHaveBeenCalled();
  });

  it("selects the inserted image so its alt text can be corrected", async () => {
    const onChange = vi.fn();
    const { container } = render(<TipTapEditor value="<p>Body</p>" onChange={onChange} />);

    const file = new File([new Uint8Array(8)], "office.png", { type: "image/png" });
    fireEvent.change(fileInputOf(container), { target: { files: [file] } });

    const altInput = await screen.findByPlaceholderText("Describe the image");
    fireEvent.change(altInput, { target: { value: "AME office in Ha Noi" } });

    await waitFor(() =>
      expect(onChange.mock.calls.at(-1)![0]).toContain('alt="AME office in Ha Noi"'),
    );
  });

  it("copies an image added by URL into our own bucket", async () => {
    const prompt = vi.spyOn(window, "prompt").mockReturnValue("https://images.example.com/chart.jpg");
    const onChange = vi.fn();
    const { container } = render(<TipTapEditor value="<p>Body</p>" onChange={onChange} />);

    fireEvent.click(container.querySelector('button[title="Image from URL"]')!);

    await waitFor(() => expect(rehostImage).toHaveBeenCalledWith("https://images.example.com/chart.jpg"));
    await waitFor(() =>
      expect(onChange.mock.calls.at(-1)![0]).toContain(
        'src="https://project.test.supabase.co/storage/v1/object/public/media/posts/copied-chart.jpg"',
      ),
    );
    prompt.mockRestore();
  });

  it("leaves an image that already lives in our bucket alone", async () => {
    const own = "https://project.test.supabase.co/storage/v1/object/public/media/posts/existing.jpg";
    const prompt = vi.spyOn(window, "prompt").mockReturnValue(own);
    const onChange = vi.fn();
    const { container } = render(<TipTapEditor value="<p>Body</p>" onChange={onChange} />);

    fireEvent.click(container.querySelector('button[title="Image from URL"]')!);

    await waitFor(() => expect(onChange.mock.calls.at(-1)![0]).toContain(own));
    expect(rehostImage).not.toHaveBeenCalled();
    prompt.mockRestore();
  });
});
