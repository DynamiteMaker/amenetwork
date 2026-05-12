export function AdminField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-xs font-semibold tracking-[0.12em] uppercase text-ink-3">{label}</span>
      <div className="mt-1.5">{children}</div>
    </label>
  );
}
