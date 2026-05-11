import { useTranslations } from "next-intl";
import { setRequestLocale } from "next-intl/server";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <HomeContent />;
}

function HomeContent() {
  const t = useTranslations();
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="text-center">
        <h1 className="display-xl">{t("seo.siteName")}</h1>
        <p className="lead mt-6 max-w-xl mx-auto">
          {t("home.lead")}
        </p>
      </div>
    </div>
  );
}
