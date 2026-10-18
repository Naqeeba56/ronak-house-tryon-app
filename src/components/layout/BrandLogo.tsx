import Image from "next/image";

export default function BrandLogo({ priority = false }: { priority?: boolean }) {
  return (
    <span className="vton-brand-logo">
      <Image
        src="/brand/vton-labs-logo-light.webp"
        alt="VTON Labs"
        width={1024}
        height={256}
        className="vton-brand-logo-image vton-brand-logo-image-light"
        priority={priority}
      />
      <Image
        src="/brand/vton-labs-logo-dark.webp"
        alt=""
        aria-hidden="true"
        width={1024}
        height={256}
        className="vton-brand-logo-image vton-brand-logo-image-dark"
        priority={priority}
      />
    </span>
  );
}
