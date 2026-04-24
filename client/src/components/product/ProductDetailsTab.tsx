interface ProductDetailsTabProps {
  description: string;
}

export default function ProductDetailsTab({ description }: ProductDetailsTabProps) {
  return <p className="text-gray-600">{description}</p>;
}
