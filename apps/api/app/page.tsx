export default function Page() {
  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow p-6">
        <h1 className="text-3xl font-bold mb-4">KiBei API</h1>
        <p className="text-gray-600">Backend API for KiBei Mobile RDC</p>
        <div className="mt-6 space-y-4">
          <h2 className="text-xl font-semibold">Available Endpoints:</h2>
          <ul className="list-disc list-inside space-y-2 text-gray-600">
            <li>POST /api/auth/login - User login</li>
            <li>POST /api/auth/refresh - Refresh token</li>
            <li>POST /api/auth/logout - User logout</li>
            <li>GET /api/public/prices - Get approved prices</li>
            <li>GET /api/public/exchange-rates - Get exchange rates</li>
            <li>POST /api/collector/prices - Submit price</li>
            <li>POST /api/collector/exchange-rates - Submit exchange rate</li>
            <li>GET/PUT /api/moderator/prices - Validate prices</li>
            <li>GET/POST /api/admin/users - Manage users</li>
            <li>GET/POST /api/admin/provinces - Manage provinces</li>
            <li>GET/POST /api/admin/products - Manage products</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
