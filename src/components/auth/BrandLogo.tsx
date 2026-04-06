import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

type BrandLogoProps = {
  href?: string;
  className?: string;
  imageClassName?: string;
  showWordmark?: boolean;
  wordmarkClassName?: string;
  priority?: boolean;
};

export function BrandLogo({
  href = "/",
  className,
  imageClassName,
  priority = true,
}: BrandLogoProps) {
  return (
    <Link href={href} className={cn("inline-flex items-center gap-3 group", className)} aria-label="4to Prompt home">
      <Image
        src="/logo_01.png"
        alt="4to Prompt logo"
        width={160}
        height={60}
        priority={priority}
        className={cn("h-10 w-auto object-contain transition-transform duration-300 group-hover:scale-[1.02]", imageClassName)}
      />
    </Link>
  );
}