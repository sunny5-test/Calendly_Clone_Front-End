'use client';

import { usePathname } from 'next/navigation';

export default function MainContent({ children }) {
  const pathname = usePathname();
  const isLandingPage = pathname === '/';
  const isLoginPage = pathname === '/login';
  const isPublicPage = pathname.startsWith('/event/');
  const noSidebar = isLandingPage || isLoginPage || isPublicPage;

  return (
    <main className={`flex-1 min-h-screen overflow-y-auto ${noSidebar ? '' : 'pt-[60px] md:pt-0'}`}>
      {children}
    </main>
  );
}
