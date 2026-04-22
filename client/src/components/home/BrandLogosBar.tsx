import versaceLogo from "../../assets/VersaceLogo.png";
import zaraLogo from "../../assets/ZaraLogo.png";
import gucciLogo from "../../assets/GucciLogo.png";
import pradaLogo from "../../assets/PradaLogo.png";
import calvinKleinLogo from "../../assets/CalvinKleinLogo.png";

const brandLogos = [
  { name: "Versace", src: versaceLogo },
  { name: "Zara", src: zaraLogo },
  { name: "Gucci", src: gucciLogo },
  { name: "Prada", src: pradaLogo },
  { name: "Calvin Klein", src: calvinKleinLogo },
];

export default function BrandLogosBar() {
  return (
    <section className="bg-brand-black py-8">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-around gap-8 lg:gap-16 px-4 lg:px-8">
        {brandLogos.map((brand) => (
          <img
            key={brand.name}
            src={brand.src}
            alt={brand.name}
            className="h-5 w-auto object-contain lg:h-8"
          />
        ))}
      </div>
    </section>
  );
}
