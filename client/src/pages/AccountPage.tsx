import { useAuthStore } from "../store/authStore";

export default function AccountPage() {
  const user = useAuthStore((s) => s.user)!;

  const memberSince = new Date(user.createdAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
  });

  return (
    <div>
      <h1 className="font-display mb-6 text-2xl font-extrabold uppercase tracking-tight text-brand-black">
        Personal Information
      </h1>

      <div className="max-w-md rounded-2xl border border-gray-100 bg-white p-8 shadow-sm">
        <dl className="divide-y divide-gray-100">
          <InfoRow label="Name" value={`${user.firstName} ${user.lastName}`} />
          <InfoRow label="Email" value={user.email} />
          {user.phone && <InfoRow label="Phone" value={user.phone} />}
          <InfoRow label="Member since" value={memberSince} />
        </dl>
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1 py-4 sm:flex-row sm:items-center">
      <dt className="w-36 shrink-0 text-sm text-gray-500">{label}</dt>
      <dd className="text-sm font-medium text-gray-900">{value}</dd>
    </div>
  );
}
