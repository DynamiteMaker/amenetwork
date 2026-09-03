"use client";

import { useState } from "react";
import { z } from "zod";
import { createClient } from "@/lib/supabase/client";
import { Send, Clock } from "lucide-react";
import { WhatsappIcon } from "@/components/social-icons";
import { CONTACT } from "@/data/offices";
import { useTranslations } from "next-intl";
import type { Database } from "@/lib/supabase/types";

declare global {
  interface Window {
    plausible?: (eventName: string) => void;
  }
}

type ContactSubmissionInsert = Database["public"]["Tables"]["contact_submissions"]["Insert"];

const contactSchema = z.object({
  name: z.string().trim().min(1, "Required").max(100),
  email: z.string().trim().email("Invalid email").max(255),
  company: z.string().trim().max(150).optional(),
  type: z.string().min(1).max(80),
  message: z.string().trim().min(10, "Message too short").max(2000),
});

type FieldErrors = Partial<Record<keyof z.infer<typeof contactSchema>, string>>;

export function ContactForm() {
  const t = useTranslations("contact");
  const [data, setData] = useState({
    name: "",
    email: "",
    company: "",
    type: t("form.typeOptions.0"),
    message: "",
  });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const typeOptions: string[] = t.raw("form.typeOptions") as never;

  const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setData((d) => ({ ...d, [e.target.name]: e.target.value }));
    if (errors[e.target.name as keyof FieldErrors]) {
      setErrors((prev) => ({ ...prev, [e.target.name]: undefined }));
    }
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = contactSchema.safeParse(data);
    if (!result.success) {
      const fieldErrs: FieldErrors = {};
      result.error.issues.forEach((iss) => {
        const k = iss.path[0] as keyof FieldErrors;
        if (k && !fieldErrs[k]) fieldErrs[k] = iss.message;
      });
      setErrors(fieldErrs);
      return;
    }
    const v = result.data;
    setSubmitting(true);
    const supabase = createClient();
    const payload: ContactSubmissionInsert = {
      full_name: v.name,
      email: v.email,
      company: v.company || null,
      message: `[${v.type}] ${v.message}`,
    };
    const { error } = await supabase.from("contact_submissions").insert(payload);
    setSubmitting(false);
    if (error) {
      setErrors({ message: "Submission failed. Please try again." });
      return;
    }
    setSuccess(true);
    setData({ name: "", email: "", company: "", type: typeOptions[0], message: "" });
    if (typeof window !== "undefined") {
      window.plausible?.("contact_form_submit");
    }
  };

  if (success) {
    return (
      <div className="card-soft p-7 md:p-10 text-center">
        <div className="text-4xl mb-4">&#10003;</div>
        <h2 className="font-display text-2xl">Message sent!</h2>
        <p className="mt-2 text-ink-2">We will reply within 24 hours.</p>
        <button
          onClick={() => setSuccess(false)}
          className="btn-primary-soft mt-6"
        >
          Send another message
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      className="relative card-soft p-7 md:p-10 overflow-hidden hover:translate-y-0"
      noValidate
    >
      <div
        aria-hidden
        className="absolute -top-24 -right-24 w-72 h-72 rounded-full opacity-60"
        style={{ background: "radial-gradient(closest-side, hsl(var(--peach-soft)), transparent)" }}
      />
      <div className="relative">
        <h2 className="font-display text-3xl md:text-4xl leading-tight">
          {t("info.heading")}
        </h2>
        <p className="text-ink-2 mt-2 text-[15px]">{t("sub")}</p>

        <div className="mt-8 grid gap-5 sm:grid-cols-2">
          <Field label={t("form.name")} error={errors.name}>
            <input required name="name" maxLength={100} value={data.name} onChange={onChange} className="ame-input" />
          </Field>
          <Field label={t("form.email")} error={errors.email}>
            <input required type="email" name="email" maxLength={255} value={data.email} onChange={onChange} className="ame-input" />
          </Field>
          <Field label={t("form.company")}>
            <input name="company" maxLength={150} value={data.company} onChange={onChange} className="ame-input" />
          </Field>
          <Field label={t("form.type")}>
            <select name="type" value={data.type} onChange={onChange} className="ame-input">
              {typeOptions.map((o) => (
                <option key={o}>{o}</option>
              ))}
            </select>
          </Field>
        </div>

        <div className="mt-5">
          <Field label={t("form.message")} error={errors.message}>
            <textarea required rows={6} maxLength={2000} name="message" value={data.message} onChange={onChange} className="ame-input resize-y" />
            <div className="text-right text-xs text-ink-3 mt-1">{data.message.length} / 2000</div>
          </Field>
        </div>

        <div className="mt-6 pt-5 border-t border-line flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
          <p className="text-xs text-ink-3 flex items-center gap-1.5">
            <Clock size={14} /> Response within 24 hours
          </p>
          <div className="flex gap-2">
            <a href={CONTACT.whatsappUrl} target="_blank" rel="noopener" className="btn-ghost-soft">
              <WhatsappIcon className="w-4 h-4" /> {t("form.whatsapp")}
            </a>
            <button type="submit" disabled={submitting} className="btn-peach">
              <Send size={16} /> {submitting ? "..." : t("form.submit")}
            </button>
          </div>
        </div>
      </div>

      <style>{`
        .ame-input {
          width: 100%;
          background: hsl(var(--surface));
          border: 1px solid hsl(var(--line));
          border-radius: 1rem;
          padding: 0.85rem 1.05rem;
          font-size: 15px;
          color: hsl(var(--ink));
          transition: border-color .2s ease, box-shadow .2s ease;
        }
        .ame-input::placeholder { color: hsl(var(--ink-3) / 0.6); }
        .ame-input:focus {
          outline: none;
          border-color: hsl(var(--brand));
          box-shadow: 0 0 0 4px hsl(var(--brand) / 0.12);
        }
      `}</style>
    </form>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-xs font-semibold tracking-[0.12em] uppercase text-ink-3">{label}</span>
      <div className="mt-2">{children}</div>
      {error && <p className="mt-1.5 text-xs text-destructive">{error}</p>}
    </label>
  );
}
