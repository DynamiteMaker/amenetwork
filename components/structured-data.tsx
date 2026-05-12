export function OrganizationJsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "AME Marketing",
    url: "https://amenetwork.vn",
    logo: "https://amenetwork.vn/ame-logo.webp",
    description: "Strategic marketing agency bridging Vietnamese and Japanese brands",
    address: [
      { "@type": "PostalAddress", addressLocality: "Hanoi", addressCountry: "VN" },
      { "@type": "PostalAddress", addressLocality: "Ho Chi Minh City", addressCountry: "VN" },
      { "@type": "PostalAddress", addressLocality: "Da Nang", addressCountry: "VN" },
      { "@type": "PostalAddress", addressLocality: "Tokyo", addressCountry: "JP" },
    ],
  };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}

export function ArticleJsonLd({
  title,
  slug,
  publishedAt,
  excerpt,
  image,
}: {
  title: string;
  slug: string;
  publishedAt: string;
  excerpt?: string;
  image?: string;
}) {
  const data = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: title,
    url: `https://amenetwork.vn/blog/${slug}`,
    datePublished: publishedAt,
    author: { "@type": "Organization", name: "AME Marketing" },
    publisher: { "@type": "Organization", name: "AME Marketing" },
    ...(excerpt && { description: excerpt }),
    ...(image && { image }),
  };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}

export function FAQJsonLd({ faqs }: { faqs: { question: string; answer: string }[] }) {
  const data = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: { "@type": "Answer", text: f.answer },
    })),
  };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}

export function BreadcrumbJsonLd({ items }: { items: { name: string; url: string }[] }) {
  const data = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}
