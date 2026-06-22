'use client';

import { usePathname } from 'next/navigation';

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const hideSidebar =
    pathname === '/' ||
    pathname === '/login' ||
    pathname === '/signup' ||
    pathname === '/onboarding';

  return (
    <main
      className={
        hideSidebar
          ? 'min-h-screen w-full'
          : 'min-h-screen ml-64 bg-gray-50'
      }
    >
      {children}
    </main>
  );
}