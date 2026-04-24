import { getDictionary, Locale } from "@/i18n/dictionaries";
import { AdminClient } from "@/components/AdminClient";

export default async function AdminPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang: paramLang } = await params;
  const lang = paramLang as Locale;
  const dict = getDictionary(lang);

  return <AdminClient dict={dict} />;
}
