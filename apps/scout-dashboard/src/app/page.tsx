import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-gray-100">
      <div className="text-center">
        <h1 className="text-5xl font-bold text-gray-900 mb-4">
          Scout Dashboard
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Philippine Retail Intelligence Platform
        </p>

        <div className="flex gap-4 justify-center">
          <Link
            href="/geography"
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg font-semibold text-lg shadow-lg transition"
          >
            View Geographical Intelligence →
          </Link>
        </div>

        <div className="mt-12 text-sm text-gray-500">
          <p>4,811 transactions | 15 stores | 3 regions</p>
          <p className="mt-1">Real-time data from Supabase OPEX database</p>
        </div>
      </div>
    </div>
  );
}
