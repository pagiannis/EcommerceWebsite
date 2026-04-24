const FAQS = [
  {
    q: "What is your return policy?",
    a: "We accept returns within 30 days of purchase.",
  },
  {
    q: "How long does shipping take?",
    a: "Standard shipping takes 3-5 business days.",
  },
  {
    q: "Do you ship internationally?",
    a: "Yes, we ship to over 50 countries worldwide.",
  },
];

export default function FaqsTab() {
  return (
    <div className="space-y-4">
      {FAQS.map((faq) => (
        <div key={faq.q} className="rounded-xl border border-gray-200 p-5">
          <h4 className="font-semibold text-gray-900">{faq.q}</h4>
          <p className="mt-1 text-sm text-gray-600">{faq.a}</p>
        </div>
      ))}
    </div>
  );
}
