import { useUser } from "../hooks/useAuth";
import AccountSkeleton from "../components/account/AccountSkeleton";

export default function AccountPage() {
  const { data: user, isError, isLoading } = useUser();

  if (isError) {
    return (
      <p className="text-sm text-brand-red">
        Failed to load profile. Please try again.
      </p>
    );
  }

  const memberSince = user
    ? new Date(user.createdAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
      })
    : null;

  return (
    <div>
      <h1 className="font-display mb-6 text-2xl font-extrabold uppercase tracking-tight text-brand-black">
        Personal Information
      </h1>

      <div className="rounded-2xl border border-gray-100 bg-white p-8 shadow-sm">
        {isLoading ? (
          <AccountSkeleton />
        ) : (
          <dl className="divide-y divide-gray-100">
            <InfoRow label="First name" value={user!.firstName} />
            <InfoRow label="Last name" value={user!.lastName} />
            <InfoRow label="Email" value={user!.email} />
            {user!.phone && <InfoRow label="Phone" value={user!.phone} />}
            <InfoRow label="Member since" value={memberSince!} />
          </dl>
        )}
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1 py-4 sm:flex-row sm:items-center">
      <dt className="text-sm text-gray-500 sm:w-1/2">{label}</dt>
      <dd className="text-sm font-medium text-gray-900 sm:w-1/2">{value}</dd>
    </div>
  );
}
