import { useState } from 'react';

interface ProductImageGalleryProps {
  images: string[];
  name: string;
}

export default function ProductImageGallery({ images, name }: ProductImageGalleryProps) {
  const [activeImage, setActiveImage] = useState(0);

  return (
    <div className="flex flex-col-reverse gap-3 lg:flex-row lg:gap-4 lg:w-1/2">
      <div className="flex flex-row gap-3 lg:flex-col">
        {images.map((img, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setActiveImage(i)}
            className={`h-20 w-16 flex-shrink-0 overflow-hidden rounded-xl border-2 transition ${
              i === activeImage ? 'border-brand-black' : 'border-transparent'
            }`}
          >
            <img src={img} alt={`${name} view ${i + 1}`} className="h-full w-full object-cover" />
          </button>
        ))}
      </div>
      <div className="flex-1 overflow-hidden rounded-2xl bg-brand-gray">
        <img src={images[activeImage]} alt={name} className="h-full w-full object-cover" />
      </div>
    </div>
  );
}
