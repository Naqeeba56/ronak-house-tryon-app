import Image from "next/image";

export default function BrandMark({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <span className={`relative inline-flex shrink-0 ${className}`}>
      <Image src="/brand/fabricfit-splash-logo.png" alt="" aria-hidden="true" fill sizes="48px" className="object-contain" />
    </span>
  );
}
