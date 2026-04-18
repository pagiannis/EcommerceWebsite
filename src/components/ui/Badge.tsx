interface BadgeProps {
  label: string;
  variant: 'discount' | 'new';
}

export default function Badge({ label, variant }: BadgeProps) {
  const cls =
    variant === 'discount'
      ? 'bg-red-100 text-brand-red'
      : 'bg-green-100 text-green-700';
  return (
    <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${cls}`}>
      {label}
    </span>
  );
}
