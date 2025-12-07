'use client';

import { Suspense } from 'react';
import { FilterProvider } from '@/contexts/FilterContext';

function FilterProviderWrapper({ children }: { children: React.ReactNode }) {
  return <FilterProvider>{children}</FilterProvider>;
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={null}>
      <FilterProviderWrapper>{children}</FilterProviderWrapper>
    </Suspense>
  );
}
