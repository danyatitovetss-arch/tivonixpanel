import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

/** Same lockup in sidebar and auth header (login / register). */
export function BrandLogo({
  href,
  onClick,
  className,
  priority = false,
}: {
  href: string;
  onClick?: () => void;
  className?: string;
  priority?: boolean;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn("flex h-10 shrink-0 items-center", className)}
      aria-label="TIVONIX"
    >
      <Image
        src="/images/white-Photoroom.png"
        alt="TIVONIX"
        width={200}
        height={67}
        priority={priority}
        unoptimized
        className="h-8 w-auto max-w-[160px] object-contain object-left"
      />
    </Link>
  );
}
