import type { ComponentPropsWithoutRef } from "react";
import { cn } from "@/lib/utils";

type HeadingProps = ComponentPropsWithoutRef<"h1">;
type SectionHeadingProps = ComponentPropsWithoutRef<"h2">;
type ParagraphProps = ComponentPropsWithoutRef<"p">;
type CaptionProps = ComponentPropsWithoutRef<"small">;

function H1({ className, ...props }: HeadingProps) {
  return <h1 className={cn("text-3xl font-bold tracking-[-0.045em] text-[#171A2B] sm:text-4xl md:text-5xl", className)} {...props} />;
}

function H2({ className, ...props }: SectionHeadingProps) {
  return <h2 className={cn("text-xl font-bold tracking-[-0.03em] text-[#171A2B] sm:text-2xl", className)} {...props} />;
}

function Paragraph({ className, ...props }: ParagraphProps) {
  return <p className={cn("text-sm leading-6 text-[#6D7285] md:text-base md:leading-7", className)} {...props} />;
}

function Caption({ className, ...props }: CaptionProps) {
  return <small className={cn("text-xs font-semibold tracking-[0.04em] text-[#7A8194]", className)} {...props} />;
}

export const Text = {
  H1,
  H2,
  Paragraph,
  Caption,
};
