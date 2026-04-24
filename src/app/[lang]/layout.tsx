import "../globals.css";
import Link from 'next/link';
import { getDictionary, Locale } from '@/i18n/dictionaries';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';

export const metadata = {
  title: 'Sweets Recipes',
  description: 'Handcrafted sweets and dessert recipes',
};

export default async function RootLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang: paramLang } = await params;
  const lang = paramLang as Locale;
  const dict = getDictionary(lang);

  return (
    <html lang={lang} dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <body className="antialiased bg-white min-h-screen">
        <header className="border-b border-gray-100 px-6 py-4 flex justify-between items-center bg-white/80 backdrop-blur-sm sticky top-0 z-50">
          <Link
            href={`/${lang}`}
            style={{ fontFamily: "'Playfair Display', serif" }}
            className="text-2xl font-bold text-gray-900 tracking-tight"
          >
            {dict.home.title}
          </Link>
          <LanguageSwitcher lang={lang} />
        </header>
        <main>
          {children}
        </main>
      </body>
    </html>
  );
}
