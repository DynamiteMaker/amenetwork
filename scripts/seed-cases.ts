import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { join, resolve } from "path";

// Load .env.local manually (tsx doesn't auto-load it)
const envPath = resolve(process.cwd(), ".env.local");
const envContent = readFileSync(envPath, "utf-8");
for (const line of envContent.split("\n")) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith("#")) continue;
  const eqIdx = trimmed.indexOf("=");
  if (eqIdx === -1) continue;
  const key = trimmed.slice(0, eqIdx).trim();
  const val = trimmed.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, "");
  if (!process.env[key]) process.env[key] = val;
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

const LOCALES = ["en", "vi", "ja", "zh"] as const;
const IMAGE_MAP: Record<string, string> = {
  vinfast: "/cases/vinfast.jpg",
  bizfly: "/cases/bizfly.jpg",
  "clb-ban-sung": "/cases/clb-ban-sung.jpg",
  honya: "/cases/honya.jpg",
  "an-dien": "/cases/an-dien.jpg",
  shinbi: "/cases/shinbi.jpg",
  koolsoft: "/cases/koolsoft.jpg",
  homegy: "/cases/homegy.jpg",
  "csm-hospital": "/cases/csm.jpg",
};

interface CaseDetail {
  slug: string;
  client: string;
  tag: string;
  title: string;
  metric: string;
  metricLabel: string;
  context: string;
  challenge: string;
  solution: string[];
  results: { value: string; label: string }[];
  testimonial?: { quote: string; author: string; role: string };
}

interface MessagesCases {
  [key: string]: CaseDetail | unknown;
}

async function seed() {
  const messagesDir = join(process.cwd(), "messages");
  const allMessages: Record<string, MessagesCases> = {};
  for (const loc of LOCALES) {
    const raw = JSON.parse(readFileSync(join(messagesDir, `${loc}.json`), "utf-8"));
    allMessages[loc] = raw.cases;
  }

  const enCases = allMessages.en;
  const skipKeys = new Set(["eyebrow", "title", "titleAccent", "sub", "filters", "items"]);
  const slugs = Object.keys(enCases).filter((k) => !skipKeys.has(k));

  console.log(`Seeding ${slugs.length} cases...`);

  for (let i = 0; i < slugs.length; i++) {
    const slug = slugs[i];
    const enCase = enCases[slug] as CaseDetail;
    if (!enCase) {
      console.log(`Skipping ${slug}: no data`);
      continue;
    }

    // Insert case row
    const { data: caseRow, error: caseErr } = await supabase
      .from("cases")
      .insert({
        slug: enCase.slug,
        tag: enCase.tag,
        thumbnail: IMAGE_MAP[slug] || null,
        metric_value: enCase.metric,
        metric_label: enCase.metricLabel,
        results: enCase.results,
        solution: enCase.solution,
        testimonial: enCase.testimonial || null,
        is_featured: slug === "vinfast",
        sort_order: i,
        status: "published",
        published_at: new Date().toISOString(),
      })
      .select("id")
      .single();

    if (caseErr) {
      console.error(`Error inserting case ${slug}:`, caseErr.message);
      continue;
    }

    // Insert translations for each locale
    const translations = [];
    for (const loc of LOCALES) {
      const locCase = allMessages[loc][slug] as CaseDetail | undefined;
      if (!locCase) continue;
      translations.push({
        case_id: caseRow.id,
        locale: loc,
        client: locCase.client,
        title: locCase.title,
        context: locCase.context || "",
        challenge: locCase.challenge || "",
      });
    }

    const { error: transErr } = await supabase.from("case_translations").insert(translations);
    if (transErr) {
      console.error(`Error inserting translations for ${slug}:`, transErr.message);
    } else {
      console.log(`✓ ${slug} (${translations.length} translations)`);
    }
  }

  console.log("Done.");
}

seed().catch(console.error);
