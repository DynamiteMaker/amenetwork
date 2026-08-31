const MAX_LENGTH = 80;

export function slugify(input: string): string {
  const slug = input
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "d")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  if (slug.length <= MAX_LENGTH) return slug;

  // Cut on a word boundary so long titles never end mid-word
  // (e.g. "...da-thay-doi-ra" instead of "...da-thay-doi").
  const cut = slug.slice(0, MAX_LENGTH + 1);
  const boundary = cut.lastIndexOf("-");
  return (boundary > 0 ? cut.slice(0, boundary) : cut.slice(0, MAX_LENGTH)).replace(/-$/, "");
}
