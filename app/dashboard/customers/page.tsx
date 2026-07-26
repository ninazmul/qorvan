import { requirePermission } from "@/lib/auth/rbac";
import { connectToDatabase } from "@/lib/database";
import User from "@/lib/database/models/user.model";

export const dynamic = "force-dynamic";

export default async function CustomersPage() {
  await requirePermission("customers", "read");
  await connectToDatabase();

  const users = await User.find({ status: "active" }).sort({ createdAt: -1 }).lean();

  return (
    <div className="space-y-6 pb-10">
      <div className="border-b pb-4">
        <h1 className="text-2xl font-bold text-gray-900">Customer Directory</h1>
        <p className="text-xs text-gray-500">Registered QORVAN luxury client accounts</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        <table className="w-full text-left text-xs">
          <thead className="bg-gray-50 uppercase font-bold border-b text-gray-700">
            <tr>
              <th className="py-3.5 px-4">Customer</th>
              <th className="py-3.5 px-4">Email</th>
              <th className="py-3.5 px-4">Status</th>
              <th className="py-3.5 px-4">Registered Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {users.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-8 text-center text-gray-400">
                  No customer records found yet.
                </td>
              </tr>
            ) : (
              users.map((u: any) => (
                <tr key={u._id.toString()} className="hover:bg-gray-50 transition">
                  <td className="py-3.5 px-4 font-bold text-gray-900 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-900 flex items-center justify-center font-extrabold uppercase">
                      {u.name?.[0] || "U"}
                    </div>
                    {u.name}
                  </td>
                  <td className="py-3.5 px-4 text-gray-600 font-mono">{u.email}</td>
                  <td className="py-3.5 px-4">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      {u.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-gray-500">
                    {new Date(u.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
