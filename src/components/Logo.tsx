import { Aperture } from "lucide-react";

/** Pictogramme provisoire de la marque : un diaphragme sur la couleur d'accent. */
export function Logo({ size = 28 }: { size?: number }) {
  return (
    <span className="lp-logo" style={{ width: size, height: size }} aria-hidden>
      <Aperture size={Math.round(size * 0.6)} strokeWidth={2} />
    </span>
  );
}
