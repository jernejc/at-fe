'use client';

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

/** Scrolls the window to the top whenever the route pathname changes. */
export function ScrollToTop() {
  const pathname = usePathname();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}
