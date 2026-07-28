import { cn } from "@/lib/utils";

type BrandMarkProps = {
  className?: string;
  iconClassName?: string;
  size?: "sm" | "md" | "lg";
};

const sizes = {
  sm: "size-8 rounded-xl",
  md: "size-10 rounded-2xl",
  lg: "size-12 rounded-2xl",
};

export function BrandMark({ className, iconClassName, size = "md" }: BrandMarkProps) {
  return (
    <span
      className={cn(
        "grid shrink-0 place-items-center bg-gradient-to-br from-[#6366F1] via-[#776AF4] to-[#9A78FF] text-white shadow-md shadow-indigo-200/80",
        sizes[size],
        className,
      )}
      aria-hidden
    >
      <svg className={cn("size-5", iconClassName)} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2.75 20 7.2v9.6L12 21.25 4 16.8V7.2L12 2.75Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
        <path d="m4.35 7.4 7.65 4.3 7.65-4.3M12 11.7v9.05" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  );
}
