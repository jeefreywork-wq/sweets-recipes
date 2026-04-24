import "../globals.css";
import Link from 'next/link';
import { getDictionary, Locale } from '@/i18n/dictionaries';

export const metadata = {
  title: 'Sweets Recipes',
  description: 'High-end Brutalist Recipe Platform',
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
      <body className="antialiased selection:bg-(--color-accent-blue) selection:text-white min-h-screen border-t-8 border-t-black">
        <header className="border-b-4 border-black p-4 flex flex-wrap gap-4 justify-between items-center bg-white sticky top-0 z-50">
          <Link href={`/${lang}`} className="text-3xl font-black tracking-tighter uppercase">
            {dict.home.title}
          </Link>
          <div className="flex gap-4 font-bold border-2 border-black p-1 bg-(--color-bg-light)">
            <Link href="/en" className={`px-2 ${lang === 'en' ? 'bg-(--color-accent-mint) border-2 border-black' : ''}`}>EN</Link>
            <Link href="/ar" className={`px-2 ${lang === 'ar' ? 'bg-(--color-accent-mint) border-2 border-black' : ''}`}>عربي</Link>
          </div>
        </header>
        <main className="p-4 md:p-8 max-w-7xl mx-auto">
          {children}
        </main>
      </body>
    </html>
  );
}
