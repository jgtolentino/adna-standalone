'use client';

import React from 'react';

export function Databank() {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 text-sm">
      <h2 className="mb-2 text-base font-semibold">Agency Databank (Preview)</h2>
      <p className="text-gray-600">
        This is a placeholder Databank component used to unblock the build.
        Replace with the real databank UI when ready.
      </p>
    </div>
  );
}

export function NLQChart({ data }: { data?: any }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 text-sm">
      <h3 className="mb-2 text-sm font-semibold">NLQ Chart Placeholder</h3>
      <p className="text-gray-600 text-xs">Chart data will render here.</p>
    </div>
  );
}

export default Databank;
